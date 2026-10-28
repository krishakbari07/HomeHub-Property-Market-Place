import Offer from "../models/Offer.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { formatIndianCurrency } from "../utils/currencyFormatter.js";
import { createNotification } from "../services/notificationService.js";

// Helper populator for offers
const populateOffer = (query) => {
  return query
    .populate("property", "title price formattedPrice location city type purpose listingType image status owner agent createdBy creatorRole")
    .populate("buyer", "name email phone role preferredCity budgetRange")
    .populate("seller", "name email phone role")
    .populate("agent", "name email phone agencyName reraId")
    .populate("listingCreator", "name email phone role");
};

// Helper to determine responsible listing managers for notifications
const getListingManagers = (property) => {
  const managers = [];
  if (property.agent) managers.push(property.agent.toString());
  if (property.createdBy && !managers.includes(property.createdBy.toString())) {
    managers.push(property.createdBy.toString());
  }
  if (property.owner && !managers.includes(property.owner.toString())) {
    managers.push(property.owner.toString());
  }
  return managers;
};

/**
 * Strict Listing-Owner Based Authorization Validator
 *
 * Rules:
 * 1. Admin-created listing:
 *    - Only an authorized Admin (user.role === 'admin') can manage bids/offers.
 *    - Unrelated Agents and Sellers are strictly forbidden.
 * 2. Agent-created listing:
 *    - The specific authorized Agent who created the listing can manage bids/offers.
 *    - Other Agents and Sellers are strictly forbidden.
 * 3. Seller-created listing:
 *    - The specific Seller who created the listing can manage bids/offers.
 *    - Other Sellers are strictly forbidden.
 *    - If an authorized agent was explicitly designated by the seller (property.agent === user._id),
 *      that designated agent can also manage bids/offers. Other agents are strictly forbidden.
 * 4. Buyers and Renters:
 *    - Cannot manage (accept, reject, counter) any offers, including their own.
 */
export const canManageListingOffers = (user, property) => {
  if (!user || !property) return false;

  const authUserId = user._id ? user._id.toString() : String(user.id || "");
  const authUserRole = (user.role || "").toLowerCase();

  // Buyers and Renters cannot manage offers under any circumstances
  if (["buyer", "renter", "rental", "user"].includes(authUserRole)) {
    return false;
  }

  // Resolve listing creator and creator role reliably from the database property
  const creatorId = property.createdBy ? property.createdBy.toString() : property.owner ? property.owner.toString() : null;
  const creatorRole = (property.creatorRole || property.ownerRole || "").toLowerCase();

  // 1. Admin-created listing: Only an authorized Admin can manage
  if (creatorRole === "admin") {
    return authUserRole === "admin";
  }

  // 2. Agent-created listing: Only the specific agent who created the listing can manage
  if (creatorRole === "agent") {
    return authUserRole === "agent" && authUserId === creatorId;
  }

  // 3. Seller-created listing: The creating seller or their explicitly assigned agent can manage
  if (creatorRole === "seller") {
    if (authUserRole === "seller" && authUserId === creatorId) {
      return true;
    }
    const assignedAgentId = property.agent ? property.agent.toString() : null;
    if (authUserRole === "agent" && assignedAgentId && authUserId === assignedAgentId) {
      return true;
    }
    return false;
  }

  // Fallback for untagged legacy listings: creator must match directly
  if (creatorId && authUserId === creatorId) {
    return true;
  }

  return false;
};

