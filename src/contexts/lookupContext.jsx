import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { LOOKUP_URL } from '../constants/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getHeaders } from '../helpers/auth.helper';

const getAllLookups = async () => {
  try {
    const headers = getHeaders();
    if (!headers.token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${LOOKUP_URL}/lookup`, {
      headers: {
        Authorization: `Bearer ${headers.token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch lookups');
  }
};

const LookupContext = createContext();

export const LookupProvider = ({ children }) => {
  const { fetchLocal, saveLocal } = useLocalStorage();
  const [lookups, setLookups] = React.useState([]);
  const [cityLookups, setCityLookups] = React.useState([]);
  const [genderLookups, setGenderLookups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchLookups = async () => {
    try {
      setLoading(true);
      const result = await getAllLookups();
      console.log('result============>', result);
      if (result) {
        const genderData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Gender',
        );
        const cityData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'City',
        );
        await saveLocal('genderLookups', genderData);
        await saveLocal('cityLookups', cityData);
        setLookups(result);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGenderLookups = async () => {
      const genderLookups = await fetchLocal('genderLookups');
      const cityLookups = await fetchLocal('cityLookups');
      setGenderLookups(genderLookups);
      setCityLookups(cityLookups);
    };
    fetchGenderLookups();
  }, [lookups]);

  const value = {
    lookups,
    genderLookups,
    cityLookups,
    loading,
    error,
    fetchLookups,
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
