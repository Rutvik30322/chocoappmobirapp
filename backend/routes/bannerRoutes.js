import express from 'express';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadBannerImage } from '../middleware/bannerImageMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBanners);
router.get('/:id', getBannerById);

// Admin routes
router.post('/', protect, adminOnly, uploadBannerImage, createBanner);
router.put('/:id', protect, adminOnly, uploadBannerImage, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

export default router;
