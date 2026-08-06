import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { 
  getNews, 
  createNews, 
  getMyNews, 
  getNewsById,
  getAIRecommendations,
  addComment,
  likeNews
} from "../controllers/newsController.js";
import { deleteNews } from "../controllers/deleteNews.js";

const router = express.Router();

router.get("/", getNews);
router.get("/recommendations", protect(), getAIRecommendations);
router.get("/my-news", protect(), getMyNews);
router.get("/:id", getNewsById);
router.post("/", protect(), createNews);
router.post("/:id/comments", protect(), addComment);
router.post("/:id/like", protect(), likeNews);
router.delete("/:id", protect(), deleteNews);

export default router;