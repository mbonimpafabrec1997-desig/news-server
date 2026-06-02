import express from 'express';
import { deleteNewsAdmin, applyCopyrightStrike, handleUserViolation, adminDeleteUser } from '../controllers/adminController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.delete('/news/:id',             protect(['admin']), deleteNewsAdmin);
router.post('/copyright-strike',         protect(['admin']), applyCopyrightStrike);
router.post('/user-violation',           protect(['admin']), handleUserViolation);
router.delete('/users/:userId',          protect(['admin']), adminDeleteUser);

export default router;