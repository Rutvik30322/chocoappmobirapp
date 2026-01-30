import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import Sidebar from './Sidebar';
import Header from './Header';
import dashboardStyles from './Dashboard.module.css';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useSocket();
  const navigate = useNavigate();

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

  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'order':
        return 'Order';
      case 'customer':
        return 'Customer';
      case 'user':
        return 'User';
      case 'product':
        return 'Product';
      default:
        return 'Notification';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'order' && notification.data?.orderId) {
      navigate('/orders');
    } else if ((notification.type === 'customer' || notification.type === 'user') && notification.data?.userId) {
      navigate('/users');
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="Notifications"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          <div className={styles.notificationsHeader}>
            <div className={styles.headerInfo}>
              <h2 className={styles.pageTitle}>All Notifications</h2>
              <p className={styles.subtitle}>
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
            <div className={styles.headerActions}>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllReadBtn}
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className={styles.clearAllBtn}
                  onClick={clearAllNotifications}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'read' ? styles.active : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Notifications Table */}
          <div className={styles.tableContainer}>
            {filteredNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔔</div>
                <h3>No notifications</h3>
                <p>
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : filter === 'read'
                    ? 'No read notifications yet.'
                    : 'No notifications yet. New notifications will appear here.'}
                </p>
              </div>
            ) : (
              <table className={styles.notificationsTable}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`${styles.tableRow} ${!notification.read ? styles.unreadRow : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <td>
                        <div className={styles.typeCell}>
                          <span className={styles.typeIcon}>
                            {getNotificationIcon(notification.type)}
                          </span>
                          <span className={styles.typeLabel}>
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.titleCell}>
                          <strong>{notification.title}</strong>
                          {!notification.read && (
                            <span className={styles.unreadDot}></span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.messageCell}>
                          {notification.message}
                        </div>
                      </td>
                      <td>
                        <div className={styles.timeCell}>
                          <span className={styles.timeAgo}>
                            {formatTime(notification.timestamp)}
                          </span>
                          <span className={styles.fullDate}>
                            {formatFullDate(notification.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${notification.read ? styles.readBadge : styles.unreadBadge}`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          {!notification.read && (
                            <button
                              className={styles.actionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
