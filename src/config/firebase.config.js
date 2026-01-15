import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCXGt41botyVbEkMsfo0SEe5iu8Qy1hguY',
  authDomain: 'portal-2ba29.firebaseapp.com',
  projectId: 'portal-2ba29',
  storageBucket: 'portal-2ba29.firebasestorage.app',
  messagingSenderId: '31732856266',
  appId: '1:31732856266:web:d3033d39df7ca6d0100b33',
  measurementId: 'G-3F413XVYM2',
};

// VAPID key for web push notifications
// Obtained from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
export const VAPID_KEY = 'BMm1rpCLM2ow0HQp4oalzITS81O-4zoG46-Jyn8IXk901_TCXrCwmZr9E6J9dy0WqN1-fZPqkmcUaJ-5gDuhN0o';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

// Check if browser supports messaging and we're not in SSR
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
    console.log('Firebase Messaging initialized');
  } catch (error) {
    console.log('Error initializing Firebase Messaging', error);
  }
}

export { app, messaging };
