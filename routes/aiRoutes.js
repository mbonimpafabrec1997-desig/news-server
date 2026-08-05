import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  analyzeArticle,
  improveWriting,
  fixGrammar,
  generateHeadlines,
  generateSummary,
  optimizeSeo,
  extractKeywords,
  translateArticle,
  generateSocialPost,
  explainNews
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/analyze", protect(["journalist", "admin", "reporter", "editor"]), analyzeArticle);
router.post("/improve", protect(["journalist", "admin", "reporter", "editor"]), improveWriting);
router.post("/grammar", protect(["journalist", "admin", "reporter", "editor"]), fixGrammar);
router.post("/headlines", protect(["journalist", "admin", "reporter", "editor"]), generateHeadlines);
router.post("/summary", protect(["journalist", "admin", "reporter", "editor"]), generateSummary);
router.post("/seo", protect(["journalist", "admin", "reporter", "editor"]), optimizeSeo);
router.post("/keywords", protect(["journalist", "admin", "reporter", "editor"]), extractKeywords);
router.post("/translate", protect(), translateArticle); // available to all logged in users
router.post("/social-post", protect(["journalist", "admin", "reporter", "editor"]), generateSocialPost);
router.post("/explain", protect(), explainNews); // available to all logged in users

export default router;
