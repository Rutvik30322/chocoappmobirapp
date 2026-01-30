import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
        setNotifications([]);
      }
      return;
    }

    // Get the backend URL - extract from API base URL or use environment variable
    const apiBaseUrl = 'http://172.16.10.248:5000/api';
    const backendUrl = apiBaseUrl.replace('/api', ''); // Remove /api to get base URL
    
    // Create socket connection
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;

    // Connection event
    newSocket.on('connect', () => {
     
      setIsConnected(true);
      
      // Join admin room
      newSocket.emit('join-admin');
    });

    // Disconnection event
    newSocket.on('disconnect', () => {
     
      setIsConnected(false);
    });

    // Receive notification
    newSocket.on('notification', (notification) => {
    
      
      // Add notification to state
      setNotifications((prev) => {
        // Check if notification already exists (prevent duplicates)
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;
        
        // Add new notification at the beginning
        return [notification, ...prev];
      });

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    });

    // Error handling
    newSocket.on('connect_error', (error) => {
      console.error('🔔 Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
