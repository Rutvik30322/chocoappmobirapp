import express from 'express';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect, customerOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and only accessible by customers
router.route('/')
  .get(protect, customerOnly, getCart)
  .delete(protect, customerOnly, clearCart);

router.post('/add', protect, customerOnly, addToCart);
router.delete('/remove/:productId', protect, customerOnly, removeFromCart);
router.put('/update/:productId', protect, customerOnly, updateCartItemQuantity);

export default router;