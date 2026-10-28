import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Property from "./models/Property.js";

// Safe Property Catalog Seed (Only seeds if Properties collection is empty; NEVER seeds demo users or touches genuine accounts)
const seedProperties = [
  {
    title: "Luxury 4 BHK Modern Villa",
    price: 24500000,
    formattedPrice: "₹2.45 Cr",
    location: "Bopal, Ahmedabad",
    city: "Ahmedabad",
    type: "Villa",
    purpose: "buy",
    bedrooms: 4,
    bathrooms: 4,
    areaSqFt: 2800,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    isFeatured: true,
    aiMatchScore: 99,
    description: "Architectural masterpiece modern luxury villa situated in prime location of Bopal, Ahmedabad. Smart home automation, private manicured garden, double height living room.",
    features: ["Smart Home Automation", "Private Garden", "Covered Parking", "24/7 Security", "Solar Power System", "Clubhouse Access"],
  },
  {
    title: "Premium 3 BHK High-Rise Apartment",
    price: 28000,
    formattedPrice: "₹28,000 /mo",
    location: "Satellite, Ahmedabad",
    city: "Ahmedabad",
    type: "Apartment",
    purpose: "rent",
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 1750,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    isFeatured: true,
    aiMatchScore: 95,
    description: "Fully furnished 3BHK premium apartment in prime Satellite locality. Includes wooden flooring, designer modular kitchen, split ACs, clubhouse access, swimming pool.",
    features: ["Furnished", "Elevator", "Swimming Pool", "Gym", "Power Backup", "Covered Car Parking"],
  },
  {
    title: "Elegant 3 BHK Builder Floor Flat",
    price: 12500000,
    formattedPrice: "₹1.25 Cr",
    location: "South Bopal, Ahmedabad",
    city: "Ahmedabad",
    type: "Flat",
    purpose: "buy",
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 1550,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
    ],
    isFeatured: true,
    aiMatchScore: 92,
    description: "Spacious 3BHK flat in South Bopal with excellent cross-ventilation, abundant natural light, proximity to top schools and hospitals.",
    features: ["Park Facing", "Reserved Parking", "Intercom", "Power Backup", "Children Play Area"],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    const existingProps = await Property.countDocuments();
    if (existingProps > 0) {
      console.log(`ℹ️ Properties already exist in MongoDB Atlas (${existingProps} properties found). Skipping seeding to preserve live data.`);
      process.exit(0);
    }

    const designatedAdminEmail = (process.env.ADMIN_EMAIL || "admin@homehub.com").toLowerCase().trim();
    const adminUser = await User.findOne({ email: designatedAdminEmail });

    if (!adminUser) {
      console.error("❌ Administrator user not found. Please start the server first to initialize admin.");
      process.exit(1);
    }

    console.log("Seeding initial properties catalog under designated admin...");
    for (const p of seedProperties) {
      await Property.create({
        ...p,
        owner: adminUser._id,
        ownerName: adminUser.name,
        ownerRole: adminUser.role,
      });
    }

    console.log("✅ Catalog properties seeded safely without creating fake demo accounts!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
