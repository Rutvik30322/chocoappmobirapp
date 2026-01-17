/**
 * Middleware to handle product images from request body
 * This middleware extracts image URLs from the request body 
 * and attaches them to the request object for use in controllers
 */

export const processProductImages = (req, res, next) => {
  try {
    console.log('Processing product images, req.body:', req.body);
    
    // Check if image URLs are provided in the request body
    if (req.body.image && req.body.image.trim() !== '🍫') { // Filter out default emoji
      req.image = req.body.image; // Main product image
      console.log('Set req.image to:', req.image);
    }
    
    // Check if additional image URLs are provided in the request body
    if (req.body.images && Array.isArray(req.body.images)) {
      req.images = req.body.images; // Additional product images
      console.log('Set req.images to:', req.images);
    }
    
    // If image is provided as a single-item array, extract it
    if (req.body.image && Array.isArray(req.body.image) && req.body.image.length > 0 && req.body.image[0].trim() !== '🍫') {
      req.image = req.body.image[0];
      console.log('Reset req.image to first item:', req.image);
    }
    
    next();
  } catch (error) {
    console.error('Error in processProductImages middleware:', error);
    next(error);
  }
};