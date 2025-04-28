import axios from 'axios';
import {
  signInMicrosoftRequest,
  signInRequest,
} from '../api/auth.api';
import { deleteHeaders, getHeaders, setHeaders } from '../helpers/auth.helper';
import { deleteVerifier } from '../helpers/verifier.helper';
import { setSignedIn, setUser } from '../store/slice/auth.slice';
import { Navigate } from 'react-router-dom';

export const validation = () => {
  return async (dispatch) => {
    try {
      const res = getHeaders();
      if (res?.token) {
        dispatch(setSignedIn(true));
      } else {
        dispatch(setSignedIn(false));
      }
    } catch (error) {
      dispatch(setSignedIn(false));
    }
  };
};

export const signInMicrosoft = data => {
  return dispatch => {
    signInMicrosoftRequest(data)
      .then(res => {
        if (res.status === 200) {
          setHeaders(res.data);
          deleteVerifier()
          dispatch(setSignedIn(true));
          dispatch(setUser(res.data.data));
        } else {
          toast.error(res.data.errors[0] ?? 'Unable to Sign In');
        }
      })
      .catch(() => toast.error('Something went wrong'));
  };
};


export const signOut = (navigate) => {
  return dispatch => {
    try {
      deleteHeaders();
      dispatch(setSignedIn(false));
      dispatch(setUser({}));
      navigate('/landing')
    } catch (error) {
      toast.error('Something went wrong')
    }
  }
};
