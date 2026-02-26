import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import type { NotificationSeverity, Notification } from '../types';

interface NotificationContextValue {
  showNotification: (severity: NotificationSeverity, message: string, duration?: number) => number;
  showSuccess: (message: string, duration?: number) => number;
  showError: (message: string, duration?: number) => number;
  showWarning: (message: string, duration?: number) => number;
  showInfo: (message: string, duration?: number) => number;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps): React.ReactElement => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showNotification = (severity: NotificationSeverity, message: string, duration: number = 4000): number => {
    const id = Date.now() + Math.random();
    const notification: Notification = {
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

  const removeNotification = (id: number): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message: string, duration?: number): number => showNotification('success', message, duration);
  const showError = (message: string, duration?: number): number => showNotification('error', message, duration);
  const showWarning = (message: string, duration?: number): number => showNotification('warning', message, duration);
  const showInfo = (message: string, duration?: number): number => showNotification('info', message, duration);

  const value: NotificationContextValue = {
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