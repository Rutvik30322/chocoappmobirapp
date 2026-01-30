import express from 'express';
import {
  getAllNotifications,
  getLatestNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(protect, adminOnly);

// Routes
router.get('/stats', getNotificationStats);
router.get('/latest', getLatestNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/', deleteAllNotifications);
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
