import "dotenv/config";
import connectDB from "../config/db.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import Offer from "../models/Offer.js";

const run = async () => {
  await connectDB();
  console.log("Starting safe migration of listing ownership and bidding permissions...");

  const properties = await Property.find({});
  let migratedProps = 0;
  let flaggedProps = 0;

  for (const property of properties) {
    let creatorId = property.createdBy || property.owner;
    let creatorUser = null;

    if (creatorId) {
      creatorUser = await User.findById(creatorId);
    }

    if (!creatorUser && property.owner) {
      creatorUser = await User.findById(property.owner);
      creatorId = property.owner;
    }

    if (!creatorUser) {
      console.warn(`⚠️ Listing ID ${property._id} ("${property.title}") has missing/unverifiable owner. Flagging for manual review.`);
      property.needsManualReview = true;
      flaggedProps++;
    } else {
      const normalizedRole = (creatorUser.role || "seller").toLowerCase();
      property.createdBy = creatorUser._id;
      property.creatorRole = normalizedRole;
      property.owner = creatorUser._id;
      property.ownerRole = normalizedRole;
      property.needsManualReview = false;
      migratedProps++;
      console.log(`✅ Listing "${property.title}" (${property._id}) assigned createdBy: ${creatorUser.name} (${normalizedRole})`);
    }

    await property.save();
  }

  // Update existing offers with reliable listing creator snapshot
  const offers = await Offer.find({}).populate("property");
  let migratedOffers = 0;

  for (const offer of offers) {
    if (offer.property) {
      offer.listingCreator = offer.property.createdBy || offer.property.owner;
      offer.listingCreatorRole = offer.property.creatorRole || offer.property.ownerRole;
      await offer.save();
      migratedOffers++;
      console.log(`✅ Offer ${offer._id} synchronized with listingCreator: ${offer.listingCreator} (${offer.listingCreatorRole})`);
    }
  }

  console.log("==================================================");
  console.log(`Migration Complete:`);
  console.log(`- Properties verified & migrated: ${migratedProps}`);
  console.log(`- Properties flagged for review: ${flaggedProps}`);
  console.log(`- Offers synchronized: ${migratedOffers}`);
  console.log("==================================================");
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
