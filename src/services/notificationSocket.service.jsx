import { io } from 'socket.io-client';
import { notification } from 'antd';
import { NOTIFICATION_URL } from '../constants/api';
import { decryptToken } from '../helpers/crypt.helper';

let notificationSocket = null;
let handlers = {
  onNotification: null,
  onUnreadCount: null,
};

const getBaseSocketUrl = () => {
  if (!NOTIFICATION_URL) {
    return null;
  }

  try {
    // Ensure we only pass the origin (protocol + host) to socket.io
    const url = new URL(NOTIFICATION_URL);
    return url.origin;
  } catch {
    // Fallback to the raw value if URL parsing fails
    return NOTIFICATION_URL;
  }
};

const showAntdNotification = payload => {
  const messageId =
    payload?.messageId || payload?._id || payload?.id || Date.now().toString();
  const title = payload?.title || 'Notification';
  const description = payload?.body || payload?.message || 'You have a new notification.';

  notification.open({
    key: String(messageId),
    message: title,
    description,
    placement: 'topRight',
    duration: 5,
  });
};

export const initNotificationSocket = async({
  token,
  userId,
  tenantId,
  onNotification,
  onUnreadCount,
}) => {
  if (typeof window === 'undefined') {
    // Avoid initializing on server / during SSR
    return;
  }

  if (!token || !userId || !tenantId) {
    console.warn('Missing data for notification socket init', {
      hasToken: !!token,
      hasUserId: !!userId,
      hasTenantId: !!tenantId,
    });
    return;
  }
  const decryptoken = await decryptToken(token);
  
  // Always keep latest handlers so components can update callbacks without recreating socket
  handlers.onNotification = onNotification;
  handlers.onUnreadCount = onUnreadCount;
  
  // If socket already exists, don't recreate it
  if (notificationSocket) {
    return;
  }
  
  try {
    console.log('Connecting notification socket with token and URL', {
      token: decryptoken,
      NOTIFICATION_URL,
    });
    const baseSocketUrl = getBaseSocketUrl();
    if (!baseSocketUrl) {
      console.warn('Notification socket base URL is not configured');
      return;
    }

    console.log('Connecting to notification socket', {
      baseSocketUrl,
      path: '/notification-service/api/socket.io',
    });

    notificationSocket = io(baseSocketUrl, {
      // External Socket.IO endpoint exposed by the gateway
      path: '/notification-service/api/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token: decryptoken
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    notificationSocket.on('connect', () => {
      console.log('Notification socket connected');
    });

    notificationSocket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    notificationSocket.on('connect_error', error => {
      console.error('Notification socket connection error:', error?.message || error);
    });

    // Generic notification payload handler
    notificationSocket.on('notification', payload => {
      // Show Ant Design toast popup whenever a real-time notification arrives.
      showAntdNotification(payload);

      if (handlers.onNotification) {
        handlers.onNotification(payload);
      }
    });

    // Unread count update handler - align with server "unreadCount" event
    notificationSocket.on('unreadCount', data => {
      if (!handlers.onUnreadCount) return;

      const count =
        typeof data === 'number'
          ? data
          : typeof data?.count === 'number'
            ? data.count
            : typeof data?.unreadCount === 'number'
              ? data.unreadCount
              : 0;

      handlers.onUnreadCount(count);
    });
  } catch (error) {
    console.error('Failed to initialize notification socket', error);
  }
};

export const disconnectNotificationSocket = () => {
  if (notificationSocket) {
    try {
      notificationSocket.disconnect();
    } catch (error) {
      console.error('Error disconnecting notification socket', error);
    }
  }

  notificationSocket = null;
  handlers.onNotification = null;
  handlers.onUnreadCount = null;
};

