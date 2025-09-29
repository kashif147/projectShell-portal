import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getHeaders } from '../helpers/auth.helper';
import { fetchAllCountry, fetchAllLookupRequest, fetchLookupHierarchyByType } from '../api/lookup.api';

const getAllLookups = async () => {
  try {
    const headers = getHeaders();
    if (!headers.token) {
      throw new Error('No token found');
    }
    const response = await fetchAllLookupRequest();
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch lookups');
  }
};

const getAllCountry = async () => {
  try {
    const response = await fetchAllCountry();
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch country');
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

        await saveLocal('genderLookups', genderData);
        await saveLocal('cityLookups', cityData);
        await saveLocal('titleLookups', titleData);
        await saveLocal('secondarySection', secondarySectionData);
        await saveLocal('primarySection', sectionData);
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
      const results = response || [];
      await saveLocal('countries', results);
      setCountryLookups(results);
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
      const titleLookups = await fetchLocal('titleLookups');
      const primarySection = await fetchLocal('primarySection');
      const secondarySection = await fetchLocal('secondarySection');
      const workLocationLookups = await fetchLocal('workLocationLookups');
      const countryLookups = await fetchLocal('countries');
      setGenderLookups(genderLookups);
      setCityLookups(cityLookups);
      setTitleLookups(titleLookups);
      setPrimarySectionLookups(primarySection);
      setSecondarySectionLookups(secondarySection);
      setWorkLocationLookups(workLocationLookups);
      setCountryLookups(countryLookups);
    };
    fetchGenderLookups();
  }, [lookups]);

  useEffect(() => {
    const ensureWorkLocations = async () => {
      const cached = await fetchLocal('workLocationLookups');
      if (!cached || cached.length === 0) {
        await fetchWorkLocationLookups();
      }
    };
    const ensureCountries = async () => {
      const cached = await fetchLocal('countries');
      if (!cached || cached.length === 0) {
        await fetchCountryLookups();
      }
    };
    ensureWorkLocations();
    ensureCountries();
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
    loading,
    error,
    fetchLookups,
    fetchWorkLocationLookups,
    fetchCountryLookups,
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
