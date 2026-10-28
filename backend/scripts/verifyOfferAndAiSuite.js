// Comprehensive HomeHub Automated Verification Suite
// Tests:
// 1. CRM Budget Formatting & Schema Defaults
// 2. Offer / Bidding System Validation, Lifecycle & Security Isolation
// 3. AI Grounding, Deterministic Scoring, & Price Estimator Safety

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Offer from "../models/Offer.js";
import {
  submitOffer,
  acceptOffer,
  rejectOffer,
  counterOffer,
  withdrawOffer,
  respondToCounter,
} from "../controllers/offerController.js";
import { formatIndianCurrency, formatClientBudget } from "../utils/currencyFormatter.js";
import {
  calculateMatchScore,
  normalizeSearchQuery,
  estimatePropertyValuation,
} from "../services/geminiService.js";

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("======================================================================");
  console.log("🚀 Starting Comprehensive HomeHub Verification Suite");
  console.log("======================================================================\n");

  try {
    // -------------------------------------------------------------
    // SECTION 1: CRM Budget Formatting & Schema Integrity
    // -------------------------------------------------------------
    console.log("📋 [Section 1] Agent CRM Budget & Currency Formatting");

    // Test formatIndianCurrency
    assert(formatIndianCurrency(25000000) === "₹ 2.50 Cr", "Formats 2.5 Cr correctly");
    assert(formatIndianCurrency(4500000) === "₹ 45 Lakh", "Formats 45 Lakhs correctly");
    assert(formatIndianCurrency(35000, { isRental: true }) === "₹ 35,000/month", "Formats rental 35,000/month correctly");
    assert(formatIndianCurrency(0) === "Not specified", "0 amount returns 'Not specified'");
    assert(formatIndianCurrency(null) === "Not specified", "null returns 'Not specified'");
    assert(formatIndianCurrency(undefined) === "Not specified", "undefined returns 'Not specified'");

    // Test formatClientBudget
    const buyerWithBudget = { role: "buyer", buyerBudget: 8500000 };
    assert(formatClientBudget(buyerWithBudget) === "₹ 85 Lakh", "Buyer with numeric buyerBudget formats correctly");

    const buyerWithCroreBudget = { role: "buyer", buyerBudget: 15000000 };
    assert(formatClientBudget(buyerWithCroreBudget) === "₹ 1.50 Cr", "Buyer with 1.5 Cr buyerBudget formats correctly");

    const renterWithBudget = { role: "renter", rentalBudget: 25000 };
    assert(formatClientBudget(renterWithBudget) === "₹ 25,000/month", "Renter with monthly rentalBudget formats correctly");

    const clientWithNoBudget = { role: "buyer" };
    assert(formatClientBudget(clientWithNoBudget) === "Not specified", "Missing budget displays 'Not specified' (no fake default)");

    // Renter protection: renter with old corrupt legacy string "₹ 1 Cr - ₹ 2 Cr" must return "Not specified"
    const renterWithLegacyBogusCr = { role: "renter", budgetRange: "₹ 1 Cr - ₹ 2 Cr" };
    assert(formatClientBudget(renterWithLegacyBogusCr) === "Not specified", "Renter with legacy '₹ 1 Cr - ₹ 2 Cr' is sanitized to 'Not specified'");

    // User model schema default check
    const budgetRangeDefault = User.schema.paths.budgetRange.defaultValue;
    assert(
      budgetRangeDefault !== "₹ 1 Cr - ₹ 2 Cr",
      `User schema budgetRange has no hardcoded '₹ 1 Cr - ₹ 2 Cr' default (found: ${budgetRangeDefault || "undefined"})`
    );
    assert(!!User.schema.paths.buyerBudget, "User schema has 'buyerBudget' path");
    assert(!!User.schema.paths.rentalBudget, "User schema has 'rentalBudget' path");

    // -------------------------------------------------------------
    // SECTION 2: Database Connection & Seed Data Inspection
    // -------------------------------------------------------------
    console.log("\n📦 [Section 2] Connecting to Database & Inspecting Genuine Listings");
    await connectDB();

    const properties = await Property.find({}).limit(10).lean();
    assert(properties.length > 0, `Retrieved ${properties.length} genuine property listing(s) from database`);

    const genuineSaleProp = properties.find(
      (p) =>
        (p.status || "").toLowerCase() === "available" &&
        ((p.purpose || "").toLowerCase() === "buy" || (p.purpose || "").toLowerCase() === "sale")
    );
    assert(!!genuineSaleProp, `Found genuine available property for testing: "${genuineSaleProp?.title}" (₹${genuineSaleProp?.price})`);

    // Verify existing users
    const buyerUser = await User.findOne({ email: "krish@gmail.com" });
    const sellerUser = await User.findOne({ email: "vansh@gmail.com" });
    const agentUser = await User.findOne({ email: "meet@gmail.com" });

    assert(!!buyerUser, "Buyer user (krish@gmail.com) exists");
    assert(!!sellerUser, "Seller user (vansh@gmail.com) exists");
    assert(!!agentUser, "Agent user (meet@gmail.com) exists");

    // -------------------------------------------------------------
    // SECTION 3: Property Bidding / Offer Management System
    // -------------------------------------------------------------
    console.log("\n🤝 [Section 3] Property Bidding / Offer Management System");

    // Test 3.1: Server-side validation - Negative amount rejection
    let negativeOfferError = null;
    try {
      const invalidOffer = new Offer({
        property: genuineSaleProp._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerType: "purchase",
        amount: -100000,
        askingPrice: genuineSaleProp.price,
      });
      await invalidOffer.validate();
    } catch (err) {
      negativeOfferError = err;
    }
    assert(!!negativeOfferError, "Model validation prevents negative offer amounts (rejected with validation error)");

    // Test 3.2: Clean up any prior test offers on genuineSaleProp to start clean
    await Offer.deleteMany({ property: genuineSaleProp._id, buyer: buyerUser._id });

    // Test 3.3: Submit a valid purchase offer
    const originalAskingPrice = genuineSaleProp.price;
    const originalPropStatus = genuineSaleProp.status;
    const testOfferAmount = originalAskingPrice * 0.95; // 5% below asking price

    const validOffer = await Offer.create({
      property: genuineSaleProp._id,
      buyer: buyerUser._id,
      seller: sellerUser._id,
      agent: genuineSaleProp.agent || agentUser._id,
      offerType: "purchase",
      amount: testOfferAmount,
      askingPrice: originalAskingPrice,
      status: "pending",
      notes: "Verification suite test offer",
      history: [
        {
          status: "pending",
          action: "submitted",
          actor: buyerUser._id,
          actorRole: "buyer",
          amount: testOfferAmount,
          note: "Initial test offer",
          timestamp: new Date(),
        },
      ],
    });

    assert(validOffer._id && validOffer.status === "pending", "Submitted valid purchase offer with 'pending' status");
    assert(validOffer.history.length === 1, "Recorded initial audit history entry with action 'submitted'");

    // Test 3.4: Invariance check - property asking price & status must NOT change
    const propAfterOffer = await Property.findById(genuineSaleProp._id).lean();
    assert(propAfterOffer.price === originalAskingPrice, "Listing asking price was NOT changed by offer submission");
    assert(propAfterOffer.status === originalPropStatus, "Listing status was NOT changed to sold/rented by offer submission");

    // Test 3.5: Counteroffer workflow
    const counterAmount = originalAskingPrice * 0.98;
    validOffer.status = "countered";
    validOffer.counterAmount = counterAmount;
    validOffer.counterNote = "Countering at 98% of asking price";
    validOffer.history.push({
      status: "countered",
      action: "countered",
      actor: sellerUser._id,
      actorRole: "seller",
      amount: counterAmount,
      note: "Countering at 98% of asking price",
      timestamp: new Date(),
    });
    await validOffer.save();

    const fetchedCounteredOffer = await Offer.findById(validOffer._id).lean();
    assert(fetchedCounteredOffer.status === "countered", "Offer successfully transitioned to 'countered' status");
    assert(fetchedCounteredOffer.counterAmount === counterAmount, "Counter amount recorded accurately");
    assert(fetchedCounteredOffer.history.length === 2, "Offer audit history reflects counteroffer action");

    // Test 3.6: Buyer responds to counteroffer (Accepts)
    validOffer.status = "accepted";
    validOffer.history.push({
      status: "accepted",
      action: "counter_accepted",
      actor: buyerUser._id,
      actorRole: "buyer",
      amount: counterAmount,
      note: "Accepted counteroffer",
      timestamp: new Date(),
    });
    await validOffer.save();

    const fetchedAcceptedOffer = await Offer.findById(validOffer._id).lean();
    assert(fetchedAcceptedOffer.status === "accepted", "Offer successfully transitioned to 'accepted' status");
    assert(fetchedAcceptedOffer.history.length === 3, "Complete 3-step audit history maintained");

    // Test 3.7: Offer withdrawal workflow
    const withdrawalTestOffer = await Offer.create({
      property: genuineSaleProp._id,
      buyer: buyerUser._id,
      seller: sellerUser._id,
      offerType: "purchase",
      amount: testOfferAmount * 0.9,
      askingPrice: originalAskingPrice,
      status: "pending",
      notes: "Offer to be withdrawn",
      history: [
        {
          status: "pending",
          action: "submitted",
          actor: buyerUser._id,
          actorRole: "buyer",
          amount: testOfferAmount * 0.9,
          timestamp: new Date(),
        },
      ],
    });

    assert(withdrawalTestOffer.status === "pending", "Created pending offer for withdrawal test");

    // Withdraw pending offer
    withdrawalTestOffer.status = "withdrawn";
    withdrawalTestOffer.history.push({
      status: "withdrawn",
      action: "withdrawn",
      actor: buyerUser._id,
      actorRole: "buyer",
      timestamp: new Date(),
    });
    await withdrawalTestOffer.save();

    const fetchedWithdrawn = await Offer.findById(withdrawalTestOffer._id).lean();
    assert(fetchedWithdrawn.status === "withdrawn", "Offer transitioned to 'withdrawn' status successfully");

    // Clean up test offers created during test
    await Offer.deleteMany({ _id: { $in: [validOffer._id, withdrawalTestOffer._id] } });
    console.log("  🧹 Cleaned up test offers; genuine listings & data preserved.");

    // Test 3.8: Controller-Level Authorization & Security Isolation Tests
    const createMockRes = () => {
      const res = {};
      res.statusCode = 200;
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (payload) => {
        res.data = payload;
        return res;
      };
      return res;
    };

    // Submitting negative amount via controller
    const negReq = { user: buyerUser, body: { propertyId: genuineSaleProp._id, amount: -5000 } };
    const negRes = createMockRes();
    await submitOffer(negReq, negRes);
    assert(negRes.statusCode === 400, "submitOffer controller rejects negative amounts with HTTP 400");

    // Owner bidding on their own property
    const ownerId = genuineSaleProp.owner || sellerUser._id;
    const ownerReq = { user: { _id: ownerId }, body: { propertyId: genuineSaleProp._id, amount: 25000000 } };
    const ownerRes = createMockRes();
    await submitOffer(ownerReq, ownerRes);
    assert(ownerRes.statusCode === 400 && ownerRes.data?.message?.includes("owners cannot submit offers"), "submitOffer prevents owner from bidding on own property");

    // Submit a valid offer via controller to test authorization guards
    const ctrlOfferReq = { user: buyerUser, body: { propertyId: genuineSaleProp._id, amount: testOfferAmount } };
    const ctrlOfferRes = createMockRes();
    await submitOffer(ctrlOfferReq, ctrlOfferRes);
    assert(ctrlOfferRes.statusCode === 201 && ctrlOfferRes.data?.data?._id, "submitOffer controller creates offer with HTTP 201");
    const activeOfferId = ctrlOfferRes.data?.data?._id;

    // Test Duplicate Active Offer rejection
    const dupRes = createMockRes();
    await submitOffer(ctrlOfferReq, dupRes);
    assert(dupRes.statusCode === 400 && dupRes.data?.message?.includes("already have an active offer"), "submitOffer blocks duplicate active offers with HTTP 400");

    // Test Unauthorized Agent attempting to accept offer
    const rogueAgentId = new mongoose.Types.ObjectId();
    const rogueAgentReq = {
      user: { _id: rogueAgentId, role: "agent" },
      params: { id: activeOfferId },
      body: {},
    };
    const rogueAgentRes = createMockRes();
    await acceptOffer(rogueAgentReq, rogueAgentRes);
    assert(rogueAgentRes.statusCode === 403, "acceptOffer rejects unauthorized agent with HTTP 403 Forbidden");

    // Test Unauthorized User attempting to withdraw another user's offer
    const rogueBuyerId = new mongoose.Types.ObjectId();
    const rogueBuyerReq = {
      user: { _id: rogueBuyerId, role: "buyer" },
      params: { id: activeOfferId },
      body: {},
    };
    const rogueBuyerRes = createMockRes();
    await withdrawOffer(rogueBuyerReq, rogueBuyerRes);
    assert(rogueBuyerRes.statusCode === 403, "withdrawOffer rejects unauthorized user with HTTP 403 Forbidden");

    // Submitting buyer legitimately withdraws their offer
    const legitWithdrawReq = {
      user: buyerUser,
      params: { id: activeOfferId },
      body: { reason: "Testing withdrawal" },
    };
    const legitWithdrawRes = createMockRes();
    await withdrawOffer(legitWithdrawReq, legitWithdrawRes);
    assert(legitWithdrawRes.statusCode === 200, "Submitting buyer successfully withdraws offer with HTTP 200");

    // Cannot withdraw already withdrawn offer
    const retryWithdrawRes = createMockRes();
    await withdrawOffer(legitWithdrawReq, retryWithdrawRes);
    assert(retryWithdrawRes.statusCode === 400, "Cannot withdraw an offer that is already withdrawn (HTTP 400)");

    // Clean up controller test offer
    await Offer.findByIdAndDelete(activeOfferId);
    console.log("  🧹 Controller test offers cleared.");

    // -------------------------------------------------------------
    // SECTION 4: AI Grounding, Deterministic Scoring & Search Normalization
    // -------------------------------------------------------------
    console.log("\n🧠 [Section 4] AI Grounding, Deterministic Scoring & Normalization");

    // Test 4.1: Natural-Language Normalization of Indian Currencies & Intents
    const buyQuery = "Looking for a 3 bhk luxury villa in bodakdev under 3 crore for sale";
    const parsedBuy = normalizeSearchQuery(buyQuery);
    assert(parsedBuy.purpose === "buy", `Extracted purpose 'buy' from query`);
    assert(parsedBuy.bedrooms === 3, `Extracted 3 BHK from query`);
    assert(parsedBuy.type === "Villa", `Extracted 'Villa' type from query`);
    assert(parsedBuy.maxPrice === 30000000, `Normalized 'under 3 crore' to 30,000,000 INR`);

    const rentQuery = "Need a 2 bhk flat in satellite rent under 25k";
    const parsedRent = normalizeSearchQuery(rentQuery);
    assert(parsedRent.purpose === "rent", `Extracted purpose 'rent' from query`);
    assert(parsedRent.bedrooms === 2, `Extracted 2 BHK from query`);
    assert(parsedRent.type === "Apartment", `Extracted 'Apartment' type from query`);
    assert(parsedRent.maxPrice === 25000, `Normalized 'under 25k' to 25,000 INR`);

    // Test 4.2: Deterministic Weighted Match Scoring Formula
    const sampleProperty = {
      city: "Ahmedabad",
      price: 15000000,
      bedrooms: 4,
      type: "Villa",
      purpose: "buy",
    };

    // Perfect match criteria
    const perfectCriteria = {
      purpose: "buy",
      preferredCity: "Ahmedabad",
      maxBudget: 16000000,
      propertyType: "Villa",
      bedrooms: 4,
    };
    const perfectScore = calculateMatchScore(sampleProperty, perfectCriteria);
    // Purpose (30) + City (25) + Budget (25) + Type (10) + Bedrooms (10) = 100, clamped to max 98
    assert(perfectScore.score === 98, `Deterministic score formula computes max clamped score of 98 (computed: ${perfectScore.score}%)`);
    assert(perfectScore.matchedFactors.length >= 4, `Matched factors list generated transparently (${perfectScore.matchedFactors.length} factors)`);

    // Mismatched city criteria
    const mismatchedCityCriteria = {
      purpose: "buy",
      preferredCity: "Mumbai",
      maxBudget: 16000000,
      propertyType: "Villa",
      bedrooms: 4,
    };
    const mismatchedScore = calculateMatchScore(sampleProperty, mismatchedCityCriteria);
    // drops by 25 pts
    assert(
      mismatchedScore.score <= 75,
      `Mismatched city reduces match score as expected (score: ${mismatchedScore.score}%)`
    );

    // Test 4.3: Valuation & Price Estimator Safety
    // When insufficient comparable properties exist in DB -> Must return INSUFFICIENT_DATA status
    const sparseQuery = {
      city: "NonExistentCityXYZ",
      areaSqFt: 25000,
      bedrooms: 10,
      propertyType: "Castle",
      purpose: "buy",
    };
    const sparseValuation = await estimatePropertyValuation(sparseQuery);
    assert(
      sparseValuation.status === "INSUFFICIENT_DATA",
      "Sparse/Zero-comp valuation returns status 'INSUFFICIENT_DATA'"
    );
    assert(
      sparseValuation.message.includes("Insufficient data to estimate reliably"),
      "Sparse valuation message informs user 'Insufficient data to estimate reliably' without inventing numbers"
    );
    assert(
      sparseValuation.comparablesUsed === 0,
      "Reported 0 comparables used for sparse query"
    );

    // Test 4.4: Real DB Comparable Valuation (Ahmedabad Buy)
    const ahmedabadValuation = await estimatePropertyValuation({
      city: "Ahmedabad",
      areaSqFt: 3000,
      bedrooms: 4,
      propertyType: "Villa",
      purpose: "buy",
    });

    if (ahmedabadValuation.status === "ESTIMATE_CALCULATED") {
      assert(
        ahmedabadValuation.estimatedValue > 0,
        `Real valuation calculated strictly from ${ahmedabadValuation.comparablesUsed} actual database comps (Avg ₹${ahmedabadValuation.avgRatePerSqFt}/sq.ft)`
      );
      assert(
        ahmedabadValuation.comparablesSample.length > 0 &&
          ahmedabadValuation.comparablesSample.every((c) => !!c.title && c.price > 0),
        "Valuation comparables sample contains verified genuine database listings"
      );
    } else {
      assert(
        ahmedabadValuation.status === "INSUFFICIENT_DATA",
        "Valuation safely handled data volume"
      );
    }

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log("\n======================================================================");
    console.log(`🏁 Test Suite Finished: ${passed} PASSED, ${failed} FAILED`);
    console.log("======================================================================\n");

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Critical test suite failure:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTestSuite();
