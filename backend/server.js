import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { networkInterfaces } from 'os';

import connectDB from './config/database.js';
import configureCloudinary from './config/cloudinary.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure Cloudinary
configureCloudinary();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3001', 'http://localhost:5173', 'http://172.16.10.248:3001'], // Allow specific dev origins
  credentials: true,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Security middleware
app.use(helmet());
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - More lenient for admin panel usage
// General rate limiter for all API routes
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window (reduced from 15 minutes)
  max: 200, // limit each IP to 200 requests per minute (increased from 100 per 15 min)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

// More lenient rate limiter for admin routes (applied first, before general limiter)
const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 500, // Higher limit for admin operations (500 requests per minute)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply more lenient rate limiting to admin routes FIRST (order matters!)
app.use('/api/orders/admin', adminLimiter);
app.use('/api/users', adminLimiter);
app.use('/api/admins', adminLimiter);
app.use('/api/products', adminLimiter);
app.use('/api/categories', adminLimiter);
app.use('/api/reviews', adminLimiter);
app.use('/api/banners', adminLimiter);
app.use('/api/orders', adminLimiter);

// Apply general rate limiting to all other API routes
app.use('/api', generalLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://172.16.10.248:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
 

  // Join admin room for notifications
  socket.on('join-admin', () => {
    socket.join('admin');
   
  });

  socket.on('disconnect', () => {
   
  });
});

// Make io available globally for notifications
global.io = io;

// Get local IP address
const getLocalIP = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Start server
const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0'; // Listen on all network interfaces
const LOCAL_IP = getLocalIP();

httpServer.listen(PORT, HOST, () => {
  console.log('\n========================================');
  console.log('🚀 Backend Server Started Successfully!');
  console.log('========================================');
  console.log(`📍 Localhost URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL:   http://${LOCAL_IP}:${PORT}`);
  console.log(`📡 API Base URL:   http://localhost:${PORT}/api`);
  console.log(`📡 API Network:    http://${LOCAL_IP}:${PORT}/api`);
  console.log('========================================\n');
});

export default app;
export { io };