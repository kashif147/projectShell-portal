import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNotification } from '../contexts/notificationContext';
import { setNotificationContextMethods } from '../services/firebase.services';
import {
  initNotificationSocket,
  disconnectNotificationSocket,
} from '../services/notificationSocket.service';

/**
 * Component to connect notification context to firebase service
 * and Socket.io notification stream.
 * This must be rendered inside NotificationProvider
 */
const NotificationSetup = () => {
  const {
    incrementUnreadCount,
    addNotification,
    setUnreadCountValue,
  } = useNotification();

  const auth = useSelector(state => state.auth);

  useEffect(() => {
    // Set notification context methods for firebase service
    setNotificationContextMethods({
      incrementUnreadCount,
      addNotification,
    });

    return () => {
      setNotificationContextMethods(null);
    };
  }, [incrementUnreadCount, addNotification]);

  useEffect(() => {
    if (!auth?.isSignedIn) {
      disconnectNotificationSocket();
      return;
    }

    const user = auth.user || auth.userDetail;
    const userId =
      user?.id || user?._id || auth.userDetail?.id || auth.userDetail?._id;
    const tenantId =
      user?.tenantId ||
      user?.userTenantId ||
      auth.userDetail?.tenantId ||
      auth.userDetail?.userTenantId;

    // Token is stored in localStorage via auth.helper
    const token = localStorage.getItem('token');

    const handleNotification = payload => {
      const messageId =
        payload?.messageId || payload?._id || Date.now().toString();
      const title = payload?.title || 'Notification';
      const body = payload?.body || payload?.message || '';
      const timestamp =
        payload?.sentAt || payload?.createdAt || new Date().toISOString();

      addNotification({
        messageId,
        from: payload?.from,
        title,
        body,
        read: false,
        timestamp,
        data: payload?.data || {},
      });

      incrementUnreadCount();
    };

    const handleUnreadCount = count => {
      setUnreadCountValue(typeof count === 'number' ? count : 0);
    };

    if (userId && tenantId && token) {
      initNotificationSocket({
        token,
        userId,
        tenantId,
        onNotification: handleNotification,
        onUnreadCount: handleUnreadCount,
      });
    }

    return () => {
      disconnectNotificationSocket();
    };
  }, [
    auth?.isSignedIn,
    addNotification,
    incrementUnreadCount,
    setUnreadCountValue,
  ]);

  return null; // This component doesn't render anything
};

export default NotificationSetup;

