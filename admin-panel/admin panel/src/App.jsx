import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { adminLogout } from './store/slices/authSlice';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import Customers from './components/Customers';

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
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/products" 
        element={isAuthenticated ? <Products onLogout={handleLogout} /> : <Navigate to="/login" />} 
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
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;