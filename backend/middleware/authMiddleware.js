import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "homehub_super_secret_jwt_key_2026_production";
      const decoded = jwt.verify(token, secret);

      const userId = decoded.userId || decoded.id;
      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user account not found",
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no Bearer token provided",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  const designatedAdminEmail = (process.env.ADMIN_EMAIL || "admin@homehub.com").toLowerCase().trim();
  if (
    req.user &&
    req.user.role &&
    req.user.role.toLowerCase() === "admin" &&
    req.user.email &&
    req.user.email.toLowerCase().trim() === designatedAdminEmail
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Forbidden: Admin access required",
  });
};

export const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toLowerCase());
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: User role not identified",
      });
    }
    const userRole = req.user.role.toLowerCase();
    if (userRole === "admin" || normalizedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `User role '${req.user.role}' is not authorized to access this resource`,
    });
  };
};
