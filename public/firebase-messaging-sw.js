// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: 'AIzaSyCXGt41botyVbEkMsfo0SEe5iu8Qy1hguY',
  authDomain: 'portal-2ba29.firebaseapp.com',
  projectId: 'portal-2ba29',
  storageBucket: 'portal-2ba29.firebasestorage.app',
  messagingSenderId: '31732856266',
  appId: '1:31732856266:web:d3033d39df7ca6d0100b33',
  measurementId: 'G-3F413XVYM2',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    icon: '/vite.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
