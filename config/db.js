import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("⏳ Guhuza na MongoDB...");
    console.log("🔗 URI:", process.env.MONGO_URI); 
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // ← itegereza seconds 30
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;