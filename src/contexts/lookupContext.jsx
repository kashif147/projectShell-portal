import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getHeaders } from '../helpers/auth.helper';
import { fetchAllCountry, fetchAllLookupRequest, fetchLookupHierarchyByType } from '../api/lookup.api';
import { fetchCategoryByTypeId } from '../api/category.api';
import { toast } from 'react-toastify';

const globalFetchLock = { isFetching: false, promise: null };

const readStoredLookupArray = key => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error reading lookup cache for ${key}:`, error);
    return [];
  }
};

const hasCachedLookupData = () =>
  [
    'genderLookups',
    'titleLookups',
    'countries',
    'categories',
    'workLocationLookups',
    'gradeLookups',
  ].some(key => readStoredLookupArray(key).length > 0);

const verifyLocalStorageSave = (key, expectedValue) => {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === null) {
      return expectedValue.length === 0;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && Array.isArray(expectedValue)) {
      return parsed.length === expectedValue.length;
    }
    return false;
  } catch (error) {
    console.error(`Error verifying localStorage save for ${key}:`, error);
    return false;
  }
};

const retrySaveWithBackoff = async (saveFn, verifyFn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await saveFn();
      if (verifyFn && !verifyFn()) {
        if (attempt === maxRetries - 1) {
          throw new Error('Save verification failed after retries');
        }
        const delay = 50 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return true;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = 50 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

const getAllLookups = async () => {
  try {
    const headers = getHeaders();
    if (!headers.token) {
      throw new Error('No token found');
    }
    const response = await fetchAllLookupRequest();
    return response.data;
  } catch (error) {
    // toast.error(error.response?.data?.message ?? 'Failed to fetch lookups');
    throw error;
  }
};

const getAllCountry = async () => {
  try {
    const response = await fetchAllCountry();
    return response?.data?.data;
  } catch (error) {
    console.log('❌ Failed to fetch country:', error.response?.data?.message ?? 'Failed to fetch country');
    throw error;
  }
};

const LookupContext = createContext();

export const LookupProvider = ({ children }) => {
  const { fetchLocal, saveLocal } = useLocalStorage();
  const [lookups, setLookups] = React.useState([]);
  const [cityLookups, setCityLookups] = React.useState(() =>
    readStoredLookupArray('cityLookups'),
  );
  const [genderLookups, setGenderLookups] = React.useState(() =>
    readStoredLookupArray('genderLookups'),
  );
  const [titleLookups, setTitleLookups] = React.useState(() =>
    readStoredLookupArray('titleLookups'),
  );
  const [primarySectionLookups, setPrimarySectionLookups] = React.useState(() =>
    readStoredLookupArray('primarySection'),
  );
  const [secondarySectionLookups, setSecondarySectionLookups] = React.useState(
    () => readStoredLookupArray('secondarySection'),
  );
  const [workLocationLookups, setWorkLocationLookups] = React.useState(() =>
    readStoredLookupArray('workLocationLookups'),
  );
  const [countryLookups, setCountryLookups] = React.useState(() =>
    readStoredLookupArray('countries'),
  );
  const [categoryLookups, setCategoryLookups] = React.useState(() =>
    readStoredLookupArray('categories'),
  );
  const [gradeLookups, setGradeLookups] = React.useState(() =>
    readStoredLookupArray('gradeLookups'),
  );
  const [paymentLooups, setPaymentLooups] = React.useState(() =>
    readStoredLookupArray('paymentLookups'),
  );
  const [studyLocationLookups, setStudyLocationLookups] = React.useState(() =>
    readStoredLookupArray('studyLocationLookups'),
  );
  const [disciplineLookups, setDisciplineLookups] = React.useState(() =>
    readStoredLookupArray('disciplineLookups'),
  );
  const [youthForumLookups, setYouthForumLookups] = React.useState(() =>
    readStoredLookupArray('youthForumLookups'),
  );
  const [loading, setLoading] = React.useState(() => !hasCachedLookupData());
  const [error, setError] = React.useState(null);
  const isFetchingRef = useRef(false);

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
        disciplineLookupsData,
        youthForumLookupsData,
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
        fetchLocal('disciplineLookups'),
        fetchLocal('youthForumLookups'),
      ]);

      const sanitizeData = (data, key) => {
        if (data === null || data === undefined) {
          return [];
        }
        if (!Array.isArray(data)) {
          return [];
        }
        return data;
      };

      const sanitizedGenderLookups = sanitizeData(genderLookupsData, 'genderLookups');
      const sanitizedCityLookups = sanitizeData(cityLookupsData, 'cityLookups');
      const sanitizedTitleLookups = sanitizeData(titleLookupsData, 'titleLookups');
      const sanitizedPrimarySection = sanitizeData(primarySectionData, 'primarySection');
      const sanitizedSecondarySection = sanitizeData(secondarySectionData, 'secondarySection');
      const sanitizedWorkLocationLookups = sanitizeData(workLocationLookupsData, 'workLocationLookups');
      const sanitizedCountryLookups = sanitizeData(countryLookupsData, 'countries');
      const sanitizedCategoryLookups = sanitizeData(categoryLookupsData, 'categories');
      const sanitizedGradeLookups = sanitizeData(gradeLookupsData, 'gradeLookups');
      const sanitizedPaymentLookups = sanitizeData(paymentLookupsData, 'paymentLookups');
      const sanitizedStudyLocationLookups = sanitizeData(studyLocationLookupsData, 'studyLocationLookups');
      const sanitizedDisciplineLookups = sanitizeData(disciplineLookupsData, 'disciplineLookups');
      const sanitizedYouthForumLookups = sanitizeData(youthForumLookupsData, 'youthForumLookups');

      setGenderLookups(sanitizedGenderLookups);
      setCityLookups(sanitizedCityLookups);
      setTitleLookups(sanitizedTitleLookups);
      setPrimarySectionLookups(sanitizedPrimarySection);
      setSecondarySectionLookups(sanitizedSecondarySection);
      setWorkLocationLookups(sanitizedWorkLocationLookups);
      setCountryLookups(sanitizedCountryLookups);
      setCategoryLookups(sanitizedCategoryLookups);
      setGradeLookups(sanitizedGradeLookups);
      setPaymentLooups(sanitizedPaymentLookups);
      setStudyLocationLookups(sanitizedStudyLocationLookups);
      setDisciplineLookups(sanitizedDisciplineLookups);
      setYouthForumLookups(sanitizedYouthForumLookups);
    } catch (error) {
      console.error('❌ Error loading lookups from storage:', error);
      setError(error.message);
      setGenderLookups([]);
      setCityLookups([]);
      setTitleLookups([]);
      setPrimarySectionLookups([]);
      setSecondarySectionLookups([]);
      setWorkLocationLookups([]);
      setCountryLookups([]);
      setCategoryLookups([]);
      setGradeLookups([]);
      setPaymentLooups([]);
      setStudyLocationLookups([]);
      setDisciplineLookups([]);
      setYouthForumLookups([]);
    }
  }, [fetchLocal]);

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
        disciplineData = [],
        youthForumData = [],
      } = lookupData;

      const lookupKeys = [
        { key: 'paymentLookups', data: paymentData },
        { key: 'genderLookups', data: genderData },
        { key: 'cityLookups', data: cityData },
        { key: 'titleLookups', data: titleData },
        { key: 'secondarySection', data: secondarySectionData },
        { key: 'primarySection', data: sectionData },
        { key: 'gradeLookups', data: gradeData },
        { key: 'studyLocationLookups', data: studyLocationData },
        { key: 'workLocationLookups', data: workLocationData },
        { key: 'countries', data: countryData },
        { key: 'categories', data: categoryData },
        { key: 'disciplineLookups', data: disciplineData },
        { key: 'youthForumLookups', data: youthForumData },
      ];

      try {
        const savePromises = lookupKeys.map(({ key, data }) =>
          retrySaveWithBackoff(
            async () => {
              const json = JSON.stringify(data);
              window.localStorage.setItem(key, json);
            },
            () => verifyLocalStorageSave(key, data),
            3
          )
        );

        await Promise.allSettled(savePromises);

        const verificationResults = lookupKeys.map(({ key, data }) => ({
          key,
          verified: verifyLocalStorageSave(key, data),
        }));

        const failedVerifications = verificationResults.filter(result => !result.verified);
        if (failedVerifications.length > 0) {
          for (const { key, data } of lookupKeys) {
            const result = verificationResults.find(r => r.key === key);
            if (!result?.verified) {
              try {
                await retrySaveWithBackoff(
                  async () => {
                    const json = JSON.stringify(data);
                    window.localStorage.setItem(key, json);
                  },
                  () => verifyLocalStorageSave(key, data),
                  3
                );
              } catch (retryError) {
                console.error(`Failed to save ${key} after retries:`, retryError);
              }
            }
          }
        }

        return true;
      } catch (error) {
        console.error('❌ Error saving lookups to storage:', error);
        setError(error.message);
        // Don't update state here - it's already updated in fetchAllLookups
        return false;
      }
    },
    [saveLocal, fetchLocal]
  );

  const fetchAllLookups = useCallback(async () => {
    if (globalFetchLock.isFetching) {
      if (globalFetchLock.promise) {
        await globalFetchLock.promise;
      }
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    const headers = getHeaders();
    if (!headers.token) {
      await loadLookupsFromStorage();
      return;
    }

    globalFetchLock.isFetching = true;
    isFetchingRef.current = true;
    const shouldShowLoading = !hasCachedLookupData();
    if (shouldShowLoading) {
      setLoading(true);
    }
    setError(null);

    const fetchPromise = (async () => {
      try {
        const [allLookupsResult, workLocationResult, countryResult, categoryResult] = await Promise.allSettled([
          getAllLookups(),
          (async () => {
            try {
              const response = await fetchLookupHierarchyByType('68d036e2662428d1c504b3ad');
              return response?.data?.results || [];
            } catch (error) {
              console.error('❌ Failed to fetch work location lookups:', error);
              return [];
            }
          })(),
          getAllCountry(),
          (async () => {
            try {
              const response = await fetchCategoryByTypeId('68dae613c5b15073d66b891f');
              return response?.data?.data?.products || [];
            } catch (error) {
              console.error('❌ Failed to fetch category lookups:', error);
              return [];
            }
          })(),
        ]);

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
        let disciplineData = [];
        let youthForumData = [];
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
          disciplineData = result.filter(item => item.lookuptypeId?.lookuptype === 'Discipline');
          youthForumData = result.filter(item => item.lookuptypeId?.lookuptype === 'Youth Forum');
        }

        if (workLocationResult.status === 'fulfilled' && workLocationResult.value) {
          workLocationData = workLocationResult.value;
        }

        if (countryResult.status === 'fulfilled' && countryResult.value) {
          countryData = countryResult.value;
        }

        if (categoryResult.status === 'fulfilled' && categoryResult.value) {
          categoryData = categoryResult.value;
        }

        // Update all state immediately - don't defer
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
        setDisciplineLookups(disciplineData);
        setYouthForumLookups(youthForumData);

        saveLookupsToStorageAndState({
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
          disciplineData,
          youthForumData,
        }).catch(error => {
          console.error('Failed to save lookups to localStorage:', error);
        });
      } catch (error) {
        console.error('Error fetching all lookups:', error);
        setError(error.message);
        console.error('Error fetching all lookups:', error.response?.data?.message ?? 'Failed to fetch lookups');
        await loadLookupsFromStorage();
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        globalFetchLock.isFetching = false;
        globalFetchLock.promise = null;
      }
    })();

    globalFetchLock.promise = fetchPromise;
    await fetchPromise;
  }, [saveLookupsToStorageAndState, loadLookupsFromStorage]);

  const refreshLookupsFromStorage = useCallback(() => {
    loadLookupsFromStorage();
  }, [loadLookupsFromStorage]);

  useEffect(() => {
    const headers = getHeaders();
    if (!headers.token) {
      return;
    }

    fetchAllLookups().catch(error => {
      console.error('Error refreshing lookups:', error);
    });
  }, [fetchAllLookups]);

  useEffect(() => {
    const handleLookupUpdate = async () => {
      await loadLookupsFromStorage();
    };

    window.addEventListener('lookupsUpdated', handleLookupUpdate);
    return () => {
      window.removeEventListener('lookupsUpdated', handleLookupUpdate);
    };
  }, [loadLookupsFromStorage]);

  const lookupsReady = React.useMemo(
    () =>
      !loading ||
      genderLookups.length > 0 ||
      titleLookups.length > 0 ||
      countryLookups.length > 0 ||
      categoryLookups.length > 0 ||
      workLocationLookups.length > 0,
    [
      loading,
      genderLookups,
      titleLookups,
      countryLookups,
      categoryLookups,
      workLocationLookups,
    ],
  );

  const value = React.useMemo(() => ({
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
    disciplineLookups,
    youthForumLookups,
    loading,
    lookupsReady,
    error,
    fetchAllLookups,
    refreshLookupsFromStorage,
  }), [
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
    disciplineLookups,
    youthForumLookups,
    loading,
    lookupsReady,
    error,
    fetchAllLookups,
    refreshLookupsFromStorage,
  ]);

  return (
    <LookupContext.Provider value={value}>{children}</LookupContext.Provider>
  );
};

export const fetchAllLookupsOnLogin = async () => {
  if (globalFetchLock.isFetching) {
    if (globalFetchLock.promise) {
      await globalFetchLock.promise;
    }
    return;
  }

  try {
    const headers = getHeaders();
    if (!headers.token) {
      return;
    }

    globalFetchLock.isFetching = true;

    const saveToLocalStorage = async (key, value) => {
      return retrySaveWithBackoff(
        async () => {
          const json = JSON.stringify(value);
          window.localStorage.setItem(key, json);
        },
        () => verifyLocalStorageSave(key, value),
        3
      );
    };

    const [allLookupsResult, workLocationResult, countryResult, categoryResult] = await Promise.allSettled([
      getAllLookups(),
      (async () => {
        try {
          const response = await fetchLookupHierarchyByType('68d036e2662428d1c504b3ad');
          return response?.data?.results || [];
        } catch (error) {
          console.error('❌ Failed to fetch work location lookups:', error);
          return [];
        }
      })(),
      getAllCountry(),
      (async () => {
        try {
          const response = await fetchCategoryByTypeId('68dae613c5b15073d66b891f');
          return response?.data?.data?.products || [];
        } catch (error) {
          console.error('❌ Failed to fetch category lookups:', error);
          return [];
        }
      })(),
    ]);

    const lookupKeys = [];

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
      const disciplineData = result.filter(item => item.lookuptypeId?.lookuptype === 'Discipline');
      const youthForumData = result.filter(item => item.lookuptypeId?.lookuptype === 'Youth Forum');
      lookupKeys.push(
        { key: 'paymentLookups', data: paymentData },
        { key: 'genderLookups', data: genderData },
        { key: 'cityLookups', data: cityData },
        { key: 'titleLookups', data: titleData },
        { key: 'secondarySection', data: secondarySectionData },
        { key: 'primarySection', data: sectionData },
        { key: 'gradeLookups', data: gradeData },
        { key: 'studyLocationLookups', data: studyLocationData },
        { key: 'disciplineLookups', data: disciplineData },
        { key: 'youthForumLookups', data: youthForumData },
      );
    }

    if (workLocationResult.status === 'fulfilled' && workLocationResult.value) {
      lookupKeys.push({ key: 'workLocationLookups', data: workLocationResult.value });
    }

    if (countryResult.status === 'fulfilled' && countryResult.value) {
      lookupKeys.push({ key: 'countries', data: countryResult.value });
    }

    if (categoryResult.status === 'fulfilled' && categoryResult.value) {
      lookupKeys.push({ key: 'categories', data: categoryResult.value });
    }

    const savePromises = lookupKeys.map(({ key, data }) =>
      saveToLocalStorage(key, data).catch(error => {
        console.error(`Failed to save ${key} after retries:`, error);
        return false;
      })
    );

    await Promise.allSettled(savePromises);

    window.dispatchEvent(new CustomEvent('lookupsUpdated'));
  } catch (error) {
    console.error('Error fetching all lookups on login:', error);
  } finally {
    globalFetchLock.isFetching = false;
    globalFetchLock.promise = null;
  }
};

export const useLookup = () => {
  const context = useContext(LookupContext);
  if (!context) {
    throw new Error('useLookup must be used within a LookupProvider');
  }
  return context;
};