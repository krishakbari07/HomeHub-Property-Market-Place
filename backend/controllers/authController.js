import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper JWT token generator
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || "homehub_super_secret_jwt_key_2026_production";
  return jwt.sign({ userId, id: userId, role }, secret, {
    expiresIn: "30d",
  });
};

// Helper safe user object formatter
const formatUserResponse = (user, token = null) => {
  const normRole = user.role?.toLowerCase() === "rental" ? "renter" : user.role?.toLowerCase() || "buyer";
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: normRole,
    phone: user.phone || "",
    avatar: user.avatar || user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    profileImage: user.profileImage || user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    preferredCity: user.preferredCity || "Ahmedabad",
    budgetRange: user.budgetRange || "",
    buyerBudget: user.buyerBudget ?? null,
    rentalBudget: user.rentalBudget ?? null,
    agencyName: user.agencyName || "",
    reraId: user.reraId || "",
    region: user.region || "",
    isEmailVerified: Boolean(user.isEmailVerified),
    createdAt: user.createdAt,
    ...(token && { token }),
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      preferredCity,
      budgetRange,
      buyerBudget,
      rentalBudget,
      agencyName,
      reraId,
      region,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, and password.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Reject privilege escalation attempts immediately
    if (req.body.isAdmin || req.body.is_admin || (req.body.role && String(req.body.role).toLowerCase() === "admin")) {
      return res.status(400).json({
        success: false,
        message: "Registration as an Administrator or privilege escalation is strictly not permitted.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether email already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists. Please log in.",
      });
    }

    // Public registration assigns standard roles, never admin
    let targetRole = "buyer";
    const requestedRole = (role || "").toLowerCase().trim();
    if (["buyer", "seller", "agent", "renter", "rental", "user"].includes(requestedRole)) {
      targetRole = requestedRole === "rental" ? "renter" : requestedRole;
    } else {
      targetRole = "buyer";
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? String(phone).trim() : "+91 98765 00000",
      role: targetRole,
      preferredCity: preferredCity || "Ahmedabad",
      budgetRange: budgetRange || "",
      buyerBudget: buyerBudget !== undefined && buyerBudget !== null && buyerBudget !== "" ? Number(buyerBudget) : null,
      rentalBudget: rentalBudget !== undefined && rentalBudget !== null && rentalBudget !== "" ? Number(rentalBudget) : null,
      agencyName: agencyName || "",
      reraId: reraId || "",
      region: region || "",
      isEmailVerified: false,
    });

    const userData = formatUserResponse(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful. You can now sign in.",
      data: userData,
      user: userData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

// @desc    Self-service Password Reset via Registered Email & Phone Verification
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Registered email address, registered phone number, and new password are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification details. Please confirm your registered email and phone number.",
      });
    }

    // Normalize phone digits for comparison (e.g. matching last 10 digits to allow country code variations)
    const inputDigits = String(phone).replace(/\D/g, "");
    const userDigits = String(user.phone || "").replace(/\D/g, "");

    const phoneMatches =
      inputDigits.length >= 6 &&
      (userDigits === inputDigits ||
        userDigits.endsWith(inputDigits) ||
        inputDigits.endsWith(userDigits));

    if (!phoneMatches) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification details. Please confirm your registered email and phone number.",
      });
    }

    // Update password (pre-save hook hashes with bcrypt automatically)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);
      const userData = formatUserResponse(user, token);

      return res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: userData,
        data: userData,
        ...userData,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server login error",
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me (also /api/auth/profile)
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      const userData = formatUserResponse(user);
      return res.json({
        success: true,
        user: userData,
        data: userData,
        ...userData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching profile",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};
