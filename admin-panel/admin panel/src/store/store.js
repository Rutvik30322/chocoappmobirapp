import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    auth: authReducer,
    users: userReducer,
    admins: adminReducer,
    categories: categoryReducer,
    orders: orderReducer,
    reviews: reviewReducer,
  },
});

export default store;