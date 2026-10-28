import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import { createNotification } from "../services/notificationService.js";

// @desc    Submit property inquiry
// @route   POST /api/inquiries
// @access  Public / Private
export const createInquiry = async (req, res) => {
  try {
    const {
      propertyId,
      property,
      propertyTitle,
      agentId,
      agent,
      userName,
      userEmail,
      userPhone,
      message,
    } = req.body;

    const actualPropertyId = propertyId || property || null;
    let targetProperty = null;
    if (actualPropertyId) {
      targetProperty = await Property.findById(actualPropertyId);
    }

    const resolvedTitle =
      propertyTitle || targetProperty?.title || "Advisory Consultation";
    const resolvedAgent =
      agentId || agent || targetProperty?.agent || null;
    const userId = req.user ? req.user._id : null;

    const inquiry = await Inquiry.create({
      property: actualPropertyId || null,
      propertyTitle: resolvedTitle,
      agent: resolvedAgent || null,
      sender: userId,
      user: userId,
      userName: userName || req.user?.name || "Guest User",
      userEmail: userEmail || req.user?.email || "guest@example.com",
      userPhone: userPhone || req.user?.phone || "+91 98765 00000",
      message: message || "Interested in consulting with advisor.",
      status: "Pending",
    });

    // Notify responsible listing manager or direct advisor AFTER database persist succeeds
    try {
      const managers = [];
      if (targetProperty) {
        if (targetProperty.agent) managers.push(targetProperty.agent.toString());
        if (targetProperty.owner && !managers.includes(targetProperty.owner.toString())) {
          managers.push(targetProperty.owner.toString());
        }
        if (targetProperty.createdBy && !managers.includes(targetProperty.createdBy.toString())) {
          managers.push(targetProperty.createdBy.toString());
        }
      }
      if (resolvedAgent && !managers.includes(resolvedAgent.toString())) {
        managers.push(resolvedAgent.toString());
      }

      const senderId = req.user ? req.user._id.toString() : null;
      for (const managerId of managers) {
        if (managerId !== senderId) {
          await createNotification({
            recipient: managerId,
            sender: req.user ? req.user._id : null,
            type: "inquiry_submitted",
            title: targetProperty ? "New Property Inquiry" : "New Advisory Inquiry",
            message: `New inquiry from ${inquiry.userName} for "${resolvedTitle}": "${inquiry.message.substring(0, 80)}"`,
            property: targetProperty?._id || null,
            propertyTitle: resolvedTitle,
            resourceType: "inquiry",
            resourceId: inquiry._id,
            link: "/seller/inquiries",
            metadata: { userEmail: inquiry.userEmail, userPhone: inquiry.userPhone },
          });
        }
      }
    } catch (notifErr) {
      console.warn("Inquiry notification advisory:", notifErr.message);
    }

    return res.status(201).json(inquiry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user inquiries (strictly isolated: clients see only their own inquiries)
// @route   GET /api/inquiries
// @access  Private
export const getMyInquiries = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = (req.user.role || "").toLowerCase();

    if (userRole === "admin") {
      const allInquiries = await Inquiry.find()
        .populate("property", "title location price formattedPrice image owner agent purpose status")
        .populate("sender", "name email phone role")
        .populate("agent", "name email phone role agencyName")
        .sort({ createdAt: -1 });

      return res.json(allInquiries);
    }

    // Buyers / Renters: Strictly see only their own private inquiries
    if (userRole === "buyer" || userRole === "renter" || userRole === "rental" || userRole === "user") {
      const inquiries = await Inquiry.find({
        $or: [
          { sender: userId },
          { user: userId },
          { userEmail: req.user.email },
        ],
      })
        .populate("property", "title location price image owner agent")
        .populate("agent", "name email phone role agencyName")
        .sort({ createdAt: -1 });

      return res.json(inquiries);
    }

    // Sellers & Agents: Inquiries for properties they own or are designated agent for, or inquiries directed directly to them
    const userProperties = await Property.find({
      $or: [{ owner: userId }, { agent: userId }, { createdBy: userId }],
    }).select("_id");

    const userPropIds = userProperties.map((p) => p._id);

    const inquiries = await Inquiry.find({
      $or: [
        { sender: userId },
        { user: userId },
        { agent: userId },
        { property: { $in: userPropIds } },
      ],
    })
      .populate("property", "title location price image owner agent")
      .populate("sender", "name email phone role")
      .populate("agent", "name email phone role agencyName")
      .sort({ createdAt: -1 });

    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inquiries for Admin
// @route   GET /api/inquiries/all
// @access  Private (Admin)
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("property", "title location price formattedPrice image owner agent purpose status")
      .populate("sender", "name email phone role")
      .populate("agent", "name email phone role agencyName")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
      inquiries: inquiries,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update inquiry status & optional response
// @route   PUT /api/inquiries/:id
// @access  Private
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, response } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (status) {
      inquiry.status = status;
    }
    if (response !== undefined && response !== null && response.trim() !== "") {
      inquiry.response = response.trim();
      inquiry.respondedBy = req.user._id;
      inquiry.respondedAt = new Date();
      if (!status) {
        inquiry.status = "Responded";
      }
    }

    const updated = await inquiry.save();

    // Notify submitting client AFTER DB update succeeds
    try {
      const recipientId = inquiry.sender || inquiry.user;
      if (recipientId && recipientId.toString() !== req.user._id.toString()) {
        const hasResponse = Boolean(inquiry.response);
        await createNotification({
          recipient: recipientId,
          sender: req.user._id,
          type: hasResponse ? "inquiry_replied" : "inquiry_status_changed",
          title: hasResponse ? "Inquiry Response Received" : "Inquiry Status Updated",
          message: hasResponse
            ? `Advisor responded to your inquiry on "${inquiry.propertyTitle || "Advisory Consultation"}": "${inquiry.response}"`
            : `Your inquiry for "${inquiry.propertyTitle || "Advisory Consultation"}" status updated to "${inquiry.status}".`,
          property: inquiry.property || null,
          propertyTitle: inquiry.propertyTitle || "Advisory Consultation",
          resourceType: "inquiry",
          resourceId: inquiry._id,
          link: "/buyer/inquiries",
          metadata: { status: inquiry.status, response: inquiry.response },
        });
      }
    } catch (notifErr) {
      console.warn("Inquiry update notification advisory:", notifErr.message);
    }

    return res.json({ success: true, message: "Inquiry status updated", data: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    return res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
