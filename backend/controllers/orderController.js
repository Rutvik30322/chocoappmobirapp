import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { notifyNewOrder } from '../utils/notifications.js';

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

    // Clear user's cart after successful order creation
    await User.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] }
    });

    // Populate user data for notification
    const orderWithUser = await Order.findById(order._id)
      .populate('user', 'name email mobile');

    // Emit notification to admin panel
    notifyNewOrder(orderWithUser);

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
      .populate('orderItems.product', 'name image price')
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
 * @desc    Cancel order (Customer)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Customer)
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to cancel this order');
    }

    // Only allow cancellation if order is Pending or Processing
    if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Processing') {
      throw new ApiError(400, `Cannot cancel order with status: ${order.orderStatus}`);
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    return successResponse(res, 200, 'Order cancelled successfully', { order: updatedOrder });
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

    // If changing from Cancelled to another status, reduce stock
    if (order.orderStatus === 'Cancelled' && orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product && product.stock < item.quantity) {
          throw new ApiError(400, `Insufficient stock for product ${item.name}`);
        }
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // If changing to Cancelled, restore stock
    if (order.orderStatus !== 'Cancelled' && orderStatus === 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
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
 * @desc    Update order payment status (Admin only)
 * @route   PUT /api/orders/:id/payment
 * @access  Private/Admin
 */
export const updateOrderPayment = async (req, res, next) => {
  try {
    const { isPaid, paymentResult } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    order.isPaid = isPaid !== undefined ? isPaid : order.isPaid;
    
    if (order.isPaid && !order.paidAt) {
      order.paidAt = Date.now();
    }

    if (paymentResult) {
      order.paymentResult = {
        ...order.paymentResult,
        ...paymentResult,
      };
    }

    const updatedOrder = await order.save();

    return successResponse(res, 200, 'Order payment status updated successfully', { order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete order (Admin only)
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // If order is not cancelled, restore product stock before deleting
    if (order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Order deleted successfully', null);
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

    // Total products
    const totalProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ 
      isActive: true, 
      $or: [{ inStock: false }, { stock: 0 }] 
    });

    // Total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const customers = await User.countDocuments({ role: 'customer' });
    const admins = await User.countDocuments({ role: 'admin' });

    // Total categories
    const totalCategories = await Category.countDocuments({ isActive: true });

    // Total reviews
    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ isApproved: true });
    const pendingReviews = await Review.countDocuments({ isApproved: false });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Orders by month (last 6 months) - all orders, not just paid
    const ordersByMonth = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const todayRevenueData = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const todayRevenue = todayRevenueData[0]?.total || 0;

    // This month's stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const thisMonthOrders = await Order.countDocuments({ createdAt: { $gte: thisMonthStart } });
    const thisMonthRevenueData = await Order.aggregate([
      { 
        $match: { 
          isPaid: true,
          createdAt: { $gte: thisMonthStart }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const thisMonthRevenue = thisMonthRevenueData[0]?.total || 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment statistics
    const paidOrders = await Order.countDocuments({ isPaid: true });
    const unpaidOrders = await Order.countDocuments({ isPaid: false });
    
    // Revenue by payment method
    const revenueByPaymentMethod = await Order.aggregate([
      { 
        $match: { isPaid: true } 
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Orders by payment method
    const ordersByPaymentMethod = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          paid: {
            $sum: { $cond: ['$isPaid', 1, 0] }
          },
          unpaid: {
            $sum: { $cond: ['$isPaid', 0, 1] }
          }
        }
      }
    ]);

    // Payment status breakdown
    const paymentStatusBreakdown = {
      paid: paidOrders,
      unpaid: unpaidOrders,
      total: totalOrders
    };

    return successResponse(res, 200, 'Dashboard stats fetched successfully', {
      stats: {
        totalOrders,
        totalRevenue,
        ordersByStatus,
        totalProducts,
        outOfStockProducts,
        totalUsers,
        activeUsers,
        customers,
        admins,
        totalCategories,
        totalReviews,
        approvedReviews,
        pendingReviews,
        recentOrders,
        revenueByMonth,
        ordersByMonth,
        todayOrders,
        todayRevenue,
        thisMonthOrders,
        thisMonthRevenue,
        avgOrderValue,
        paidOrders,
        unpaidOrders,
        paymentStatusBreakdown,
        revenueByPaymentMethod,
        ordersByPaymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};
