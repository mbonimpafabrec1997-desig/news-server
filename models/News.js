import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: "" },     
  category: { type: String, required: true },
  country: { type: String, default: "" },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft"
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
  }],
  viewsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true                           
  },
  copyrightStrike: {
    isStriked: { type: Boolean, default: false },
    originalAuthor: { type: String, default: "" },
    compensationFee: { type: String, default: "" },
    strikedAt: { type: Date }
  }
}, { timestamps: true });

const News = mongoose.models.News || mongoose.model("News", newsSchema);
export default News;