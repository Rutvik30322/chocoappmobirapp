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
    console.log('getAllProducts called with query:', req.query);
    
    const { category, search, minPrice, maxPrice, inStock, sort, page = 1, limit = 20 } = req.query;

    // Validate and sanitize inputs
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    
    // Ensure page and limit are positive integers
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, 'Invalid page or limit parameters');
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
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(query);

    return successResponse(res, 200, 'Products fetched successfully', {
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log('Error in getAllProducts:', error.message);
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
    console.log('Creating product, req.body:', req.body);
    console.log('req.image:', req.image);
    console.log('req.images:', req.images);
    
    const productData = { ...req.body };
    
    // Remove default emoji from productData if present in original body
    if (productData.image && isDefaultEmoji(productData.image)) {
      console.log('Removing default emoji from productData.image');
      delete productData.image; // Don't create with default emoji
    }
    
    // Handle image field if present from middleware (processed image upload)
    if (req.image && !isDefaultEmoji(req.image)) {
      productData.image = req.image;
      console.log('Set productData.image to:', req.image);
    }
    
    // Handle images array if present in request
    if (req.images && Array.isArray(req.images)) {
      productData.images = req.images;
      console.log('Set productData.images to:', req.images);
    }
    
    console.log('Final productData:', productData);
    
    const product = await Product.create(productData);
    console.log('Created product:', product);

    return successResponse(res, 201, 'Product created successfully', { product });
  } catch (error) {
    console.error('Error creating product:', error);
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
    console.log('Updating product, req.body:', req.body);
    console.log('req.image:', req.image);
    console.log('req.images:', req.images);
    
    const productData = { ...req.body };
    
    // Remove default emoji from productData if present in original body
    if (productData.image && isDefaultEmoji(productData.image)) {
      console.log('Removing default emoji from productData.image');
      delete productData.image; // Don't update image if it's the default emoji
    }
    
    // Handle image field if present from middleware (processed image upload)
    if (req.image && !isDefaultEmoji(req.image)) {
      productData.image = req.image;
      console.log('Set productData.image to:', req.image);
    }
    
    // Handle images array if present in request
    if (req.images && Array.isArray(req.images)) {
      productData.images = req.images;
      console.log('Set productData.images to:', req.images);
    }
    
    console.log('Final productData for update:', productData);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    console.log('Updated product:', product);

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
 * @desc    Get all categories
 * @route   GET /api/products/categories/all
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: '1', name: 'Bars', icon: '🍫' },
      { id: '2', name: 'Truffles', icon: '🍬' },
      { id: '3', name: 'Fudge', icon: '🍮' },
      { id: '4', name: 'Pralines', icon: '🌰' },
      { id: '5', name: 'Fruits', icon: '🍓' },
      { id: '6', name: 'Caramels', icon: '🍯' },
      { id: '7', name: 'Flavored', icon: '🍊' },
    ];

    return successResponse(res, 200, 'Categories fetched successfully', { categories });
  } catch (error) {
    next(error);
  }
};
