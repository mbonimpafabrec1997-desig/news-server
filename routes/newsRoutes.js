import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { getNews, createNews, getMyNews, getNewsById } from "../controllers/newsController.js";
import { deleteNews } from "../controllers/deleteNews.js";
import { sendNewArticleEmail } from "../utils/sendEmail.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/", getNews);
router.get("/my-news", protect(), getMyNews);
router.get("/:id", getNewsById);
router.post("/", protect(), createNews);
router.delete("/:id", protect(["admin"]), deleteNews);

export default router;