import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchPersonalDetail, fetchProfessionalDetail, fetchSubscriptionDetail } from '../api/application.api';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [personalDetail, setPersonalDetail] = useState(null)
  const [professionalDetail, setProfessionalDetail] = useState(null)
  const [subscriptionDetail, setSubscriptionDetail] = useState(null)
  const [currentStep, setCurrentStep] = useState(1);

  const getPersonalDetail = () => {
    setLoading(true)
    fetchPersonalDetail()
      .then(res => {
        if (res.status === 200) {
          setLoading(false)
          setPersonalDetail(res?.data?.data)
        } else {
          setLoading(false)
          toast.error(res.data.message ?? 'Unable to get personal datail');
        }
      })
      .catch(() => {
        setLoading(false)
        toast.error('Something went wrong')
      });
  }

  const getProfessionalDetail = () => {
    fetchProfessionalDetail()
      .then(res => {
        if (res.status === 200) {
          setProfessionalDetail(res?.data?.data)
        } else {
          setLoading(false)
          toast.error(res.data.message ?? 'Unable to get professional datail');
        }
      })
      .catch(() => {
        toast.error('Something went wrong')
      });
  }

  const getSubscriptionDetail = () => {
    fetchSubscriptionDetail()
      .then(res => {
        console.log('response==========>', res);
        if (res.status === 200) {
          setSubscriptionDetail(res?.data?.data)
        } else {
          setLoading(false)
          toast.error(res.data.message ?? 'Unable to get subscription datail');
        }
      })
      .catch(() => {
        toast.error('Something went wrong')
      });
  }

  useEffect(() => {
    if (personalDetail && professionalDetail) {
      setCurrentStep(3);
    } else if (personalDetail) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [personalDetail, professionalDetail]);

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
    <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useLookup must be used within a ApplicationProvider');
  }
  return context;
};