// @desc    Submit a new offer/bid on an eligible listing
// @route   POST /api/offers
// @access  Private (Buyer / Renter)
export const submitOffer = async (req, res) => {
  try {
    const { propertyId, amount, note } = req.body;
    const userId = req.user._id;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: "Property ID is required to make an offer." });
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive offer amount is required." });
    }

    const offerAmount = Number(amount);

    // 1. Check Property Eligibility
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property listing not found." });
    }

    if (property.status && property.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: `Bidding is unavailable on this property because its status is '${property.status}'.`,
      });
    }

    // 2. Prevent Owner or Assigned Agent from bidding on their own listing
    const creatorId = property.createdBy?.toString() || property.owner?.toString();
    if (creatorId && creatorId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Property owners cannot submit offers on their own listings.",
      });
    }

    if (property.agent && property.agent.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Assigned agents cannot place bids on listings they manage.",
      });
    }

    // 3. Determine Offer Type from listing purpose
    const rawPurpose = (property.purpose || property.listingType || "buy").toLowerCase();
    const isRental = rawPurpose === "rent" || rawPurpose === "for rent";
    const offerType = isRental ? "rent" : "purchase";

    // 4. Duplicate Active Offer Protection
    const existingActiveOffer = await Offer.findOne({
      property: property._id,
      buyer: userId,
      status: { $in: ["pending", "countered"] },
    });

    if (existingActiveOffer) {
      return res.status(400).json({
        success: false,
        message: "You already have an active offer pending on this property. You can review or withdraw your existing offer before submitting a new one.",
      });
    }

    // Format Indian currency strings
    const formattedAmount = formatIndianCurrency(offerAmount, { isRental });
    const formattedAskingPrice = property.formattedPrice || formatIndianCurrency(property.price, { isRental });

    // 5. Create Offer Document retaining creator snapshot
    const newOffer = await Offer.create({
      property: property._id,
      buyer: userId,
      seller: property.owner,
      listingCreator: property.createdBy || property.owner,
      listingCreatorRole: property.creatorRole || property.ownerRole,
      agent: property.agent || null,
      offerType,
      amount: offerAmount,
      formattedAmount,
      askingPrice: property.price,
      formattedAskingPrice,
      currency: "INR",
      status: "pending",
      note: note ? String(note).trim() : "",
      history: [
        {
          status: "pending",
          action: "submitted",
          actor: userId,
          actorRole: req.user.role || "buyer",
          amount: offerAmount,
          note: note ? String(note).trim() : "Initial offer submitted",
          timestamp: new Date(),
        },
      ],
    });

    const populated = await populateOffer(Offer.findById(newOffer._id));

    // Send notifications to listing managers after DB persist succeeds
    try {
      const managers = getListingManagers(property);
      for (const managerId of managers) {
        if (managerId !== userId.toString()) {
          await createNotification({
            recipient: managerId,
            sender: userId,
            type: "offer_submitted",
            title: "New Offer Received",
            message: `${req.user.name || "A buyer"} submitted an offer of ${formattedAmount} on "${property.title}".`,
            property: property._id,
            propertyTitle: property.title,
            resourceType: "offer",
            resourceId: newOffer._id,
            link: "/seller/offers",
            metadata: { amount: offerAmount, formattedAmount, offerType },
          });
        }
      }
    } catch (notifErr) {
      console.warn("Offer submission notification advisory:", notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `${isRental ? "Rental offer" : "Purchase offer"} submitted successfully.`,
      data: populated,
    });
  } catch (error) {
    console.error("Submit offer error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in client's own submitted offers (Buyer / Renter)
// @route   GET /api/offers/my
// @access  Private
export const getMyOffers = async (req, res) => {
  try {
    const userId = req.user._id;
    const offers = await populateOffer(Offer.find({ buyer: userId }).sort({ createdAt: -1 }));

    return res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers for listings owned by logged-in Seller
// @route   GET /api/offers/seller
// @access  Private (Seller / Owner)
export const getSellerOffers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get properties created or owned by this seller (strictly excluding admin listings)
    const sellerProps = await Property.find({
      $or: [{ createdBy: userId }, { owner: userId }],
      creatorRole: { $in: ["seller", "Seller", null] },
    }).select("_id");
    const propIds = sellerProps.map((p) => p._id);

    const offers = await populateOffer(
      Offer.find({
        property: { $in: propIds },
      }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers for listings managed by logged-in Agent
// @route   GET /api/offers/agent
// @access  Private (Agent)
export const getAgentOffers = async (req, res) => {
  try {
    const agentId = req.user._id;

    // Agent can ONLY manage offers for:
    // 1. Listings created by this specific agent (creatorRole === "agent")
    // 2. Seller-created listings where this agent was explicitly designated (creatorRole === "seller" && agent === agentId)
    // Admin-created listings are strictly excluded.
    const managedProps = await Property.find({
      $or: [
        {
          $or: [{ createdBy: agentId }, { owner: agentId }],
          creatorRole: { $in: ["agent", "Agent"] },
        },
        {
          agent: agentId,
          creatorRole: { $in: ["seller", "Seller"] },
        },
      ],
    }).select("_id");
    const managedPropIds = managedProps.map((p) => p._id);

    const offers = await populateOffer(
      Offer.find({
        property: { $in: managedPropIds },
      }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers for listings created by Admin
// @route   GET /api/offers/admin
// @access  Private (Admin)
export const getAdminOffers = async (req, res) => {
  try {
    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }

    const adminProps = await Property.find({
      creatorRole: { $in: ["admin", "Admin"] },
    }).select("_id");
    const adminPropIds = adminProps.map((p) => p._id);

    const offers = await populateOffer(
      Offer.find({
        property: { $in: adminPropIds },
      }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single offer by ID with strict ownership/agent authorization
// @route   GET /api/offers/:id
// @access  Private
export const getOfferById = async (req, res) => {
  try {
    const offer = await populateOffer(Offer.findById(req.params.id));
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    const userId = req.user._id.toString();
    const isBuyer = offer.buyer?._id?.toString() === userId;
    const canManage = canManageListingOffers(req.user, offer.property);

    if (!isBuyer && !canManage) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to access this offer." });
    }

    return res.json({ success: true, data: offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept an offer (Authorized Listing Manager only)
// @route   PUT /api/offers/:id/accept
// @access  Private (Listing Owner / Authorized Agent / Admin)
export const acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    const property = await Property.findById(offer.property);
    if (!property) {
      return res.status(404).json({ success: false, message: "Associated property listing not found." });
    }

    // Strictly enforce listing-owner-based authorization
    if (!canManageListingOffers(req.user, property)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to accept offers for this listing.",
      });
    }

    // State transition guard
    if (offer.status !== "pending" && offer.status !== "countered") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept offer with current status '${offer.status}'.`,
      });
    }

    offer.status = "accepted";
    offer.history.push({
      status: "accepted",
      action: "accepted",
      actor: req.user._id,
      actorRole: req.user.role || "seller",
      amount: offer.amount,
      note: req.body.note || "Offer accepted",
      timestamp: new Date(),
    });

    await offer.save();

    // Notify submitting client AFTER DB save succeeds
    try {
      await createNotification({
        recipient: offer.buyer,
        sender: req.user._id,
        type: "offer_accepted",
        title: "Offer Accepted!",
        message: `Congratulations! Your offer of ${offer.formattedAmount || formatIndianCurrency(offer.amount)} for "${property.title}" has been accepted.`,
        property: property._id,
        propertyTitle: property.title,
        resourceType: "offer",
        resourceId: offer._id,
        link: "/buyer/offers",
        metadata: { amount: offer.amount, status: "accepted" },
      });
    } catch (notifErr) {
      console.warn("Offer acceptance notification advisory:", notifErr.message);
    }

    const populated = await populateOffer(Offer.findById(offer._id));
    return res.json({
      success: true,
      message: "Offer accepted successfully.",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject an offer (Authorized Listing Manager only)
// @route   PUT /api/offers/:id/reject
// @access  Private (Listing Owner / Authorized Agent / Admin)
export const rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    const property = await Property.findById(offer.property);
    if (!property) {
      return res.status(404).json({ success: false, message: "Associated property listing not found." });
    }

    // Strictly enforce listing-owner-based authorization
    if (!canManageListingOffers(req.user, property)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to decline offers for this listing.",
      });
    }

    if (offer.status !== "pending" && offer.status !== "countered") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject offer with current status '${offer.status}'.`,
      });
    }

    offer.status = "rejected";
    offer.history.push({
      status: "rejected",
      action: "rejected",
      actor: req.user._id,
      actorRole: req.user.role || "seller",
      amount: offer.amount,
      note: req.body.note || "Offer declined",
      timestamp: new Date(),
    });

    await offer.save();

    // Notify submitting client AFTER DB save succeeds
    try {
      await createNotification({
        recipient: offer.buyer,
        sender: req.user._id,
        type: "offer_rejected",
        title: "Offer Declined",
        message: `Your offer of ${offer.formattedAmount || formatIndianCurrency(offer.amount)} for "${property.title}" was declined.`,
        property: property._id,
        propertyTitle: property.title,
        resourceType: "offer",
        resourceId: offer._id,
        link: "/buyer/offers",
        metadata: { amount: offer.amount, status: "rejected" },
      });
    } catch (notifErr) {
      console.warn("Offer rejection notification advisory:", notifErr.message);
    }

    const populated = await populateOffer(Offer.findById(offer._id));
    return res.json({
      success: true,
      message: "Offer rejected successfully.",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Counter an offer with a proposed amount (Authorized Listing Manager only)
// @route   PUT /api/offers/:id/counter
// @access  Private (Listing Owner / Authorized Agent / Admin)
export const counterOffer = async (req, res) => {
  try {
    const { counterAmount, counterNote } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    const property = await Property.findById(offer.property);
    if (!property) {
      return res.status(404).json({ success: false, message: "Associated property listing not found." });
    }

    // Strictly enforce listing-owner-based authorization
    if (!canManageListingOffers(req.user, property)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to counter offers for this listing.",
      });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot counter an offer with current status '${offer.status}'.`,
      });
    }

    if (counterAmount === undefined || isNaN(Number(counterAmount)) || Number(counterAmount) <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive counteroffer amount is required." });
    }

    const numericCounter = Number(counterAmount);
    const isRental = offer.offerType === "rent";

    offer.status = "countered";
    offer.counterAmount = numericCounter;
    offer.formattedCounterAmount = formatIndianCurrency(numericCounter, { isRental });
    offer.counterNote = counterNote ? String(counterNote).trim() : "";
    offer.history.push({
      status: "countered",
      action: "countered",
      actor: req.user._id,
      actorRole: req.user.role || "seller",
      amount: numericCounter,
      note: offer.counterNote || "Counteroffer proposed",
      timestamp: new Date(),
    });

    await offer.save();

    // Notify submitting client AFTER DB save succeeds
    try {
      await createNotification({
        recipient: offer.buyer,
        sender: req.user._id,
        type: "offer_countered",
        title: "Counteroffer Received",
        message: `A counteroffer of ${offer.formattedCounterAmount} has been proposed for "${property.title}".${offer.counterNote ? ' Note: "' + offer.counterNote + '"' : ""}`,
        property: property._id,
        propertyTitle: property.title,
        resourceType: "offer",
        resourceId: offer._id,
        link: "/buyer/offers",
        metadata: {
          counterAmount: numericCounter,
          formattedCounterAmount: offer.formattedCounterAmount,
          counterNote: offer.counterNote,
        },
      });
    } catch (notifErr) {
      console.warn("Offer counter notification advisory:", notifErr.message);
    }

    const populated = await populateOffer(Offer.findById(offer._id));
    return res.json({
      success: true,
      message: "Counteroffer dispatched to the client successfully.",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw an offer (Submitting Buyer / Renter only)
// @route   PUT /api/offers/:id/withdraw
// @access  Private (Buyer / Renter)
export const withdrawOffer = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    // Only the submitting buyer/renter can withdraw their offer
    if (offer.buyer?.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only withdraw your own offers." });
    }

    // Allow withdrawal only when status is pending or countered
    if (offer.status !== "pending" && offer.status !== "countered") {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw offer with status '${offer.status}'. Only pending or countered offers may be withdrawn.`,
      });
    }

    offer.status = "withdrawn";
    offer.history.push({
      status: "withdrawn",
      action: "withdrawn",
      actor: req.user._id,
      actorRole: req.user.role || "buyer",
      amount: offer.amount,
      note: req.body.reason || "Offer withdrawn by client",
      timestamp: new Date(),
    });

    await offer.save();

    // Notify listing manager AFTER DB save succeeds
    try {
      const property = await Property.findById(offer.property);
      if (property) {
        const managers = getListingManagers(property);
        for (const managerId of managers) {
          if (managerId !== userId) {
            await createNotification({
              recipient: managerId,
              sender: req.user._id,
              type: "offer_withdrawn",
              title: "Offer Withdrawn",
              message: `${req.user.name || "Client"} withdrew their offer of ${offer.formattedAmount || formatIndianCurrency(offer.amount)} for "${property.title}".`,
              property: property._id,
              propertyTitle: property.title,
              resourceType: "offer",
              resourceId: offer._id,
              link: "/seller/offers",
              metadata: { amount: offer.amount, status: "withdrawn" },
            });
          }
        }
      }
    } catch (notifErr) {
      console.warn("Offer withdrawal notification advisory:", notifErr.message);
    }

    const populated = await populateOffer(Offer.findById(offer._id));
    return res.json({
      success: true,
      message: "Offer withdrawn successfully.",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Client response to a counteroffer (Accept or Decline counter)
// @route   PUT /api/offers/:id/respond-counter
// @access  Private (Buyer / Renter)
export const respondToCounter = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user._id.toString();
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }

    if (offer.buyer?.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to respond to this counteroffer." });
    }

    if (offer.status !== "countered") {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to counteroffer. Current status is '${offer.status}'.`,
      });
    }

    if (action === "accept") {
      offer.status = "accepted";
      offer.amount = offer.counterAmount;
      offer.formattedAmount = offer.formattedCounterAmount;
      offer.history.push({
        status: "accepted",
        action: "counter_accepted",
        actor: req.user._id,
        actorRole: req.user.role || "buyer",
        amount: offer.counterAmount,
        note: "Client accepted counteroffer",
        timestamp: new Date(),
      });
    } else if (action === "reject" || action === "decline") {
      offer.status = "rejected";
      offer.history.push({
        status: "rejected",
        action: "counter_rejected",
        actor: req.user._id,
        actorRole: req.user.role || "buyer",
        amount: offer.counterAmount,
        note: "Client declined counteroffer",
        timestamp: new Date(),
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Must be 'accept' or 'reject'." });
    }

    await offer.save();

    // Notify listing managers AFTER DB save succeeds
    try {
      const property = await Property.findById(offer.property);
      if (property) {
        const managers = getListingManagers(property);
        const isAccepted = action === "accept";
        for (const managerId of managers) {
          if (managerId !== userId) {
            await createNotification({
              recipient: managerId,
              sender: req.user._id,
              type: isAccepted ? "offer_counter_accepted" : "offer_counter_rejected",
              title: isAccepted ? "Counteroffer Accepted!" : "Counteroffer Declined",
              message: `${req.user.name || "Client"} ${isAccepted ? "accepted" : "declined"} the counteroffer of ${offer.formattedCounterAmount || offer.formattedAmount} for "${property.title}".`,
              property: property._id,
              propertyTitle: property.title,
              resourceType: "offer",
              resourceId: offer._id,
              link: "/seller/offers",
              metadata: { action, amount: offer.amount },
            });
          }
        }
      }
    } catch (notifErr) {
      console.warn("Counter response notification advisory:", notifErr.message);
    }

    const populated = await populateOffer(Offer.findById(offer._id));
    return res.json({
      success: true,
      message: action === "accept" ? "Counteroffer accepted!" : "Counteroffer declined.",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
