import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  updateAvatar, 
  getFollowers, 
  toggleFollow,
  getUserNotifications,
  markNotificationsAsRead,
  getUserMonetizationStatus,
  savePaymentDetails,
  subscribeUser
} from "../controllers/userController.js";

const router = express.Router();

// Public newsletter subscription route
router.post("/subscribe", subscribeUser);

// Profile picture upload endpoint
router.put("/me/avatar", protect(), updateAvatar);

// Get followers endpoint
router.get("/me/followers", protect(["journalist", "admin", "reporter", "editor"]), getFollowers);

// Follow/unfollow toggle endpoint
router.post("/:id/follow", protect(), toggleFollow);

// Notifications endpoints
router.get("/me/notifications", protect(), getUserNotifications);
router.post("/me/notifications/read", protect(), markNotificationsAsRead);

// Monetization endpoints
router.get("/me/monetization", protect(), getUserMonetizationStatus);
router.put("/me/payment-details", protect(), savePaymentDetails);

export default router;
