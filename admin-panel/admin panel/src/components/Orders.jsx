import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLogout } from '../store/slices/authSlice';
import styles from './Dashboard.module.css';

const Orders = () => {
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

  // Sample order data
  const orders = [
    { id: '#ORD-001', customer: 'John Doe', date: '2023-05-15', amount: '₹1,244', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Jane Smith', date: '2023-06-20', amount: '₹746', status: 'Shipped' },
    { id: '#ORD-003', customer: 'Bob Johnson', date: '2023-07-10', amount: '₹1,160', status: 'Processing' },
    { id: '#ORD-004', customer: 'Alice Brown', date: '2023-08-05', amount: '₹1,617', status: 'Pending' },
    { id: '#ORD-005', customer: 'Charlie Wilson', date: '2023-09-12', amount: '₹456', status: 'Delivered' },
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
          <h1 className={styles.dashboardTitle}>Order Management</h1>
          <button className={styles.logoutBtn} onClick={() => {
            dispatch(adminLogout());
            navigate('/login');
          }}>
            Logout
          </button>
        </header>
        
        <div className={styles.dashboardContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>All Orders</h2>
            <div>
              <input 
                type="text" 
                placeholder="Search orders..." 
                style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <select style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                <option>All Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>
          
          <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
            <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{order.id}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{order.customer}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{order.date}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{order.amount}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        backgroundColor: order.status === 'Delivered' ? '#dcfce7' : 
                                        order.status === 'Shipped' ? '#dbeafe' :
                                        order.status === 'Processing' ? '#fef3c7' : '#fee2e2',
                        color: order.status === 'Delivered' ? '#166534' : 
                               order.status === 'Shipped' ? '#1e40af' :
                               order.status === 'Processing' ? '#92400e' : '#b91c1c'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                      <button style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '3px', 
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}>
                        View
                      </button>
                      <button style={{ 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '3px', 
                        cursor: 'pointer'
                      }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Orders;