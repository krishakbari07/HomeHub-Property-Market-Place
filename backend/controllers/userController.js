import User from "../models/User.js";
import Property from "../models/Property.js";
import Appointment from "../models/Appointment.js";
import Inquiry from "../models/Inquiry.js";
import { formatClientBudget, formatIndianCurrency } from "../utils/currencyFormatter.js";

// Helper safe user object formatter
const formatUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  avatar: user.avatar || user.profileImage || "",
  profileImage: user.profileImage || user.avatar || "",
  preferredCity: user.preferredCity || "",
  budgetRange: user.budgetRange || "",
  buyerBudget: user.buyerBudget ?? null,
  rentalBudget: user.rentalBudget ?? null,
  formattedBudget: formatClientBudget(user),
  agencyName: user.agencyName || "",
  reraId: user.reraId || "",
  region: user.region || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      data: formatUser(user),
      ...formatUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, phone, preferredCity, budgetRange, buyerBudget, rentalBudget, agencyName, reraId, region, avatar, profileImage, role } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredCity !== undefined) user.preferredCity = preferredCity;
    if (budgetRange !== undefined) user.budgetRange = budgetRange;
    if (buyerBudget !== undefined) user.buyerBudget = buyerBudget === "" || buyerBudget === null ? null : Number(buyerBudget);
    if (rentalBudget !== undefined) user.rentalBudget = rentalBudget === "" || rentalBudget === null ? null : Number(rentalBudget);
    if (agencyName) user.agencyName = agencyName;
    if (reraId) user.reraId = reraId;
    if (region) user.region = region;
    if (avatar || profileImage) {
      user.avatar = avatar || profileImage;
      user.profileImage = profileImage || avatar;
    }

    // Users cannot change their own roles through profile update APIs
    // (Role field is strictly ignored in /api/users/me)

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: formatUser(updatedUser),
      ...formatUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with role 'agent'
