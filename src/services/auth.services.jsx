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
import { clearB2CAuthTransaction } from '../helpers/verifier.helper';
import { microsoftLogoutRedirect } from '../helpers/B2C.helper';
import { setSignedIn, setUser, setDetail } from '../store/slice/auth.slice';
import { getMemberDetail } from '../helpers/decode.helper';
import { toast } from 'react-toastify';
import { fetchAllLookupsOnLogin } from '../contexts/lookupContext';

let authSessionGeneration = 0;

const bumpAuthSession = () => {
  authSessionGeneration += 1;
  return authSessionGeneration;
};

const isAuthSessionCurrent = generation =>
  generation === authSessionGeneration;

const performLogoutCleanup = dispatch => {
  bumpAuthSession();
  deleteHeaders();
  deleteRefreshToken();
  clearB2CAuthTransaction();
  dispatch(setSignedIn(false));
  dispatch(setUser({}));
  dispatch(setDetail(null));
};

export const validation = () => {
  return async dispatch => {
    const generation = authSessionGeneration;

    try {
      const res = getHeaders();
      const refreshToken = getRefreshToken();

      const hasToken =
        res?.token &&
        typeof res.token === 'string' &&
        res.token.trim().length > 0;

      if (!hasToken) {
        if (!isAuthSessionCurrent(generation)) return;
        dispatch(setSignedIn(false));
        dispatch(setUser({}));
        dispatch(setDetail(null));
        return;
      }

      const refreshUser = await refreshTokenRequest({ refreshToken });
      if (!isAuthSessionCurrent(generation)) return;

      if (refreshUser?.status === 200) {
        setHeaders(refreshUser?.data?.data);
        // The backend now sends both tokens as-is (no client-side decryption) - see
        // helpers/crypt.helper.js.
        setRefreshToken(refreshUser?.data?.data?.refreshToken);

        const meRes = await validationRequest();
        if (!isAuthSessionCurrent(generation)) return;

        const isSuccess = meRes?.status >= 200 && meRes?.status < 300;

        if (isSuccess) {
          const meUser = meRes.data?.data ?? meRes.data;
          dispatch(setSignedIn(true));
          dispatch(setUser(meUser ?? {}));
          const memberDetail = await getMemberDetail();
          if (!isAuthSessionCurrent(generation)) return;
          dispatch(setDetail(memberDetail));
        }
      } else {
        if (!isAuthSessionCurrent(generation)) return;
        performLogoutCleanup(dispatch);
      }
    } catch (error) {
      console.error('Validation error:', error);
      if (!isAuthSessionCurrent(generation)) return;
      performLogoutCleanup(dispatch);
    }
  };
};

export const signInMicrosoft = data => {
  return async dispatch => {
    const generation = bumpAuthSession();

    try {
      const res = await signInMicrosoftRequest(data);
      if (!isAuthSessionCurrent(generation)) return { success: false };

      if (res?.status === 200) {
        setHeaders(res.data);
        setRefreshToken(res?.data?.refreshToken);
        clearB2CAuthTransaction();
        dispatch(setSignedIn(true));
        dispatch(setUser(res.data.user));
        const memberDetail = await getMemberDetail();
        if (!isAuthSessionCurrent(generation)) return { success: false };
        dispatch(setDetail(memberDetail));

        fetchAllLookupsOnLogin().catch(() => {
          // Lookups are non-blocking; avoid logging auth payload details.
        });
        return { success: true };
      }

      clearB2CAuthTransaction();

      const status = res?.status;
      const apiMessage =
        res?.data?.message ||
        res?.data?.error ||
        res?.data?.errors?.[0];

      if (status === 400) {
        toast.error(
          'Your sign-in session expired or was invalid. Please try again.',
        );
      } else if (status === 401) {
        toast.error('Authentication failed. Please try signing in again.');
      } else {
        toast.error(apiMessage || 'Unable to Sign In');
      }

      return { success: false, status };
    } catch (error) {
      clearB2CAuthTransaction();
      toast.error('Authentication failed. Please try again.');
      return { success: false, error };
    }
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
        'disciplineLookups',
        'workLocationLookups',
        'allLookups',
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

      performLogoutCleanup(dispatch);

      // Use setTimeout to allow React to finish unmounting before navigation
      // This prevents the "removeChild" error during component cleanup
      setTimeout(() => {
        // Redirect to B2C's own logout endpoint, not just "/" - clearing our own
        // localStorage doesn't end B2C's session cookie, so a plain in-app navigation
        // would let the next "Sign in with Microsoft" silently re-authenticate with no
        // credential prompt. See helpers/B2C.helper.js's microsoftLogoutRedirect.
        microsoftLogoutRedirect();
      }, 100);
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
