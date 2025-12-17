import axios from 'axios';
import { signInMicrosoftRequest } from '../api/auth.api';
import {
  deleteHeaders,
  deleteUser,
  getHeaders,
  getUser,
  saveUser,
  setHeaders,
} from '../helpers/auth.helper';
import { deleteVerifier } from '../helpers/verifier.helper';
import { setSignedIn, setUser, setDetail } from '../store/slice/auth.slice';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';
import { getMemberDetail } from '../helpers/decode.helper';
import { toast } from 'react-toastify';
import { fetchAllLookupsOnLogin } from '../contexts/lookupContext';

export const validation = () => {
  return async dispatch => {
    try {
      const res = getHeaders();
      const user = getUser();
      if (res?.token && user?.user) {
        dispatch(setSignedIn(true));
        dispatch(setUser(JSON.parse(user?.user)));
        const memberDetail = await getMemberDetail();
        dispatch(setDetail(memberDetail));
        
        // Lookups will be fetched by LookupProvider on mount and Dashboard on navigation
        // No need to fetch here to avoid redundant calls
      } else {
        dispatch(setSignedIn(false));
      }
    } catch (error) {
      dispatch(setSignedIn(false));
    }
  };
};

export const getMemberRule = () => {
  const res = getHeaders();
  if (res?.token) {
    const cleanToken = res.token.replace(/^Bearer\s+/i, '');
    createPolicyEvaluationRequest({
      token: cleanToken,
      resource: 'user',
      action: 'read',
      context: {
        userId: '6888b5dc60c798b097e86c91',
      },
    })
      .then(res => {
        console.log('res=============>', res);
      })
      .catch(err => {
        console.log('err=============>', err);
      });
  }
};

export const signInMicrosoft = data => {
  return async dispatch => {
    signInMicrosoftRequest(data)
      .then(async res => {
        if (res.status === 200) {
          console.log('resonse=================>', res);
          setHeaders(res.data);
          saveUser(res.data.user);
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
      deleteUser();
      
      // Dispatch state changes
      dispatch(setSignedIn(false));
      dispatch(setUser({}));
      
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
