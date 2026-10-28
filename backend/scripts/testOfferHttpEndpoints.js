process.env.PORT = "5099";
import "dotenv/config";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Offer from "../models/Offer.js";
import jwt from "jsonwebtoken";
import app from "../app.js";
import mongoose from "mongoose";

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  // Wait 2 seconds for app to connect to DB and start listening on port 5099
  await delay(2000);

  console.log("==================================================");
  console.log("🧪 Testing Direct HTTP Offer Authorization APIs");
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

  const admin = await User.findOne({ role: "admin" });
  const buyer = await User.findOne({ role: "buyer" });
  const agent = await User.findOne({ role: "agent" });
  const seller = await User.findOne({ role: "seller" });

  const adminToken = createToken(admin);
  const buyerToken = createToken(buyer);
  const agentToken = createToken(agent);
  const sellerToken = createToken(seller);

  // Test 1: Admin Listing - Offer created
  const testAdminProp = await Property.create({
    title: "HTTP Test Admin Luxury Villa",
    description: "Admin property for testing permissions",
    price: 50000000,
    purpose: "buy",
    location: "Bodakdev, Ahmedabad",
    city: "Ahmedabad",
    owner: admin._id,
    ownerRole: "admin",
    createdBy: admin._id,
    creatorRole: "admin",
    agent: agent._id, // Notice: agent attached for contact, but unauthorized to manage offers!
    status: "Available",
  });

  const testOffer = await Offer.create({
    property: testAdminProp._id,
    buyer: buyer._id,
    seller: admin._id,
    listingCreator: admin._id,
    listingCreatorRole: "admin",
    agent: agent._id,
    offerType: "purchase",
    amount: 48000000,
    askingPrice: 50000000,
    status: "pending",
  });

  // Test 1a: Unrelated Agent tries to accept Admin listing offer -> Expect 403 Forbidden
  const agentAcceptRes = await fetch(`http://127.0.0.1:5000/api/offers/${testOffer._id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${agentToken}`,
    },
    body: JSON.stringify({ note: "Agent attempting unauthorized accept" }),
  });

  assert(
    agentAcceptRes.status === 403,
    `Direct HTTP PUT by Agent on Admin listing returned 403 Forbidden (Got: ${agentAcceptRes.status})`
  );

  // Test 1b: Unrelated Seller tries to counter Admin listing offer -> Expect 403 Forbidden
  const sellerCounterRes = await fetch(`http://127.0.0.1:5000/api/offers/${testOffer._id}/counter`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sellerToken}`,
    },
    body: JSON.stringify({ counterAmount: 49000000 }),
  });

  assert(
    sellerCounterRes.status === 403,
    `Direct HTTP PUT by Seller on Admin listing returned 403 Forbidden (Got: ${sellerCounterRes.status})`
  );

  // Test 1c: Submitting Buyer tries to accept their own offer -> Expect 403 Forbidden
  const buyerAcceptRes = await fetch(`http://127.0.0.1:5000/api/offers/${testOffer._id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${buyerToken}`,
    },
    body: JSON.stringify({}),
  });

  assert(
    buyerAcceptRes.status === 403,
    `Direct HTTP PUT by Buyer attempting to accept own offer returned 403 Forbidden (Got: ${buyerAcceptRes.status})`
  );

  // Test 1d: Authorized Admin accepts offer -> Expect 200 OK
  const adminAcceptRes = await fetch(`http://127.0.0.1:5000/api/offers/${testOffer._id}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ note: "Formal admin acceptance" }),
  });
  const adminAcceptJson = await adminAcceptRes.json();

  assert(
    adminAcceptRes.status === 200 && adminAcceptJson.data?.status === "accepted",
    `Direct HTTP PUT by authorized Admin succeeded with 200 OK (Status: ${adminAcceptJson.data?.status})`
  );

  // Test 2: Asking price immutability check
  const reloadedProp = await Property.findById(testAdminProp._id);
  assert(
    reloadedProp.price === 50000000,
    `Property asking price remains untouched at ₹${reloadedProp.price.toLocaleString("en-IN")}`
  );

  // Clean up scratch test documents
  await Offer.findByIdAndDelete(testOffer._id);
  await Property.findByIdAndDelete(testAdminProp._id);

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
