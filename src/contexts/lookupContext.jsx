import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '../config/constants';

const getAllLookups = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${baseURL}/lookup`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch lookups');
  }
};

const LookupContext = createContext();

export const LookupProvider = ({ children }) => {
  const [lookups, setLookups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoading(true);
        const result = await getAllLookups();
        setLookups(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, []);

  const value = {
    lookups,
    loading,
    error,
    refreshLookups: async () => {
      try {
        setLoading(true);
        const result = await getAllLookups();
        setLookups(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <LookupContext.Provider value={value}>{children}</LookupContext.Provider>
  );
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (!context) {
    throw new Error('useLookup must be used within a LookupProvider');
  }
  return context;
};
