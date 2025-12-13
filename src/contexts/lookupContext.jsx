import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
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
    throw error;
  }
};

const getAllCountry = async () => {
  try {
    const response = await fetchAllCountry();
    return response?.data?.data;
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Failed to fetch country');
    throw error;
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
  const isInitialMount = useRef(true);
  const isFetchingRef = useRef(false);

  // Load lookups from localStorage on initial render
  const loadLookupsFromStorage = useCallback(async () => {
    try {
      const [
        genderLookupsData,
        cityLookupsData,
        titleLookupsData,
        primarySectionData,
        secondarySectionData,
        workLocationLookupsData,
        countryLookupsData,
        categoryLookupsData,
        gradeLookupsData,
        paymentLookupsData,
        studyLocationLookupsData,
      ] = await Promise.all([
        fetchLocal('genderLookups'),
        fetchLocal('cityLookups'),
        fetchLocal('titleLookups'),
        fetchLocal('primarySection'),
        fetchLocal('secondarySection'),
        fetchLocal('workLocationLookups'),
        fetchLocal('countries'),
        fetchLocal('categories'),
        fetchLocal('gradeLookups'),
        fetchLocal('paymentLookups'),
        fetchLocal('studyLocationLookups'),
      ]);

      // Update all states in a batch
      setGenderLookups(genderLookupsData || []);
      setCityLookups(cityLookupsData || []);
      setTitleLookups(titleLookupsData || []);
      setPrimarySectionLookups(primarySectionData || []);
      setSecondarySectionLookups(secondarySectionData || []);
      setWorkLocationLookups(workLocationLookupsData || []);
      setCountryLookups(countryLookupsData || []);
      setCategoryLookups(categoryLookupsData || []);
      setGradeLookups(gradeLookupsData || []);
      setPaymentLooups(paymentLookupsData || []);
      setStudyLocationLookups(studyLocationLookupsData || []);
    } catch (error) {
      console.error('Error loading lookups from storage:', error);
      setError(error.message);
    }
  }, [fetchLocal]);

  // Unified function to save lookups to both localStorage and state atomically
  const saveLookupsToStorageAndState = useCallback(
    async (lookupData) => {
      const {
        genderData = [],
        cityData = [],
        titleData = [],
        secondarySectionData = [],
        sectionData = [],
        gradeData = [],
        paymentData = [],
        studyLocationData = [],
        workLocationData = [],
        countryData = [],
        categoryData = [],
      } = lookupData;

      try {
        // Save all to localStorage in parallel
        await Promise.all([
          saveLocal('paymentLookups', paymentData),
          saveLocal('genderLookups', genderData),
          saveLocal('cityLookups', cityData),
          saveLocal('titleLookups', titleData),
          saveLocal('secondarySection', secondarySectionData),
          saveLocal('primarySection', sectionData),
          saveLocal('gradeLookups', gradeData),
          saveLocal('studyLocationLookups', studyLocationData),
          saveLocal('workLocationLookups', workLocationData),
          saveLocal('countries', countryData),
          saveLocal('categories', categoryData),
        ]);

        // Update all states in a batch (after localStorage is saved)
        setPaymentLooups(paymentData);
        setGenderLookups(genderData);
        setCityLookups(cityData);
        setTitleLookups(titleData);
        setSecondarySectionLookups(secondarySectionData);
        setPrimarySectionLookups(sectionData);
        setGradeLookups(gradeData);
        setStudyLocationLookups(studyLocationData);
        setWorkLocationLookups(workLocationData);
        setCountryLookups(countryData);
        setCategoryLookups(categoryData);

        return true;
      } catch (error) {
        console.error('Error saving lookups to storage and state:', error);
        return false;
      }
    },
    [saveLocal]
  );

  // Unified function to fetch all lookups and update both localStorage and state
  const fetchAllLookups = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Lookup fetch already in progress, skipping...');
      return;
    }

    const headers = getHeaders();
    if (!headers.token) {
      console.warn('No token found, skipping lookup fetch');
      // Still load from localStorage if token is not available
      await loadLookupsFromStorage();
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
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

      // Process all lookups
      let genderData = [];
      let cityData = [];
      let titleData = [];
      let secondarySectionData = [];
      let sectionData = [];
      let gradeData = [];
      let paymentData = [];
      let studyLocationData = [];
      let workLocationData = [];
      let countryData = [];
      let categoryData = [];

      // Process main lookups
      if (allLookupsResult.status === 'fulfilled' && allLookupsResult.value) {
        const result = allLookupsResult.value;

        genderData = result.filter(item => item.lookuptypeId?.lookuptype === 'Gender');
        cityData = result.filter(item => item.lookuptypeId?.lookuptype === 'City');
        titleData = result.filter(item => item.lookuptypeId?.lookuptype === 'Title');
        secondarySectionData = result.filter(item => item.lookuptypeId?.lookuptype === 'Secondary Section');
        sectionData = result.filter(item => item.lookuptypeId?.lookuptype === 'Section');
        gradeData = result.filter(item => item.lookuptypeId?.lookuptype === 'Grade');
        paymentData = result.filter(item => item.lookuptypeId?.lookuptype === 'Payment Type');
        studyLocationData = result.filter(item => item.lookuptypeId?.lookuptype === 'Study Location');
      }

      // Process work location lookups
      if (workLocationResult.status === 'fulfilled' && workLocationResult.value) {
        workLocationData = workLocationResult.value;
      }

      // Process country lookups
      if (countryResult.status === 'fulfilled' && countryResult.value) {
        countryData = countryResult.value;
      }

      // Process category lookups
      if (categoryResult.status === 'fulfilled' && categoryResult.value) {
        categoryData = categoryResult.value;
      }

      // Save all lookups to localStorage and state atomically
      await saveLookupsToStorageAndState({
        genderData,
        cityData,
        titleData,
        secondarySectionData,
        sectionData,
        gradeData,
        paymentData,
        studyLocationData,
        workLocationData,
        countryData,
        categoryData,
      });

      console.log('All lookups fetched and saved successfully');
    } catch (error) {
      console.error('Error fetching all lookups:', error);
      setError(error.message);
      toast.error(error.response?.data?.message ?? 'Failed to fetch lookups');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [saveLookupsToStorageAndState, loadLookupsFromStorage]);

  // Function to refresh lookups from localStorage
  const refreshLookupsFromStorage = useCallback(() => {
    loadLookupsFromStorage();
  }, [loadLookupsFromStorage]);

  // Load lookups on mount: first from localStorage, then fetch fresh data if token exists
  useEffect(() => {
    const initializeLookups = async () => {
      // Always load from localStorage first for immediate UI rendering
      await loadLookupsFromStorage();

      // Then fetch fresh data if token exists
      const headers = getHeaders();
      if (headers.token) {
        // Small delay to ensure localStorage is loaded first
        setTimeout(() => {
          fetchAllLookups();
        }, 100);
      }
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      initializeLookups();
    }
  }, [loadLookupsFromStorage, fetchAllLookups]);

  // Listen for custom event to refresh lookups when fetchAllLookupsOnLogin is called
  useEffect(() => {
    const handleLookupUpdate = () => {
      loadLookupsFromStorage();
    };

    window.addEventListener('lookupsUpdated', handleLookupUpdate);
    return () => {
      window.removeEventListener('lookupsUpdated', handleLookupUpdate);
    };
  }, [loadLookupsFromStorage]);

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
    fetchAllLookups, // Export the fetch function
    refreshLookupsFromStorage, // Export refresh function
  };

  return (
    <LookupContext.Provider value={value}>{children}</LookupContext.Provider>
  );
};

// Standalone function to fetch and save all lookups - can be called from anywhere
// This saves to localStorage and dispatches an event to update context state
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

    // Dispatch event to notify context to refresh from localStorage
    window.dispatchEvent(new CustomEvent('lookupsUpdated'));

    console.log('All lookups fetched and saved successfully');
  } catch (error) {
    console.error('Error fetching all lookups on login:', error);
  }
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (!context) {
    throw new Error('useLookup must be used within a LookupProvider');
  }
  return context;
};