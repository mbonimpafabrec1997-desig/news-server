import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { 
  getNews, 
  createNews, 
  getMyNews, 
  getNewsById,
  getAIRecommendations
} from "../controllers/newsController.js";
import { deleteNews } from "../controllers/deleteNews.js";

const router = express.Router();

router.get("/", getNews);
router.get("/recommendations", protect(), getAIRecommendations);
router.get("/my-news", protect(), getMyNews);
router.get("/:id", getNewsById);
router.post("/", protect(), createNews);
router.delete("/:id", protect(), deleteNews);

export default router;