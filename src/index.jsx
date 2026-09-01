import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/index';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { publicRoutes, privateRoutes } from './config/routes';
import './assets/theme/index.css';
import { signInMicrosoft, validation } from './services/auth.services';
import './config/globals.js';
import { ErrorPage } from './pages/errorPage';
import { getVerifier } from './helpers/verifier.helper.js';
import { B2C_FLOW_STORAGE_KEY } from './helpers/B2C.helper.js';
import { ContextProvider } from './contexts/ContextProvider';
import NotificationSetup from './components/NotificationSetup';
import {
  getFcmToken,
  ensureFcmTokenRegistered,
  registerListenerWithFcm,
  unRegisterAppWithFcm,
  setNotificationContextMethods,
} from './services/firebase.services';
import SessionTimeoutModal from './components/SessionTimeoutModal';

const root = ReactDOM.createRoot(document.getElementById('root'));

const antdTheme = {
  token: {
    colorPrimary: '#2563eb',
    colorInfo: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#f43f5e',
    colorTextBase: '#0f172a',
    colorBgBase: '#ffffff',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    wireframe: false,
    boxShadowSecondary: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
  },
  components: {
    Button: {
      borderRadius: 9,
      controlHeight: 38,
      controlHeightLG: 46,
      controlHeightSM: 32,
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.05)',
      colorBorderSecondary: 'rgba(226, 232, 240, 0.8)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#1e293b',
      rowHoverBg: '#f8fafc',
      borderColor: '#f1f5f9',
    },
    Modal: {
      borderRadiusLG: 20,
      headerBg: 'transparent',
    },
    Drawer: {
      borderRadiusSM: 16,
    },
    Tag: {
      borderRadiusSM: 6,
      fontSize: 12,
    },
    Input: {
      borderRadius: 9,
      controlHeight: 38,
    },
    Select: {
      borderRadius: 9,
      controlHeight: 38,
    },
  },
};

const PulseLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f1f5f9 100%)',
    }}>
    <div
      style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid rgba(37, 99, 235, 0.15)',
          borderTopColor: '#2563eb',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          boxShadow: '0 0 12px rgba(37, 99, 235, 0.5)',
        }}
      />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          margin: '0 0 4px 0',
          color: '#0f172a',
          fontSize: '15px',
          fontWeight: '600',
          letterSpacing: '-0.01em',
        }}>
        ProjectShell Portal
      </p>
      <p
        style={{
          margin: 0,
          color: '#64748b',
          fontSize: '13px',
        }}>
        Loading your workspace...
      </p>
    </div>
  </div>
);

const Router = ({ auth }) => {
  const routes = auth.isSignedIn ? privateRoutes : publicRoutes;

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element}>
          {route.children?.map((child, childIndex) => (
            <Route
              key={childIndex}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
      ))}
      <Route exact path="*" element={<ErrorPage />} />
    </Routes>
  );
};
const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const queryParams = new URLSearchParams(location.search);
  const authCode = queryParams.get('code');
  const notificationUnsubscribeRef = React.useRef(null);
  const fcmListenerInitializedRef = React.useRef(false);
  const fcmRegisteredRef = React.useRef(false);
  const processedAuthCodeRef = React.useRef(null);

  const fcmUserId =
    auth.user?.id ||
    auth.user?._id ||
    auth.userDetail?.id ||
    auth.userDetail?._id;
  const fcmTenantId =
    auth.user?.tenantId ||
    auth.user?.userTenantId ||
    auth.userDetail?.tenantId ||
    auth.userDetail?.userTenantId;

  // Store navigate function globally for notification handlers
  React.useEffect(() => {
    window.__navigate = navigate;
    return () => {
      delete window.__navigate;
    };
  }, [navigate]);

  React.useEffect(() => {
    const handleAuthentication = async () => {
      try {
        const code_verifier = getVerifier();
        if (authCode && code_verifier) {
          if (processedAuthCodeRef.current === authCode) {
            return;
          }

          processedAuthCodeRef.current = authCode;
          const storedFlow = localStorage.getItem(B2C_FLOW_STORAGE_KEY);
          const data = {
            code: authCode,
            codeVerifier: code_verifier,
          };

          if (storedFlow) {
            data.flow = storedFlow;
          }

          const signInResult = await dispatch(signInMicrosoft(data));
          if (storedFlow) {
            localStorage.removeItem(B2C_FLOW_STORAGE_KEY);
          }
          if (signInResult?.success) {
            window.history.replaceState(null, '', '/');
          }
        } else {
          dispatch(validation());
        }
      } catch (error) {
        toast.error('Authentication failed');
      }
    };

    handleAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authCode, dispatch]);

  // Fetch FCM token and set up foreground listener once per signed-in session
  React.useEffect(() => {
    if (!auth.isSignedIn) {
      fcmListenerInitializedRef.current = false;
      fcmRegisteredRef.current = false;
      if (notificationUnsubscribeRef.current) {
        notificationUnsubscribeRef.current();
        notificationUnsubscribeRef.current = null;
      }
      unRegisterAppWithFcm().catch(() => {});
      return;
    }

    let cancelled = false;

    const setupFcmListener = async () => {
      if (fcmListenerInitializedRef.current) {
        return;
      }

      fcmListenerInitializedRef.current = true;

      try {
        console.log('Initializing FCM notifications...');
        await getFcmToken();
        if (cancelled) return;

        setTimeout(() => {
          if (cancelled || notificationUnsubscribeRef.current) return;
          notificationUnsubscribeRef.current = registerListenerWithFcm(navigate);
        }, 500);
      } catch (error) {
        console.error('FCM Initialization Error:', error);
        fcmListenerInitializedRef.current = false;
      }
    };

    setupFcmListener();

    return () => {
      cancelled = true;
    };
  }, [auth.isSignedIn, navigate]);

  // Register token with backend once userId and tenantId are available (e.g. after JWT decode)
  React.useEffect(() => {
    if (!auth.isSignedIn || !fcmUserId || !fcmTenantId || fcmRegisteredRef.current) {
      return;
    }

    let cancelled = false;

    const registerToken = async () => {
      const registered = await ensureFcmTokenRegistered({
        userId: fcmUserId,
        tenantId: fcmTenantId,
      });

      if (!cancelled && registered) {
        fcmRegisteredRef.current = true;
        console.log('FCM token registered with backend after login');
      }
    };

    registerToken();

    return () => {
      cancelled = true;
    };
  }, [auth.isSignedIn, fcmUserId, fcmTenantId]);

  if (auth.isLoading) {
    return <PulseLoader />;
  }

  return (
    <>
      <Router auth={auth} />
      <SessionTimeoutModal isEnabled={auth.isSignedIn} />
    </>
  );
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider theme={antdTheme}>
          <ContextProvider>
            <NotificationSetup />
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme="colored"
            />
            <App />
          </ContextProvider>
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

// Inject pulse animation styles
const pulseStyles = `
@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = pulseStyles;
document.head.appendChild(styleSheet);
