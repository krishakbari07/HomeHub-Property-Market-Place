import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "+91 98765 00000",
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "agent", "renter", "rental", "admin", "user", "Buyer", "Seller", "Agent", "Renter", "Rental", "Admin", "User"],
      default: "buyer",
      lowercase: true,
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
    profileImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    },
    preferredCity: {
      type: String,
      default: "Ahmedabad",
    },
    budgetRange: {
      type: String,
      default: "",
    },
    buyerBudget: {
      type: Number,
      default: null,
    },
    rentalBudget: {
      type: Number,
      default: null,
    },
    agencyName: {
      type: String,
      default: "",
    },
    reraId: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified and not already hashed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  // Double-hashing prevention
  if (
    this.password &&
    (this.password.startsWith("$2a$") ||
      this.password.startsWith("$2b$") ||
      this.password.startsWith("$2y$"))
  ) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored bcrypt password (or migrate legacy plain-text password)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;

  const isBcryptHash =
    this.password.startsWith("$2a$") ||
    this.password.startsWith("$2b$") ||
    this.password.startsWith("$2y$");

  if (isBcryptHash) {
    return await bcrypt.compare(enteredPassword, this.password);
  } else {
    // Legacy plain text check & auto-migration to bcrypt
    if (enteredPassword === this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(enteredPassword, salt);
      await this.save();
      return true;
    }
    return false;
  }
};

// Compound index for role-based queries (e.g., agents listing, admin lookups)
userSchema.index({ role: 1, name: 1 });

const User = mongoose.model("User", userSchema);
export default User;
