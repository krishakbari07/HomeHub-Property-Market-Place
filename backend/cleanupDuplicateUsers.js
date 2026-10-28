import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Property from "./models/Property.js";
import Appointment from "./models/Appointment.js";
import Inquiry from "./models/Inquiry.js";
import Wishlist from "./models/Wishlist.js";

export const cleanupDuplicates = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    const users = await User.find().sort({ createdAt: 1 });
    const emailMap = new Map();

    for (const u of users) {
      if (!u.email) continue;
      const email = u.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, [u]);
      } else {
        emailMap.get(email).push(u);
      }
    }

    let duplicateCount = 0;
    for (const [email, userGroup] of emailMap.entries()) {
      if (userGroup.length > 1) {
        duplicateCount += userGroup.length - 1;
        console.warn(`⚠️ Detected ${userGroup.length} accounts with duplicate email [${email}]. Automatic destructive cleanup is disabled to protect database relationships.`);
      }
    }

    if (duplicateCount === 0) {
      console.log("✅ No duplicate User documents found in MongoDB.");
    }

    // Securely bootstrap/verify designated single System Admin account
    const designatedAdminEmail = (process.env.ADMIN_EMAIL || "admin@homehub.com").toLowerCase().trim();
    const designatedAdminPassword = process.env.ADMIN_PASSWORD || "password123";

    let designatedAdmin = await User.findOne({ email: designatedAdminEmail });
    if (!designatedAdmin) {
      designatedAdmin = await User.create({
        name: "System Admin",
        email: designatedAdminEmail,
        password: designatedAdminPassword,
        role: "admin",
        phone: "+91 99000 00000",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      });
      console.log(`👑 Created designated System Admin account: [${designatedAdminEmail}]`);
    } else {
      if (designatedAdmin.role !== "admin") {
        designatedAdmin.role = "admin";
        await designatedAdmin.save();
        console.log(`👑 Restored 'admin' role for designated account: [${designatedAdminEmail}]`);
      } else {
        console.log(`👑 Designated System Admin account verified: [${designatedAdminEmail}]`);
      }
    }

    // Identify and report if any secondary admin accounts exist
    const secondaryAdmins = await User.find({
      role: { $regex: /^admin$/i },
      email: { $ne: designatedAdminEmail },
    });

    if (secondaryAdmins.length > 0) {
      for (const secAdmin of secondaryAdmins) {
        console.warn(`⚠️ Secondary admin account detected: [${secAdmin.email}] (ID: ${secAdmin._id}). Enforcing single-admin policy: downgrading to 'buyer'.`);
        secAdmin.role = "buyer";
        await secAdmin.save();
      }
    }
  } catch (error) {
    console.error("Error during duplicate user cleanup:", error.message);
  }
};

