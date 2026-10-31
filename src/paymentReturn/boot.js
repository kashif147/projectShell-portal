// Standalone render of a payment return page. Loaded by src/index.jsx INSTEAD of the portal app
// for the two return paths, so none of the app's sign-in callback handling, token validation,
// notification setup or API client is loaded.
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../assets/theme/index.css';
import logo from '../assets/images/logo.png';
import { PaymentReturnPage } from './PaymentReturnPage.js';

export function renderPaymentReturn(outcome) {
  // Drop any query string / fragment (e.g. a Stripe session id) from the address bar and
  // history; it is never read or shown.
  if (window.location.search || window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  document.title = outcome === 'success' ? 'Payment submitted' : 'Payment not completed';
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(React.StrictMode, null, React.createElement(PaymentReturnPage, { outcome, logoSrc: logo })),
  );
}
