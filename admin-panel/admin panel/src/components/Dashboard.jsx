import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLogout } from '../store/slices/authSlice';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '📋' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Categories', path: '/categories', icon: '🏷️' },
    { name: 'Analytics', path: '/analytics', icon: '📊' },
  ];
  
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
          <button 
            className={styles.closeSidebarBtn} 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className={styles.navMenu}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link 
                  to={item.path} 
                  className={styles.navLink}
                  onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <button 
            className={styles.menuToggleBtn} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
          <button className={styles.logoutBtn} onClick={() => {
            dispatch(adminLogout());
            navigate('/login');
          }}>
            Logout
          </button>
        </header>
        
        <div className={styles.dashboardContent}>
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Manage your chocolate shop inventory and orders here.</p>
          
          <div className={styles.quickActions}>
            <Link to="/products" className={styles.actionCard}>
              <div className={styles.actionIcon}>📦</div>
              <h3>Manage Products</h3>
              <p>Add, edit, and manage your chocolate products</p>
            </Link>
            
            <Link to="/orders" className={styles.actionCard}>
              <div className={styles.actionIcon}>📋</div>
              <h3>View Orders</h3>
              <p>Check and manage customer orders</p>
            </Link>
            
            <Link to="/customers" className={styles.actionCard}>
              <div className={styles.actionIcon}>👥</div>
              <h3>Customer List</h3>
              <p>View and manage customer information</p>
            </Link>
          </div>
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {sidebarOpen && <div 
        className={styles.overlay} 
        onClick={() => setSidebarOpen(false)}
      />}
    </div>
  );
};

export default Dashboard;