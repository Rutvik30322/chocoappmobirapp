import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

// Helper function to check if the image is the default emoji
const isDefaultEmoji = (str) => {
  // Compare by normalizing the string and checking if it's the chocolate emoji
  // This handles potential Unicode variations
  return str && str.trim() === '🍫';
};

/**
 * @desc    Get all products (with filters)
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (req, res, next) => {
  try {
    
    
    const { category, search, minPrice, maxPrice, inStock, sort, page = 1, limit } = req.query;

    // Validate and sanitize inputs
    const pageNum = parseInt(page) || 1;
    // If limit is not provided or is 'all', fetch all products (no limit)
    // Otherwise, use the provided limit with a max of 1000
    const limitNum = limit === 'all' || limit === undefined ? undefined : parseInt(limit) || 20;
    
    // Ensure page is positive integer
    if (pageNum < 1) {
      throw new ApiError(400, 'Invalid page parameter');
    }
    
    // Ensure limit is positive integer if provided
    if (limitNum !== undefined && (limitNum < 1 || limitNum > 10000)) {
      throw new ApiError(400, 'Invalid limit parameter. Must be between 1 and 10000, or use "all" to fetch all products');
    }

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice !== undefined) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
    }

    if (inStock === 'true') {
      query.inStock = true;
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1; // Default

    // Pagination
    let products;
    let total = await Product.countDocuments(query);
    
    if (limitNum === undefined) {
      // Fetch all products (no pagination)
      products = await Product.find(query).sort(sortOption);
    } else {
      // Fetch with pagination
    const skip = (pageNum - 1) * limitNum;
      products = await Product.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip);
    }

    return successResponse(res, 200, 'Products fetched successfully', {
      products,
      pagination: {
        total,
        page: pageNum,
        pages: limitNum ? Math.ceil(total / limitNum) : 1,
        limit: limitNum || total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return successResponse(res, 200, 'Product fetched successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    
    const productData = { ...req.body };
    
    // Remove default emoji from productData if present in original body
    if (productData.image && isDefaultEmoji(productData.image)) {
      delete productData.image; // Don't create with default emoji
    }
    
    // Handle image field if present from middleware (processed image upload)
    if (req.image && !isDefaultEmoji(req.image)) {
      productData.image = req.image;
    }
    
    // Handle images array if present in request
    if (req.images && Array.isArray(req.images)) {
      productData.images = req.images;
    }
    
    // Handle file uploads from form fields
    if (req.files) {
      // Handle main image upload
      if (req.files.mainImage && req.files.mainImage[0]) {
        productData.image = req.files.mainImage[0].path;
      }
      
      // Handle additional images upload
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        const additionalImageUrls = req.files.additionalImages.map(file => file.path);
        if (!productData.images) {
          productData.images = [];
        }
        productData.images = [...productData.images, ...additionalImageUrls];
      }
    }
    
    const product = await Product.create(productData);

    return successResponse(res, 201, 'Product created successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    
    const productData = { ...req.body };
    
    // Remove default emoji from productData if present in original body
    if (productData.image && isDefaultEmoji(productData.image)) {
      delete productData.image; // Don't update image if it's the default emoji
    }
    
    // Handle image field - prioritize middleware processed image, then req.body.image
    // Check if we have a valid image URL from any source
    const hasValidImageFromMiddleware = req.image && 
                                       typeof req.image === 'string' && 
                                       req.image.trim() !== '' && 
                                       !isDefaultEmoji(req.image) &&
                                       (req.image.startsWith('http://') || req.image.startsWith('https://'));
    
    const hasValidImageFromBody = productData.image && 
                                  typeof productData.image === 'string' && 
                                  productData.image.trim() !== '' && 
                                  !isDefaultEmoji(productData.image) &&
                                  (productData.image.startsWith('http://') || productData.image.startsWith('https://'));
    
    if (hasValidImageFromMiddleware) {
      productData.image = req.image.trim();
    } 
    else if (hasValidImageFromBody) {
      // Keep the image from req.body if it's a valid URL
      productData.image = productData.image.trim();
    }
    // If image is empty string, null, or undefined, remove it to preserve existing image
    else if (productData.image === '' || productData.image === null || productData.image === undefined) {
      delete productData.image;
    }
    // If image exists but is invalid (not a URL), log warning but remove it
    else if (productData.image) {
      delete productData.image;
    }
    
    // Handle images array if present in request
    if (req.images && Array.isArray(req.images) && req.images.length > 0) {
      productData.images = req.images;
    } else if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      // If middleware didn't set req.images but req.body has images, use them
      productData.images = req.body.images;
    }
    
    // Handle file uploads from form fields (multipart/form-data)
    if (req.files) {
      // Handle main image upload
      if (req.files.mainImage && req.files.mainImage[0]) {
        productData.image = req.files.mainImage[0].path;
      }
      
      // Handle additional images upload
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        const additionalImageUrls = req.files.additionalImages.map(file => file.path);
        if (!productData.images) {
          productData.images = [];
        }
        productData.images = [...productData.images, ...additionalImageUrls];
      }
    }
    
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    

    return successResponse(res, 200, 'Product updated successfully', { product });
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

/**
 * @desc    Delete product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return successResponse(res, 200, 'Product deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories (deprecated - use /api/categories instead)
 * @route   GET /api/products/categories/all
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    // Import Category model
    const Category = (await import('../models/Category.js')).default;
    
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // Format to match old response structure for backward compatibility
    const formattedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      icon: cat.icon || '🍫',
    }));

    return successResponse(res, 200, 'Categories fetched successfully', { categories: formattedCategories });
  } catch (error) {
    next(error);
  }
};
