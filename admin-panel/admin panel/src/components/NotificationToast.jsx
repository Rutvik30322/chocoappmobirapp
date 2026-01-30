import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import styles from './NotificationToast.module.css';

const NotificationToast = () => {
  const { notifications } = useSocket();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Show only top 3 latest unread notifications as toasts
    const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);
    
    if (unreadNotifications.length > 0) {
      // Get notifications that are not yet visible
      const newNotifications = unreadNotifications.filter(
        n => !visibleNotifications.some(v => v.id === n.id)
      );
      
      if (newNotifications.length > 0) {
        // Add new notifications to visible list (max 3)
        setVisibleNotifications((prev) => {
          const combined = [...newNotifications, ...prev];
          // Keep only top 3 and remove duplicates
          const unique = combined.filter((n, index, self) =>
            index === self.findIndex((t) => t.id === n.id)
          );
          return unique.slice(0, 3);
        });
        
        // Auto-hide after 5 seconds
        const timers = newNotifications.map(notification => {
          return setTimeout(() => {
            setVisibleNotifications((prev) =>
              prev.filter((n) => n.id !== notification.id)
            );
          }, 5000);
        });
        
        return () => {
          timers.forEach(timer => clearTimeout(timer));
        };
      }
    } else {
      // Clear visible notifications if no unread
      setVisibleNotifications([]);
    }
  }, [notifications]);

  const handleClose = (notificationId) => {
    setVisibleNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'customer':
        return '👤';
      case 'user':
        return '👥';
      case 'product':
        return '📦';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#3b82f6';
      case 'customer':
        return '#10b981';
      case 'user':
        return '#8b5cf6';
      case 'product':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.toastContainer}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={styles.toast}
          style={{ borderLeftColor: getNotificationColor(notification.type) }}
        >
          <div className={styles.toastIcon}>
            {getNotificationIcon(notification.type)}
          </div>
          <div className={styles.toastContent}>
            <h4 className={styles.toastTitle}>{notification.title}</h4>
            <p className={styles.toastMessage}>{notification.message}</p>
          </div>
          <button
            className={styles.toastClose}
            onClick={() => handleClose(notification.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
