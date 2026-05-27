import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  author: {
    type: String,
    default: "User"
  },
  type: {
    type: String,
    enum: ["photo", "video", "audio"],
    required: true
  },
  media: {
    type: String, 
    required: true
  },
  caption: {
    type: String,
    default: ""
  },
  musicName: {
    type: String,
    default: ""
  },
  music: {
    type: String,
    default: ""
  },
  likes: {
    type: Number,
    default: 0
  },
  likedUsers: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 
  }
});

export default mongoose.model("Status", statusSchema);