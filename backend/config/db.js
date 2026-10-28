import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing in backend/.env");
    }

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const hostStr = conn.connection?.host || "";
    const isAtlas = hostStr.includes("mongodb.net");
    console.log(`==================================================`);
    console.log(`✅ MongoDB Connected Successfully: ${hostStr || "cluster"}`);
    if (isAtlas) {
      console.log(`🌐 Connected to Cloud MongoDB Atlas Database: [${conn.connection.name}]`);
    } else {
      console.log(`💻 Connected to Local MongoDB Database: [${conn.connection.name}]`);
    }
    console.log(`==================================================`);
    return conn;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Database:", error.message);
    process.exit(1);
  }
};

export default connectDB;