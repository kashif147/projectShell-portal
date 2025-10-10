import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { toast } from 'react-toastify';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import { SubscriptionModal, PaymentStatusModal } from '../components/modals';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import {
  createPersonalDetailRequest,
  createProfessionalDetailRequest,
  createSubscriptionDetailRequest,
  updatePersonalDetailRequest,
  updateProfessionalDetailRequest,
  updateSubscriptionDetailRequest,
} from '../api/application.api';
import { createPaymentIntentRequest } from '../api/payment.api';
import { fetchCategoryByCategoryId } from '../api/category.api';
import { useApplication } from '../contexts/applicationContext';
import Spinner from '../components/common/Spinner';
import { isDataFormat } from '../helpers/date.helper';
import SubscriptionWrapper from '../components/modals/SubscriptionWrapper';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const {
    personalDetail,
    getPersonalDetail,
    loading,
    getProfessionalDetail,
    professionalDetail,
    subscriptionDetail,
    getSubscriptionDetail,
    setCurrentStep,
    currentStep,
  } = useApplication();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
  const [showValidation, setShowValidation] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      forename: user?.userFirstName || '',
      surname: user?.userLastName || '',
      personalEmail: user?.userEmail || '',
      mobileNo: user?.userMobilePhone || '',
      country: 'Ireland',
      consent: true,
    },
    professionalDetails: {},
    subscriptionDetails: {},
  });

  console.log('Application ID', personalDetail?.ApplicationId);

  useEffect(() => {
    if (personalDetail) {
      // Reset payment intent state for new application
      setPaymentIntentCreated(false);

      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          title: personalDetail?.personalInfo?.title || '',
          surname: personalDetail?.personalInfo?.surname || '',
          forename: personalDetail?.personalInfo?.forename || '',
          gender: personalDetail?.personalInfo?.gender || '',
          dateOfBirth: personalDetail?.personalInfo?.dateOfBirth || '',
          countryPrimaryQualification:
            personalDetail?.personalInfo?.countryPrimaryQualification || '',
          personalEmail: personalDetail?.contactInfo?.personalEmail || '',
          mobileNo: personalDetail?.contactInfo?.mobileNumber || '',
          consent: personalDetail?.contactInfo?.consent ?? true,
          addressLine1: personalDetail?.contactInfo?.buildingOrHouse || '',
          addressLine2: personalDetail?.contactInfo?.streetOrRoad || '',
          addressLine3: personalDetail?.contactInfo?.areaOrTown || '',
          addressLine4: personalDetail?.contactInfo?.countyCityOrPostCode || '',
          eircode: personalDetail?.contactInfo?.eircode || '',
          preferredAddress: personalDetail?.contactInfo?.preferredAddress || '',
          preferredEmail: personalDetail?.contactInfo?.preferredEmail || '',
          homeWorkTelNo: personalDetail?.contactInfo?.telephoneNumber || '',
          country: personalDetail?.contactInfo?.country || '',
          workEmail: personalDetail?.contactInfo?.workEmail || '',
        },
      }));
    }
  }, [personalDetail]);

  useEffect(() => {
    if (professionalDetail) {
      setFormData(prev => ({
        ...prev,
        professionalDetails: {
          ...prev.professionalDetails,
          membershipCategory:
            professionalDetail?.professionalDetails?.membershipCategory,
          workLocation: professionalDetail?.professionalDetails?.workLocation,
          otherWorkLocation:
            professionalDetail?.professionalDetails?.otherWorkLocation ?? '',
          grade: professionalDetail?.professionalDetails?.grade,
          otherGrade: professionalDetail?.professionalDetails?.otherGrade ?? '',
          nmbiNumber: professionalDetail?.professionalDetails?.nmbiNumber ?? '',
          nurseType: professionalDetail?.professionalDetails?.nurseType ?? '',
          nursingAdaptationProgramme: professionalDetail?.professionalDetails
            ?.nursingAdaptationProgramme
            ? 'yes'
            : 'no',
          region: professionalDetail?.professionalDetails?.region ?? '',
          branch: professionalDetail?.professionalDetails?.branch ?? '',
          pensionNo: professionalDetail?.professionalDetails?.pensionNo ?? '',
          isRetired:
            professionalDetail?.professionalDetails?.isRetired ?? false,
          retiredDate:
            professionalDetail?.professionalDetails?.retiredDate ?? '',
          studyLocation:
            professionalDetail?.professionalDetails?.studyLocation ?? '',
          graduationDate:
            professionalDetail?.professionalDetails?.graduationDate ?? '',
        },
      }));

      // Fetch category data when professional details are available
      const membershipCategory =
        professionalDetail?.professionalDetails?.membershipCategory;
      if (membershipCategory && !categoryData) {
        fetchCategoryByCategoryId(membershipCategory)
          .then(res => {
            const payload = res?.data?.data || res?.data;
            setCategoryData(payload);
          })
          .catch(error => {
            console.error('Failed to fetch category data:', error);
          });
      }
    }
  }, [professionalDetail, categoryData]);

  useEffect(() => {
    if (subscriptionDetail) {
      setIsSubmitted(true);
      setFormData(prev => ({
        ...prev,
        subscriptionDetails: {
          ...prev.subscriptionDetails,
          paymentType: subscriptionDetail?.subscriptionDetails?.paymentType,
          payrollNo: subscriptionDetail?.subscriptionDetails?.payrollNo ?? '',
          memberStatus:
            subscriptionDetail?.subscriptionDetails?.membershipStatus ?? '',
          otherIrishTradeUnion: subscriptionDetail?.subscriptionDetails
            ?.otherIrishTradeUnion
            ? 'yes'
            : 'no',
          otherScheme: subscriptionDetail?.subscriptionDetails?.otherScheme
            ? 'yes'
            : 'no',
          recuritedBy:
            subscriptionDetail?.subscriptionDetails?.recuritedBy ?? '',
          recuritedByMembershipNo:
            subscriptionDetail?.subscriptionDetails?.recuritedByMembershipNo ??
            '',
          primarySection:
            subscriptionDetail?.subscriptionDetails?.primarySection,
          otherPrimarySection:
            subscriptionDetail?.subscriptionDetails?.otherPrimarySection ?? '',
          secondarySection:
            subscriptionDetail?.subscriptionDetails?.secondarySection,
          otherSecondarySection:
            subscriptionDetail?.subscriptionDetails?.otherSecondarySection ??
            '',
          incomeProtectionScheme:
            subscriptionDetail?.subscriptionDetails?.incomeProtectionScheme ??
            false,
          inmoRewards:
            subscriptionDetail?.subscriptionDetails?.inmoRewards ?? false,
          valueAddedServices:
            subscriptionDetail?.subscriptionDetails?.valueAddedServices ??
            false,
          termsAndConditions:
            subscriptionDetail?.subscriptionDetails?.termsAndConditions ??
            false,
          membershipCategory:
            subscriptionDetail?.subscriptionDetails?.membershipCategory,
          dateJoined: subscriptionDetail?.subscriptionDetails?.dateJoined,
          paymentFrequency:
            subscriptionDetail?.subscriptionDetails?.paymentFrequency,
        },
      }));
    }
  }, [subscriptionDetail]);

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Professional Details' },
    { number: 3, title: 'Subscription Details' },
  ];

  const createPersonalDetail = data => {
    const personalInfo = {};

    const personalFields = {
      title: data.title,
      surname: data.surname,
      forename: data.forename,
      gender: data.gender,
      dateOfBirth: isDataFormat(data.dateOfBirth),
      countryPrimaryQualification: data.countryPrimaryQualification,
    };

    personalInfo.personalInfo = {};
    Object.entries(personalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfo.personalInfo[key] = value;
      }
    });

    const contactFields = {
      preferredAddress: data.preferredAddress,
      eircode: data.eircode,
      buildingOrHouse: data.addressLine1,
      streetOrRoad: data.addressLine2,
      areaOrTown: data.addressLine3,
      countyCityOrPostCode: data.addressLine4,
      country: data.country,
      mobileNumber: data.mobileNo,
      telephoneNumber: data.homeWorkTelNo,
      preferredEmail: data.preferredEmail,
      personalEmail: data.personalEmail,
      workEmail: data.workEmail,
      consent: data.consent,
    };

    personalInfo.contactInfo = {};
    Object.entries(contactFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfo.contactInfo[key] = value;
      }
    });

    createPersonalDetailRequest(personalInfo)
      .then(res => {
        if (res.status === 200) {
          getPersonalDetail();
          setCurrentStep(prev => {
            const nextStep = Math.min(prev + 1, steps.length);
            return nextStep;
          });
        } else {
          toast.error(res.data.message ?? 'Unable to add personal detail');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  const updatePersonalDetail = data => {
    const personalInfo = {};

    const personalFields = {
      title: data.title,
      surname: data.surname,
      forename: data.forename,
      gender: data.gender,
      dateOfBirth: isDataFormat(data.dateOfBirth),
      countryPrimaryQualification: data.countryPrimaryQualification,
    };

    personalInfo.personalInfo = {};
    Object.entries(personalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfo.personalInfo[key] = value;
      }
    });

    const contactFields = {
      preferredAddress: data.preferredAddress,
      eircode: data.eircode,
      buildingOrHouse: data.addressLine1,
      streetOrRoad: data.addressLine2,
      areaOrTown: data.addressLine3,
      countyCityOrPostCode: data.addressLine4,
      country: data.country,
      mobileNumber: data.mobileNo,
      telephoneNumber: data.homeWorkTelNo,
      preferredEmail: data.preferredEmail,
      personalEmail: data.personalEmail,
      workEmail: data.workEmail,
      consent: data.consent,
    };

    personalInfo.contactInfo = {};
    Object.entries(contactFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfo.contactInfo[key] = value;
      }
    });

    updatePersonalDetailRequest(personalDetail?.ApplicationId, personalInfo)
      .then(res => {
        if (res.status === 200) {
          getPersonalDetail();
          setCurrentStep(prev => {
            const nextStep = Math.min(prev + 1, steps.length);
            return nextStep;
          });
        } else {
          toast.error(res.data.message ?? 'Unable to update personal detail');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };
  const createProfessionalDetail = data => {
    const professionalFields = {
      membershipCategory: data.membershipCategory,
      workLocation: data.workLocation,
      otherWorkLocation: data.otherWorkLocation,
      grade: data.grade,
      otherGrade: data.otherGrade,
      nmbiNumber: data.nmbiNumber,
      nurseType: data.nurseType,
      nursingAdaptationProgramme: data?.nursingAdaptationProgramme === 'yes',
      region: data.region,
      branch: data.branch,
      pensionNo: data.pensionNo,
      isRetired: data?.membershipCategory === 'retired_associate',
      retiredDate: data.retiredDate && isDataFormat(data.retiredDate),
      studyLocation: data.studyLocation,
      graduationDate: data.graduationDate && isDataFormat(data.graduationDate),
    };

    const professionalInfo = { professionalDetails: {} };

    Object.entries(professionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        professionalInfo.professionalDetails[key] = value;
      }
    });

    createProfessionalDetailRequest(
      personalDetail?.ApplicationId,
      professionalInfo,
    )
      .then(res => {
        if (res.status === 200) {
          getProfessionalDetail();
          setCurrentStep(prev => {
            const nextStep = Math.min(prev + 1, steps.length);
            return nextStep;
          });
        } else {
          toast.error(res.data.message ?? 'Unable to add professional detail');
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  const updateProfessionalDetail = data => {
    const professionalFields = {
      membershipCategory: data.membershipCategory,
      workLocation: data.workLocation,
      otherWorkLocation: data.otherWorkLocation,
      grade: data.grade,
      otherGrade: data.otherGrade,
      nmbiNumber: data.nmbiNumber,
      nurseType: data.nurseType,
      nursingAdaptationProgramme: data?.nursingAdaptationProgramme === 'yes',
      region: data.region,
      branch: data.branch,
      pensionNo: data.pensionNo,
      isRetired: data?.membershipCategory === 'retired_associate',
      retiredDate: data.retiredDate && isDataFormat(data.retiredDate),
      studyLocation: data.studyLocation,
      graduationDate: data.graduationDate && isDataFormat(data.graduationDate),
    };

    const professionalInfo = { professionalDetails: {} };

    Object.entries(professionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        professionalInfo.professionalDetails[key] = value;
      }
    });

    updateProfessionalDetailRequest(
      personalDetail?.ApplicationId,
      professionalInfo,
    )
      .then(res => {
        if (res.status === 200) {
          getProfessionalDetail();
          setCurrentStep(prev => {
            const nextStep = Math.min(prev + 1, steps.length);
            return nextStep;
          });
        } else {
          toast.error(
            res.data.message ?? 'Unable to update professional detail',
          );
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  const createPaymentIntent = async () => {
    try {
      // Check if payment intent already created for this application
      if (paymentIntentCreated) {
        console.log(
          'Payment intent already created for this application, skipping...',
        );
        return { success: true, message: 'Payment intent already exists' };
      }

      const amount = categoryData?.currentPricing?.price || 50000; // fallback amount in cents
      const currency = categoryData?.currentPricing?.currency || 'EUR';
      const applicationId = personalDetail?.ApplicationId;

      if (!applicationId) {
        throw new Error('Application ID not found');
      }

      // const paymentData = {
      //   purpose: 'subscriptionFee',
      //   amount: amount,
      //   currency: currency.toLowerCase(),
      //   // status: 'created',
      //   description: 'Annual membership fees',
      //   applicationId: applicationId,
      // };

      // console.log('Creating payment intent with data:', paymentData);

      // const response = await createPaymentIntentRequest(paymentData);

      // console.log('Payment intent response:', response);

      // Handle different response structures
      if (response && (response.status === 200 || response.status === 201)) {
        console.log('Payment intent created successfully:', response.data);
        setPaymentIntentCreated(true);
        return response.data;
      } else if (response && response.data && response.data.success) {
        console.log('Payment intent created successfully:', response.data);
        setPaymentIntentCreated(true);
        return response.data;
      } else {
        const errorMessage =
          response?.data?.message ||
          response?.message ||
          'Failed to create payment intent';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Payment intent creation failed:', error);

      // Handle different error structures
      let errorMessage = 'Failed to create payment intent';

      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response);
        console.error('Server error data:', error.response.data);

        if (error.response.status === 409) {
          // Handle conflict error (likely duplicate payment intent)
          console.warn(
            'Payment intent conflict - payment intent already exists for this application',
          );
          setPaymentIntentCreated(true);
          // Don't throw error for 409 - treat as success since payment intent exists
          return {
            success: true,
            message: 'Payment intent already exists',
            existing: true,
          };
        } else {
          errorMessage =
            error.response.data?.message ||
            error.response.statusText ||
            errorMessage;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
        console.error('Network error:', error.request);
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const createSubscriptionDetail = async data => {
    try {
      // Create payment intent first (with error handling to continue if it fails)
      try {
        // await createPaymentIntent();
      } catch (paymentError) {
        console.warn(
          'Payment intent creation failed, continuing with subscription creation:',
          paymentError,
        );
        // Continue with subscription creation even if payment intent fails
      }

      const defaultFields = {
        membershipCategory:
          professionalDetail?.professionalDetails?.membershipCategory,
        // dateJoined: "15/01/2025",
        // paymentFrequency: "Monthly",
      };

      const subscriptionFields = {
        paymentType: data?.paymentType,
        payrollNo: data?.payrollNo,
        membershipStatus: data?.memberStatus,
        otherIrishTradeUnion: data?.otherIrishTradeUnion === true,
        otherScheme: data?.otherScheme === true,
        recuritedBy: data?.recuritedBy,
        recuritedByMembershipNo: data?.recuritedByMembershipNo,
        primarySection: data?.primarySection,
        otherPrimarySection: data?.otherPrimarySection,
        secondarySection: data?.secondarySection,
        otherSecondarySection: data?.otherSecondarySection,
        incomeProtectionScheme: data?.incomeProtectionScheme === true,
        inmoRewards: data?.inmoRewards === true,
        valueAddedServices: data?.valueAddedServices === true,
        termsAndConditions: data?.termsAndConditions === true,
        ...defaultFields,
      };

      const subscriptionDetails = {};
      Object.entries(subscriptionFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          subscriptionDetails[key] = value;
        }
      });

      const subscriptionInfo = {
        subscriptionDetails,
      };

      const res = await createSubscriptionDetailRequest(
        personalDetail?.ApplicationId,
        subscriptionInfo,
      );

      console.log('response', res);
      if (res.status === 200) {
        getSubscriptionDetail();
        setCurrentStep(prev => {
          const nextStep = Math.min(prev + 1, steps.length);
          return nextStep;
        });
        setStatusModal({ open: true, status: 'success', message: '' });
        setTimeout(() => {
          setStatusModal({ open: false, status: 'success', message: '' });
          navigate('/');
        }, 3000);
        toast.success('Application submitted successfully');
      } else {
        toast.error(res.data.message ?? 'Unable to add subscription detail');
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
      toast.error('Failed to process subscription. Please try again.');
    }
  };

  const updateSubscriptionDetail = async data => {
    try {
      // Create payment intent first (with error handling to continue if it fails)
      // try {
      //   await createPaymentIntent();
      // } catch (paymentError) {
      //   console.warn(
      //     'Payment intent creation failed, continuing with subscription update:',
      //     paymentError,
      //   );
      //   // Continue with subscription update even if payment intent fails
      // }

      const defaultFields = {
        membershipCategory:
          professionalDetail?.professionalDetails?.membershipCategory,
        // dateJoined: "15/01/2025",
        // paymentFrequency: "Monthly",
      };

      const subscriptionFields = {
        paymentType: data?.paymentType,
        payrollNo: data?.payrollNo,
        membershipStatus: data?.memberStatus,
        otherIrishTradeUnion: data?.otherIrishTradeUnion === true,
        otherScheme: data?.otherScheme === true,
        recuritedBy: data?.recuritedBy,
        recuritedByMembershipNo: data?.recuritedByMembershipNo,
        primarySection: data?.primarySection,
        otherPrimarySection: data?.otherPrimarySection,
        secondarySection: data?.secondarySection,
        otherSecondarySection: data?.otherSecondarySection,
        incomeProtectionScheme: data?.incomeProtectionScheme === true,
        inmoRewards: data?.inmoRewards === true,
        valueAddedServices: data?.valueAddedServices === true,
        termsAndConditions: data?.termsAndConditions === true,
        ...defaultFields,
      };

      const subscriptionDetails = {};
      Object.entries(subscriptionFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          subscriptionDetails[key] = value;
        }
      });

      const subscriptionInfo = {
        subscriptionDetails,
      };

      const res = await updateSubscriptionDetailRequest(
        personalDetail?.ApplicationId,
        subscriptionInfo,
      );

      if (res.status === 200) {
        getSubscriptionDetail();
        setCurrentStep(prev => {
          const nextStep = Math.min(prev + 1, steps.length);
          return nextStep;
        });
        setStatusModal({ open: true, status: 'success', message: '' });
        setTimeout(() => {
          setStatusModal({ open: false, status: 'success', message: '' });
          navigate('/');
        }, 3000);
        toast.success('Application update successfully');
      } else {
        toast.error(res.data.message ?? 'Unable to update subscription detail');
      }
    } catch (error) {
      console.error('Subscription update failed:', error);
      toast.error('Failed to update subscription. Please try again.');
    }
  };

  const handleNext = () => {
    setShowValidation(true);
    if (validateCurrentStep()) {
      if (currentStep === 1) {
        if (!personalDetail) {
          createPersonalDetail(formData.personalInfo);
        } else {
          updatePersonalDetail(formData.personalInfo);
        }
      }
      if (currentStep === 2) {
        if (!professionalDetail) {
          createProfessionalDetail(formData.professionalDetails);
        } else {
          updateProfessionalDetail(formData.professionalDetails);
        }
      }
      if (
        currentStep === 3 &&
        professionalDetail?.professionalDetails?.membershipCategory ===
          'undergraduate_student'
      ) {
        if (!subscriptionDetail) {
          createSubscriptionDetail(formData.subscriptionDetails);
        } else {
          updateSubscriptionDetail(formData.subscriptionDetails);
        }
      }
      if (
        currentStep === 3 &&
        professionalDetail?.professionalDetails?.membershipCategory !==
          'undergraduate_student'
      ) {
        setIsModalVisible(true);
      }
      // Remove automatic step increment - it will be handled by API success callbacks
      setShowValidation(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => {
      const prevStep = Math.max(prev - 1, 1);
      return prevStep;
    });
  };

  const handleFormDataChange = (stepName, data) => {
    setFormData(prev => {
      const newData = { ...prev, [stepName]: data };
      return newData;
    });
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        const {
          title,
          forename,
          surname,
          gender,
          dateOfBirth,
          personalEmail,
          mobileNo,
          addressLine1,
          addressLine4,
          preferredAddress,
        } = formData.personalInfo || {};
        if (
          !title ||
          !forename ||
          !surname ||
          !gender ||
          !dateOfBirth ||
          !personalEmail ||
          !mobileNo ||
          !addressLine1 ||
          !addressLine4 ||
          !preferredAddress
        ) {
          return false;
        }
        break;
      case 2:
        const {
          workLocation,
          grade,
          membershipCategory,
          nursingAdaptationProgramme,
          nurseType,
          nmbiNumber,
        } = formData.professionalDetails || {};
        if (!grade || !workLocation || !membershipCategory) {
          return false;
        }
        if (nursingAdaptationProgramme === 'yes') {
          if (!nurseType || !nmbiNumber) return false;
        }
        break;
      case 3:
        const {
          paymentType,
          incomeProtectionScheme,
          inmoRewards,
          termsAndConditions,
          otherIrishTradeUnion,
          otherScheme,
          memberStatus,
        } = formData.subscriptionDetails || {};
        if (!paymentType) return false;

        if (
          paymentType === 'deduction' &&
          !formData.subscriptionDetails?.payrollNo
        )
          return false;
        if (!memberStatus) return false;

        if (!otherIrishTradeUnion || !otherScheme) return false;

        if (!termsAndConditions) return false;

        if (memberStatus === 'new' || memberStatus === 'graduate') {
          if (!incomeProtectionScheme || !inmoRewards) return false;
        }
        break;
    }
    return true;
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSubscriptionSuccess = async paymentData => {
    if (validateCurrentStep()) {
      if (
        currentStep === 3 &&
        professionalDetail?.professionalDetails?.membershipCategory !==
          'undergraduate_student'
      ) {
        try {
          if (!subscriptionDetail) {
            await createSubscriptionDetail(formData.subscriptionDetails);
          } else {
            await updateSubscriptionDetail(formData.subscriptionDetails);
          }
        } catch (error) {
          console.error('Subscription processing failed:', error);
          // Error is already handled in the create/update functions
          return;
        }
      }
      setIsModalVisible(false);
    }
  };

  const handleSubscriptionFailure = errorMessage => {
    setIsModalVisible(false);
    setStatusModal({ open: true, status: 'error', message: errorMessage });
    setTimeout(() => {
      setStatusModal({ open: false, status: 'error', message: '' });
      // navigate('/');
    }, 2500);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInformation
            formData={formData.personalInfo}
            onFormDataChange={data =>
              handleFormDataChange('personalInfo', data)
            }
            showValidation={showValidation}
          />
        );
      case 2:
        return (
          <ProfessionalDetails
            formData={formData.professionalDetails}
            onFormDataChange={data =>
              handleFormDataChange('professionalDetails', data)
            }
            showValidation={showValidation}
          />
        );
      case 3:
        return (
          <SubscriptionDetails
            formData={formData.subscriptionDetails}
            onFormDataChange={data =>
              handleFormDataChange('subscriptionDetails', data)
            }
            showValidation={showValidation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
            {steps.map(step => (
              <div
                key={step.number}
                className="flex items-center w-full sm:w-auto">
                <div className="flex items-center w-full sm:w-auto">
                  <div
                    className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  isSubmitted && step.number === 3
                    ? 'bg-green-500 text-white'
                    : currentStep === step.number
                      ? 'bg-blue-500 text-white'
                      : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                }
              `}>
                    {isSubmitted && step.number === 3
                      ? '✓'
                      : currentStep > step.number
                        ? '✓'
                        : step.number}
                  </div>
                  <div className="ml-2">
                    <p
                      className={`text-sm whitespace-nowrap ${
                        isSubmitted && step.number === 3
                          ? 'text-green-500 font-semibold'
                          : currentStep === step.number
                            ? 'text-blue-500 font-semibold'
                            : 'text-gray-500'
                      }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {step.number < steps.length && (
                  <div
                    className={`
                hidden sm:block flex-grow mx-2 h-1 min-w-[16px]
                ${(isSubmitted && step.number === 2) || currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
              `}
                  />
                )}
              </div>
            ))}
          </div>

          <Card title={steps[currentStep - 1].title} className="p-4">
            {renderStepContent()}
          </Card>

          <div className="flex justify-between mt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }>
              Previous
            </Button>
            <Button type="primary" onClick={handleNext}>
              {currentStep === steps.length ? 'Submit' : 'Next'}
            </Button>
          </div>
        </>
      )}

      {/* <Elements stripe={stripePromise}>
        <SubscriptionModal
          isVisible={isModalVisible}
          onClose={handleModalClose}
          onSuccess={handleSubscriptionSuccess}
          onFailure={handleSubscriptionFailure}
          formData={formData}
          membershipCategory={formData.professionalDetails.membershipCategory}
        />
      </Elements> */}

      <SubscriptionWrapper
        isVisible={isModalVisible}
        onClose={handleModalClose}
        onSuccess={handleSubscriptionSuccess}
        onFailure={handleSubscriptionFailure}
        formData={formData}
        membershipCategory={formData.professionalDetails.membershipCategory}
      />

      <PaymentStatusModal
        open={statusModal.open}
        status={statusModal.status}
        subTitle={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, open: false }))}
        onPrimary={() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          navigate('/');
        }}
      />
    </div>
  );
};

export default ApplicationForm;
