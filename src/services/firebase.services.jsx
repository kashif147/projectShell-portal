import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { messaging, VAPID_KEY } from '../config/firebase.config';
import { registerToken } from '../api/notification.api';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

// Store navigate function globally for notification handlers
let globalNavigate = null;

// Store notification context methods globally
let notificationContextMethods = null;

// Function to set notification context methods (called from component)
export const setNotificationContextMethods = (methods) => {
  notificationContextMethods = methods;
};

// Check if browser supports notifications
const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Generate or retrieve persistent device ID
const getOrCreateDeviceId = () => {
  const STORAGE_KEY = 'fcmDeviceId';
  
  if (typeof window === 'undefined') {
    return null;
  }
  
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate new device ID using UUID
    deviceId = uuidv4();
    localStorage.setItem(STORAGE_KEY, deviceId);
    console.log('Generated new device ID:', deviceId);
  } else {
    console.log('Retrieved existing device ID:', deviceId);
  }
  
  return deviceId;
};

// Register FCM token with backend
const registerFcmTokenWithBackend = async (fcmToken, userId, tenantId, deviceId, platform = 'web') => {
  if (!fcmToken || !userId || !tenantId || !deviceId) {
    console.warn('Missing required data for FCM token registration:', {
      hasToken: !!fcmToken,
      hasUserId: !!userId,
      hasTenantId: !!tenantId,
      hasDeviceId: !!deviceId,
    });
    return false;
  }

  try {
    const registrationData = {
      fcmToken,
      userId,
      tenantId,
      deviceId,
      platform,
    };

    console.log('Registering FCM token with backend:', {
      ...registrationData,
      fcmToken: fcmToken.substring(0, 20) + '...', // Log partial token for debugging
    });

    const response = await registerToken(registrationData);
    
    if (response?.status === 200 || response?.data?.status === 'success') {
      console.log('FCM token registered successfully');
      return true;
    } else {
      console.error('FCM token registration failed:', response?.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error registering FCM token with backend:', error);
    return false;
  }
};

const getFcmToken = async (userData = null) => {
  let token = null;
  
  if (!isNotificationSupported() || !messaging) {
    console.log('Notifications not supported or messaging not initialized');
    return 'DeviceToken';
  }

  await checkApplicationNotificationsPermission();
  await registerAppWithFcm();
  
  try {
    token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    console.log('FCM token=========>', token);
    console.log('FCM Token (for API):', token);
    
    // Store token in localStorage
    if (token) {
      localStorage.setItem('fcmToken', token);
      console.log('FCM token stored in localStorage');
      
      // Register token with backend if user data is provided
      if (userData) {
        const userId = userData.userId;
        const tenantId = userData.tenantId;
        const deviceId = getOrCreateDeviceId();
        
        if (userId && tenantId && deviceId) {
          // Register token asynchronously (don't block token retrieval)
          registerFcmTokenWithBackend(token, userId, tenantId, deviceId, 'web')
            .then(success => {
              if (success) {
                console.log('FCM token registration completed successfully');
              } else {
                console.warn('FCM token registration failed, but token is still available');
              }
            })
            .catch(error => {
              console.error('FCM token registration error:', error);
            });
        } else {
          console.warn('User data incomplete, skipping FCM token registration:', {
            hasUserId: !!userId,
            hasTenantId: !!tenantId,
            hasDeviceId: !!deviceId,
          });
        }
      } else {
        console.log('User data not provided, FCM token will be registered later');
      }
    } else {
      console.log('No FCM token received');
    }
  } catch (error) {
    console.log('Error getting FCM token', error);
    console.error('FCM Token Error Details:', error.message);
    token = 'DeviceToken';
  }
  return token;
};

const checkApplicationNotificationsPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported in this browser');
    return;
  }

  try {
    // Check current permission status
    let permission = Notification.permission;

    // Request permission if not already granted or denied
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      console.log('Notifications permission granted');
    } else if (permission === 'denied') {
      console.log('Notifications permission denied');
    } else {
      console.log('Notifications permission not granted', permission);
    }
  } catch (error) {
    console.log('Error requesting notification permissions', error);
  }
};

const registerAppWithFcm = async () => {
  // No explicit registration needed for web
  // Browser notification permission is sufficient
  console.log('Web device - remote message registration not required');
};

