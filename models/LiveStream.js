import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema({
  peerId: { type: String, required: true, unique: true },
  title: { type: String, default: "Live Stream" },
  hostName: { type: String, default: "Presenter" },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "ended"], default: "active" }
}, { timestamps: true });

const LiveStream = mongoose.models.LiveStream || mongoose.model("LiveStream", liveStreamSchema);
export default LiveStream;
