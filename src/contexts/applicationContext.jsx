import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchPersonalDetail } from '../api/application.api';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [personalDetail, setPersonalDetail] = useState({})

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

  const value = {
    loading,
    personalDetail,
    getPersonalDetail
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
