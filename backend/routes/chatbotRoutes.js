import express from 'express';
import { chatWithBot } from '../controllers/chatbotController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware
router.use(protect, adminOnly);

// Chat with bot
router.post('/', chatWithBot);

export default router;