// @route   GET /api/users/agents
// @access  Public / Private
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: { $regex: new RegExp("^agent$", "i") },
    })
      .select("-password")
      .sort({ name: 1 })
      .lean();

    // Compute live managed property counts for genuine registered agents
    const agentIds = agents.map((a) => a._id);
    const counts = await Property.aggregate([
      {
        $match: {
          $or: [
            { agent: { $in: agentIds } },
            { owner: { $in: agentIds } },
          ],
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$agent", "$owner"] },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map();
    counts.forEach((c) => {
      if (c._id) {
        countMap.set(String(c._id), c.count);
      }
    });

    const formatted = agents.map((agent) => {
      const base = formatUser(agent);
      const propertiesCount = countMap.get(String(agent._id)) || 0;
      return {
        ...base,
        agency: agent.agencyName || base.agencyName || "Independent Licensed Broker",
        agencyName: agent.agencyName || base.agencyName || "Independent Licensed Broker",
        city: agent.region || agent.preferredCity || "Ahmedabad",
        region: agent.region || agent.preferredCity || "Ahmedabad",
        propertiesCount,
        activeListings: propertiesCount,
        rating: 4.9,
        reviews: 24,
        specialization: "Residential & Commercial Advisory",
      };
    });

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const formattedUsers = users.map(formatUser);
    return res.json({
      success: true,
      data: formattedUsers,
      users: formattedUsers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, role, phone, preferredCity, budgetRange, buyerBudget, rentalBudget, agencyName, reraId, region } = req.body;
    
    const designatedAdminEmail = (process.env.ADMIN_EMAIL || "admin@homehub.com").toLowerCase().trim();

    // Prevent promoting any user to admin in single-admin system
    if (role && role.toLowerCase() === "admin" && user.email !== designatedAdminEmail) {
      return res.status(400).json({
        success: false,
        message: `Cannot promote user to admin. Only the designated system administrator account (${designatedAdminEmail}) is permitted.`,
      });
    }

    if (name) user.name = name;
    if (email && user.email !== designatedAdminEmail) user.email = email.toLowerCase();
    if (role && user.email !== designatedAdminEmail) user.role = role.toLowerCase();
    if (phone) user.phone = phone;
    if (preferredCity !== undefined) user.preferredCity = preferredCity;
    if (budgetRange !== undefined) user.budgetRange = budgetRange;
    if (buyerBudget !== undefined) user.buyerBudget = buyerBudget === "" || buyerBudget === null ? null : Number(buyerBudget);
    if (rentalBudget !== undefined) user.rentalBudget = rentalBudget === "" || rentalBudget === null ? null : Number(rentalBudget);
    if (agencyName !== undefined) user.agencyName = agencyName;
    if (reraId !== undefined) user.reraId = reraId;
    if (region !== undefined) user.region = region;

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: "User updated successfully by admin",
      data: formatUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user by Admin
// @route   POST /api/users
// @access  Private (Admin)
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, phone, agencyName, reraId, region, preferredCity, budgetRange, buyerBudget, rentalBudget } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    // Prevent creating additional admin accounts
    if (role && role.toLowerCase() === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot create additional admin accounts. Only one designated system administrator account is permitted.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role ? role.toLowerCase() : "buyer",
      phone: phone || "+91 98765 00000",
      agencyName: agencyName || "",
      reraId: reraId || "",
      region: region || "",
      preferredCity: preferredCity || "Ahmedabad",
      budgetRange: budgetRange || "",
      buyerBudget: buyerBudget ? Number(buyerBudget) : null,
      rentalBudget: rentalBudget ? Number(rentalBudget) : null,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully by admin",
      data: formatUser(newUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUserById = async (req, res) => {
  try {
    const designatedAdminEmail = (process.env.ADMIN_EMAIL || "admin@homehub.com").toLowerCase().trim();
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Lock the designated system admin from deletion
    if (user.email === designatedAdminEmail) {
      return res.status(400).json({
        success: false,
        message: `The designated system administrator account (${designatedAdminEmail}) cannot be deleted.`,
      });
    }

    // Prevent active admin from deleting their own account
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active admin account while logged in.",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: `User "${user.name}" (${user.role}) deleted successfully by admin`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get CRM clients for the currently logged-in Agent
// @route   GET /api/users/agent/clients
// @access  Private (Agent)
export const getAgentClients = async (req, res) => {
  try {
    const agentId = req.user._id;

    // 1. Get properties assigned to or owned by this agent
    const agentProps = await Property.find({
      $or: [{ agent: agentId }, { owner: agentId }],
    }).select("_id title city location price purpose");

    const propIds = agentProps.map((p) => p._id);

    // 2. Find appointments connected to this agent or their properties
    const appointments = await Appointment.find({
      $or: [{ agent: agentId }, { property: { $in: propIds } }],
    })
      .populate("user", "name email phone role preferredCity budgetRange buyerBudget rentalBudget")
      .populate("property", "title city purpose price formattedPrice")
      .lean();

    // 3. Find inquiries for this agent's properties
    const inquiries = await Inquiry.find({
      $or: [{ agent: agentId }, { property: { $in: propIds } }],
    })
      .populate("user", "name email phone role preferredCity budgetRange buyerBudget rentalBudget")
      .populate("sender", "name email phone role preferredCity budgetRange buyerBudget rentalBudget")
      .populate("property", "title city purpose price formattedPrice")
      .lean();

    const clientMap = new Map();

    // Process appointments
    appointments.forEach((appt) => {
      const u = appt.user;
      if (u && u._id) {
        const uId = u._id.toString();
        if (!clientMap.has(uId)) {
          const rawRole = (u.role || "buyer").toLowerCase();
          const normRole = rawRole === "rental" ? "renter" : rawRole;
          clientMap.set(uId, {
            id: uId,
            _id: uId,
            name: u.name,
            email: u.email,
            phone: u.phone || "+91 98765 00000",
            role: normRole,
            type: normRole.toUpperCase(),
            city: u.preferredCity || appt.property?.city || "Ahmedabad",
            rawBudget: u.budgetRange || "",
            buyerBudget: u.buyerBudget || null,
            rentalBudget: u.rentalBudget || null,
            budget: formatClientBudget(u),
            source: "Appointment",
            lastInteraction: appt.appointmentDate || appt.createdAt,
            propertyTitle: appt.property?.title,
          });
        }
      }
    });

    // Process inquiries
    inquiries.forEach((inq) => {
      const u = inq.user || inq.sender;
      const uId = u?._id ? u._id.toString() : (inq.userEmail || inq.email);
      if (uId && !clientMap.has(uId)) {
        const rawRole = (u?.role || "buyer").toLowerCase();
        const normRole = rawRole === "rental" ? "renter" : rawRole;
        clientMap.set(uId, {
          id: uId,
          _id: uId,
          name: u?.name || inq.userName || inq.name || "Client Lead",
          email: u?.email || inq.userEmail || inq.email || "",
          phone: u?.phone || inq.userPhone || inq.phone || "+91 98765 00000",
          role: normRole,
          type: normRole.toUpperCase(),
          city: u?.preferredCity || inq.property?.city || "Ahmedabad",
          rawBudget: u?.budgetRange || "",
          buyerBudget: u?.buyerBudget || null,
          rentalBudget: u?.rentalBudget || null,
          budget: u ? formatClientBudget(u) : "Not specified",
          source: "Inquiry",
          lastInteraction: inq.createdAt,
          propertyTitle: inq.propertyTitle || inq.property?.title,
        });
      }
    });

    // Also include any offers for this agent
    try {
      const Offer = (await import("../models/Offer.js")).default;
      if (Offer) {
        const offers = await Offer.find({
          $or: [{ agent: agentId }, { property: { $in: propIds } }],
        })
          .populate("buyer", "name email phone role preferredCity budgetRange buyerBudget rentalBudget")
          .populate("property", "title city purpose price formattedPrice")
          .lean();

        offers.forEach((off) => {
          const u = off.buyer;
          if (u && u._id) {
            const uId = u._id.toString();
            if (!clientMap.has(uId)) {
              const rawRole = (u.role || "buyer").toLowerCase();
              const normRole = rawRole === "rental" ? "renter" : rawRole;
              clientMap.set(uId, {
                id: uId,
                _id: uId,
                name: u.name,
                email: u.email,
                phone: u.phone || "+91 98765 00000",
                role: normRole,
                type: normRole.toUpperCase(),
                city: u.preferredCity || off.property?.city || "Ahmedabad",
                rawBudget: u.budgetRange || "",
                buyerBudget: u.buyerBudget || null,
                rentalBudget: u.rentalBudget || null,
                budget: formatClientBudget(u),
                source: "Offer",
                lastInteraction: off.createdAt,
                propertyTitle: off.property?.title,
              });
            }
          }
        });
      }
    } catch (offerErr) {
      // Offer model might not be initialized yet
    }

    const clients = Array.from(clientMap.values());
    return res.json({
      success: true,
      count: clients.length,
      clients,
      data: clients,
    });
  } catch (error) {
    console.error("Get agent clients error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


