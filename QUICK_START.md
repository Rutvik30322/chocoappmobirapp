# 🚀 Quick Start Guide - Chocolate App

## Backend Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `backend/.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ADMIN_EMAIL=admin@chocolateapp.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Get MongoDB Atlas URI
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster → Create database user → Whitelist IP (0.0.0.0/0)
3. Click "Connect" → "Connect your application" → Copy connection string
4. Replace `<password>` with your database password

### 4. Get Cloudinary Credentials
1. Go to https://cloudinary.com/
2. Sign up/Login → Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

### 5. Seed Database & Start Server
```bash
npm run seed    # Creates admin user and sample products
npm run dev     # Starts server on http://localhost:5000
```

---

## Mobile App Setup (3 minutes)

### 1. Install Dependencies
```bash
cd app
npm install axios @react-native-async-storage/async-storage
```

### 2. Update API URL
Edit `app/src/services/api.ts`:
```typescript
// Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// iOS Simulator  
// const API_BASE_URL = 'http://localhost:5000/api';

// Real Device (use your computer's IP)
// const API_BASE_URL = 'http://192.168.1.X:5000/api';
```

### 3. Run Mobile App
```bash
# Android
npm run android

# iOS
npm run ios
```

---

## ✅ Test the Setup

### 1. Backend Health Check
Open browser: `http://localhost:5000/api/health`

Should see:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 2. Test Admin Login
```bash
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@chocolateapp.com",
  "password": "Admin@123456"
}
```

### 3. Mobile App Login
Use mobile app to register a new customer or login with existing credentials.

---

## 🎯 Default Credentials

**Admin:**
- Email: `admin@chocolateapp.com`  
- Password: `Admin@123456`

**Customer:**
- Register through mobile app

---

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register customer |
| `/api/auth/login` | POST | Customer login |
| `/api/auth/admin/login` | POST | Admin login |
| `/api/products` | GET | Get all products |
| `/api/orders` | POST | Create order |
| `/api/upload/profile-picture` | POST | Upload photo |

Full API documentation: See `backend/README.md`

---

## 🔧 Troubleshooting

**Cannot connect to backend from mobile:**
- Use `10.0.2.2` instead of `localhost` for Android
- Use your computer's IP for real devices
- Make sure backend is running

**MongoDB connection failed:**
- Check if IP is whitelisted in MongoDB Atlas
- Verify connection string in `.env`

**Cloudinary upload fails:**
- Check credentials in `.env`
- Restart server after changing `.env`

---

## 📁 Project Structure

```
chocolateapp/
├── backend/              # Node.js API
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, etc.
│   └── server.js        # Entry point
│
└── app/                 # React Native App
    └── src/
        ├── screens/     # UI screens
        ├── services/    # API services
        ├── context/     # Context providers
        └── navigation/  # Navigation config
```

---

## ✨ What's Been Created

### ✅ Backend (Complete)
- Authentication (Admin & Customer separate)
- Profile picture upload to Cloudinary
- Product management (CRUD)
- Order management
- Admin dashboard stats
- Security & validation

### ✅ Mobile Services (Complete)
- API service with Axios
- Auth service (register, login, admin login)
- Product service
- Order service  
- Profile upload service

### ⚠️ To Be Completed
- Redux store integration (in progress)
- Update Login/SignUp screens to use API
- Profile picture upload UI
- Admin dashboard screens

---

## 🚀 Next Steps

1. Backend is **100% ready** ✅
2. Mobile services are **ready** ✅
3. Now integrating **Redux** for state management
4. Then updating **UI screens** to connect to API

**Ready to continue?** Let me know and I'll complete the Redux setup and screen updates!
