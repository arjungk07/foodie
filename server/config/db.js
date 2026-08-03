import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Wait up to 10 seconds
      socketTimeoutMS: 45000,          // Close inactive sockets after 45 seconds
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ MongoDB Connected Successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ MongoDB Connection Failed");
    console.error(`📄 Error   : ${error.message}`);

    if (
      error.message.includes("IP") ||
      error.message.includes("whitelist") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("💡 Check:");
      console.error("   • MongoDB Atlas Network Access (IP Whitelist)");
      console.error("   • Cluster is running");
      console.error("   • MONGODB_URI is correct");
      console.error("   • Username and password are correct");
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(1);
  }
};

export default connectDB;