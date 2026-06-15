import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import {
  fetchPersonalDetail,
  fetchProfessionalDetail,
  fetchSubscriptionDetail,
  applicationConfirmationRequest,
} from '../api/application.api';
import { fetchCategoryByCategoryId } from '../api/category.api';
import { getHeaders } from '../helpers/auth.helper';
import { getAggregatedUserDetailsFromCrmCreateRequest } from '../api/profile.api';
import {
  extractAggregatedUserDetailsResponse,
  detailBelongsToApplication,
  isActiveApplicationPersonalDetail,
  isAggregateResponseHandled,
  isResumablePortalApplication,
  markAggregateResponseHandled,
  normalizeAggregatedSubscriptionDetails,
  normalizePortalPersonalDetail,
} from '../helpers/applicationPayload.helper';

const ApplicationContext = createContext();

const getAuthUserId = auth =>
  auth?.user?.id ||
  auth?.user?._id ||
  auth?.user?.userId ||
  auth?.userDetail?.id ||
  auth?.userDetail?._id ||
  null;

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [personalDetail, setPersonalDetail] = useState(null);
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const [subscriptionDetail, setSubscriptionDetail] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryData, setCategoryData] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [isCrmUser, setIsCrmUser] = useState(false);
  const aggregateResultRef = useRef(null);
  const aggregatePromiseRef = useRef(null);
  const detailFetchAttemptedRef = useRef({ professional: null, subscription: null });
  const professionalFetchRef = useRef({ key: null, promise: null });
  const subscriptionFetchRef = useRef({ key: null, promise: null });
  const personalDetailPromiseRef = useRef(null);
  const bundleFetchRef = useRef({ appId: null, promise: null });
  const { token } = getHeaders();
  const isSignedIn = useSelector(state => state.auth?.isSignedIn);
  const authUserId = useSelector(state => getAuthUserId(state.auth));

  const resetApplicationFetchState = useCallback(() => {
    aggregateResultRef.current = null;
    aggregatePromiseRef.current = null;
    detailFetchAttemptedRef.current = { professional: null, subscription: null };
    professionalFetchRef.current = { key: null, promise: null };
    subscriptionFetchRef.current = { key: null, promise: null };
    personalDetailPromiseRef.current = null;
    bundleFetchRef.current = { appId: null, promise: null };
  }, []);

  const fetchAggregateOnce = useCallback(() => {
    if (aggregatePromiseRef.current) {
      return aggregatePromiseRef.current;
    }

    aggregatePromiseRef.current = getAggregatedUserDetailsFromCrmCreateRequest()
      .then(res => {
        const isSuccess =
          res?.status === 200 || res?.data?.status === 'success';
        const data = isSuccess ? extractAggregatedUserDetailsResponse(res) : null;
        aggregateResultRef.current = data;
        return data;
      })
      .catch(() => {
        aggregateResultRef.current = null;
        return null;
      });

    return aggregatePromiseRef.current;
  }, []);

  const applyCachedAggregateDetails = useCallback(() => {
    const data = aggregateResultRef.current;
    if (!data || !isActiveApplicationPersonalDetail(data.personalDetails)) {
      return false;
    }

    if (data.professionalDetails) {
      setProfessionalDetail(data.professionalDetails);
    }
    if (data.subscriptionDetails) {
      setSubscriptionDetail(
        normalizeAggregatedSubscriptionDetails(data.subscriptionDetails),
      );
    }
    return true;
  }, []);

  const applyAggregatedResponse = data => {
    if (data?.personalDetails) setPersonalDetail(data.personalDetails);
    if (data?.professionalDetails) {
      setProfessionalDetail(data.professionalDetails);
    }
    if (data?.subscriptionDetails) {
      setSubscriptionDetail(
        normalizeAggregatedSubscriptionDetails(data.subscriptionDetails),
      );
    }
    setApplicationStatus(data?.personalDetails?.applicationStatus ?? null);
    setIsCrmUser(true);
    setLoading(false);
  };

  const applyCancelledAggregateResponse = data => {
    if (data?.personalDetails) {
      setPersonalDetail(
        normalizePortalPersonalDetail(
          data.personalDetails,
          data.personalDetails?.applicationStatus,
        ),
      );
    }
    setProfessionalDetail(null);
    setSubscriptionDetail(null);
    setApplicationStatus(data?.personalDetails?.applicationStatus ?? null);
    setIsCrmUser(false);
  };

  const applyPortalPersonalDetail = portalPersonal => {
    const status = portalPersonal?.applicationStatus ?? null;
    setPersonalDetail(normalizePortalPersonalDetail(portalPersonal, status));
    setIsCrmUser(false);
    setApplicationStatus(status);
  };

  const enrichPortalPersonalDetail = portalPersonal =>
    applicationConfirmationRequest(portalPersonal.applicationId)
      .then(response => {
        if (
          response?.status !== 200 &&
          response?.data?.status !== 'success'
        ) {
          return portalPersonal;
        }

        const statusPayload = response?.data?.data || response?.data || {};
        const applicationStatus =
          statusPayload.applicationStatus ??
          portalPersonal?.applicationStatus ??
          null;
        const metaIsActive =
          statusPayload?.meta?.isActive ?? statusPayload?.isActive;

        return {
          ...portalPersonal,
          applicationStatus,
          ...(metaIsActive !== undefined
            ? {
                meta: {
                  ...portalPersonal?.meta,
                  isActive: metaIsActive,
                },
              }
            : {}),
        };
      })
      .catch(() => portalPersonal);

  const loadPortalPersonalDetail = portalPersonal => {
    if (!portalPersonal?.applicationId) {
      applyPortalPersonalDetail(portalPersonal);
      return Promise.resolve(portalPersonal);
    }

    return enrichPortalPersonalDetail(portalPersonal).then(enriched => {
      applyPortalPersonalDetail(enriched);
      return enriched;
    });
  };

  const fetchApplicationStepDetails = useCallback(applicationId => {
    const appId = applicationId || personalDetail?.applicationId;
    if (!appId) {
      return Promise.resolve();
    }

    const cacheKey = String(appId);
    if (
      bundleFetchRef.current.appId === cacheKey &&
      bundleFetchRef.current.promise
    ) {
      return bundleFetchRef.current.promise;
    }

    setDetailsLoading(true);
    detailFetchAttemptedRef.current = {
      professional: cacheKey,
      subscription: cacheKey,
    };
    professionalFetchRef.current.key = cacheKey;
    subscriptionFetchRef.current.key = cacheKey;

    const promise = Promise.allSettled([
      fetchProfessionalDetail(appId).then(res => {
        if (res?.status === 200) {
          setProfessionalDetail(res?.data?.data);
          setIsCrmUser(false);
        }
      }),
      fetchSubscriptionDetail(appId).then(res => {
        if (res?.status === 200) {
          setSubscriptionDetail(res?.data?.data);
          setIsCrmUser(false);
        }
      }),
    ]).finally(() => {
      setDetailsLoading(false);
      if (bundleFetchRef.current.appId === cacheKey) {
        bundleFetchRef.current = { appId: null, promise: null };
      }
    });

    bundleFetchRef.current = { appId: cacheKey, promise };
    professionalFetchRef.current.promise = promise;
    subscriptionFetchRef.current.promise = promise;
    return promise;
  }, [personalDetail?.applicationId]);

  const loadResumableApplicationDetails = useCallback(
    portalPersonal => {
      const status = portalPersonal?.applicationStatus ?? applicationStatus;
      if (
        !portalPersonal?.applicationId ||
        !isResumablePortalApplication(portalPersonal, status)
      ) {
        return Promise.resolve();
      }

      return fetchApplicationStepDetails(portalPersonal.applicationId);
    },
    [applicationStatus, fetchApplicationStepDetails],
  );

  const refreshPortalPersonalDetail = useCallback((portalPersonal = null) => {
    aggregateResultRef.current = null;
    aggregatePromiseRef.current = null;
    personalDetailPromiseRef.current = null;
    detailFetchAttemptedRef.current = { professional: null, subscription: null };
    professionalFetchRef.current = { key: null, promise: null };
    subscriptionFetchRef.current = { key: null, promise: null };
    bundleFetchRef.current = { appId: null, promise: null };

    setLoading(true);

    const refreshPromise = portalPersonal?.applicationId
      ? loadPortalPersonalDetail(portalPersonal).then(loadedPersonal =>
          loadResumableApplicationDetails(loadedPersonal),
        )
      : fetchPersonalDetail()
          .then(res => {
            if (res?.status === 200 && res?.data?.data) {
              return loadPortalPersonalDetail(res.data.data).then(loadedPersonal =>
                loadResumableApplicationDetails(loadedPersonal),
              );
            }
            return null;
          });

    return refreshPromise.finally(() => {
      setLoading(false);
    });
  }, [loadResumableApplicationDetails]);

  const getPersonalDetail = useCallback(() => {
    if (personalDetailPromiseRef.current) {
      return personalDetailPromiseRef.current;
    }

    setLoading(true);

    personalDetailPromiseRef.current = fetchAggregateOnce()
      .then(data => {
        if (data) {
          if (isActiveApplicationPersonalDetail(data.personalDetails)) {
            applyAggregatedResponse(data);
            return markAggregateResponseHandled();
          }

          applyCancelledAggregateResponse(data);
        }

        return fetchPersonalDetail();
      })
      .then(res => {
        if (isAggregateResponseHandled(res)) return;

        if (res?.status === 200 && res?.data?.data) {
          return loadPortalPersonalDetail(res.data.data).then(loadedPersonal =>
            loadResumableApplicationDetails(loadedPersonal),
          );
        }
        setLoading(false);
      })
      .catch(() => {
        fetchPersonalDetail()
          .then(res => {
            if (res?.status === 200 && res?.data?.data) {
              return loadPortalPersonalDetail(res.data.data).then(loadedPersonal =>
                loadResumableApplicationDetails(loadedPersonal),
              );
            }
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      })
      .finally(() => {
        setLoading(false);
        personalDetailPromiseRef.current = null;
      });

    return personalDetailPromiseRef.current;
  }, [fetchAggregateOnce, loadResumableApplicationDetails]);

  const getProfessionalDetail = useCallback(
    applicationId => {
      if (isCrmUser) {
        if (applyCachedAggregateDetails()) {
          return Promise.resolve();
        }
        return Promise.resolve();
      }

      const appId = applicationId || personalDetail?.applicationId;
      if (!appId) {
        return Promise.resolve();
      }

      const cacheKey = String(appId);
      if (
        professionalFetchRef.current.key === cacheKey &&
        professionalFetchRef.current.promise
      ) {
        return professionalFetchRef.current.promise;
      }

      setLoading(true);
      professionalFetchRef.current.key = cacheKey;
      professionalFetchRef.current.promise = fetchProfessionalDetail(appId)
        .then(res => {
          if (res?.status === 200) {
            setProfessionalDetail(res?.data?.data);
            setIsCrmUser(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });

      return professionalFetchRef.current.promise;
    },
    [isCrmUser, personalDetail?.applicationId, applyCachedAggregateDetails],
  );

  const getSubscriptionDetail = useCallback(
    applicationId => {
      if (isCrmUser) {
        if (applyCachedAggregateDetails()) {
          return Promise.resolve();
        }
        return Promise.resolve();
      }

      const appId = applicationId || personalDetail?.applicationId;
      if (!appId) {
        return Promise.resolve();
      }

      const cacheKey = String(appId);
      if (
        subscriptionFetchRef.current.key === cacheKey &&
        subscriptionFetchRef.current.promise
      ) {
        return subscriptionFetchRef.current.promise;
      }

      setLoading(true);
      subscriptionFetchRef.current.key = cacheKey;
      subscriptionFetchRef.current.promise = fetchSubscriptionDetail(appId)
        .then(res => {
          if (res?.status === 200) {
            setSubscriptionDetail(res?.data?.data);
            setIsCrmUser(false);
          }
        })
        .finally(() => {
          setLoading(false);
        });

      return subscriptionFetchRef.current.promise;
    },
    [isCrmUser, personalDetail?.applicationId, applyCachedAggregateDetails],
  );

  const getCategoryData = useCallback(
    (categoryNameOrId, categoryLookups = []) => {
      if (!categoryNameOrId) {
        setCategoryData(null);
        return;
      }

      setCategoryLoading(true);

      // Helper function to check if input looks like an ID (MongoDB ObjectId format)
      const isObjectId = str => {
        return /^[0-9a-fA-F]{24}$/.test(str);
      };

      // Determine if we need to find category by name from lookup
      let categoryId = categoryNameOrId;
      const normalize = value =>
        String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[_-]+/g, ' ')
          .replace(/\s+/g, ' ');
      const normalizedInput = normalize(categoryNameOrId);

      // If it doesn't look like an ID and we have categoryLookups, find by name
      if (!isObjectId(categoryNameOrId) && categoryLookups.length > 0) {
        const foundCategory = categoryLookups.find(item => {
          const itemName =
            item?.name ||
            item?.DisplayName ||
            item?.label ||
            item?.productType?.name ||
            item?.code;
          return normalize(itemName) === normalizedInput;
        });

        if (foundCategory) {
          categoryId = foundCategory?._id || foundCategory?.id;
        } else {
          // Category name not found in lookup
          console.warn(
            `Category with name "${categoryNameOrId}" not found in lookup`,
          );
          setCategoryData(null);
          setCategoryLoading(false);
          return;
        }
      } else if (!isObjectId(categoryNameOrId) && categoryLookups.length === 0) {
        // Wait for lookups instead of calling product API with a plain name.
        setCategoryData(null);
        setCategoryLoading(false);
        return;
      }

      if (!categoryId) {
        setCategoryData(null);
        setCategoryLoading(false);
        return;
      }

      fetchCategoryByCategoryId(categoryId)
        .then(res => {
          const payload = res?.data?.data || res?.data;
          setCategoryData(payload || null);
          setCategoryLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch category data:', error);
          setCategoryData(null);
          setCategoryLoading(false);
        });
    },
    [],
  );

  useEffect(() => {
    if (!isSignedIn || !authUserId) {
      resetApplicationFetchState();
      setPersonalDetail(null);
      setProfessionalDetail(null);
      setSubscriptionDetail(null);
      setApplicationStatus(null);
      setCategoryData(null);
      setIsCrmUser(false);
      setCurrentStep(1);
      return;
    }

    resetApplicationFetchState();
    setPersonalDetail(null);
    setProfessionalDetail(null);
    setSubscriptionDetail(null);
    setApplicationStatus(null);
    setCategoryData(null);
    setIsCrmUser(false);
    getPersonalDetail();
  }, [isSignedIn, authUserId, resetApplicationFetchState]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (isCrmUser) {
      if (
        !professionalDetail &&
        detailFetchAttemptedRef.current.professional !== 'crm'
      ) {
        detailFetchAttemptedRef.current.professional = 'crm';
        getProfessionalDetail();
      }
      if (
        !subscriptionDetail &&
        detailFetchAttemptedRef.current.subscription !== 'crm'
      ) {
        detailFetchAttemptedRef.current.subscription = 'crm';
        getSubscriptionDetail();
      }
      return;
    }

    const appId = personalDetail?.applicationId;
    if (!appId) {
      return;
    }

    const profReady = detailBelongsToApplication(professionalDetail, appId);
    const subReady = detailBelongsToApplication(subscriptionDetail, appId);
    if (profReady && subReady) {
      return;
    }

    if (detailFetchAttemptedRef.current.professional === String(appId)) {
      return;
    }

    fetchApplicationStepDetails(appId);
  }, [
    token,
    personalDetail?.applicationId,
    isCrmUser,
    professionalDetail?.applicationId,
    subscriptionDetail?.applicationId,
    fetchApplicationStepDetails,
  ]);

  // Note: Auto-fetch removed - components should handle fetching with categoryLookups
  // since membershipCategory is now stored as name and requires lookup to find the ID

  // Helper function to check if user has CRM data
  const isCrmUserCheck = () => {
    return (
      isCrmUser ||
      Boolean(
        (personalDetail && !personalDetail?.applicationId) ||
          (professionalDetail && !professionalDetail?.applicationId) ||
          (subscriptionDetail && !subscriptionDetail?.applicationId),
      )
    );
  };

  const value = {
    loading,
    detailsLoading,
    isFormInitializing: loading || detailsLoading,
    personalDetail,
    currentStep,
    setCurrentStep,
    professionalDetail,
    subscriptionDetail,
    applicationStatus,
    categoryData,
    categoryLoading,
    getPersonalDetail,
    refreshPortalPersonalDetail,
    getProfessionalDetail,
    getSubscriptionDetail,
    getCategoryData,
    isCrmUser: isCrmUserCheck(),
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useLookup must be used within a ApplicationProvider');
  }
  return context;
};
