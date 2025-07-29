import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchPersonalDetail } from '../api/application.api';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [pesonalDetail, setPersonalDetail] = useState({})

  useEffect(() => {
    getPersonalDetail();
  }, []);

  const getPersonalDetail = () => {
    fetchPersonalDetail()
      .then(res => {
        if (res.status === 200) {
          console.log('response======>', res);
        } else {
          toast.error(res.data.message ?? 'Unable to get personal datail');
        }
      })
      .catch(() => toast.error('Something went wrong'));
  }



  const value = {
    loading,
    error,
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
