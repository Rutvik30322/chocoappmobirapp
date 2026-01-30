import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { processProductImages, uploadProductImages } from '../middleware/productImageMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories/all', getCategories);
router.get('/:id', getProductById);

// Admin routes
// Use regular middleware for both JSON and file uploads - the middleware will handle both
router.post('/', protect, adminOnly, processProductImages, createProduct);
router.put('/:id', protect, adminOnly, processProductImages, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
