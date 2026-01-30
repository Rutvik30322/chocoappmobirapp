import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { adminLogout } from './store/slices/authSlice';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import EditProduct from './components/EditProduct';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Users from './components/Users';
import EditUser from './components/EditUser';
import Admins from './components/Admins';
import EditAdmin from './components/EditAdmin';
import Categories from './components/Categories';
import EditCategory from './components/EditCategory';
import Reviews from './components/Reviews';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import Notifications from './components/Notifications';
import Banners from './components/Banners';
import Chatbot from './components/Chatbot';
import ChatbotWidget from './components/ChatbotWidget';

// Component to handle authentication state
function AppContent() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(adminLogout());
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/forgot-password" 
        element={<ForgotPassword />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/products" 
        element={isAuthenticated ? <Products onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/products/add" 
        element={isAuthenticated ? <EditProduct /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/products/edit/:id" 
        element={isAuthenticated ? <EditProduct /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/orders" 
        element={isAuthenticated ? <Orders onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/customers" 
        element={isAuthenticated ? <Customers onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/users" 
        element={isAuthenticated ? <Users onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/users/add" 
        element={isAuthenticated ? <EditUser /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/users/edit/:id" 
        element={isAuthenticated ? <EditUser /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admins" 
        element={isAuthenticated ? <Admins onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admins/add" 
        element={isAuthenticated ? <EditAdmin /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/admins/edit/:id" 
        element={isAuthenticated ? <EditAdmin /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/categories" 
        element={isAuthenticated ? <Categories onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/categories/add" 
        element={isAuthenticated ? <EditCategory /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/categories/edit/:id" 
        element={isAuthenticated ? <EditCategory /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/reviews" 
        element={isAuthenticated ? <Reviews onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/banners" 
        element={isAuthenticated ? <Banners /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile" 
        element={isAuthenticated ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/notifications" 
        element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/chatbot" 
        element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <SocketProvider>
      <div className="App">
        <AppContent />
        <ChatbotWidget />
      </div>
      </SocketProvider>
    </Router>
  );
}

export default App;