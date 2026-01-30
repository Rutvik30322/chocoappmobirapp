import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { notifyNewUser } from '../utils/notifications.js';

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    
    const { search, role, isActive, sort, page = 1, limit = 10 } = req.query;

    // Validate and sanitize inputs
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Ensure page and limit are positive integers
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, 'Invalid page or limit parameters');
    }

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Sorting
    let sortOption = {};
    if (sort === 'name_asc') sortOption.name = 1;
    else if (sort === 'name_desc') sortOption.name = -1;
    else if (sort === 'email_asc') sortOption.email = 1;
    else if (sort === 'email_desc') sortOption.email = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'oldest') sortOption.createdAt = 1;
    else sortOption.createdAt = -1; // Default

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password') // Exclude password field
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip);

    const total = await User.countDocuments(query);

    return successResponse(res, 200, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return successResponse(res, 200, 'User fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role, isActive, profilePicture, addresses } = req.body;
    
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });
    
    if (existingUser) {
      throw new ApiError(400, 'User with this email or mobile already exists');
    }
    
    const userData = {
      name,
      email,
      mobile,
      password,
      role: role || 'customer',
      isActive: isActive !== undefined ? isActive : true,
      ...(profilePicture && { profilePicture }),
      ...(addresses && { addresses })
    };
    
    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // Emit notification to admin panel for new user creation
    notifyNewUser(user);
    
    return successResponse(res, 201, 'User created successfully', { user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, mobile, role, isActive, profilePicture, addresses, password } = req.body;
    
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check if email or mobile already exists for another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(400, 'Email already exists');
      }
    }
    
    if (mobile && mobile !== user.mobile) {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        throw new ApiError(400, 'Mobile number already exists');
      }
    }
    
    // Update fields - always update if provided, even if same value
    if (name !== undefined && name !== null) user.name = name;
    if (email !== undefined && email !== null) user.email = email;
    if (mobile !== undefined && mobile !== null) user.mobile = mobile;
    if (role !== undefined && role !== null) {
      // Validate role
      if (role !== 'customer' && role !== 'admin') {
        throw new ApiError(400, 'Invalid role. Must be "customer" or "admin"');
      }
      user.role = role;
    }
    if (isActive !== undefined && isActive !== null) user.isActive = isActive;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (addresses !== undefined) user.addresses = addresses;
    if (password !== undefined && password !== null && password.trim() !== '') {
      user.password = password; // Will be hashed by pre-save hook
    }
    
    const updatedUser = await user.save();
    
    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    
    
    return successResponse(res, 200, 'User updated successfully', { user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    await user.deleteOne();
    
    return successResponse(res, 200, 'User deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status (Admin only)
 * @route   PUT /api/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, { user: userResponse });
  } catch (error) {
    next(error);
  }
};