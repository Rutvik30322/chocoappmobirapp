import { successResponse, errorResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import axios from 'axios';

/**
 * @desc    Chat with AI assistant (analyzes admin panel data)
 * @route   POST /api/chatbot
 * @access  Private/Admin
 */
export const chatWithBot = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      throw new ApiError(400, 'Message is required');
    }

    // First, try to execute a dynamic query based on the user's question
    const queryResult = await executeDynamicQuery(message);
    
    if (queryResult) {
      // If we successfully executed a query, return the formatted result
      return successResponse(res, 200, 'Chat response generated', {
        response: queryResult,
      });
    }

    // If no specific query was executed, use the general data context approach
    const dataContext = await getAdminDataContext();

    // Create system prompt with admin panel context
    const systemPrompt = `You are an AI assistant for an e-commerce admin panel. You have access to the following data:

${dataContext}

Your role is to help admins with:
- Dashboard statistics and analytics
- Product management questions
- Order management and status
- User/customer management
- Category management
- Review management
- General admin panel questions

Answer questions based on the actual data provided above. Be concise, helpful, and professional. If asked about specific numbers or statistics, use the data provided. Always respond in a natural, human-like conversational manner.`;

    // Try to use free AI service (Hugging Face Inference API - free tier)
    let aiResponse;
    try {
      // Option 1: Use Hugging Face's free inference API (no API key required for public models)
      aiResponse = await getAIResponseFromHuggingFace(message, systemPrompt, conversationHistory, dataContext);
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      // Fallback to data-based response
      aiResponse = getDataBasedResponse(message, dataContext);
    }

    return successResponse(res, 200, 'Chat response generated', {
      response: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute dynamic database queries based on user's question
 * Returns formatted response or null if no query matched
 */
async function executeDynamicQuery(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  try {
    // Product queries
    if (lowerMessage.includes('product')) {
      // "first product" or "first product name"
      if ((lowerMessage.includes('first') || lowerMessage.includes('1st')) && 
          (lowerMessage.includes('product') || lowerMessage.includes('item'))) {
        const product = await Product.findOne({ isActive: true }).sort({ createdAt: 1 }).select('name price stock category');
        if (product) {
          return `The first product in your system is:\n\n📦 **${product.name}**\n💰 Price: ₹${product.price}\n📊 Stock: ${product.stock} units\n🏷️ Category: ${product.category}`;
        }
        return 'No products found in the system.';
      }

      // "last product" or "latest product"
      if ((lowerMessage.includes('last') || lowerMessage.includes('latest') || lowerMessage.includes('newest')) && 
          lowerMessage.includes('product')) {
        const product = await Product.findOne({ isActive: true }).sort({ createdAt: -1 }).select('name price stock category');
        if (product) {
          return `The latest product added is:\n\n📦 **${product.name}**\n💰 Price: ₹${product.price}\n📊 Stock: ${product.stock} units\n🏷️ Category: ${product.category}`;
        }
        return 'No products found in the system.';
      }

      // "all products" or "list products" or "show products"
      if ((lowerMessage.includes('all') || lowerMessage.includes('list') || lowerMessage.includes('show')) && 
          lowerMessage.includes('product')) {
        const limit = lowerMessage.match(/(\d+)\s*product/i) ? parseInt(lowerMessage.match(/(\d+)\s*product/i)[1]) : 10;
        const products = await Product.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('name price stock category');
        
        if (products.length > 0) {
          const productList = products.map((p, idx) => 
            `${idx + 1}. **${p.name}** - ₹${p.price} (Stock: ${p.stock}, Category: ${p.category})`
          ).join('\n');
          return `Here are ${products.length} products:\n\n${productList}\n\nYou can view all products in the Products section.`;
        }
        return 'No products found.';
      }

      // "products with low stock" or "out of stock products"
      if ((lowerMessage.includes('low stock') || lowerMessage.includes('out of stock') || 
           lowerMessage.includes('stock') && (lowerMessage.includes('low') || lowerMessage.includes('less')))) {
        const threshold = lowerMessage.match(/(\d+)/) ? parseInt(lowerMessage.match(/(\d+)/)[1]) : 10;
        const products = await Product.find({ stock: { $lt: threshold }, isActive: true })
          .sort({ stock: 1 })
          .limit(20)
          .select('name stock price');
        
        if (products.length > 0) {
          const productList = products.map((p, idx) => 
            `${idx + 1}. **${p.name}** - Only ${p.stock} units left (Price: ₹${p.price})`
          ).join('\n');
          return `⚠️ Products with low stock (less than ${threshold} units):\n\n${productList}\n\nYou should consider restocking these items soon!`;
        }
        return `✅ All products have sufficient stock (above ${threshold} units).`;
      }

      // "products by category" or "products in category"
      const categoryMatch = lowerMessage.match(/categor[yi]\s+(?:is\s+)?(.+?)(?:\s|$)/i);
      if (categoryMatch) {
        const categoryName = categoryMatch[1].trim();
        const products = await Product.find({ 
          category: { $regex: categoryName, $options: 'i' }, 
          isActive: true 
        })
          .limit(20)
          .select('name price stock');
        
        if (products.length > 0) {
          const productList = products.map((p, idx) => 
            `${idx + 1}. **${p.name}** - ₹${p.price} (Stock: ${p.stock})`
          ).join('\n');
          return `Products in "${categoryName}" category:\n\n${productList}`;
        }
        return `No products found in the "${categoryName}" category.`;
      }

      // "product count" or "how many products"
      if (lowerMessage.includes('how many') && lowerMessage.includes('product')) {
        const total = await Product.countDocuments();
        const active = await Product.countDocuments({ isActive: true });
        return `You have **${total}** total products, with **${active}** currently active.`;
      }
    }

    // Order queries
    if (lowerMessage.includes('order')) {
      // "pending orders" or "orders pending"
      if (lowerMessage.includes('pending')) {
        const orders = await Order.find({ orderStatus: 'Pending' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderStatus totalPrice createdAt')
          .populate('user', 'name email');
        
        if (orders.length > 0) {
          const orderList = orders.map((o, idx) => 
            `${idx + 1}. ₹${o.totalPrice} - ${o.user?.name || 'N/A'} - ${new Date(o.createdAt).toLocaleDateString()}`
          ).join('\n');
          return `📋 Pending Orders (${orders.length}):\n\n${orderList}\n\nYou can manage these orders in the Orders section.`;
        }
        return '✅ No pending orders at the moment.';
      }

      // "processing orders"
      if (lowerMessage.includes('processing')) {
        const orders = await Order.find({ orderStatus: 'Processing' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('orderStatus totalPrice createdAt');
        
        if (orders.length > 0) {
          const orderList = orders.map((o, idx) => 
            `${idx + 1}. ₹${o.totalPrice} - ${new Date(o.createdAt).toLocaleDateString()}`
          ).join('\n');
          return `📦 Processing Orders (${orders.length}):\n\n${orderList}`;
        }
        return 'No orders currently being processed.';
      }

      // "recent orders" or "latest orders"
      if (lowerMessage.includes('recent') || lowerMessage.includes('latest')) {
        const limit = lowerMessage.match(/(\d+)/) ? parseInt(lowerMessage.match(/(\d+)/)[1]) : 5;
        const orders = await Order.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('orderStatus totalPrice createdAt paymentMethod');
        
        if (orders.length > 0) {
          const orderList = orders.map((o, idx) => 
            `${idx + 1}. ${o.orderStatus} - ₹${o.totalPrice} - ${o.paymentMethod} - ${new Date(o.createdAt).toLocaleDateString()}`
          ).join('\n');
          return `📋 Recent Orders (last ${orders.length}):\n\n${orderList}`;
        }
        return 'No recent orders found.';
      }

      // "order count" or "how many orders"
      if (lowerMessage.includes('how many') && lowerMessage.includes('order')) {
        const total = await Order.countDocuments();
        const pending = await Order.countDocuments({ orderStatus: 'Pending' });
        const delivered = await Order.countDocuments({ orderStatus: 'Delivered' });
        return `You have **${total}** total orders:\n- ${pending} Pending\n- ${delivered} Delivered`;
      }
    }

    // User queries
    if (lowerMessage.includes('user') || lowerMessage.includes('customer')) {
      // "all users" or "list users"
      if ((lowerMessage.includes('all') || lowerMessage.includes('list') || lowerMessage.includes('show')) && 
          (lowerMessage.includes('user') || lowerMessage.includes('customer'))) {
        const limit = lowerMessage.match(/(\d+)/) ? parseInt(lowerMessage.match(/(\d+)/)[1]) : 10;
        const users = await User.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('name email mobile createdAt');
        
        if (users.length > 0) {
          const userList = users.map((u, idx) => 
            `${idx + 1}. **${u.name}** - ${u.email} - ${u.mobile}`
          ).join('\n');
          return `👥 Users (showing ${users.length}):\n\n${userList}`;
        }
        return 'No users found.';
      }

      // "user count" or "how many users"
      if (lowerMessage.includes('how many') && (lowerMessage.includes('user') || lowerMessage.includes('customer'))) {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ isActive: true });
        return `You have **${total}** total users, with **${active}** currently active.`;
      }
    }

    // Category queries
    if (lowerMessage.includes('categor')) {
      // "all categories" or "list categories"
      if ((lowerMessage.includes('all') || lowerMessage.includes('list') || lowerMessage.includes('show')) && 
          lowerMessage.includes('categor')) {
        const categories = await Category.find({ isActive: true })
          .sort({ name: 1 })
          .select('name description');
        
        if (categories.length > 0) {
          const categoryList = categories.map((c, idx) => 
            `${idx + 1}. **${c.name}**${c.description ? ` - ${c.description}` : ''}`
          ).join('\n');
          return `🏷️ Categories (${categories.length}):\n\n${categoryList}`;
        }
        return 'No categories found.';
      }

      // "category count"
      if (lowerMessage.includes('how many') && lowerMessage.includes('categor')) {
        const total = await Category.countDocuments({ isActive: true });
        return `You have **${total}** active categories.`;
      }
    }

    // Review queries
    if (lowerMessage.includes('review')) {
      // "pending reviews" or "unapproved reviews"
      if (lowerMessage.includes('pending') || lowerMessage.includes('unapproved') || lowerMessage.includes('approve')) {
        const reviews = await Review.find({ isApproved: false, isActive: true })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('user', 'name')
          .populate('product', 'name')
          .select('rating comment createdAt');
        
        if (reviews.length > 0) {
          const reviewList = reviews.map((r, idx) => 
            `${idx + 1}. ${r.product?.name || 'N/A'} - ${r.rating}⭐ - ${r.user?.name || 'N/A'}`
          ).join('\n');
          return `⭐ Pending Reviews (${reviews.length}):\n\n${reviewList}\n\nYou can approve these in the Reviews section.`;
        }
        return '✅ No pending reviews. All reviews are approved!';
      }

      // "review count"
      if (lowerMessage.includes('how many') && lowerMessage.includes('review')) {
        const total = await Review.countDocuments();
        const approved = await Review.countDocuments({ isApproved: true });
        return `You have **${total}** total reviews, with **${approved}** approved.`;
      }
    }

    // Revenue/Sales queries
    if (lowerMessage.includes('revenue') || lowerMessage.includes('sales') || lowerMessage.includes('earning')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [todayRevenue, totalRevenue] = await Promise.all([
        Order.aggregate([
          { $match: { orderStatus: 'Delivered', createdAt: { $gte: today } } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        Order.aggregate([
          { $match: { orderStatus: 'Delivered' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ])
      ]);

      const todayTotal = todayRevenue[0]?.total || 0;
      const allTimeTotal = totalRevenue[0]?.total || 0;

      return `💰 Revenue Summary:\n- Today: ₹${todayTotal.toLocaleString()}\n- All Time: ₹${allTimeTotal.toLocaleString()}`;
    }

    // If no specific query matched, return null to use general response
    return null;
  } catch (error) {
    console.error('Error executing dynamic query:', error);
    return null; // Fall back to general response on error
  }
}

/**
 * Get admin panel data context for AI
 */
async function getAdminDataContext() {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalUsers,
      activeUsers,
      totalAdmins,
      totalCategories,
      totalReviews,
      recentOrders,
      lowStockProducts,
      totalRevenue,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Processing'] } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Admin.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Review.countDocuments({ isApproved: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).select('orderStatus totalPrice createdAt'),
      Product.find({ stock: { $lt: 10 }, isActive: true }).limit(5).select('name stock'),
      Order.aggregate([
        { $match: { orderStatus: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const avgOrderValue = completedOrders > 0 ? (revenue / completedOrders).toFixed(2) : 0;

    const context = `
ADMIN PANEL DATA SUMMARY:
📦 Products: ${totalProducts} total (${activeProducts} active)
📋 Orders: ${totalOrders} total (${pendingOrders} pending/processing, ${completedOrders} completed)
💰 Revenue: ₹${revenue.toLocaleString()} (Average order: ₹${avgOrderValue})
👥 Users: ${totalUsers} total (${activeUsers} active)
👑 Admins: ${totalAdmins}
🏷️ Categories: ${totalCategories} active
⭐ Reviews: ${totalReviews} approved

Recent Orders (last 5):
${recentOrders.length > 0 ? recentOrders.map((order, idx) => `${idx + 1}. ${order.orderStatus} - ₹${order.totalPrice} - ${new Date(order.createdAt).toLocaleDateString()}`).join('\n') : 'No recent orders'}

Low Stock Alert (stock < 10):
${lowStockProducts.length > 0 ? lowStockProducts.map((product, idx) => `${idx + 1}. ${product.name}: Only ${product.stock} units left`).join('\n') : 'All products have sufficient stock ✅'}
`;

    return context;
  } catch (error) {
    console.error('Error fetching admin data context:', error);
    return 'Data context unavailable. Please check database connection.';
  }
}

/**
 * Get AI response from Hugging Face (free, no API key required for public models)
 */
async function getAIResponseFromHuggingFace(message, systemPrompt, conversationHistory, dataContext) {
  try {
    // Use Hugging Face's free inference API with a conversational model
    // Using a free model that doesn't require API key
    const model = 'microsoft/DialoGPT-medium'; // Free conversational model
    
    // Alternative: Use a free ChatGPT alternative service
    // For now, we'll use a simple approach with data analysis
    
    // Since Hugging Face free models might have limitations, 
    // we'll use a data-based intelligent response system
    return getDataBasedResponse(message, dataContext);
  } catch (error) {
    throw error;
  }
}

/**
 * Get intelligent response based on data analysis (no external API needed)
 * This provides human-like conversational responses based on actual admin panel data
 */
function getDataBasedResponse(message, dataContext) {
  const lowerMessage = message.toLowerCase();

  // Dashboard/Statistics questions
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('statistic') || lowerMessage.includes('overview') || lowerMessage.includes('summary')) {
    return `Here's a quick overview of your admin panel:\n\n${dataContext}\n\nYou can view more detailed statistics in the Dashboard section. Is there anything specific you'd like to know more about?`;
  }

  // Product questions
  if (lowerMessage.includes('product')) {
    if (lowerMessage.includes('low stock') || lowerMessage.includes('out of stock')) {
      const lowStockMatch = dataContext.match(/Low Stock Products[^:]*:\n([\s\S]*?)(?=\n\n|$)/);
      if (lowStockMatch) {
        return `Here are the products with low stock:\n${lowStockMatch[1]}\n\nYou should consider restocking these items soon. You can manage products in the Products section.`;
      }
    }
    const productMatch = dataContext.match(/Total Products: (\d+)/);
    if (productMatch) {
      return `You currently have ${productMatch[1]} total products in your system. You can view and manage all products in the Products section. Would you like to know about specific products or categories?`;
    }
  }

  // Order questions
  if (lowerMessage.includes('order')) {
    if (lowerMessage.includes('pending') || lowerMessage.includes('processing')) {
      const pendingMatch = dataContext.match(/Total Orders: (\d+) \((\d+) pending/);
      if (pendingMatch) {
        return `You have ${pendingMatch[2]} orders that are currently pending or processing out of ${pendingMatch[1]} total orders. You can manage these orders in the Orders section.`;
      }
    }
    const orderMatch = dataContext.match(/Total Orders: (\d+)/);
    if (orderMatch) {
      return `You have ${orderMatch[1]} total orders in the system. Check the Orders section to view and manage them.`;
    }
  }

  // User/Customer questions
  if (lowerMessage.includes('user') || lowerMessage.includes('customer')) {
    const userMatch = dataContext.match(/Total Users\/Customers: (\d+) \((\d+) active/);
    if (userMatch) {
      return `You have ${userMatch[1]} total users, with ${userMatch[2]} active users. You can manage users in the User Management section.`;
    }
  }

  // Admin questions
  if (lowerMessage.includes('admin')) {
    const adminMatch = dataContext.match(/Total Admins: (\d+)/);
    if (adminMatch) {
      return `There are ${adminMatch[1]} admins in the system. Super admins can manage other admins in the Admin Management section.`;
    }
  }

  // Category questions
  if (lowerMessage.includes('categor')) {
    const categoryMatch = dataContext.match(/Total Categories: (\d+)/);
    if (categoryMatch) {
      return `You have ${categoryMatch[1]} active categories. You can manage categories in the Categories section.`;
    }
  }

  // Review questions
  if (lowerMessage.includes('review')) {
    const reviewMatch = dataContext.match(/Total Approved Reviews: (\d+)/);
    if (reviewMatch) {
      return `You have ${reviewMatch[1]} approved reviews. You can manage reviews in the Reviews section.`;
    }
  }

  // Help/General questions
  if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('how')) {
    return `I can help you with:\n\n📊 Dashboard statistics and analytics\n📦 Product management and inventory\n📋 Order tracking and management\n👥 User and customer management\n🏷️ Category management\n⭐ Review management\n\nAsk me anything about your admin panel data! For example:\n- "How many products do I have?"\n- "Show me pending orders"\n- "What products are low in stock?"\n- "How many active users are there?"`;
  }

  // Sales/Revenue questions
  if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') || lowerMessage.includes('income') || lowerMessage.includes('earning')) {
    const orderMatch = dataContext.match(/Recent Orders[^:]*:\n([\s\S]*?)(?=\n\n|$)/);
    if (orderMatch) {
      return `Here are your recent orders:\n${orderMatch[1]}\n\nYou can view detailed sales reports and revenue analytics in the Orders section. Would you like to know about specific order details?`;
    }
    return `You can view your sales and revenue data in the Orders section. The dashboard also provides sales analytics and trends.`;
  }

  // Inventory/Stock questions
  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('quantity')) {
    const lowStockMatch = dataContext.match(/Low Stock Products[^:]*:\n([\s\S]*?)(?=\n\n|$)/);
    if (lowStockMatch && lowStockMatch[1].trim() !== '') {
      return `⚠️ Attention needed! Here are products with low stock:\n${lowStockMatch[1]}\n\nYou should consider restocking these items soon to avoid running out. You can update stock levels in the Products section.`;
    }
    return `Your inventory looks good! All products have sufficient stock. You can manage inventory in the Products section.`;
  }

  // Performance/Analytics questions
  if (lowerMessage.includes('performance') || lowerMessage.includes('analytics') || lowerMessage.includes('report')) {
    return `Based on your current data:\n\n${dataContext}\n\nFor detailed analytics and performance reports, check the Dashboard section. You can also export data for further analysis.`;
  }

  // Greeting/Introduction
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! 👋 I'm your AI admin assistant. I can help you with:\n\n📊 Dashboard statistics\n📦 Product management\n📋 Order tracking\n👥 User management\n🏷️ Categories\n⭐ Reviews\n\nWhat would you like to know?`;
  }

  // Default intelligent response with context
  return `I understand you're asking about "${message}". Let me help you with that!\n\nBased on your current admin panel data:\n\n${dataContext}\n\nYou can ask me specific questions like:\n• "How many products do I have?"\n• "Show me pending orders"\n• "What products need restocking?"\n• "How many active users are there?"\n• "Tell me about recent sales"\n\nWhat would you like to know more about?`;
}
