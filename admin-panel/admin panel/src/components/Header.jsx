import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../store/slices/authSlice';
import { getMe } from '../services/authService';
import { useSocket } from '../contexts/SocketContext';
import styles from './Header.module.css';

const Header = ({ title, onRefresh, refreshLoading, onMenuToggle }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const notificationRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: adminFromStore } = useSelector(state => state.auth);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, isConnected } = useSocket();

  // Default handler if onMenuToggle is not provided
  const handleMenuToggle = onMenuToggle || (() => {
    console.warn('onMenuToggle not provided to Header component');
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    // Use admin from store if available, otherwise fetch
    if (adminFromStore) {
      setAdminData(adminFromStore);
    } else {
      loadAdminData();
    }
  }, [adminFromStore]);

  const loadAdminData = async () => {
    try {
      const response = await getMe();
      if (response.admin) {
        setAdminData(response.admin);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/login');
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'order' && notification.data?.orderId) {
      navigate(`/orders`);
      setNotificationOpen(false);
    } else if ((notification.type === 'customer' || notification.type === 'user') && notification.data?.userId) {
      navigate(`/users`);
      setNotificationOpen(false);
    }
  };

  const adminName = adminData?.name || 'Admin';
  const adminPicture = adminData?.profilePicture || null;

  return (
    <>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.menuToggleBtn} 
            onClick={handleMenuToggle}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.dashboardTitle}>{title || 'Admin Panel'}</h1>
        </div>

        <div className={styles.headerRight}>
          {onRefresh && (
            <button 
              className={styles.refreshBtn} 
              onClick={onRefresh}
              disabled={refreshLoading}
              title="Refresh data"
            >
              {refreshLoading ? '⏳' : '🔄'}
            </button>
          )}

          {/* Notification Icon */}
          <div className={styles.notificationContainer} ref={notificationRef}>
            <button 
              className={styles.notificationBtn}
              onClick={toggleNotifications}
              aria-label="Notifications"
              title="Notifications"
            >
              <span className={styles.notificationIcon}>
                {isConnected ? '🔔' : '🔕'}
              </span>
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notificationOpen && (
              <div className={styles.notificationPanel}>
                <div className={styles.notificationHeader}>
                  <h3>Notifications {!isConnected && <span className={styles.connectionStatus}>(Disconnected)</span>}</h3>
                  <div className={styles.notificationHeaderActions}>
                    {notifications.length > 0 && (
                      <button
                        className={styles.markAllReadBtn}
                        onClick={markAllAsRead}
                        title="Mark all as read"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      className={styles.closeNotificationBtn}
                      onClick={() => setNotificationOpen(false)}
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {notifications.length > 0 && (
                  <div className={styles.viewAllContainer}>
                    <button
                      className={styles.viewAllBtn}
                      onClick={() => {
                        navigate('/notifications');
                        setNotificationOpen(false);
                      }}
                    >
                      View All Notifications →
                    </button>
                  </div>
                )}
                <div className={styles.notificationList}>
                  {notifications.length === 0 ? (
                    <div className={styles.noNotifications}>
                      <p>No notifications</p>
                      {!isConnected && (
                        <p className={styles.connectionMessage}>
                          Reconnecting to notification server...
                        </p>
                      )}
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={styles.notificationIconWrapper}>
                          {notification.type === 'order' && '📦'}
                          {notification.type === 'customer' && '👤'}
                          {notification.type === 'user' && '👥'}
                          {notification.type === 'product' && '📦'}
                        </div>
                        <div className={styles.notificationContent}>
                          <p className={styles.notificationTitle}>{notification.title}</p>
                          <p className={styles.notificationMessage}>{notification.message}</p>
                          <span className={styles.notificationTime}>
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className={styles.unreadIndicator}></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className={styles.profileSection}>
            {adminPicture ? (
              <img 
                src={adminPicture} 
                alt={adminName}
                className={styles.profilePicture}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={styles.profileInitials}
              style={{ display: adminPicture ? 'none' : 'flex' }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className={styles.profileName}>{adminName}</span>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
