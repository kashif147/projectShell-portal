import { io } from 'socket.io-client';
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

  // Strip any trailing slash so socket.io can append its own path
  return NOTIFICATION_URL;
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
  console.log('dectoken==========>',decryptoken)

  // Always keep latest handlers so components can update callbacks without recreating socket
  handlers.onNotification = onNotification;
  handlers.onUnreadCount = onUnreadCount;

  // If socket already exists, don't recreate it
  if (notificationSocket) {
    return;
  }

  try {
    notificationSocket = io(`${NOTIFICATION_URL}/api/socket.io`, {
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
      if (handlers.onNotification) {
        handlers.onNotification(payload);
      }
    });

    // Unread count update handler
    notificationSocket.on('notification:unreadCount', data => {
      if (!handlers.onUnreadCount) return;

      const count =
        typeof data === 'number'
          ? data
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

