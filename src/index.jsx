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
import { ContextProvider } from './contexts/ContextProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));

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

  React.useEffect(() => {
    const handleAuthentication = async () => {
      try {
        const code_verifier = getVerifier();
        if (authCode && code_verifier) {
          const data = {
            code: authCode,
            codeVerifier: code_verifier,
          };
          dispatch(signInMicrosoft(data));
        } else {
          dispatch(validation());
        }
      } catch (error) {
        toast.error('Authentication failed');
      }
    };

    handleAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authCode, dispatch, location, navigate]);

  console.log('auth========>', auth);

  return auth.isLoading ? <div>loading...</div> : <Router auth={auth} />;
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider>
          <ContextProvider>
            <ToastContainer />
            <App />
          </ContextProvider>
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
