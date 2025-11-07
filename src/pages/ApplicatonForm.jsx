import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { toast } from 'react-toastify';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import {PaymentStatusModal } from '../components/modals';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import {
  createPersonalDetailRequest,
  createProfessionalDetailRequest,
  createSubscriptionDetailRequest,
  updatePersonalDetailRequest,
  updateProfessionalDetailRequest,
  updateSubscriptionDetailRequest,
} from '../api/application.api';
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
  const [shouldShowModal, setShouldShowModal] = useState(false);
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
    if (personalDetail?.ApplicationId) {
      // Reset payment intent state for new application
      setPaymentIntentCreated(false);

      setFormData(prev => {
        // Only update if data has actually changed
        const newPersonalInfo = {
          title: personalDetail?.personalInfo?.title || prev.personalInfo.title || '',
          surname: personalDetail?.personalInfo?.surname || prev.personalInfo.surname || '',
          forename: personalDetail?.personalInfo?.forename || prev.personalInfo.forename || '',
          gender: personalDetail?.personalInfo?.gender || prev.personalInfo.gender || '',
          dateOfBirth: personalDetail?.personalInfo?.dateOfBirth || prev.personalInfo.dateOfBirth || '',
          countryPrimaryQualification:
            personalDetail?.personalInfo?.countryPrimaryQualification || prev.personalInfo.countryPrimaryQualification || '',
          personalEmail: personalDetail?.contactInfo?.personalEmail || prev.personalInfo.personalEmail || '',
          mobileNo: personalDetail?.contactInfo?.mobileNumber || prev.personalInfo.mobileNo || '',
          consent: personalDetail?.contactInfo?.consent ?? prev.personalInfo.consent ?? true,
          addressLine1: personalDetail?.contactInfo?.buildingOrHouse || prev.personalInfo.addressLine1 || '',
          addressLine2: personalDetail?.contactInfo?.streetOrRoad || prev.personalInfo.addressLine2 || '',
          addressLine3: personalDetail?.contactInfo?.areaOrTown || prev.personalInfo.addressLine3 || '',
          addressLine4: personalDetail?.contactInfo?.countyCityOrPostCode || prev.personalInfo.addressLine4 || '',
          eircode: personalDetail?.contactInfo?.eircode || prev.personalInfo.eircode || '',
          preferredAddress: personalDetail?.contactInfo?.preferredAddress || prev.personalInfo.preferredAddress || '',
          preferredEmail: personalDetail?.contactInfo?.preferredEmail || prev.personalInfo.preferredEmail || '',
          homeWorkTelNo: personalDetail?.contactInfo?.telephoneNumber || prev.personalInfo.homeWorkTelNo || '',
          country: personalDetail?.contactInfo?.country || prev.personalInfo.country || 'Ireland',
          workEmail: personalDetail?.contactInfo?.workEmail || prev.personalInfo.workEmail || '',
        };

        return {
          ...prev,
          personalInfo: newPersonalInfo,
        };
      });
    }
  }, [personalDetail?.ApplicationId]);

  useEffect(() => {
    if (professionalDetail?.ApplicationId) {
      const membershipCategory =
        professionalDetail?.professionalDetails?.membershipCategory;

      setFormData(prev => ({
        ...prev,
        professionalDetails: {
          membershipCategory: membershipCategory || prev.professionalDetails.membershipCategory || '',
          workLocation: professionalDetail?.professionalDetails?.workLocation || prev.professionalDetails.workLocation || '',
          otherWorkLocation:
            professionalDetail?.professionalDetails?.otherWorkLocation ?? prev.professionalDetails.otherWorkLocation ?? '',
          grade: professionalDetail?.professionalDetails?.grade || prev.professionalDetails.grade || '',
          otherGrade: professionalDetail?.professionalDetails?.otherGrade ?? prev.professionalDetails.otherGrade ?? '',
          nmbiNumber: professionalDetail?.professionalDetails?.nmbiNumber ?? prev.professionalDetails.nmbiNumber ?? '',
          nurseType: professionalDetail?.professionalDetails?.nurseType ?? prev.professionalDetails.nurseType ?? '',
          nursingAdaptationProgramme: professionalDetail?.professionalDetails
            ?.nursingAdaptationProgramme
            ? 'yes'
            : prev.professionalDetails.nursingAdaptationProgramme || 'no',
          region: professionalDetail?.professionalDetails?.region ?? prev.professionalDetails.region ?? '',
          branch: professionalDetail?.professionalDetails?.branch ?? prev.professionalDetails.branch ?? '',
          pensionNo: professionalDetail?.professionalDetails?.pensionNo ?? prev.professionalDetails.pensionNo ?? '',
          isRetired:
            professionalDetail?.professionalDetails?.isRetired ?? prev.professionalDetails.isRetired ?? false,
          retiredDate:
            professionalDetail?.professionalDetails?.retiredDate ?? prev.professionalDetails.retiredDate ?? '',
          studyLocation:
            professionalDetail?.professionalDetails?.studyLocation ?? prev.professionalDetails.studyLocation ?? '',
          graduationDate:
            professionalDetail?.professionalDetails?.graduationDate ?? prev.professionalDetails.graduationDate ?? '',
        },
      }));

      // Fetch category data when professional details are available
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
  }, [professionalDetail?.ApplicationId, professionalDetail?.professionalDetails?.membershipCategory]);

  useEffect(() => {
    if (subscriptionDetail?.ApplicationId) {
      setIsSubmitted(true);
      setFormData(prev => ({
        ...prev,
        subscriptionDetails: {
          paymentType: subscriptionDetail?.subscriptionDetails?.paymentType || prev.subscriptionDetails.paymentType || '',
          payrollNo: subscriptionDetail?.subscriptionDetails?.payrollNo ?? prev.subscriptionDetails.payrollNo ?? '',
          memberStatus:
            subscriptionDetail?.subscriptionDetails?.membershipStatus ?? prev.subscriptionDetails.memberStatus ?? '',
          otherIrishTradeUnion: subscriptionDetail?.subscriptionDetails
            ?.otherIrishTradeUnion
            ? 'yes'
            : prev.subscriptionDetails.otherIrishTradeUnion || 'no',
          otherScheme: subscriptionDetail?.subscriptionDetails?.otherScheme
            ? 'yes'
            : prev.subscriptionDetails.otherScheme || 'no',
          recuritedBy:
            subscriptionDetail?.subscriptionDetails?.recuritedBy ?? prev.subscriptionDetails.recuritedBy ?? '',
          recuritedByMembershipNo:
            subscriptionDetail?.subscriptionDetails?.recuritedByMembershipNo ??
            prev.subscriptionDetails.recuritedByMembershipNo ?? '',
          primarySection:
            subscriptionDetail?.subscriptionDetails?.primarySection || prev.subscriptionDetails.primarySection || '',
          otherPrimarySection:
            subscriptionDetail?.subscriptionDetails?.otherPrimarySection ?? prev.subscriptionDetails.otherPrimarySection ?? '',
          secondarySection:
            subscriptionDetail?.subscriptionDetails?.secondarySection || prev.subscriptionDetails.secondarySection || '',
          otherSecondarySection:
            subscriptionDetail?.subscriptionDetails?.otherSecondarySection ??
            prev.subscriptionDetails.otherSecondarySection ?? '',
          incomeProtectionScheme:
            subscriptionDetail?.subscriptionDetails?.incomeProtectionScheme ??
            prev.subscriptionDetails.incomeProtectionScheme ?? false,
          inmoRewards:
            subscriptionDetail?.subscriptionDetails?.inmoRewards ?? prev.subscriptionDetails.inmoRewards ?? false,
          valueAddedServices:
            subscriptionDetail?.subscriptionDetails?.valueAddedServices ??
            prev.subscriptionDetails.valueAddedServices ?? false,
          termsAndConditions:
            subscriptionDetail?.subscriptionDetails?.termsAndConditions ??
            prev.subscriptionDetails.termsAndConditions ?? false,
          membershipCategory:
            subscriptionDetail?.subscriptionDetails?.membershipCategory || prev.subscriptionDetails.membershipCategory || '',
          dateJoined: subscriptionDetail?.subscriptionDetails?.dateJoined || prev.subscriptionDetails.dateJoined || '',
          paymentFrequency:
            subscriptionDetail?.subscriptionDetails?.paymentFrequency || prev.subscriptionDetails.paymentFrequency || '',
        },
      }));
    }
  }, [subscriptionDetail?.ApplicationId]);

  // Show modal after subscription detail is created/updated
  useEffect(() => {
    if (shouldShowModal) {
      setIsModalVisible(true);
      setShouldShowModal(false);
    }
  }, [shouldShowModal]);

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
          // Update personal detail and move to next step
          getPersonalDetail();
          setCurrentStep(2);
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
          // Update personal detail and move to next step
          getPersonalDetail();
          setCurrentStep(2);
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
          // Update professional detail and move to next step
          getProfessionalDetail(personalDetail?.ApplicationId);
          setCurrentStep(3);
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
          // Update professional detail and move to next step
          getProfessionalDetail(personalDetail?.ApplicationId);
          setCurrentStep(3);
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

  const createSubscriptionDetail = async data => {
    try {
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

      if (res.status === 200) {
        // Update subscription detail
        getSubscriptionDetail(personalDetail?.ApplicationId);
        
        // Check if undergraduate student - they don't need payment
        if (professionalDetail?.professionalDetails?.membershipCategory === 'undergraduate_student') {
          setIsSubmitted(true);
          setStatusModal({ 
            open: true, 
            status: 'success', 
            message: 'Application submitted successfully!' 
          });
        } else {
          // Trigger payment modal for other categories
          setShouldShowModal(true);
        }
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
        // Update subscription detail
        getSubscriptionDetail(personalDetail?.ApplicationId);
        
        // Check if undergraduate student - they don't need payment
        if (professionalDetail?.professionalDetails?.membershipCategory === 'undergraduate_student') {
          setIsSubmitted(true);
          setStatusModal({ 
            open: true, 
            status: 'success', 
            message: 'Application updated successfully!' 
          });
        } else {
          // Trigger payment modal for other categories
          setShouldShowModal(true);
        }
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
      if (currentStep === 3) {
        // Always create/update subscription detail first
        if (!subscriptionDetail) {
          createSubscriptionDetail(formData.subscriptionDetails);
        } else {
          updateSubscriptionDetail(formData.subscriptionDetails);
        }
        // Modal will be shown by useEffect after subscription is saved (via shouldShowModal)
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
    console.log('Payment Success Data:', paymentData);
    
    // Close the payment modal
    setIsModalVisible(false);
    
    // Show success status modal
    setStatusModal({ 
      open: true, 
      status: 'success', 
      message: 'Payment completed successfully!' 
    });
    
    // Reset form state
    setIsSubmitted(true);
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
  console.log('modal==========>', isModalVisible);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex items-center mb-6 sm:mb-8 px-1 sm:px-8 md:px-12 lg:px-16 overflow-x-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {/* Step Circle and Label */}
                <div className="flex flex-col items-center relative flex-shrink-0">
                  <div
                    className={`
                      w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base
                      ${
                        isSubmitted && step.number === 3
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                            ? 'bg-blue-500 text-white'
                            : currentStep > step.number
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                      }
                    `}>
                    {isSubmitted && step.number === 3
                      ? '✓'
                      : currentStep > step.number
                        ? '✓'
                        : step.number}
                  </div>
                  <p
                    className={`mt-1.5 sm:mt-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium text-center max-w-[70px] sm:max-w-none leading-tight sm:leading-normal ${
                      isSubmitted && step.number === 3
                        ? 'text-green-500'
                        : currentStep === step.number
                          ? 'text-blue-500'
                          : currentStep > step.number
                            ? 'text-green-500'
                            : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-1 sm:mx-4 md:mx-6 lg:mx-8 min-w-[30px] sm:min-w-[80px] md:min-w-[100px]">
                    <div
                      className={`
                        h-0.5 w-full
                        ${(isSubmitted && step.number === 2) || currentStep > step.number 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'}
                      `}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <Card className="p-4">
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