const unRegisterAppWithFcm = async () => {
  // Delete token
  if (!messaging) {
    return;
  }

  try {
    await deleteToken(messaging);
    localStorage.removeItem('fcmToken');
    console.log('FCM token deleted');
  } catch (error) {
    console.log('Error deleting FCM token', error);
  }
};

const registerListenerWithFcm = (navigate) => {
  if (!messaging) {
    console.log('Messaging not initialized');
    return () => {}; // Return empty unsubscribe function
  }

  // Store navigate function globally for notification handlers
  globalNavigate = navigate;

  // Listen for foreground messages (when tab is open)
  const unsubscribe = onMessage(messaging, async (payload) => {
    console.log('Foreground message received', payload);
    
    // Handle new payload structure: { from, messageId, notification: { title, body } }
    const notificationTitle = payload?.notification?.title;
    const notificationBody = payload?.notification?.body;
    const messageId = payload?.messageId;
    const from = payload?.from;
    
    if (notificationTitle && notificationBody) {
      // Show toast notification with title
      toast.info(notificationTitle, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Increment unread count and add notification
      if (notificationContextMethods) {
        notificationContextMethods.incrementUnreadCount();
        notificationContextMethods.addNotification({
          messageId: messageId || Date.now().toString(),
          from: from,
          title: notificationTitle,
          body: notificationBody,
          read: false,
          timestamp: new Date().toISOString(),
          data: payload.data || {},
        });
      }

      // Also show browser notification
      onDisplayNotification(
        notificationTitle,
        notificationBody,
        payload.data || {},
      );
    }
  });

  // Handle notification clicks (for notifications created by our app)
  // Note: This only works for notifications we create, not system notifications
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        handleNotificationOpenApp(event.data.payload, globalNavigate);
      }
    });
  }

  return () => {
    globalNavigate = null;
    unsubscribe();
  };
};

const handleNotificationOpenApp = (remoteMessageOrNotification, navigate) => {
  if (!navigate) {
    console.log('Navigate function not available for notification handling');
    return;
  }

  // Handle both Firebase remoteMessage and notification objects
  // Firebase remoteMessage has data in remoteMessage.data
  // Browser notification has data in notification.data
  const data = remoteMessageOrNotification?.data || 
               remoteMessageOrNotification?.notification?.data || 
               {};

  let obj = {
    roomId: data?.roomId,
    userInfo: {
      id: data?.detail?.id || data?.details?.id,
      name: data?.detail?.name || data?.details?.name,
      message: data?.detail?.message || data?.details?.message,
    },
  };

  // Navigate based on notification data
  if (obj.roomId) {
    // Future: Navigate to chat screen with roomId
    console.log('Navigate to chat with roomId:', obj.roomId);
    // navigate('/chat', { state: { roomId: obj.roomId } });
  } else {
    // Navigate to Notifications screen
    console.log('Navigate to Notifications screen');
    navigate('/notifications');
  }
};

const onDisplayNotification = async (title, body, data) => {
  console.log('displaying notification', JSON.stringify(data));
  
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return;
  }

  // Check permission
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }
  }

  try {
    // Create and show notification
    const notification = new Notification(title, {
      body: body,
      icon: '/vite.svg', // You can replace with your app icon
      badge: '/vite.svg',
      data: data,
      tag: data?.roomId || 'default', // Use roomId as tag to replace notifications
      requireInteraction: false,
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus(); // Focus the window
      
      // Use global navigate function or fallback to window.location
      const navigateFn = globalNavigate || window.__navigate || null;
      if (navigateFn) {
        handleNotificationOpenApp({ data: data }, navigateFn);
      } else {
        // Fallback: navigate using window.location
        if (data?.roomId) {
          console.log('Navigate to chat with roomId:', data.roomId);
          // window.location.href = `/chat?roomId=${data.roomId}`;
        } else {
          window.location.href = '/notifications';
        }
      }
      
      notification.close();
    };

    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  } catch (error) {
    console.log('Error displaying notification', error);
  }
};

export {
  getFcmToken,
  checkApplicationNotificationsPermission,
  registerAppWithFcm,
  unRegisterAppWithFcm,
  registerListenerWithFcm,
};
