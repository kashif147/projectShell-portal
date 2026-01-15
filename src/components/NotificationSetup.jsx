import React, { useEffect } from 'react';
import { useNotification } from '../contexts/notificationContext';
import { setNotificationContextMethods } from '../services/firebase.services';

/**
 * Component to connect notification context to firebase service
 * This must be rendered inside NotificationProvider
 */
const NotificationSetup = () => {
  const {
    incrementUnreadCount,
    addNotification,
  } = useNotification();

  useEffect(() => {
    // Set notification context methods for firebase service
    setNotificationContextMethods({
      incrementUnreadCount,
      addNotification,
    });

    // Cleanup on unmount
    return () => {
      setNotificationContextMethods(null);
    };
  }, [incrementUnreadCount, addNotification]);

  return null; // This component doesn't render anything
};

export default NotificationSetup;
