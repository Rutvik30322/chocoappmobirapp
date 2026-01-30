/**
 * Middleware to handle product images from request body and file uploads
 * This middleware extracts image URLs from the request body and handles file uploads
 * and attaches them to the request object for use in controllers
 */

export const processProductImages = (req, res, next) => {
  try {
    
    // Initialize req.image and req.images if they don't exist
    if (!req.image) req.image = null;
    if (!req.images) req.images = [];
    
    // Handle main image if provided in request body
    if (req.body && req.body.image !== undefined) {
      if (typeof req.body.image === 'string' && req.body.image.trim() !== '' && req.body.image.trim() !== '🍫') {
        req.image = req.body.image.trim(); // Main product image
      } else if (req.body.image === null || req.body.image === '') {
        req.image = null; // Clear if it's null or empty string
      } else if (req.body.image === '🍫' || (typeof req.body.image === 'string' && req.body.image.trim() === '🍫')) {
        req.image = null; // Clear if it's the default emoji
      }
    }
    
    // Handle additional images if provided in request body
    if (req.body && req.body.images !== undefined && Array.isArray(req.body.images)) {
      // Filter out any problematic entries and ensure they are strings
      const validImages = req.body.images.filter(img => typeof img === 'string' && img.trim() !== '' && img !== '🍫');
      req.images = validImages; // Additional product images
    }
    
    // Handle file uploads for main image (single file)
    if (req.file) {
      req.image = req.file.path;
    }
    
    // Handle file uploads for multiple images
    if (req.files && req.files.length > 0) {
      const uploadedImageUrls = req.files.map(file => file.path);
      req.images = [...req.images, ...uploadedImageUrls];
    }
    
    // If image is provided as a single-item array, extract it
    if (req.body && req.body.image && Array.isArray(req.body.image) && req.body.image.length > 0) {
      const extractedImage = req.body.image[0];
      if (typeof extractedImage === 'string' && extractedImage.trim() !== '🍫') {
        req.image = extractedImage;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to handle product image uploads using Cloudinary
 */
import { productImageUpload } from './upload.js';

export const uploadProductImages = [
  productImageUpload.fields([
    { name: 'mainImage', maxCount: 1 },      // For main product image
    { name: 'additionalImages', maxCount: 10 } // For additional product images
  ]),
  processProductImages
];