import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  fetchPersonalDetail,
  fetchProfessionalDetail,
  fetchSubscriptionDetail,
} from '../api/application.api';
import { fetchCategoryByCategoryId } from '../api/category.api';
import { getHeaders } from '../helpers/auth.helper';

const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [personalDetail, setPersonalDetail] = useState(null);
  const [professionalDetail, setProfessionalDetail] = useState(null);
  const [subscriptionDetail, setSubscriptionDetail] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryData, setCategoryData] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const { token } = getHeaders();

  const getPersonalDetail = () => {
    setLoading(true);

    fetchPersonalDetail()
      .then(res => {
        if (res.status === 200) {
          setPersonalDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
          // toast.error(res.data.message ?? 'Unable to get personal datail');
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getProfessionalDetail = applicationId => {
    const appId = applicationId || personalDetail?.applicationId;
    if (!appId) return;

    setLoading(true);
    fetchProfessionalDetail(appId)
      .then(res => {
        if (res.status === 200) {
          setProfessionalDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getSubscriptionDetail = applicationId => {
    const appId = applicationId || personalDetail?.applicationId;
    if (!appId) return;

    setLoading(true);
    fetchSubscriptionDetail(appId)
      .then(res => {
        if (res.status === 200) {
          setSubscriptionDetail(res?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getCategoryData = useCallback((categoryNameOrId, categoryLookups = []) => {
    if (!categoryNameOrId) {
      setCategoryData(null);
      return;
    }

    setCategoryLoading(true);

    // Helper function to check if input looks like an ID (MongoDB ObjectId format)
    const isObjectId = (str) => {
      return /^[0-9a-fA-F]{24}$/.test(str);
    };

    // Determine if we need to find category by name from lookup
    let categoryId = categoryNameOrId;
    
    // If it doesn't look like an ID and we have categoryLookups, find by name
    if (!isObjectId(categoryNameOrId) && categoryLookups.length > 0) {
      const foundCategory = categoryLookups.find(item => {
        const itemName =
          item?.name ||
          item?.DisplayName ||
          item?.label ||
          item?.productType?.name ||
          item?.code;
        return String(itemName || '') === String(categoryNameOrId);
      });
      
      if (foundCategory) {
        categoryId = foundCategory?._id || foundCategory?.id;
      } else {
        // Category name not found in lookup
        console.warn(`Category with name "${categoryNameOrId}" not found in lookup`);
        setCategoryData(null);
        setCategoryLoading(false);
        return;
      }
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
  }, []);

  useEffect(() => {
    if (token) {
      if (personalDetail?.applicationId) {
        // Only fetch if we don't already have the data
        if (!professionalDetail) {
          getProfessionalDetail(personalDetail.applicationId);
        }
        if (!subscriptionDetail) {
          getSubscriptionDetail(personalDetail.applicationId);
        }
      }
    }
  }, [personalDetail?.applicationId]);

  // Note: Auto-fetch removed - components should handle fetching with categoryLookups
  // since membershipCategory is now stored as name and requires lookup to find the ID

  const value = {
    loading,
    personalDetail,
    currentStep,
    setCurrentStep,
    professionalDetail,
    subscriptionDetail,
    categoryData,
    categoryLoading,
    getPersonalDetail,
    getProfessionalDetail,
    getSubscriptionDetail,
    getCategoryData,
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
