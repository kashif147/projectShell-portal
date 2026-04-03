import {
  refreshTokenRequest,
  signInMicrosoftRequest,
  validationRequest,
} from '../api/auth.api';
import {
  deleteHeaders,
  deleteRefreshToken,
  getHeaders,
  getRefreshToken,
  setHeaders,
  setRefreshToken,
} from '../helpers/auth.helper';
import { deleteVerifier } from '../helpers/verifier.helper';
import { setSignedIn, setUser, setDetail } from '../store/slice/auth.slice';
import { getMemberDetail } from '../helpers/decode.helper';
import { toast } from 'react-toastify';
import { fetchAllLookupsOnLogin } from '../contexts/lookupContext';
import { decryptToken } from '../helpers/crypt.helper';

const performLogoutCleanup = dispatch => {
  deleteHeaders();
  deleteVerifier();
  dispatch(setSignedIn(false));
  dispatch(setUser({}));
  dispatch(setDetail(null));
};

export const validation = () => {
  return async dispatch => {
    try {
      const res = getHeaders();
      const refreshToken = getRefreshToken();
      
      const hasToken =
      res?.token &&
      typeof res.token === 'string' &&
      res.token.trim().length > 0;
      
      if (!hasToken) {
        dispatch(setSignedIn(false));
        dispatch(setUser({}));
        return;
      }
      
      const refreshUser = await refreshTokenRequest({ refreshToken });
      if (refreshUser?.status === 200) {
        setHeaders(refreshUser?.data?.data);
        const refreshDectoken = await decryptToken(refreshUser?.data?.data?.refreshToken);
        setRefreshToken(refreshDectoken);

        const meRes = await validationRequest();
        const isSuccess = meRes?.status >= 200 && meRes?.status < 300;

        if (isSuccess) {
          const meUser = meRes.data?.data ?? meRes.data;
          dispatch(setSignedIn(true));
          dispatch(setUser(meUser ?? {}));
          const memberDetail = await getMemberDetail();
          dispatch(setDetail(memberDetail));
        }
      } else {
        dispatch(setSignedIn(false));
        dispatch(setUser({}));
        dispatch(setDetail(null));
        performLogoutCleanup(dispatch);
      }
    } catch (error) {
      console.error('Validation error:', error);
      performLogoutCleanup(dispatch);
    }
  };
};

export const signInMicrosoft = data => {
  return async dispatch => {
    signInMicrosoftRequest(data)
      .then(async res => {
        if (res.status === 200) {
          setHeaders(res.data);
          setRefreshToken(res?.data?.refreshToken);
          deleteVerifier();
          dispatch(setSignedIn(true));
          dispatch(setUser(res.data.user));
          const memberDetail = await getMemberDetail();
          dispatch(setDetail(memberDetail));

          // Fetch all lookups after successful login
          fetchAllLookupsOnLogin().catch(error => {
            console.error('Failed to fetch lookups on login:', error);
          });
        } else {
          toast.error(res.data.errors[0] ?? 'Unable to Sign In');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
        // navigate('/')
      });
  };
};

export const signOut = navigate => {
  return async dispatch => {
    try {
      // Clear all lookup data from local storage first
      const lookupKeys = [
        'paymentLookups',
        'genderLookups',
        'cityLookups',
        'titleLookups',
        'secondarySection',
        'primarySection',
        'gradeLookups',
        'studyLocationLookups',
        'workLocationLookups',
        'countries',
        'categories',
      ];

      lookupKeys.forEach(key => {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to remove ${key} from localStorage:`, error);
        }
      });

      // Clear auth data
      deleteHeaders();
      deleteRefreshToken();

      // Dispatch state changes
      dispatch(setSignedIn(false));
      dispatch(setUser({}));
      dispatch(setDetail(null));

      // Use setTimeout to allow React to finish unmounting before navigation
      // This prevents the "removeChild" error during component cleanup
      setTimeout(() => {
        // Use window.location for a clean navigation that resets everything
        window.location.href = '/';
      }, 100);

      // await microSoftUrlRedirect();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Something went wrong');
      // Fallback navigation
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };
};
