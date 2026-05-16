import express from "express";
import { createAd, getAds } from "../controllers/adController.js";

const router = express.Router();

router.post("/create", createAd);
router.get("/",        getAds);  

export default router;

