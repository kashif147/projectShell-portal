import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchPersonalDetail,
  fetchProfessionalDetail,
  fetchSubscriptionDetail,
} from '../api/application.api';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [personalDetail, setPersonalDetail] = useState(null);
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const [subscriptionDetail, setSubscriptionDetail] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const getPersonalDetail = () => {
    setLoading(true);
    fetchPersonalDetail()
      .then(res => {
        if (res.status === 200) {
          setPersonalDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
          toast.error(res.data.message ?? 'Unable to get personal datail');
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error('Something went wrong');
      });
  };

  const getProfessionalDetail = (applicationId) => {
    const appId = applicationId || personalDetail?.ApplicationId;
    if (!appId) return;
    
    setLoading(true);
    fetchProfessionalDetail(appId)
      .then(res => {
        if (res.status === 200) {
          setProfessionalDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getSubscriptionDetail = (applicationId) => {
    const appId = applicationId || personalDetail?.ApplicationId;
    if (!appId) return;
    
    setLoading(true);
    fetchSubscriptionDetail(appId)
      .then(res => {
        if (res.status === 200) {
          setSubscriptionDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (personalDetail?.ApplicationId) {
      // Only fetch if we don't already have the data
      if (!professionalDetail) {
        getProfessionalDetail(personalDetail.ApplicationId);
      }
      if (!subscriptionDetail) {
        getSubscriptionDetail(personalDetail.ApplicationId);
      }
    }
  }, [personalDetail?.ApplicationId]);

  const value = {
    loading,
    personalDetail,
    currentStep,
    setCurrentStep,
    professionalDetail,
    subscriptionDetail,
    getPersonalDetail,
    getProfessionalDetail,
    getSubscriptionDetail,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useLookup must be used within a ApplicationProvider');
  }
  return context;
};
