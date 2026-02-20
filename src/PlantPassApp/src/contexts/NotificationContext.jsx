import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showNotification = (severity, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      severity,
      message,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration) => showNotification('success', message, duration);
  const showError = (message, duration) => showNotification('error', message, duration);
  const showWarning = (message, duration) => showNotification('warning', message, duration);
  const showInfo = (message, duration) => showNotification('info', message, duration);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={
            isMobile 
              ? { vertical: 'top', horizontal: 'center' }
              : { vertical: 'bottom', horizontal: 'left' }
          }
          sx={{ 
            ...(isMobile 
              ? { mt: `${index * 60 + 8}px` }
              : { mb: `${index * 60}px` }
            ),
            zIndex: 9999 + index 
          }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};