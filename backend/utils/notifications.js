/**
 * Notification utility for emitting real-time notifications to admin panel
 */

/**
 * Emit notification to admin panel
 * @param {string} type - Type of notification (order, user, customer, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} data - Additional data to send with notification
 */
export const emitNotification = (type, title, message, data = {}) => {
  if (!global.io) {
    console.warn('Socket.io not initialized, notification not sent');
    return;
  }

  const notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  // Emit to all admins in the admin room
  global.io.to('admin').emit('notification', notification);
  
};

/**
 * Emit new order notification
 * @param {object} order - Order object
 */
export const notifyNewOrder = (order) => {
  emitNotification(
    'order',
    'New Order Received',
    `Order #${order._id.toString().slice(-6)} from ${order.user?.name || 'Customer'}`,
    {
      orderId: order._id,
      orderTotal: order.totalPrice,
      orderStatus: order.orderStatus,
      customerName: order.user?.name,
      customerEmail: order.user?.email,
    }
  );
};

/**
 * Emit new user/customer notification
 * @param {object} user - User object
 */
export const notifyNewUser = (user) => {
  const isCustomer = user.role === 'customer';
  emitNotification(
    isCustomer ? 'customer' : 'user',
    isCustomer ? 'New Customer Registered' : 'New User Created',
    `${user.name} (${user.email}) has ${isCustomer ? 'registered' : 'been created'}`,
    {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
    }
  );
};

/**
 * Emit new product notification
 * @param {object} product - Product object
 */
export const notifyNewProduct = (product) => {
  emitNotification(
    'product',
    'New Product Added',
    `${product.name} has been added to the catalog`,
    {
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
    }
  );
};
