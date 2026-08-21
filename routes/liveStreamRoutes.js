import express from "express";
import LiveStream from "../models/LiveStream.js";

const router = express.Router();

// Get active live streams
router.get("/", async (req, res) => {
  try {
    const streams = await LiveStream.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json(streams);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching live streams", error });
  }
});

// Start/Create a live stream
router.post("/", async (req, res) => {
  try {
    const { peerId, title, hostName, hostId } = req.body;
    if (!peerId) {
      return res.status(400).json({ message: "peerId is required" });
    }
    // Delete any existing active stream with this peerId to avoid duplication
    await LiveStream.deleteMany({ peerId });

    const newStream = new LiveStream({
      peerId,
      title: title || "Global News Live Stream",
      hostName: hostName || "Presenter",
      hostId: hostId || undefined
    });

    await newStream.save();
    res.status(201).json(newStream);
  } catch (error) {
    res.status(500).json({ message: "Server error starting live stream", error });
  }
});

// End/Delete a live stream
router.delete("/:peerId", async (req, res) => {
  try {
    const { peerId } = req.params;
    await LiveStream.deleteMany({ peerId });
    res.status(200).json({ message: "Live stream ended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error ending live stream", error });
  }
});

export default router;
