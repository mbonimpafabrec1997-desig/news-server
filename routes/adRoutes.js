import express from "express";
import { createAd, getAds, deleteAd } from "../controllers/adController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createAd);
router.post("/",       createAd);
router.get("/",        getAds);  
router.delete("/:id", protect(), deleteAd);

export default router;

