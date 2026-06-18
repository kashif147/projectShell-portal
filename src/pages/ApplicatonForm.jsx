import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Card } from 'antd';
import { toast } from 'react-toastify';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails, {
  CATEGORY_DISPLAY_NAME_BY_TYPE,
} from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import { PaymentStatusModal } from '../components/modals';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createPersonalDetailRequest,
  createProfessionalDetailRequest,
  createSubscriptionDetailRequest,
  updatePersonalDetailRequest,
  updateProfessionalDetailRequest,
  updateSubscriptionDetailRequest,
} from '../api/application.api';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import Spinner from '../components/common/Spinner';
import { calculateAgeFromDateOfBirth, isDataFormat } from '../helpers/date.helper';
import { normalizeMobileToE164 } from '../helpers/phone.helper';
import {
  getPaymentFrequencyCategory,
  isSalaryDeductionPaymentType,
} from '../helpers/subscriptionPricing.helper';
import {
  detailBelongsToApplication,
  isResumablePortalApplication,
  resolveApplicationFormStep,
} from '../helpers/applicationPayload.helper';
import { APPLICATION_PAYMENT_AUTHORISED_MESSAGE } from '../helpers/paymentIntent.helper';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const ApplicationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formTopRef = useRef(null);
  const hasRestoredInitialStep = useRef(false);
  const { user } = useSelector(state => state.auth);
  const {
    personalDetail,
    refreshPortalPersonalDetail,
    isFormInitializing,
    getProfessionalDetail,
    professionalDetail,
    subscriptionDetail,
    getSubscriptionDetail,
    setCurrentStep,
    currentStep,
    categoryData,
    getCategoryData,
    applicationStatus,
  } = useApplication();
  const { categoryLookups, lookupsReady } = useLookup();

  const hasActiveApplication = useMemo(
    () => isResumablePortalApplication(personalDetail, applicationStatus),
    [personalDetail, applicationStatus],
  );
  const activeApplicationId = hasActiveApplication
    ? personalDetail?.applicationId
    : null;
  const activeProfessionalDetail = useMemo(
    () =>
      detailBelongsToApplication(professionalDetail, activeApplicationId)
        ? professionalDetail
        : null,
    [professionalDetail, activeApplicationId],
  );
  const activeSubscriptionDetail = useMemo(
    () =>
      detailBelongsToApplication(subscriptionDetail, activeApplicationId)
        ? subscriptionDetail
        : null,
    [subscriptionDetail, activeApplicationId],
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    title: '',
    message: '',
  });
  const [showValidation, setShowValidation] = useState(false);
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      forename: user?.userFirstName || user?.firstName || '',
      surname: user?.userLastName || user?.lastName || '',
      personalEmail: user?.userEmail || user?.email || '',
      mobileNo: normalizeMobileToE164(user?.userMobilePhone || user?.mobilePhone || ''),
      country: 'Ireland',
      consent: true,
    },
    professionalDetails: {},
    subscriptionDetails: {},
  });

  console.log('Application ID', personalDetail?.applicationId);
  console.log('user===========>',user)

  useEffect(() => {
    if (!hasActiveApplication) {
      hasRestoredInitialStep.current = false;
    }
  }, [hasActiveApplication]);

  useLayoutEffect(() => {
    if (isFormInitializing || hasRestoredInitialStep.current) {
      return;
    }

    const nextStep =
      !hasActiveApplication || !activeApplicationId
        ? 1
        : resolveApplicationFormStep({
            activeSubscriptionDetail,
            activeProfessionalDetail,
            activeApplicationId,
          });

    setCurrentStep(nextStep);
    hasRestoredInitialStep.current = true;
  }, [
    isFormInitializing,
    hasActiveApplication,
    activeApplicationId,
    activeSubscriptionDetail,
    activeProfessionalDetail,
    setCurrentStep,
  ]);

  useEffect(() => {
    if (!hasActiveApplication) {
      if (isFormInitializing) {
        return;
      }

      setCurrentStep(1);
      setIsSubmitted(false);
      setPaymentIntentCreated(false);
      setFormData(prev => ({
        ...prev,
        professionalDetails: {},
        subscriptionDetails: {},
      }));
      return;
    }

    if (activeApplicationId) {
      // Reset payment intent state for new application
      setPaymentIntentCreated(false);

      setFormData(prev => {
        // Only update if data has actually changed
        const newPersonalInfo = {
          title:
            personalDetail?.personalInfo?.title ||
            prev.personalInfo.title ||
            '',
          surname:
            personalDetail?.personalInfo?.surname ||
            prev.personalInfo.surname ||
            '',
          forename:
            personalDetail?.personalInfo?.forename ||
            prev.personalInfo.forename ||
            '',
          gender:
            personalDetail?.personalInfo?.gender ||
            prev.personalInfo.gender ||
            '',
          dateOfBirth:
            personalDetail?.personalInfo?.dateOfBirth ||
            prev.personalInfo.dateOfBirth ||
            '',
          countryPrimaryQualification:
            personalDetail?.personalInfo?.countryPrimaryQualification ||
            prev.personalInfo.countryPrimaryQualification ||
            '',
          personalEmail:
            personalDetail?.contactInfo?.personalEmail ||
            prev.personalInfo.personalEmail ||
            '',
          mobileNo:
            normalizeMobileToE164(
              personalDetail?.contactInfo?.mobileNumber ||
                prev.personalInfo.mobileNo ||
                '',
            ) ||
            prev.personalInfo.mobileNo ||
            '',
          consent:
            personalDetail?.contactInfo?.consent ??
            prev.personalInfo.consent ??
            false,
          addressLine1:
            personalDetail?.contactInfo?.buildingOrHouse ||
            prev.personalInfo.addressLine1 ||
            '',
          addressLine2:
            personalDetail?.contactInfo?.streetOrRoad ||
            prev.personalInfo.addressLine2 ||
            '',
          addressLine3:
            personalDetail?.contactInfo?.areaOrTown ||
            prev.personalInfo.addressLine3 ||
            '',
          addressLine4:
            personalDetail?.contactInfo?.countyCityOrPostCode ||
            prev.personalInfo.addressLine4 ||
            '',
          eircode:
            personalDetail?.contactInfo?.eircode ||
            prev.personalInfo.eircode ||
            '',
          preferredAddress:
            personalDetail?.contactInfo?.preferredAddress ||
            prev.personalInfo.preferredAddress ||
            '',
          preferredEmail:
            personalDetail?.contactInfo?.preferredEmail ||
            prev.personalInfo.preferredEmail ||
            '',
          homeWorkTelNo:
            personalDetail?.contactInfo?.telephoneNumber ||
            prev.personalInfo.homeWorkTelNo ||
            '',
          country:
            personalDetail?.contactInfo?.country ||
            prev.personalInfo.country ||
            'Ireland',
          workEmail:
            personalDetail?.contactInfo?.workEmail ||
            prev.personalInfo.workEmail ||
            '',
        };

        return {
          ...prev,
          personalInfo: newPersonalInfo,
        };
      });
    }
  }, [hasActiveApplication, activeApplicationId, personalDetail]);

  useEffect(() => {
    if (activeProfessionalDetail?.applicationId) {
      const membershipCategory =
        activeProfessionalDetail?.professionalDetails?.membershipCategory;

      setFormData(prev => ({
        ...prev,
        professionalDetails: {
          membershipCategory:
            membershipCategory ||
            prev.professionalDetails.membershipCategory ||
            '',
          workLocation:
            activeProfessionalDetail?.professionalDetails?.workLocation ||
            prev.professionalDetails.workLocation ||
            '',
          otherWorkLocation:
            activeProfessionalDetail?.professionalDetails?.otherWorkLocation ??
            prev.professionalDetails.otherWorkLocation ??
            '',
          grade:
            activeProfessionalDetail?.professionalDetails?.grade ||
            prev.professionalDetails.grade ||
            '',
          otherGrade:
            activeProfessionalDetail?.professionalDetails?.otherGrade ??
            prev.professionalDetails.otherGrade ??
            '',
          nursingAdaptationProgramme: (() => {
            const value =
              activeProfessionalDetail?.professionalDetails
                ?.nursingAdaptationProgramme;
            if (value === false) return 'no';
            if (value === true || value === 'yes') return 'yes';
            return prev.professionalDetails.nursingAdaptationProgramme || '';
          })(),
          nmbiNumber:
            activeProfessionalDetail?.professionalDetails?.nmbiNumber ??
            prev.professionalDetails.nmbiNumber ??
            '',
          nurseType: (() => {
            const programmeValue =
              activeProfessionalDetail?.professionalDetails
                ?.nursingAdaptationProgramme;
            if (programmeValue === false || programmeValue === 'no') {
              return '';
            }
            return (
              activeProfessionalDetail?.professionalDetails?.nurseType ??
              prev.professionalDetails.nurseType ??
              ''
            );
          })(),
          region:
            activeProfessionalDetail?.professionalDetails?.region ??
            prev.professionalDetails.region ??
            '',
          branch:
            activeProfessionalDetail?.professionalDetails?.branch ??
            prev.professionalDetails.branch ??
            '',
          pensionNo:
            activeProfessionalDetail?.professionalDetails?.pensionNo ??
            prev.professionalDetails.pensionNo ??
            '',
          isRetired:
            activeProfessionalDetail?.professionalDetails?.isRetired ??
            prev.professionalDetails.isRetired ??
            false,
          retirementDate:
            activeProfessionalDetail?.professionalDetails?.retirementDate ??
            prev.professionalDetails.retirementDate ??
            '',
          studyLocation:
            activeProfessionalDetail?.professionalDetails?.studyLocation ??
            prev.professionalDetails.studyLocation ??
            '',
          startDate:
            activeProfessionalDetail?.professionalDetails?.startDate ??
            prev.professionalDetails.startDate ??
            '',
          graduationDate:
            activeProfessionalDetail?.professionalDetails?.graduationDate ??
            prev.professionalDetails.graduationDate ??
            '',
          discipline:
            activeProfessionalDetail?.professionalDetails?.discipline ??
            prev.professionalDetails.discipline ??
            '',
        },
      }));

      if (membershipCategory) {
        getCategoryData(membershipCategory, categoryLookups);
      }
    }
  }, [
    activeProfessionalDetail,
    activeProfessionalDetail?.professionalDetails?.membershipCategory,
    getCategoryData,
    categoryLookups,
  ]);

  useEffect(() => {
    if (activeSubscriptionDetail?.applicationId) {
      setIsSubmitted(true);
      setFormData(prev => ({
        ...prev,
        subscriptionDetails: {
          paymentType:
            activeSubscriptionDetail?.subscriptionDetails?.paymentType ||
            prev.subscriptionDetails.paymentType ||
            '',
          payrollNo:
            activeSubscriptionDetail?.subscriptionDetails?.payrollNo ??
            prev.subscriptionDetails.payrollNo ??
            '',
          memberStatus:
            activeSubscriptionDetail?.subscriptionDetails?.membershipStatus ??
            prev.subscriptionDetails.memberStatus ??
            '',
          otherIrishTradeUnion: activeSubscriptionDetail?.subscriptionDetails
            ?.otherIrishTradeUnion
            ? 'yes'
            : prev.subscriptionDetails.otherIrishTradeUnion || 'no',
          otherIrishTradeUnionName:
            activeSubscriptionDetail?.subscriptionDetails
              ?.otherIrishTradeUnionName ??
            prev.subscriptionDetails.otherIrishTradeUnionName ??
            '',
          otherScheme: activeSubscriptionDetail?.subscriptionDetails?.otherScheme
            ? 'yes'
            : prev.subscriptionDetails.otherScheme || 'no',
          recuritedBy:
            activeSubscriptionDetail?.subscriptionDetails?.recuritedBy ??
            prev.subscriptionDetails.recuritedBy ??
            '',
          recuritedByMembershipNo:
            activeSubscriptionDetail?.subscriptionDetails
              ?.recuritedByMembershipNo ??
            prev.subscriptionDetails.recuritedByMembershipNo ??
            '',
          primarySection:
            activeSubscriptionDetail?.subscriptionDetails?.primarySection ||
            prev.subscriptionDetails.primarySection ||
            '',
          otherPrimarySection:
            activeSubscriptionDetail?.subscriptionDetails?.otherPrimarySection ??
            prev.subscriptionDetails.otherPrimarySection ??
            '',
          secondarySection:
            activeSubscriptionDetail?.subscriptionDetails?.secondarySection ||
            prev.subscriptionDetails.secondarySection ||
            '',
          otherSecondarySection:
            activeSubscriptionDetail?.subscriptionDetails?.otherSecondarySection ??
            prev.subscriptionDetails.otherSecondarySection ??
            '',
          incomeProtectionScheme:
            activeSubscriptionDetail?.subscriptionDetails?.incomeProtectionScheme ??
            prev.subscriptionDetails.incomeProtectionScheme ??
            false,
          inmoRewards:
            activeSubscriptionDetail?.subscriptionDetails?.inmoRewards ??
            prev.subscriptionDetails.inmoRewards ??
            false,
          valueAddedServices:
            activeSubscriptionDetail?.subscriptionDetails?.valueAddedServices ??
            prev.subscriptionDetails.valueAddedServices ??
            false,
          termsAndConditions:
            activeSubscriptionDetail?.subscriptionDetails?.termsAndConditions ??
            prev.subscriptionDetails.termsAndConditions ??
            false,
          membershipCategory:
            activeSubscriptionDetail?.subscriptionDetails?.membershipCategory ||
            prev.subscriptionDetails.membershipCategory ||
            '',
          dateJoined:
            activeSubscriptionDetail?.subscriptionDetails?.dateJoined ||
            prev.subscriptionDetails.dateJoined ||
            '',
          paymentFrequency:
            activeSubscriptionDetail?.subscriptionDetails?.paymentFrequency ||
            prev.subscriptionDetails.paymentFrequency ||
            '',
          exclusiveDiscountsAndOffers:
            activeSubscriptionDetail?.subscriptionDetails
              ?.exclusiveDiscountsAndOffers ??
            prev.subscriptionDetails.exclusiveDiscountsAndOffers ??
            false,
          previousMembershipNumber:
            activeSubscriptionDetail?.subscriptionDetails?.previousMembershipNumber ??
            prev.subscriptionDetails.previousMembershipNumber ??
            '',
          joinYouthForum: activeSubscriptionDetail?.subscriptionDetails
            ?.joinYouthForum
            ? 'yes'
            : activeSubscriptionDetail?.subscriptionDetails?.joinYouthForum ===
                false
              ? 'no'
              : prev.subscriptionDetails.joinYouthForum || '',
          youthForum:
            activeSubscriptionDetail?.subscriptionDetails?.youthForum ??
            prev.subscriptionDetails.youthForum ??
            '',
        },
      }));
    }
  }, [activeSubscriptionDetail]);

  // Show modal after subscription detail is created/updated
  useEffect(() => {
    if (shouldShowModal) {
      setIsModalVisible(true);
      setShouldShowModal(false);
    }
  }, [shouldShowModal]);

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, [location.pathname]);

  // Scroll to top when step changes (after initial load)
  useEffect(() => {
    if (isFormInitializing) return;
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, [currentStep, isFormInitializing]);

  const isPageReady = !isFormInitializing && lookupsReady;

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
      mobileNumber: normalizeMobileToE164(data.mobileNo),
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
          const createdPersonal = res?.data?.data ?? res?.data;
          hasRestoredInitialStep.current = true;
          setCurrentStep(2);
          refreshPortalPersonalDetail(
            createdPersonal?.applicationId ? createdPersonal : null,
          );
        } else {
          toast.error(res.data.message ?? 'Unable to add personal detail');
        }
        setIsNextLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong');
        setIsNextLoading(false);
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
      mobileNumber: normalizeMobileToE164(data.mobileNo),
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

    updatePersonalDetailRequest(activeApplicationId, personalInfo)
      .then(res => {
        if (res.status === 200) {
          hasRestoredInitialStep.current = true;
          setCurrentStep(2);
        } else {
          toast.error(res.data.message ?? 'Unable to update personal detail');
        }
        setIsNextLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong');
        setIsNextLoading(false);
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
      // isRetired: data?.membershipCategory === 'MEM-RET',
      retirementDate: data.retirementDate && isDataFormat(data.retirementDate),
      studyLocation: data.studyLocation,
      startDate: data.startDate && isDataFormat(data.startDate),
      graduationDate: data.graduationDate && isDataFormat(data.graduationDate),
      discipline: data.discipline,
    };

    const professionalInfo = { professionalDetails: {} };

    Object.entries(professionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        professionalInfo.professionalDetails[key] = value;
      }
    });

    const applicationId = activeApplicationId ?? personalDetail?.applicationId;

    createProfessionalDetailRequest(
      applicationId,
      professionalInfo,
    )
      .then(res => {
        if (res.status === 200) {
          // Update professional detail and move to next step
          getProfessionalDetail(applicationId);
          setCurrentStep(3);
        } else {
          toast.error(res.data.message ?? 'Unable to add professional detail');
        }
        setIsNextLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong');
        setIsNextLoading(false);
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
      retirementDate: data.retirementDate && isDataFormat(data.retirementDate),
      studyLocation: data.studyLocation,
      startDate: data.startDate && isDataFormat(data.startDate),
      graduationDate: data.graduationDate && isDataFormat(data.graduationDate),
      discipline: data.discipline,
    };

    const professionalInfo = { professionalDetails: {} };

    Object.entries(professionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        professionalInfo.professionalDetails[key] = value;
      }
    });

    updateProfessionalDetailRequest(
      activeApplicationId,
      professionalInfo,
    )
      .then(res => {
        if (res.status === 200) {
          // Update professional detail and move to next step
          getProfessionalDetail(activeApplicationId);
          setCurrentStep(3);
        } else {
          toast.error(
            res.data.message ?? 'Unable to update professional detail',
          );
        }
        setIsNextLoading(false);
      })
      .catch(() => {
        toast.error('Something went wrong');
        setIsNextLoading(false);
      });
  };

  const createSubscriptionDetail = async data => {
    try {
      const defaultFields = {
        membershipCategory:
          activeProfessionalDetail?.professionalDetails?.membershipCategory ||
          formData.professionalDetails?.membershipCategory,
        // dateJoined: "15/01/2025",
        // paymentFrequency: "Monthly",
      };

      const subscriptionFields = {
        paymentType: data?.paymentType,
        payrollNo: data?.payrollNo,
        membershipStatus: data?.memberStatus,
        otherIrishTradeUnion: data?.otherIrishTradeUnion === 'yes',
        otherIrishTradeUnionName: data?.otherIrishTradeUnionName,
        otherScheme: data?.otherScheme === 'yes',
        previousMembershipNumber: data?.previousMembershipNumber,
        joinYouthForum: data?.joinYouthForum === 'yes',
        youthForum: data?.youthForum,
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
        exclusiveDiscountsAndOffers: data?.exclusiveDiscountsAndOffers === true,
        paymentFrequency: data?.paymentFrequency,
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

      const applicationId = activeApplicationId ?? personalDetail?.applicationId;

      const res = await createSubscriptionDetailRequest(
        applicationId,
        subscriptionInfo,
      );

      if (res.status === 200) {
        // Update subscription detail
        getSubscriptionDetail(applicationId);

        // Check if undergraduate student - they don't need payment
        if (categoryData?.name === 'Undergraduate Student') {
          setIsSubmitted(true);
          setStatusModal({
            open: true,
            status: 'success',
            title: 'Application submitted',
            message:
              'Your application has been submitted successfully and is now pending review.',
          });
          setIsNextLoading(false);
        } else {
          // Trigger payment modal for other categories
          setShouldShowModal(true);
          setIsNextLoading(false);
        }
      } else {
        toast.error(res.data.message ?? 'Unable to add subscription detail');
        setIsNextLoading(false);
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
      toast.error('Failed to process subscription. Please try again.');
      setIsNextLoading(false);
    }
  };

  const updateSubscriptionDetail = async data => {
    try {
      const defaultFields = {
        membershipCategory:
          activeProfessionalDetail?.professionalDetails?.membershipCategory ||
          formData.professionalDetails?.membershipCategory,
        // dateJoined: "15/01/2025",
        // paymentFrequency: "Monthly",
      };

      const subscriptionFields = {
        paymentType: data?.paymentType,
        payrollNo: data?.payrollNo,
        membershipStatus: data?.memberStatus,
        otherIrishTradeUnion: data?.otherIrishTradeUnion === 'yes',
        otherIrishTradeUnionName: data?.otherIrishTradeUnionName,
        otherScheme: data?.otherScheme === 'yes',
        previousMembershipNumber: data?.previousMembershipNumber,
        joinYouthForum: data?.joinYouthForum === 'yes',
        youthForum: data?.youthForum,
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
        exclusiveDiscountsAndOffers: data?.exclusiveDiscountsAndOffers === true,
        paymentFrequency: data?.paymentFrequency,
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
        activeApplicationId,
        subscriptionInfo,
      );

      if (res.status === 200) {
        // Update subscription detail
        getSubscriptionDetail(activeApplicationId);

        // Check if undergraduate student - they don't need payment
        if (categoryData?.name === 'Undergraduate Student') {
          setIsSubmitted(true);
          setStatusModal({
            open: true,
            status: 'success',
            message: 'Application updated successfully!',
          });
          setIsNextLoading(false);
        } else {
          // Trigger payment modal for other categories
          setShouldShowModal(true);
          setIsNextLoading(false);
        }
      } else {
        toast.error(res.data.message ?? 'Unable to update subscription detail');
        setIsNextLoading(false);
      }
    } catch (error) {
      console.error('Subscription update failed:', error);
      toast.error('Failed to update subscription. Please try again.');
      setIsNextLoading(false);
    }
  };

  const handleNext = () => {
    setShowValidation(true);
    if (validateCurrentStep()) {
      setIsNextLoading(true);
      if (currentStep === 1) {
        if (!hasActiveApplication) {
          createPersonalDetail(formData.personalInfo);
        } else {
          updatePersonalDetail(formData.personalInfo);
        }
      }
      if (currentStep === 2) {
        if (!activeProfessionalDetail) {
          createProfessionalDetail(formData.professionalDetails);
        } else {
          updateProfessionalDetail(formData.professionalDetails);
        }
      }
      if (currentStep === 3) {
        if (!activeSubscriptionDetail) {
          createSubscriptionDetail(formData.subscriptionDetails);
        } else {
          updateSubscriptionDetail(formData.subscriptionDetails);
        }
        // Modal will be shown by useEffect after subscription is saved (via shouldShowModal)
      }
      // Remove automatic step increment - it will be handled by API success callbacks
      setShowValidation(false);
    } else {
      const missing = getMissingRequiredFields();
      const message =
        missing.length > 0
          ? `Please fill in the required fields: ${missing.join(', ')}`
          : 'Please complete all required fields.';
      toast.error(message);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => {
      const prevStep = Math.max(prev - 1, 1);
      return prevStep;
    });
  };

  const handleStepClick = (stepNumber) => {
    // Allow navigation to:
    // 1. Already completed steps (can go back)
    // 2. Current step (no change)
    // 3. Next step if current step is validated
    if (stepNumber === currentStep) {
      return; // Already on this step
    }
    
    if (stepNumber < currentStep) {
      // Going back to a previous step - always allowed
      setCurrentStep(stepNumber);
      return;
    }
    
    if (stepNumber === currentStep + 1) {
      // Going to next step - validate current step first
      handleNext();
      return;
    }
    
    // Cannot skip steps ahead
    if (stepNumber > currentStep + 1) {
      toast.warning('Please complete the current step before proceeding');
      return;
    }
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
          workEmail,
          mobileNo,
          addressLine1,
          addressLine4,
          preferredAddress,
          preferredEmail,
          countryPrimaryQualification,
        } = formData.personalInfo || {};
        
        // Validate preferredEmail is set
        if (!preferredEmail) {
          return false;
        }
        
        // Validate email field based on preferredEmail selection
        const emailFieldRequired = preferredEmail === 'personal' 
          ? !personalEmail 
          : preferredEmail === 'work' 
            ? !workEmail 
            : true; // If preferredEmail has unexpected value, fail validation
        
        if (
          !title ||
          !forename ||
          !surname ||
          !gender ||
          !dateOfBirth ||
          emailFieldRequired ||
          !mobileNo ||
          !addressLine1 ||
          !addressLine4 ||
          !preferredAddress ||
          !countryPrimaryQualification
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
          discipline,
          studyLocation,
          graduationDate,
          pensionNo,
        } = formData.professionalDetails || {};
        if (!grade || !workLocation || !membershipCategory) {
          return false;
        }
        if (
          membershipCategory ===
          CATEGORY_DISPLAY_NAME_BY_TYPE.undergraduate_student
        ) {
          if (!discipline || !studyLocation || !graduationDate) return false;
        }
        if (
          membershipCategory ===
          CATEGORY_DISPLAY_NAME_BY_TYPE.retired_associate
        ) {
          if (!String(pensionNo || '').trim()) return false;
        }
        if (nursingAdaptationProgramme === 'yes' && !nurseType) {
          return false;
        }
        if (
          nursingAdaptationProgramme === 'no' &&
          membershipCategory !==
            CATEGORY_DISPLAY_NAME_BY_TYPE.undergraduate_student &&
          !String(nmbiNumber || '').trim()
        ) {
          return false;
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
          isSalaryDeductionPaymentType(paymentType) &&
          !formData.subscriptionDetails?.payrollNo
        )
          return false;

        if (
          getPaymentFrequencyCategory(paymentType) &&
          !formData.subscriptionDetails?.paymentFrequency
        ) {
          return false;
        }

        if (!memberStatus) return false;

        if (memberStatus === 'new' || memberStatus === 'graduate') {
          if (!otherIrishTradeUnion || !otherScheme) return false;
          if (
            otherIrishTradeUnion === 'yes' &&
            !String(formData.subscriptionDetails?.otherIrishTradeUnionName || '').trim()
          ) {
            return false;
          }
        }

        const memberAge = calculateAgeFromDateOfBirth(
          formData.personalInfo?.dateOfBirth,
        );
        if (memberAge !== null && memberAge < 35) {
          if (!formData.subscriptionDetails?.joinYouthForum) return false;
          if (
            formData.subscriptionDetails?.joinYouthForum === 'yes' &&
            !formData.subscriptionDetails?.youthForum
          ) {
            return false;
          }
        }

        if (!termsAndConditions) return false;

        // if (memberStatus === 'new' || memberStatus === 'graduate') {
        //   if (!incomeProtectionScheme || !inmoRewards) return false;
        // }
        break;
    }
    return true;
  };

  const getMissingRequiredFields = () => {
    const missing = [];
    switch (currentStep) {
      case 1: {
        const {
          title,
          forename,
          surname,
          gender,
          dateOfBirth,
          personalEmail,
          workEmail,
          mobileNo,
          addressLine1,
          addressLine4,
          preferredAddress,
          preferredEmail,
          countryPrimaryQualification,
        } = formData.personalInfo || {};

        if (!preferredEmail) missing.push('Preferred email');
        if (!title) missing.push('Title');
        if (!forename) missing.push('Forename');
        if (!surname) missing.push('Surname');
        if (!gender) missing.push('Gender');
        if (!dateOfBirth) missing.push('Date of Birth');
        if (preferredEmail === 'personal' && !personalEmail)
          missing.push('Personal email');
        if (preferredEmail === 'work' && !workEmail) missing.push('Work email');
        if (preferredEmail && preferredEmail !== 'personal' && preferredEmail !== 'work' && (!personalEmail && !workEmail))
          missing.push('Preferred email');
        if (!mobileNo) missing.push('Mobile number');
        if (!addressLine1) missing.push('Address Line 1');
        if (!addressLine4) missing.push('Address Line 4');
        if (!preferredAddress) missing.push('Preferred address');
        if (!countryPrimaryQualification)
          missing.push('Country of primary qualification');
        break;
      }
      case 2: {
        const {
          workLocation,
          grade,
          membershipCategory,
          nursingAdaptationProgramme,
          nurseType,
          nmbiNumber,
          discipline,
          studyLocation,
          startDate,
          pensionNo,
        } = formData.professionalDetails || {};

        if (!membershipCategory) missing.push('Membership category');
        if (!workLocation) missing.push('Work location');
        if (!grade) missing.push('Grade');
        if (
          membershipCategory ===
          CATEGORY_DISPLAY_NAME_BY_TYPE.undergraduate_student
        ) {
          if (!discipline) missing.push('Discipline');
          if (!studyLocation) missing.push('Study location');
          if (!startDate) missing.push('Start date');
        }
        if (
          membershipCategory ===
          CATEGORY_DISPLAY_NAME_BY_TYPE.retired_associate
        ) {
          if (!String(pensionNo || '').trim())
            missing.push('Pension number');
        }
        if (nursingAdaptationProgramme === 'yes' && !nurseType) {
          missing.push('Nurse type');
        }
        if (
          nursingAdaptationProgramme === 'no' &&
          membershipCategory !==
            CATEGORY_DISPLAY_NAME_BY_TYPE.undergraduate_student &&
          !String(nmbiNumber || '').trim()
        ) {
          missing.push('NMBI number');
        }
        break;
      }
      case 3: {
        const sub = formData.subscriptionDetails || {};
        if (!sub.paymentType) missing.push('Payment type');
        if (isSalaryDeductionPaymentType(sub.paymentType) && !sub.payrollNo) {
          missing.push('Payroll number');
        }
        if (
          getPaymentFrequencyCategory(sub.paymentType) &&
          !sub.paymentFrequency
        ) {
          missing.push('Payment frequency');
        }
        if (!sub.memberStatus) missing.push('Member status');
        if (sub.memberStatus === 'new' || sub.memberStatus === 'graduate') {
          if (!sub.otherIrishTradeUnion)
            missing.push('Other Irish trade union');
          if (!sub.otherScheme) missing.push('Other scheme');
          if (
            sub.otherIrishTradeUnion === 'yes' &&
            !String(sub.otherIrishTradeUnionName || '').trim()
          ) {
            missing.push('Other Irish trade union name');
          }
        }
        const memberAge = calculateAgeFromDateOfBirth(
          formData.personalInfo?.dateOfBirth,
        );
        if (memberAge !== null && memberAge < 35) {
          if (!sub.joinYouthForum) missing.push('Youth Forum preference');
          if (sub.joinYouthForum === 'yes' && !sub.youthForum) {
            missing.push('Youth Forum selection');
          }
        }
        if (!sub.termsAndConditions) missing.push('Terms and conditions');
        break;
      }
      default:
        break;
    }
    return missing;
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSubscriptionSuccess = async paymentData => {
    console.log('Payment Success Data:', paymentData);

    setIsModalVisible(false);

    const outcome = paymentData?.paymentOutcome;
    setStatusModal({
      open: true,
      status: 'success',
      title: outcome?.title || 'Payment authorised',
      message:
        outcome?.message || APPLICATION_PAYMENT_AUTHORISED_MESSAGE,
    });

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
            categoryData={categoryData}
            dateOfBirth={formData.personalInfo?.dateOfBirth}
            workLocation={formData.professionalDetails?.workLocation}
          />
        );
      default:
        return null;
    }
  };
  console.log('Professional Detail:', professionalDetail);
  console.log('Subscription Detail:', subscriptionDetail);
  console.log('Personal Detail:', personalDetail);

  return (
    <div className="space-y-4" ref={formTopRef}>
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      {isPageReady ? (
        <>
          <div className="flex items-center mb-6 sm:mb-8 px-1 sm:px-8 md:px-12 lg:px-16 overflow-x-auto">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.number || (isSubmitted && step.number === 3);
              const isCurrent = currentStep === step.number;
              const isClickable = isCompleted || isCurrent || step.number === currentStep + 1;
              
              return (
                <React.Fragment key={step.number}>
                  {/* Step Circle and Label */}
                  <button
                    type="button"
                    onClick={() => handleStepClick(step.number)}
                    disabled={!isClickable || isNextLoading}
                    className={`
                      flex flex-col items-center relative flex-shrink-0
                      transition-all duration-200
                      ${isClickable && !isNextLoading
                        ? 'cursor-pointer hover:scale-105 active:scale-95'
                        : 'cursor-not-allowed opacity-60'
                      }
                    `}>
                    <div
                      className={`
                        w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base
                        transition-all duration-200
                        ${
                          isSubmitted && step.number === 3
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-blue-500 text-white'
                              : isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                        }
                        ${isClickable && !isNextLoading && !isCurrent
                          ? 'hover:shadow-lg hover:ring-2 hover:ring-blue-300'
                          : ''
                        }
                      `}>
                      {isSubmitted && step.number === 3
                        ? '✓'
                        : isCompleted
                          ? '✓'
                          : step.number}
                    </div>
                    <p
                      className={`mt-1.5 sm:mt-2 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-medium text-center max-w-[70px] sm:max-w-none leading-tight sm:leading-normal transition-colors duration-200 ${
                        isSubmitted && step.number === 3
                          ? 'text-green-500'
                          : isCurrent
                            ? 'text-blue-500'
                            : isCompleted
                              ? 'text-green-500'
                              : 'text-gray-500'
                      }`}>
                      {step.title}
                    </p>
                  </button>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-1 sm:mx-4 md:mx-6 lg:mx-8 min-w-[30px] sm:min-w-[80px] md:min-w-[100px]">
                      <div
                        className={`
                          h-0.5 w-full transition-colors duration-200
                          ${
                            (isSubmitted && step.number === 2) ||
                            currentStep > step.number
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }
                        `}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {renderStepContent()}

          <div className="flex justify-between sm:justify-end items-center gap-3 mt-6">
            {currentStep > 1 && (
              <Button
                onClick={handlePrevious}
                className="min-w-[120px] sm:min-w-[180px] flex-1 sm:flex-initial">
                <span className="hidden sm:inline">Previous: </span>
                {steps[currentStep - 2]?.title || 'Previous'}
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleNext}
              loading={isNextLoading}
              className="min-w-[120px] sm:min-w-[180px] flex-1 sm:flex-initial">
              {currentStep === steps.length ? (
                'Submit Application'
              ) : (
                <>
                  <span className="hidden sm:inline">Next: </span>
                  {steps[currentStep]?.title || 'Next'}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <Spinner />
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
        title={statusModal.title}
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
