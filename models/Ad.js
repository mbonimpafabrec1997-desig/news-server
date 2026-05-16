import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true },
  duration: { type: Number, required: true }, 
  description: { type: String },
  banner: { type: String }, 
  status: { type: String, default: "pending" }, 
  createdAt: { type: Date, default: Date.now },
});

const Ad = mongoose.model("Ad", adSchema);
export default Ad;