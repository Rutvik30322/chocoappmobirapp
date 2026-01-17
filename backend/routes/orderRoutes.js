import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/orderController.js';
import { protect, customerOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', protect, customerOnly, createOrder);
router.get('/my-orders', protect, customerOnly, getMyOrders);
router.put('/:id/pay', protect, customerOnly, updateOrderToPaid);

// Admin routes
router.get('/admin/stats', protect, adminOnly, getDashboardStats);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

// Shared routes (Customer & Admin)
router.get('/:id', protect, getOrderById);

export default router;
