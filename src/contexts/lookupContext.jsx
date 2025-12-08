import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getHeaders } from '../helpers/auth.helper';
import { fetchAllCountry, fetchAllLookupRequest, fetchLookupHierarchyByType } from '../api/lookup.api';
import { fetchAllCategoryRequest, fetchCategoryByTypeId } from '../api/category.api';
import { toast } from 'react-toastify';

const getAllLookups = async () => {
  try {
    const headers = getHeaders();
    if (!headers.token) {
      throw new Error('No token found');
    }
    const response = await fetchAllLookupRequest();
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Failed to fetch lookups');
  }
};

const getAllCountry = async () => {
  try {
    const response = await fetchAllCountry();
    return response?.data?.data;
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Failed to fetch country');
  }
};

// Standalone function to fetch and save all lookups - can be called from anywhere
export const fetchAllLookupsOnLogin = async () => {
  try {
    const headers = getHeaders();
    if (!headers.token) {
      console.warn('No token found, skipping lookup fetch');
      return;
    }

    // Helper function to save to localStorage
    const saveToLocalStorage = (key, value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
      }
    };

    // Fetch all lookups in parallel
    const [allLookupsResult, workLocationResult, countryResult, categoryResult] = await Promise.allSettled([
      getAllLookups(),
      (async () => {
        try {
          const response = await fetchLookupHierarchyByType('68d036e2662428d1c504b3ad');
          return response?.data?.results || [];
        } catch (error) {
          console.error('Failed to fetch work location lookups:', error);
          return [];
        }
      })(),
      getAllCountry(),
      (async () => {
        try {
          const response = await fetchCategoryByTypeId('68dae613c5b15073d66b891f');
          return response?.data?.data?.products || [];
        } catch (error) {
          console.error('Failed to fetch category lookups:', error);
          return [];
        }
      })(),
    ]);

    // Process and save all lookups
    if (allLookupsResult.status === 'fulfilled' && allLookupsResult.value) {
      const result = allLookupsResult.value;
      
      const genderData = result.filter(item => item.lookuptypeId?.lookuptype === 'Gender');
      const cityData = result.filter(item => item.lookuptypeId?.lookuptype === 'City');
      const titleData = result.filter(item => item.lookuptypeId?.lookuptype === 'Title');
      const secondarySectionData = result.filter(item => item.lookuptypeId?.lookuptype === 'Secondary Section');
      const sectionData = result.filter(item => item.lookuptypeId?.lookuptype === 'Section');
      const gradeData = result.filter(item => item.lookuptypeId?.lookuptype === 'Grade');
      const paymentData = result.filter(item => item.lookuptypeId?.lookuptype === 'Payment Type');
      const studyLocationData = result.filter(item => item.lookuptypeId?.lookuptype === 'Study Location');

      saveToLocalStorage('paymentLookups', paymentData);
      saveToLocalStorage('genderLookups', genderData);
      saveToLocalStorage('cityLookups', cityData);
      saveToLocalStorage('titleLookups', titleData);
      saveToLocalStorage('secondarySection', secondarySectionData);
      saveToLocalStorage('primarySection', sectionData);
      saveToLocalStorage('gradeLookups', gradeData);
      saveToLocalStorage('studyLocationLookups', studyLocationData);
    }

    // Save work location lookups
    if (workLocationResult.status === 'fulfilled' && workLocationResult.value) {
      saveToLocalStorage('workLocationLookups', workLocationResult.value);
    }

    // Save country lookups
    if (countryResult.status === 'fulfilled' && countryResult.value) {
      saveToLocalStorage('countries', countryResult.value);
    }

    // Save category lookups
    if (categoryResult.status === 'fulfilled' && categoryResult.value) {
      saveToLocalStorage('categories', categoryResult.value);
    }

    console.log('All lookups fetched and saved successfully');
  } catch (error) {
    console.error('Error fetching all lookups on login:', error);
  }
};

const LookupContext = createContext();

