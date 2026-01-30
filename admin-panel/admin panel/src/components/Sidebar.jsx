import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getMe } from '../services/authService';
import styles from './Sidebar.module.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const [currentRole, setCurrentRole] = useState(user?.role || 'admin');

  // Refresh admin data on mount to get latest role
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await getMe();
        if (response?.admin?.role) {
          setCurrentRole(response.admin.role);
        } else if (user?.role) {
          setCurrentRole(user.role);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // Fallback to user from store
        if (user?.role) {
          setCurrentRole(user.role);
        }
      }
    };

    if (user) {
      setCurrentRole(user.role || 'admin');
    } else {
      fetchAdminData();
    }
  }, [user]);

  const userRole = currentRole;

  // Define all menu items with their required roles
  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠', roles: ['admin', 'superadmin'] },
    { name: 'Products', path: '/products', icon: '📦', roles: ['admin', 'superadmin'] },
    { name: 'Banners', path: '/banners', icon: '🖼️', roles: ['admin', 'superadmin'] },
    { name: 'Orders', path: '/orders', icon: '📋', roles: ['admin', 'superadmin'] },
    { name: 'Categories', path: '/categories', icon: '🏷️', roles: ['admin', 'superadmin'] },
    { name: 'Reviews', path: '/reviews', icon: '⭐', roles: ['admin', 'superadmin'] },
    { name: 'User Management', path: '/users', icon: '👤', roles: ['admin', 'superadmin'] },
    { name: 'Admin Management', path: '/admins', icon: '👑', roles: ['superadmin'] }, // Only superadmin
    { name: 'Notifications', path: '/notifications', icon: '🔔', roles: ['admin', 'superadmin'] },
    { name: 'Profile', path: '/profile', icon: '⚙️', roles: ['admin', 'superadmin'] },
  ];

  // Filter menu items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  // Debug: Log role for troubleshooting (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sidebar Debug - Current role:', userRole, 'User from store:', user);
      console.log('Filtered nav items:', navItems.map(item => item.name));
    }
  }, [userRole, user, navItems]);

  // Debug: Log role for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log('Sidebar - Current user role:', userRole, 'User object:', user);
  }

  // Removed auto-close on navigation - sidebar stays open when navigating
  // const handleLinkClick = () => {
  //   if (window.innerWidth <= 768) {
  //     setSidebarOpen(false);
  //   }
  // };

  const handleClose = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`} style={{ left: sidebarOpen ? '0' : '-250px' }}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
          {/* <button 
            className={styles.closeSidebarBtn}
            type="button"
            aria-label="Close sidebar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (setSidebarOpen) {
                setSidebarOpen(false);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (setSidebarOpen) {
                  setSidebarOpen(false);
                }
              }
            }}
          >
            ✕
          </button> */}
        </div>
        <nav className={styles.navMenu}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              // Check if current path matches or starts with the item path
              // This allows parent menu items to be highlighted on child routes
              // e.g., "Products" highlights on /products/add and /products/edit/:id
              let isActive = location.pathname === item.path;
              
              // Special handling for routes with sub-pages
              if (item.path === '/products' && location.pathname.startsWith('/products')) {
                isActive = true;
              } else if (item.path === '/banners' && location.pathname.startsWith('/banners')) {
                isActive = true;
              } else if (item.path === '/categories' && location.pathname.startsWith('/categories')) {
                isActive = true;
              } else if (item.path === '/users' && location.pathname.startsWith('/users')) {
                isActive = true;
              } else if (item.path === '/admins' && location.pathname.startsWith('/admins')) {
                isActive = true;
              } else if (item.path === '/notifications' && location.pathname.startsWith('/notifications')) {
                isActive = true;
              }
              
              return (
                <li key={item.path} className={styles.navItem}>
                  <Link 
                    to={item.path} 
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      
      {/* Overlay - removed click-to-close, sidebar only closes via close button */}
      {/* Overlay is now only for visual backdrop on mobile, no click handler */}
    </>
  );
};

export default Sidebar;
