import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { LOOKUP_URL } from '../constants/api';

const getAllLookups = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${LOOKUP_URL}/lookup`, {
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
  const [genderLookups, setGenderLookups] = React.useState(() => {
    // Initialize gender lookups from localStorage if available
    const storedGenderLookups = localStorage.getItem('genderLookups');
    return storedGenderLookups ? JSON.parse(storedGenderLookups) : [];
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoading(true);
        // Only fetch if we don't have gender data in localStorage
        if (!localStorage.getItem('genderLookups')) {
          const result = await getAllLookups();
          console.log('result========>', result);
          setLookups(result);
          
          // Filter gender lookups
          const genderData = result.filter(item => 
            item.lookuptypeId?.lookuptype === 'Gender'
          );
          setGenderLookups(genderData);
          
          // Store in localStorage
          localStorage.setItem('genderLookups', JSON.stringify(genderData));
        }
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
    genderLookups,
    loading,
    error,
    refreshLookups: async () => {
      try {
        setLoading(true);
        const result = await getAllLookups();
        setLookups(result);
        
        // Filter gender lookups
        const genderData = result.filter(item => 
          item.lookuptypeId?.lookuptype === 'Gender'
        );
        setGenderLookups(genderData);
        
        // Store in localStorage
        localStorage.setItem('genderLookups', JSON.stringify(genderData));
        
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    // Add function to clear gender data from localStorage
    clearGenderLookups: () => {
      localStorage.removeItem('genderLookups');
      setGenderLookups([]);
    }
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
