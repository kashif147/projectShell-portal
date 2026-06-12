import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchProfileByIdRequest,
  fetchProfileRequest,
} from '../api/profile.api';
import { toast } from 'react-toastify';

const ProfileContext = createContext();

const getAuthUserId = auth =>
  auth?.user?.id ||
  auth?.user?._id ||
  auth?.user?.userId ||
  auth?.userDetail?.id ||
  auth?.userDetail?._id ||
  null;

export const ProfileProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileByIdDetail, setProfileByIdDetail] = useState(null);
  const isSignedIn = useSelector(state => state.auth?.isSignedIn);
  const authUserId = useSelector(state => getAuthUserId(state.auth));
  const getProfileDetail = useCallback(() => {
    setLoading(true);
    fetchProfileRequest()
      .then(res => {
        if (res.status === 200) {
          setProfileDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false) ;
          //   toast.error(res.data.message ?? 'Unable to get profile datail');
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error('Something went wrong');
      });
  }, []);
  const getProfileByIdDetail = useCallback(id => {
    setLoading(true);
    fetchProfileByIdRequest(id)
      .then(res => {
        if (res.status === 200) {
          console.log('profileByIdDetail response=======>',res)
          setProfileByIdDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
          //   toast.error(res.data.message ?? 'Unable to get profile datail');
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error('Something went wrong');
      });
  }, []);

  useEffect(() => {
    if (!isSignedIn || !authUserId) {
      setProfileDetail(null);
      setProfileByIdDetail(null);
      return;
    }

    setProfileDetail(null);
    setProfileByIdDetail(null);
    getProfileDetail();
  }, [isSignedIn, authUserId, getProfileDetail]);

  useEffect(() => {
    if (!isSignedIn || !profileDetail?.profileId) {
      setProfileByIdDetail(null);
      return;
    }

    getProfileByIdDetail(profileDetail.profileId);
  }, [isSignedIn, profileDetail?.profileId, getProfileByIdDetail]);

  const value = {
    loading,
    profileDetail,
    getProfileDetail,
    getProfileByIdDetail,
    profileByIdDetail,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
