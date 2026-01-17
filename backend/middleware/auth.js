import { verifyToken } from '../utils/jwtHelper.js';
import { errorResponse } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Protect routes - authenticate user/admin
export const protect = async (req, res, next) => {
  try {
    let token;

    // Debug logging
    console.log('Authorization header received:', req.headers.authorization);
    console.log('Full headers:', req.headers);

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token found in authorization header');
      return errorResponse(res, 401, 'Not authorized, no token');
    }

    console.log('Token found, proceeding with verification');

    // Verify token
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);

    // Check if user or admin
    if (decoded.role === 'admin') {
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return errorResponse(res, 401, 'Admin not found');
      }
      console.log('Admin authenticated:', req.admin.name);
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return errorResponse(res, 401, 'User not found');
      }
      console.log('User authenticated:', req.user.name);
    }

    req.role = decoded.role;
    console.log('Role assigned:', req.role);
    next();
  } catch (error) {
    console.log('Authentication error:', error.message);
    return errorResponse(res, 401, error.message || 'Not authorized');
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return errorResponse(res, 403, 'Access denied. Admin only.');
  }
  next();
};

// Customer only middleware
export const customerOnly = (req, res, next) => {
  if (req.role !== 'customer') {
    return errorResponse(res, 403, 'Access denied. Customer only.');
  }
  next();
};
