import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect(["admin"]), createCategory);
router.delete("/:id", protect(["admin"]), deleteCategory);

export default router;