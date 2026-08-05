import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin", "journalist"],
    default: "user"
  },
  journalistStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "none"],
    default: "none"
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  notifications: [{
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  avatar: { type: String, default: "" },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: "" },
  isMonetized: { type: Boolean, default: false },
  paymentDetails: {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    swiftCode: { type: String, default: "" },
    country: { type: String, default: "" }
  },
  categoryInterests: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;