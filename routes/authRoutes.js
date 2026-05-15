import express from "express";
import { register, login, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validator.js";
import { signupSchema, signinSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validate(signupSchema), register);
router.post("/login", validate(signinSchema), login);
router.delete("/delete-account", protect(['user']), deleteAccount);

export default router;