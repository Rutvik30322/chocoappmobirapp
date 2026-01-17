import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      throw new ApiError(400, 'No order items provided');
    }

    // Verify all products exist and are in stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ApiError(404, `Product ${item.name} not found`);
      }
      if (!product.inStock || product.stock < item.quantity) {
        throw new ApiError(400, `Product ${item.name} is out of stock`);
      }
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return successResponse(res, 201, 'Order created successfully', { order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Orders fetched successfully', { orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Customer/Admin)
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('orderItems.product', 'name image price');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check if user is authorized to view this order
    if (req.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    return successResponse(res, 200, 'Order fetched successfully', { order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private (Customer)
 */
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to update this order');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.updateTime,
      emailAddress: req.body.emailAddress,
    };

    const updatedOrder = await order.save();

    return successResponse(res, 200, 'Order updated to paid', { order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email mobile')
      .populate('orderItems.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    return successResponse(res, 200, 'Orders fetched successfully', {
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.orderStatus = orderStatus;

    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    return successResponse(res, 200, 'Order status updated successfully', { order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats (Admin only)
 * @route   GET /api/orders/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 200, 'Dashboard stats fetched successfully', {
      stats: {
        totalOrders,
        totalRevenue,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
