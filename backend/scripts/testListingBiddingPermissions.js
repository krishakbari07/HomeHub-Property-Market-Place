import "dotenv/config";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Offer from "../models/Offer.js";
import { canManageListingOffers } from "../controllers/offerController.js";
import mongoose from "mongoose";

const run = async () => {
  let isDbConnected = false;
  try {
    const connPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB connection timeout")), 1500)
    );
    await Promise.race([connPromise, timeoutPromise]);
    isDbConnected = true;
  } catch (err) {
    console.log("ℹ️ Database connection offline or sandboxed; running permissions suite using verified test fixtures.");
  }

  console.log("==================================================");
  console.log("🧪 HomeHub Bidding & Offer Permissions Test Suite");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  };

  // 1. Setup Test Users
  const adminUser = (isDbConnected && (await User.findOne({ role: "admin" }))) || { _id: new mongoose.Types.ObjectId(), role: "admin", name: "Test Admin" };
  const agent1 = (isDbConnected && (await User.findOne({ role: "agent" }))) || { _id: new mongoose.Types.ObjectId(), role: "agent", name: "Agent 1" };
  const agent2 = { _id: new mongoose.Types.ObjectId(), role: "agent", name: "Unrelated Agent 2" };
  const seller1 = (isDbConnected && (await User.findOne({ role: "seller" }))) || { _id: new mongoose.Types.ObjectId(), role: "seller", name: "Seller 1" };
  const seller2 = { _id: new mongoose.Types.ObjectId(), role: "seller", name: "Unrelated Seller 2" };
  const buyerUser = (isDbConnected && (await User.findOne({ role: "buyer" }))) || { _id: new mongoose.Types.ObjectId(), role: "buyer", name: "Buyer 1" };
  const renterUser = (isDbConnected && (await User.findOne({ role: "renter" }))) || { _id: new mongoose.Types.ObjectId(), role: "renter", name: "Renter 1" };

  console.log("\n--- Scenario 1: Admin-Created Listing ---");
  const adminListing = {
    _id: new mongoose.Types.ObjectId(),
    title: "Admin Test Penthouse",
    owner: adminUser._id,
    ownerRole: "admin",
    createdBy: adminUser._id,
    creatorRole: "admin",
    agent: agent1._id, // Notice: Agent is assigned for contact display, but cannot manage offers!
  };

  assert(
    canManageListingOffers(adminUser, adminListing) === true,
    "Admin can manage offers on an Admin-created listing"
  );
  assert(
    canManageListingOffers(agent1, adminListing) === false,
    "Assigned Agent CANNOT manage offers on an Admin-created listing"
  );
  assert(
    canManageListingOffers(agent2, adminListing) === false,
    "Unrelated Agent CANNOT manage offers on an Admin-created listing"
  );
  assert(
    canManageListingOffers(seller1, adminListing) === false,
    "Seller CANNOT manage offers on an Admin-created listing"
  );
  assert(
    canManageListingOffers(buyerUser, adminListing) === false,
    "Buyer CANNOT manage offers on an Admin-created listing"
  );

  console.log("\n--- Scenario 2: Agent-Created Listing ---");
  const agent1Listing = {
    _id: new mongoose.Types.ObjectId(),
    title: "Agent 1 Boutique Villa",
    owner: agent1._id,
    ownerRole: "agent",
    createdBy: agent1._id,
    creatorRole: "agent",
    agent: agent1._id,
  };

  assert(
    canManageListingOffers(agent1, agent1Listing) === true,
    "Creating Agent 1 can manage offers on their own Agent-created listing"
  );
  assert(
    canManageListingOffers(agent2, agent1Listing) === false,
    "Unrelated Agent 2 CANNOT manage offers on Agent 1's listing"
  );
  assert(
    canManageListingOffers(seller1, agent1Listing) === false,
    "Seller CANNOT manage offers on an Agent-created listing"
  );
  assert(
    canManageListingOffers(buyerUser, agent1Listing) === false,
    "Buyer CANNOT manage offers on an Agent-created listing"
  );

  console.log("\n--- Scenario 3: Seller-Created Listing ---");
  const seller1ListingWithAgent = {
    _id: new mongoose.Types.ObjectId(),
    title: "Seller 1 Luxury Farmhouse (With Agent)",
    owner: seller1._id,
    ownerRole: "seller",
    createdBy: seller1._id,
    creatorRole: "seller",
    agent: agent1._id, // Seller explicitly assigned agent1
  };

  const seller1ListingNoAgent = {
    _id: new mongoose.Types.ObjectId(),
    title: "Seller 1 Luxury Farmhouse (Direct Owner)",
    owner: seller1._id,
    ownerRole: "seller",
    createdBy: seller1._id,
    creatorRole: "seller",
    agent: null,
  };

  assert(
    canManageListingOffers(seller1, seller1ListingWithAgent) === true,
    "Creating Seller 1 can manage offers on their listing"
  );
  assert(
    canManageListingOffers(seller2, seller1ListingWithAgent) === false,
    "Unrelated Seller 2 CANNOT manage offers on Seller 1's listing"
  );
  assert(
    canManageListingOffers(agent1, seller1ListingWithAgent) === true,
    "Explicitly delegated Agent 1 CAN manage offers on Seller 1's listing"
  );
  assert(
    canManageListingOffers(agent2, seller1ListingWithAgent) === false,
    "Unrelated Agent 2 CANNOT manage offers on Seller 1's listing"
  );
  assert(
    canManageListingOffers(agent1, seller1ListingNoAgent) === false,
    "Agent 1 CANNOT manage offers when not designated on Seller 1's direct listing"
  );
  assert(
    canManageListingOffers(buyerUser, seller1ListingWithAgent) === false,
    "Buyer CANNOT manage offers on Seller 1's listing"
  );

  console.log("\n--- Scenario 4: Buyer / Renter Permissions ---");
  assert(
    canManageListingOffers(buyerUser, adminListing) === false,
    "Buyer cannot accept/reject/counter offers (Admin listing)"
  );
  assert(
    canManageListingOffers(buyerUser, agent1Listing) === false,
    "Buyer cannot accept/reject/counter offers (Agent listing)"
  );
  assert(
    canManageListingOffers(buyerUser, seller1ListingWithAgent) === false,
    "Buyer cannot accept/reject/counter offers (Seller listing)"
  );
  assert(
    canManageListingOffers(renterUser, seller1ListingWithAgent) === false,
    "Renter cannot accept/reject/counter offers"
  );

  console.log("\n--- Scenario 5: Anti-Spoofing & Role Parameter Immunity ---");
  // Attacker sends forged object attempting to spoof role or owner ID
  const attacker = {
    _id: buyerUser._id,
    role: "buyer",
  };
  const spoofedListingAttempt = {
    ...adminListing,
    clientClaimedOwner: buyerUser._id,
    clientClaimedRole: "admin",
  };
  assert(
    canManageListingOffers(attacker, spoofedListingAttempt) === false,
    "Server rejects spoofed client credentials; relies strictly on authenticated identity"
  );

  if (isDbConnected) {
    console.log("\n--- Scenario 6: Database Listing & Offer Integrity ---");
    const liveAdminListing = await Property.findOne({ creatorRole: "admin" });
    if (liveAdminListing) {
      assert(
        canManageListingOffers(adminUser, liveAdminListing) === true,
        `Live database Admin listing "${liveAdminListing.title}" can be managed by Admin`
      );
      assert(
        canManageListingOffers(agent1, liveAdminListing) === false,
        `Live database Admin listing "${liveAdminListing.title}" CANNOT be managed by Agent ${agent1.name}`
      );
    }

    const liveSellerListing = await Property.findOne({ creatorRole: "seller" });
    if (liveSellerListing) {
      const liveSellerUser = await User.findById(liveSellerListing.owner);
      assert(
        canManageListingOffers(liveSellerUser, liveSellerListing) === true,
        `Live database Seller listing "${liveSellerListing.title}" can be managed by its owner ${liveSellerUser?.name}`
      );
      assert(
        canManageListingOffers(seller2, liveSellerListing) === false,
        `Live database Seller listing "${liveSellerListing.title}" CANNOT be managed by unrelated Seller 2`
      );
    }
  }

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
