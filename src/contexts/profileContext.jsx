import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchProfileByIdRequest,
  fetchProfileRequest,
} from '../api/profile.api';
import { toast } from 'react-toastify';
import { getHeaders } from '../helpers/auth.helper';
const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [profileDetail, setProfileDetail] = useState(null);
  const [profileByIdDetail, setProfileByIdDetail] = useState(null);
  const { token } = getHeaders();
  const getProfileDetail = () => {
    setLoading(true);
    fetchProfileRequest()
      .then(res => {
        if (res.status === 200) {
          setProfileDetail(res?.data?.data);
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
  };
  const getProfileByIdDetail = id => {
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
  };

  useEffect(() => {
    if (token) {
      getProfileDetail();
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (profileDetail?.profileId) {
        getProfileByIdDetail(profileDetail?.profileId);
      }
    }
  }, [profileDetail?.profileId]);

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