export const LookupProvider = ({ children }) => {
  const { fetchLocal, saveLocal } = useLocalStorage();
  const [lookups, setLookups] = React.useState([]);
  const [cityLookups, setCityLookups] = React.useState([]);
  const [genderLookups, setGenderLookups] = React.useState([]);
  const [titleLookups, setTitleLookups] = React.useState([]);
  const [primarySectionLookups, setPrimarySectionLookups] = React.useState([]);
  const [secondarySectionLookups, setSecondarySectionLookups] = React.useState([]);
  const [workLocationLookups, setWorkLocationLookups] = React.useState([]);
  const [countryLookups, setCountryLookups] = React.useState([]);
  const [categoryLookups, setCategoryLookups] = React.useState([]);
  const [gradeLookups, setGradeLookups] = React.useState([]);
  const [paymentLooups, setPaymentLooups] = React.useState([]);
  const [studyLocationLookups, setStudyLocationLookups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchLookups = async () => {
    try {
      setLoading(true);
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
        const secondarySectionData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Secondary Section',
        );

        const sectionData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Section',
        );

        const gradeData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Grade',
        );

        const paymentData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Payment Type',
        );
        const studyLocationData = result.filter(
          item => item.lookuptypeId?.lookuptype === 'Study Location',
        );
        await saveLocal('paymentLookups', paymentData);
        await saveLocal('genderLookups', genderData);
        await saveLocal('cityLookups', cityData);
        await saveLocal('titleLookups', titleData);
        await saveLocal('secondarySection', secondarySectionData);
        await saveLocal('primarySection', sectionData);
        await saveLocal('gradeLookups', gradeData);
        await saveLocal('studyLocationLookups', studyLocationData);
        setLookups(result);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const WORKLOCATION_LOOKUPTYPE_ID = '68d036e2662428d1c504b3ad';

  const fetchWorkLocationLookups = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      if (!headers.token) {
        throw new Error('No token found');
      }
      const response = await fetchLookupHierarchyByType(WORKLOCATION_LOOKUPTYPE_ID);
      const results = response?.data?.results || [];
      await saveLocal('workLocationLookups', results);
      setWorkLocationLookups(results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryLookups = async () => {
    try {
      setLoading(true);
      const response = await getAllCountry();
      const results = response.data || [];
      await saveLocal('countries', results);
      setCountryLookups(results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryLookups = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      if (!headers.token) {
        throw new Error('No token found');
      }
      const response = await fetchCategoryByTypeId('68dae613c5b15073d66b891f');
      console.log("Category Response=============>",response)
      const results = response?.data?.data?.products || [];
      await saveLocal('categories', results);
      setCategoryLookups(results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLookups = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLookups(),
        fetchWorkLocationLookups(),
        fetchCountryLookups(),
        fetchCategoryLookups(),
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching all lookups:', err);
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
      const primarySection = await fetchLocal('primarySection');
      const secondarySection = await fetchLocal('secondarySection');
      const workLocationLookups = await fetchLocal('workLocationLookups');
      const countryLookups = await fetchLocal('countries');
      const categoryLookups = await fetchLocal('categories');
      const gradeLookups = await fetchLocal('gradeLookups');
      const paymentLookups = await fetchLocal('paymentLookups');
      const studyLocationLookups = await fetchLocal('studyLocationLookups');
      setGenderLookups(genderLookups);
      setCityLookups(cityLookups);
      setTitleLookups(titleLookups);
      setPrimarySectionLookups(primarySection);
      setSecondarySectionLookups(secondarySection);
      setWorkLocationLookups(workLocationLookups);
      setCountryLookups(countryLookups);
      setCategoryLookups(categoryLookups);
      setGradeLookups(gradeLookups);
      setPaymentLooups(paymentLookups);
      setStudyLocationLookups(studyLocationLookups);
    };
    fetchGenderLookups();
  }, [lookups]);

  useEffect(() => {
    const initializeLookups = async () => {
      const headers = getHeaders();
      if (headers?.token) {
        const gradeCached = await fetchLocal('gradeLookups');
        const genderCached = await fetchLocal('genderLookups');
        
        await Promise.all([
          fetchWorkLocationLookups(),
          fetchCountryLookups(),
          fetchCategoryLookups(),
        ]);
        
        if (!gradeCached || !genderCached || 
            gradeCached.length === 0 || genderCached.length === 0) {
          await fetchLookups();
        }
      }
    };
    
    initializeLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    lookups,
    genderLookups,
    cityLookups,
    titleLookups,
    primarySectionLookups,
    secondarySectionLookups,
    workLocationLookups,
    countryLookups,
    categoryLookups,
    gradeLookups,
    paymentLooups,
    studyLocationLookups,
    loading,
    error,
    fetchLookups,
    fetchWorkLocationLookups,
    fetchCountryLookups,
    fetchCategoryLookups,
    fetchAllLookups,
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
