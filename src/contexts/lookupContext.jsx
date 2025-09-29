import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LOOKUP_URL } from '../constants/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getHeaders } from '../helpers/auth.helper';

const getAllLookups = async () => {
  try {
    const headers = getHeaders();
    console.log('Lookup API Headers:', headers);
    console.log('Lookup API URL:', `${LOOKUP_URL}/api/lookup`);
    console.log('Raw token from localStorage:', localStorage.getItem('token'));

    if (!headers.token) {
      throw new Error('No token found');
    }

    const requestConfig = {
      headers: {
        Authorization: headers.token,
        'Content-Type': 'application/json',
      },
    };

    console.log('Request config:', requestConfig);

    const response = await axios.get(`${LOOKUP_URL}/api/lookup`, requestConfig);

    console.log('Lookup API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Lookup API Error:', error);
    console.error('Error Response:', error.response);
    console.error('Error Status:', error.response?.status);
    console.error('Error Data:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to fetch lookups');
    throw error;
  }
};

const LookupContext = createContext();

export const LookupProvider = ({ children }) => {
  const { fetchLocal, saveLocal } = useLocalStorage();
  const [lookups, setLookups] = useState([]);
  const [cityLookups, setCityLookups] = useState([]);
  const [genderLookups, setGenderLookups] = useState([]);
  const [titleLookups, setTitleLookups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLookups = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllLookups();
      if (result) {
        const genderData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Gender',
        );
        const cityData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'City',
        );
        const titleData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Title',
        );
        await saveLocal('genderLookups', genderData);
        await saveLocal('cityLookups', cityData);
        await saveLocal('titleLookups', titleData);
        setLookups(result);
      }
    } catch (err) {
      console.error('fetchLookups error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGenderLookups = async () => {
      const genderLookups = await fetchLocal('genderLookups');
      const cityLookups = await fetchLocal('cityLookups');
      const titleLookups = await fetchLocal('titleLookups');
      setGenderLookups(genderLookups);
      setCityLookups(cityLookups);
      setTitleLookups(titleLookups);
    };
    fetchGenderLookups();
  }, [lookups]);

  const value = {
    lookups,
    genderLookups,
    cityLookups,
    titleLookups,
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
