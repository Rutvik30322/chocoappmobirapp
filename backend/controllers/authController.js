import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/jwtHelper.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Register new customer user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    console.log('\n📝 === REGISTER REQUEST ===');
    console.log('Request Body:', req.body);
    
    const { name, email, mobile, password } = req.body;

    // Check if user already exists
    console.log('🔍 Checking for existing user with email:', email, 'or mobile:', mobile);
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email || existingUser.mobile);
      throw new ApiError(400, 'User with this email or mobile already exists');
    }

    // Create new user
    console.log('✅ Creating new user...');
    const user = await User.create({
      name,
      email,
      mobile,
      password,
    });
    console.log('✅ User created:', user._id);

    // Generate token
    const token = generateToken(user._id, 'customer');
    console.log('✅ Token generated');

    // Prepare user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      profilePicture: user.profilePicture,
      role: user.role,
    };

    console.log('✅ Registration successful for:', userData.email);
    console.log('=== END REGISTER REQUEST ===\n');
    
    return successResponse(res, 201, 'User registered successfully', {
      user: userData,
      token,
    });
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    console.log('Error details:', error);
    next(error);
  }
};

/**
 * @desc    Login customer user (email or mobile + password)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    console.log('\n🔐 === LOGIN REQUEST ===');
    console.log('Request Body:', { email: req.body.email, mobile: req.body.mobile });
    
    const { email, mobile, password } = req.body;

    // Check if email or mobile is provided
    if (!email && !mobile) {
      console.log('❌ No email or mobile provided');
      throw new ApiError(400, 'Please provide email or mobile number');
    }

    // Find user by email or mobile
    console.log('🔍 Looking for user...');
    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      throw new ApiError(401, 'Invalid credentials');
    }
    console.log('✅ User found:', user._id);

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      throw new ApiError(403, 'Your account has been deactivated');
    }

    // Verify password
    console.log('🔍 Verifying password...');
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log('❌ Password does not match');
      throw new ApiError(401, 'Invalid credentials');
    }
    console.log('✅ Password verified');

    // Generate token
    const token = generateToken(user._id, 'customer');
    console.log('✅ Token generated');

    // Prepare user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      profilePicture: user.profilePicture,
      role: user.role,
      addresses: user.addresses,
    };

    console.log('✅ Login successful for:', userData.email);
    console.log('=== END LOGIN REQUEST ===\n');

    return successResponse(res, 200, 'Login successful', {
      user: userData,
      token,
    });
  } catch (error) {
    console.log('❌ Login error:', error.message);
    next(error);
  }
};

/**
 * @desc    Register/Login admin
 * @route   POST /api/auth/admin/login
 * @access  Public (but restricted to admin credentials)
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throw new ApiError(401, 'Invalid admin credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new ApiError(403, 'Your admin account has been deactivated');
    }

    // Verify password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid admin credentials');
    }

    // Generate token
    const token = generateToken(admin._id, 'admin');

    // Prepare admin data (without password)
    const adminData = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      profilePicture: admin.profilePicture,
      role: admin.role,
      permissions: admin.permissions,
    };

    return successResponse(res, 200, 'Admin login successful', {
      admin: adminData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user/admin profile
 * @route   GET /api/auth/me
 * @access  Private (Customer/Admin)
 */
export const getMe = async (req, res, next) => {
  try {
    if (req.role === 'admin') {
      return successResponse(res, 200, 'Admin profile fetched successfully', {
        admin: req.admin,
        role: 'admin',
      });
    } else {
      return successResponse(res, 200, 'User profile fetched successfully', {
        user: req.user,
        role: 'customer',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private (Customer)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, mobile } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    await user.save();

    // Fetch updated user without password
    const updatedUser = await User.findById(user._id);

    return successResponse(res, 200, 'Profile updated successfully', {
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private (Customer)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully', null);
  } catch (error) {
    next(error);
  }
};
