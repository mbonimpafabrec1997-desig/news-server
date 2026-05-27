import express from "express";
import Status from "../models/Status.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const activeStatuses = await Status.find().sort({ createdAt: -1 });
    res.status(200).json(activeStatuses);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching stories", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, media, caption, musicName, music, author } = req.body;
    
    if (!type || !media) {
      return res.status(400).json({ message: "Media and Type are required" });
    }

    const newStatus = new Status({
      type,
      media,
      caption,
      musicName,
      music,
      author: author || "User"
    });

    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error creating story", error });
  }
});

router.put("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; 

    const status = await Status.findById(id);
    if (!status) return res.status(404).json({ message: "Story not found" });

    const hasLiked = status.likedUsers.includes(userId);

    if (hasLiked) {
      status.likedUsers = status.likedUsers.filter(uid => uid !== userId);
      status.likes = Math.max(0, status.likes - 1);
    } else {
      status.likedUsers.push(userId);
      status.likes += 1;
    }

    await status.save();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: "Server error linking story", error });
  }
});

export default router;