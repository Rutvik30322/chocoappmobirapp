# Chocolate E-Commerce Application - Complete Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Backend Documentation](#backend-documentation)
5. [Mobile App Documentation](#mobile-app-documentation)
6. [Admin Panel Documentation](#admin-panel-documentation)
7. [Features](#features)
8. [API Documentation](#api-documentation)
9. [Setup & Installation](#setup--installation)
10. [Configuration](#configuration)
11. [Deployment](#deployment)

---

## 🎯 Project Overview

This is a full-stack e-commerce application for a chocolate shop built with the MERN stack (MongoDB, Express.js, React Native, Node.js). The application consists of three main components:

1. **Backend API** - Node.js/Express REST API with MongoDB
2. **Mobile App** - React Native application for customers
3. **Admin Panel** - React web application for administrators

### Key Features
- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- Order management
- Payment integration (Razorpay)
- Review and rating system
- Address management
- Profile management with image upload
- Admin dashboard
- AI-powered chatbot for customer support

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

### Mobile App (React Native)
- **Framework**: React Native 0.83.1
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Image Picker**: react-native-image-picker
- **Payment**: react-native-razorpay
- **UI Components**: React Native Paper, Custom Themed Components
- **Animations**: Lottie React Native

### Admin Panel
- **Framework**: React
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: CSS Modules

---

## 📁 Project Structure

```
chocoapp-main/
├── backend/                    # Backend API
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controllers/           # Route controllers
│   │   ├── authController.js  # Authentication logic
│   │   ├── productController.js # Product management
│   │   ├── orderController.js  # Order management
│   │   ├── cartController.js   # Cart management
│   │   ├── reviewController.js # Review management
│   │   └── uploadController.js # File uploads
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Error handling
│   │   ├── upload.js          # Multer config
│   │   └── validate.js        # Input validation
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # User model
│   │   ├── Admin.js           # Admin model
│   │   ├── Product.js         # Product model
│   │   ├── Category.js        # Category model
│   │   ├── Order.js           # Order model
│   │   ├── Review.js          # Review model
│   │   └── Otp.js              # OTP model
│   ├── routes/                # API routes
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── productRoutes.js   # Product endpoints
│   │   ├── orderRoutes.js     # Order endpoints
│   │   ├── cartRoutes.js      # Cart endpoints
│   │   ├── reviewRoutes.js    # Review endpoints
│   │   ├── addressRoutes.js   # Address endpoints
│   │   └── uploadRoutes.js    # Upload endpoints
│   ├── utils/                 # Utility functions
│   │   ├── apiResponse.js     # Response helpers
│   │   ├── apiError.js        # Error classes
│   │   └── jwtHelper.js       # JWT utilities
│   ├── validators/            # Input validators
│   │   └── authValidator.js   # Validation schemas
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   └── package.json           # Dependencies
│
├── app/                       # React Native Mobile App
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   └── ThemedLayout.tsx
│   │   ├── context/           # Context providers
│   │   │   ├── ThemeContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── navigation/        # Navigation setup
│   │   │   ├── MainNavigator.tsx
│   │   │   ├── BottomTabNavigator.tsx
│   │   │   └── SettingsStackNavigator.tsx
│   │   ├── screens/           # Screen components
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   ├── OrdersScreen.tsx
│   │   │   ├── OrderDetailScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── DeliveryAddressScreen.tsx
│   │   │   ├── AddAddressScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── HelpSupportScreen.tsx
│   │   │   ├── AboutScreen.tsx
│   │   │   └── ChatbotScreen.tsx
│   │   ├── services/          # API services
│   │   │   ├── api.ts         # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── reviewService.ts
│   │   │   ├── addressService.ts
│   │   │   └── chatbotService.ts
│   │   ├── store/             # Redux store
│   │   │   ├── slices/
│   │   │   │   └── authSlice.ts
│   │   │   └── store.ts
│   │   └── types/             # TypeScript types
│   │       └── react-native-image-picker.d.ts
│   ├── android/               # Android native code
│   ├── ios/                   # iOS native code
│   └── package.json
│
└── admin-panel/               # Admin Web Panel
    └── admin panel/
        ├── src/
        │   ├── components/    # React components
        │   │   ├── Dashboard.jsx
        │   │   ├── Products.jsx
        │   │   ├── Orders.jsx
        │   │   ├── Categories.jsx
        │   │   ├── Reviews.jsx
        │   │   ├── Users.jsx
        │   │   ├── Customers.jsx
        │   │   ├── Login.jsx
        │   │   ├── Profile.jsx
        │   │   └── ForgotPassword.jsx
        │   ├── services/       # API services
        │   │   ├── api.js
        │   │   └── authService.js
        │   └── store/         # Redux store
        │       └── slices/
        └── package.json
```

---

## 🔧 Backend Documentation

### Database Models

#### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  mobile: String (required, unique, 10 digits),
  password: String (required, hashed),
  profilePicture: String (Cloudinary URL),
  addresses: [{
    name: String,
    addressLine: String,
    city: String,
    state: String,
    pincode: String (6 digits),
    phone: String (10 digits),
    type: String (Home/Office/Other),
    isDefault: Boolean
  }],
  role: String (default: 'customer'),
  isActive: Boolean (default: true),
  cart: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }]
}
```

#### Product Model
```javascript
{
  name: String (required),
  description: String,
  price: Number (required),
  category: ObjectId (ref: Category),
  image: String (Cloudinary URL),
  images: [String] (Cloudinary URLs),
  inStock: Boolean (default: true),
  stock: Number (default: 0),
  isActive: Boolean (default: true)
}
```

#### Order Model
```javascript
{
  user: ObjectId (ref: User),
  orderItems: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  shippingAddress: {
    name: String,
    addressLine: String,
    city: String,
    state: String,
    pincode: String,
    phone: String
  },
  paymentMethod: String (Razorpay/COD),
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },
  totalPrice: Number,
  status: String (Pending/Processing/Shipped/Delivered/Cancelled),
  isPaid: Boolean,
  paidAt: Date,
  deliveredAt: Date
}
```

#### Review Model
```javascript
{
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5, required),
  comment: String,
  isApproved: Boolean (default: false)
}
```

### API Endpoints

#### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new customer | Public |
| POST | `/login` | Customer login | Public |
| POST | `/admin/login` | Admin login | Public |
| GET | `/me` | Get current user/admin | Private |
| PUT | `/profile` | Update user profile | Private (Customer) |
| PUT | `/change-password` | Change password | Private (Customer) |
| POST | `/forgot-password/send-otp` | Send OTP for password reset | Public |
| POST | `/forgot-password/verify-otp` | Verify OTP | Public |
| POST | `/forgot-password/reset` | Reset password | Public |
| PUT | `/admin/profile` | Update admin profile | Private (Admin) |
| PUT | `/admin/change-password` | Change admin password | Private (Admin) |
| POST | `/admin/forgot-password/send-otp` | Send OTP to admin email | Public |
| POST | `/admin/forgot-password/verify-otp` | Verify admin OTP | Public |
| POST | `/admin/forgot-password/reset` | Reset admin password | Public |

#### Products (`/api/products`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all products (with filters) | Public |
| GET | `/categories/all` | Get all categories | Public |
| GET | `/:id` | Get product by ID | Public |
| GET | `/related/:category/:excludeId` | Get related products | Public |
| POST | `/` | Create new product | Private (Admin) |
| PUT | `/:id` | Update product | Private (Admin) |
| DELETE | `/:id` | Delete product | Private (Admin) |

#### Categories (`/api/categories`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all categories | Public |
| POST | `/` | Create category | Private (Admin) |
| PUT | `/:id` | Update category | Private (Admin) |
| DELETE | `/:id` | Delete category | Private (Admin) |

#### Cart (`/api/cart`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user's cart | Private (Customer) |
| POST | `/add` | Add item to cart | Private (Customer) |
| PUT | `/update/:productId` | Update cart item quantity | Private (Customer) |
| DELETE | `/remove/:productId` | Remove item from cart | Private (Customer) |
| DELETE | `/clear` | Clear entire cart | Private (Customer) |

#### Orders (`/api/orders`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new order | Private (Customer) |
| GET | `/my-orders` | Get user's orders | Private (Customer) |
| GET | `/:id` | Get order by ID | Private |
| PUT | `/:id/pay` | Update order payment | Private (Customer) |
| PUT | `/:id/cancel` | Cancel order | Private (Customer) |
| GET | `/` | Get all orders (admin) | Private (Admin) |
| PUT | `/:id/status` | Update order status | Private (Admin) |
| GET | `/admin/stats` | Get dashboard statistics | Private (Admin) |

#### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/product/:productId` | Get product reviews | Public |
| POST | `/` | Create review | Private (Customer) |
| PUT | `/:id` | Update review | Private (Customer) |
| DELETE | `/:id` | Delete review | Private (Customer) |
| PUT | `/:id/approve` | Approve review | Private (Admin) |
| GET | `/` | Get all reviews (admin) | Private (Admin) |

#### Addresses (`/api/addresses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user addresses | Private (Customer) |
| POST | `/` | Add new address | Private (Customer) |
| PUT | `/:id` | Update address | Private (Customer) |
| DELETE | `/:id` | Delete address | Private (Customer) |
| PUT | `/:id/set-default` | Set default address | Private (Customer) |

#### Upload (`/api/upload`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/profile-picture` | Upload profile picture | Private |
| DELETE | `/profile-picture` | Delete profile picture | Private |
| POST | `/product-images` | Upload product images | Private (Admin) |
| DELETE | `/product-image/:publicId` | Delete product image | Private (Admin) |

---

## 📱 Mobile App Documentation

### Screens

1. **HomeScreen** - Product catalog with categories and search
2. **LoginScreen** - User authentication
3. **SignUpScreen** - User registration
4. **ProfileScreen** - User profile with edit functionality
5. **CartScreen** - Shopping cart management
6. **ProductDetailScreen** - Product details with reviews and related products
7. **PaymentScreen** - Payment processing (Razorpay/COD)
8. **OrdersScreen** - User's order history
9. **OrderDetailScreen** - Detailed order view
10. **SettingsScreen** - App settings and logout
11. **DeliveryAddressScreen** - Address management
12. **AddAddressScreen** - Add/edit address
13. **ForgotPasswordScreen** - Password reset with OTP
14. **HelpSupportScreen** - Help and support information
15. **AboutScreen** - App information
16. **ChatbotScreen** - AI-powered customer support

### Features

#### Authentication
- User registration with email, mobile, password
- Login with mobile/email and password
- JWT token-based authentication
- Forgot password with OTP verification
- Profile picture upload to Cloudinary

#### Shopping
- Browse products by category
- Search products
- View product details with images
- Add products to cart
- Update cart quantities
- Stock management
- Related products display

#### Orders
- Place orders with default address
- Payment integration (Razorpay)
- Cash on Delivery (COD)
- Order history
- Order tracking
- Cancel orders

#### Reviews
- Rate products (1-5 stars)
- Write product reviews
- View approved reviews
- Average rating calculation

#### Address Management
- Add multiple addresses
- Edit addresses
- Delete addresses
- Set default address
- Address validation

#### Profile Management
- View profile information
- Edit name, email, mobile
- Upload profile picture
- Change password
- Profile picture from gallery or URL

---

## 🖥️ Admin Panel Documentation

### Components

1. **Dashboard** - Overview with statistics
2. **Products** - Product CRUD operations
3. **Orders** - Order management
4. **Categories** - Category management
5. **Reviews** - Review approval and management
6. **Customers** - Customer list and management
7. **Users** - User management
8. **Profile** - Admin profile and password management
9. **Login** - Admin authentication
10. **ForgotPassword** - Admin password reset

### Features

- Product management (Create, Read, Update, Delete)
- Category management
- Order status management
- Review approval system
- User management
- Admin profile management
- Admin password change
- Admin forgot password with OTP

---

## 🚀 Setup & Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Atlas
   MONGODB_URI=your_mongodb_atlas_connection_string
   
   # JWT
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   # Admin
   ADMIN_EMAIL=admin@chocolateapp.com
   ADMIN_PASSWORD=Admin@123456
   
   # OpenAI (for Chatbot)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. **Navigate to app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL in `src/services/api.ts`:**
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   ```

4. **For Android:**
   ```bash
   npm run android
   ```

5. **For iOS:**
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

### Admin Panel Setup

1. **Navigate to admin panel directory:**
   ```bash
   cd "admin-panel/admin panel"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL in `src/services/api.js`:**
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

---

## 🔐 Authentication Flow

### Customer Authentication
1. User registers with name, email, mobile, password
2. Backend creates user and returns JWT token
3. Token stored in AsyncStorage (mobile) / localStorage (admin)
4. Token included in Authorization header for protected routes
5. Token expires after 7 days

### Admin Authentication
1. Admin logs in with email and password
2. Backend verifies credentials and returns JWT token
3. Token stored in localStorage
4. Admin-only routes protected by `adminOnly` middleware

---

## 💳 Payment Integration

### Razorpay Integration
- Payment gateway: Razorpay
- Supported methods: Credit/Debit cards, UPI, Net Banking
- Payment verification on backend
- Order creation after successful payment

### Cash on Delivery (COD)
- Order placed without payment
- Payment collected on delivery
- Order status: Pending → Processing → Shipped → Delivered

---

## 📸 Image Upload

### Cloudinary Integration
- Profile pictures: `chocolate-app/profiles/`
- Product images: `chocolate-app/products/`
- Automatic image optimization
- Image deletion on update/delete

### Mobile App Image Upload
- Gallery selection
- Camera capture
- Direct URL input
- Image compression before upload

---

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers
- File upload size limits
- SQL injection prevention (MongoDB)
- XSS protection

---

## 📊 Database Schema Relationships

```
User
  ├── cart[] → Product
  ├── addresses[]
  └── orders[] → Order

Product
  ├── category → Category
  ├── reviews[] → Review
  └── orderItems[] → Order

Order
  ├── user → User
  ├── orderItems[] → Product
  └── shippingAddress

Review
  ├── user → User
  └── product → Product

Category
  └── products[] → Product
```

---

## 🧪 Testing

### Backend API Testing
Use Postman collection or similar tool:
- Import `Postman_Product_API_Test.json`
- Set environment variables
- Test all endpoints

### Mobile App Testing
- Test on Android emulator
- Test on iOS simulator
- Test on physical devices
- Test network connectivity
- Test offline scenarios

---

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend server is running
   - Verify IP address in API configuration
   - Check firewall settings
   - Ensure same network for mobile device

2. **Image Upload Fails**
   - Verify Cloudinary credentials
   - Check file size limits
   - Verify file format (jpg, png, webp)

3. **Authentication Errors**
   - Check token expiration
   - Verify JWT_SECRET matches
   - Clear AsyncStorage/localStorage and re-login

4. **Payment Issues**
   - Verify Razorpay credentials
   - Check payment gateway status
   - Verify order creation flow

---

## 🤖 Chatbot Integration

### Overview
The application includes an AI-powered chatbot using OpenAI's ChatGPT API for customer support. The chatbot is designed to answer e-commerce related questions about products, orders, payments, delivery, and more.

### Features
- **Context-Aware Conversations**: Maintains conversation history for better responses
- **E-commerce Focused**: System prompt focuses on shopping-related questions
- **Fallback Responses**: Provides helpful default responses if API fails
- **Theme Integration**: Uses app's theme colors and styling
- **Error Handling**: Graceful error handling with user-friendly messages

### Setup Instructions

#### Option 1: Direct API Integration (Current)
1. Get OpenAI API key from https://platform.openai.com/
2. Set API key in `app/src/services/chatbotService.ts`:
   ```typescript
   const DEFAULT_API_KEY = 'your-openai-api-key-here';
   ```
3. Chatbot will work immediately

#### Option 2: Backend Proxy (Recommended for Production)
1. Create backend endpoint to handle ChatGPT API calls
2. Store API key securely in backend `.env`
3. Update mobile app to call backend endpoint

See `CHATBOT_SETUP.md` for detailed setup instructions.

### Usage
- Accessible from bottom tab navigation (Chatbot tab)
- Users can ask questions about:
  - Products and prices
  - Order status and tracking
  - Payment methods (Razorpay, COD)
  - Shipping and delivery
  - Returns and refunds
  - Account management

### Cost Considerations
- OpenAI API charges based on usage (~$0.002 per 1K tokens)
- Each message uses approximately 100-200 tokens
- Consider implementing rate limiting for cost control

---

## 📝 License

ISC

---

## 👥 Support

For issues and questions:
- Email: support@chocolateapp.com
- Phone: +91-9876543210

---

## 📚 Additional Documentation

- `CHATBOT_SETUP.md` - Chatbot setup and configuration guide
- `backend/README.md` - Backend API documentation
- `backend/ADMIN_SETUP.md` - Admin setup guide
- `backend/Postman_README.md` - API testing guide

---

**Last Updated**: 2024
