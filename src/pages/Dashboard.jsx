import React, { useEffect, useMemo, useState } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import UpcomingEventCard from '../components/dashboard/UpcomingEventCard';
import {
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FormOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { useProfile } from '../contexts/profileContext';
import { Elements } from '@stripe/react-stripe-js';
import {
  PaymentStatusModal,
  DashboardPaymentModal,
} from '../components/modals';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { applicationConfirmationRequest } from '../api/application.api';
import { getAccountNetBalanceRequest } from '../api/account.api';
import { useMemberRole } from '../hooks/useMemberRole';
import { dummyData } from '../services/dummyData';
import { getSubscriptionRequest } from '../api/subscription.api';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const Dashboard = () => {
  const {
    getPersonalDetail,
    currentStep,
    subscriptionDetail,
    setCurrentStep,
    personalDetail,
    professionalDetail,
    getSubscriptionDetail,
    loading,
    categoryData,
    getCategoryData,
    applicationStatus: contextApplicationStatus,
  } = useApplication();
  const { isMember } = useMemberRole();
  const { profileDetail, getProfileDetail } = useProfile();
  const { categoryLookups } = useLookup();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isApplicationActive, setIsApplicationActive] = useState(true);
  const [isResignedMember, setIsResignedMember] = useState(false);
  const [appicationLoader, setApplicationLoader] = useState(true);
  const [accountNetBalance, setAccountNetBalance] = useState(null);
  const [accountNetBalanceLoading, setAccountNetBalanceLoading] =
    useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      forename: user?.userFirstName || '',
      surname: user?.userLastName || '',
      personalEmail: user?.userEmail || '',
      mobileNo: user?.userMobilePhone || '',
      country: 'Ireland',
      consent: false,
    },
    professionalDetails: {},
    subscriptionDetails: {},
  });


  console.log('member number=========>',profileDetail?.membershipNumber)

  // Kick off profile and application data loading together when the dashboard mounts
  useEffect(() => {
    getProfileDetail();
    // Lookups are already fetched by LookupProvider on mount
    // No need to fetch again here to avoid redundant calls
    getPersonalDetail();
  }, []);

  useEffect(() => {
    if (personalDetail?.applicationId) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          title:
            personalDetail?.personalInfo?.title ||
            prev.personalInfo.title ||
            '',
          surname:
            personalDetail?.personalInfo?.surname ||
            prev.personalInfo.surname ||
            user?.userLastName ||
            '',
          forename:
            personalDetail?.personalInfo?.forename ||
            prev.personalInfo.forename ||
            user?.userFirstName ||
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
            user?.userEmail ||
            '',
          mobileNo:
            personalDetail?.contactInfo?.mobileNumber ||
            prev.personalInfo.mobileNo ||
            user?.userMobilePhone ||
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
        },
      }));
    }
  }, [personalDetail?.applicationId]);

  useEffect(() => {
    if (professionalDetail?.applicationId) {
      setFormData(prev => ({
        ...prev,
        professionalDetails: {
          membershipCategory:
            professionalDetail?.professionalDetails?.membershipCategory ||
            prev.professionalDetails.membershipCategory ||
            '',
          workLocation:
            professionalDetail?.professionalDetails?.workLocation ||
            prev.professionalDetails.workLocation ||
            '',
          otherWorkLocation:
            professionalDetail?.professionalDetails?.otherWorkLocation ??
            prev.professionalDetails.otherWorkLocation ??
            '',
          grade:
            professionalDetail?.professionalDetails?.grade ||
            prev.professionalDetails.grade ||
            '',
          otherGrade:
            professionalDetail?.professionalDetails?.otherGrade ??
            prev.professionalDetails.otherGrade ??
            '',
          nmbiNumber:
            professionalDetail?.professionalDetails?.nmbiNumber ??
            prev.professionalDetails.nmbiNumber ??
            '',
          nurseType:
            professionalDetail?.professionalDetails?.nurseType ??
            prev.professionalDetails.nurseType ??
            '',
          nursingAdaptationProgramme: professionalDetail?.professionalDetails
            ?.nursingAdaptationProgramme
            ? 'yes'
            : prev.professionalDetails.nursingAdaptationProgramme || 'no',
          region:
            professionalDetail?.professionalDetails?.region ??
            prev.professionalDetails.region ??
            '',
          branch:
            professionalDetail?.professionalDetails?.branch ??
            prev.professionalDetails.branch ??
            '',
          pensionNo:
            professionalDetail?.professionalDetails?.pensionNo ??
            prev.professionalDetails.pensionNo ??
            '',
          isRetired:
            professionalDetail?.professionalDetails?.isRetired ??
            prev.professionalDetails.isRetired ??
            false,
          retiredDate:
            professionalDetail?.professionalDetails?.retiredDate ??
            prev.professionalDetails.retiredDate ??
            '',
          studyLocation:
            professionalDetail?.professionalDetails?.studyLocation ??
            prev.professionalDetails.studyLocation ??
            '',
          graduationDate:
            professionalDetail?.professionalDetails?.graduationDate ??
            prev.professionalDetails.graduationDate ??
            '',
        },
      }));
    }
  }, [professionalDetail?.applicationId]);

  useEffect(() => {
    if (subscriptionDetail?.applicationId) {
      setFormData(prev => ({
        ...prev,
        subscriptionDetails: {
          paymentType:
            subscriptionDetail?.subscriptionDetails?.paymentType ||
            prev.subscriptionDetails.paymentType ||
            '',
          payrollNo:
            subscriptionDetail?.subscriptionDetails?.payrollNo ??
            prev.subscriptionDetails.payrollNo ??
            '',
          memberStatus:
            subscriptionDetail?.subscriptionDetails?.membershipStatus ??
            prev.subscriptionDetails.memberStatus ??
            '',
          otherIrishTradeUnion: subscriptionDetail?.subscriptionDetails
            ?.otherIrishTradeUnion
            ? 'yes'
            : prev.subscriptionDetails.otherIrishTradeUnion || 'no',
          otherScheme: subscriptionDetail?.subscriptionDetails?.otherScheme
            ? 'yes'
            : prev.subscriptionDetails.otherScheme || 'no',
          recuritedBy:
            subscriptionDetail?.subscriptionDetails?.recuritedBy ??
            prev.subscriptionDetails.recuritedBy ??
            '',
          recuritedByMembershipNo:
            subscriptionDetail?.subscriptionDetails?.recuritedByMembershipNo ??
            prev.subscriptionDetails.recuritedByMembershipNo ??
            '',
          primarySection:
            subscriptionDetail?.subscriptionDetails?.primarySection ||
            prev.subscriptionDetails.primarySection ||
            '',
          otherPrimarySection:
            subscriptionDetail?.subscriptionDetails?.otherPrimarySection ??
            prev.subscriptionDetails.otherPrimarySection ??
            '',
          secondarySection:
            subscriptionDetail?.subscriptionDetails?.secondarySection ||
            prev.subscriptionDetails.secondarySection ||
            '',
          otherSecondarySection:
            subscriptionDetail?.subscriptionDetails?.otherSecondarySection ??
            prev.subscriptionDetails.otherSecondarySection ??
            '',
          incomeProtectionScheme:
            subscriptionDetail?.subscriptionDetails?.incomeProtectionScheme ??
            prev.subscriptionDetails.incomeProtectionScheme ??
            false,
          inmoRewards:
            subscriptionDetail?.subscriptionDetails?.inmoRewards ??
            prev.subscriptionDetails.inmoRewards ??
            false,
          valueAddedServices:
            subscriptionDetail?.subscriptionDetails?.valueAddedServices ??
            prev.subscriptionDetails.valueAddedServices ??
            false,
          termsAndConditions:
            subscriptionDetail?.subscriptionDetails?.termsAndConditions ??
            prev.subscriptionDetails.termsAndConditions ??
            false,
          membershipCategory:
            subscriptionDetail?.subscriptionDetails?.membershipCategory ||
            prev.subscriptionDetails.membershipCategory ||
            '',
          dateJoined:
            subscriptionDetail?.subscriptionDetails?.dateJoined ||
            prev.subscriptionDetails.dateJoined ||
            '',
          paymentFrequency:
            subscriptionDetail?.subscriptionDetails?.paymentFrequency ||
            prev.subscriptionDetails.paymentFrequency ||
            '',
        },
      }));
    }
  }, [subscriptionDetail?.applicationId]);

  // Fetch category data when subscription detail is available
  useEffect(() => {
    if (
      subscriptionDetail?.subscriptionDetails?.membershipCategory &&
      categoryLookups?.length > 0
    ) {
      getCategoryData(
        subscriptionDetail.subscriptionDetails.membershipCategory,
        categoryLookups,
      );
    }
  }, [
    subscriptionDetail?.subscriptionDetails?.membershipCategory,
    categoryLookups,
  ]);

  // Check application status (use context when available from aggregated CRM response, else fetch)
  useEffect(() => {
    if (loading) {
      return;
    }

    if (contextApplicationStatus != null) {
      setApplicationStatus(contextApplicationStatus);
      setIsApplicationActive(true);
      setIsApplicationSubmitted(
        contextApplicationStatus === 'submitted' ||
          contextApplicationStatus === 'approved',
      );
      setApplicationLoader(false);
      return;
    }

    const checkApplicationStatus = async () => {
      if (personalDetail?.applicationId) {
        try {
          setApplicationLoader(true);
          const response = await applicationConfirmationRequest(
            personalDetail.applicationId,
          );
          console.log('Application Status Response:', response);

          if (
            response?.status === 200 ||
            response?.data?.status === 'success'
          ) {
            const status =
              response?.data?.data?.applicationStatus ||
              response?.data?.applicationStatus;
            const isActive =
              response?.data?.data?.meta?.isActive ??
              response?.data?.meta?.isActive ??
              true;

            setApplicationStatus(status);
            setIsApplicationActive(Boolean(isActive));
            setApplicationLoader(false);
            if (isActive && (status === 'submitted' || status === 'approved')) {
              setIsApplicationSubmitted(true);
            } else {
              setIsApplicationSubmitted(false);
            }
          } else {
            setApplicationLoader(false);
          }
        } catch (error) {
          console.error('Failed to fetch application status:', error);
          setIsApplicationSubmitted(false);
          setApplicationStatus(null);
          setIsApplicationActive(true);
          setApplicationLoader(false);
        }
      } else {
        setApplicationStatus('none');
        setIsApplicationActive(true);
        setApplicationLoader(false);
      }
    };

    checkApplicationStatus();
  }, [personalDetail?.applicationId, loading, contextApplicationStatus]);

  // Fetch account statement when member has membership number
  useEffect(() => {
    const memberId = profileDetail?.membershipNumber;
    if (!memberId) {
      return;
    }
    setAccountNetBalanceLoading(true);
    getAccountNetBalanceRequest(memberId)
      .then(res => {
        if (res?.status === 200 && res?.data?.data) {
          setAccountNetBalance(res.data.data);
        }
      })
      .catch(() => {
        setAccountNetBalance(null);
      })
      .finally(() => {
        setAccountNetBalanceLoading(false);
      });
  }, [profileDetail?.membershipNumber, isMember]);

  useEffect(() => {
    const profileId = profileDetail?.profileId;
    if (!profileId) {
      setIsResignedMember(false);
      return;
    }

    getSubscriptionRequest(profileId)
      .then(res => {
        const subscriptions = res?.data?.data?.data || [];
        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
          setIsResignedMember(false);
          return;
        }

        const sortedSubscriptions = [...subscriptions].sort((a, b) => {
          const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
          const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
          return bTime - aTime;
        });

        const latestSubscription = sortedSubscriptions[0];
        const isResigned =
          String(latestSubscription?.subscriptionStatus || '').toLowerCase() ===
          'resigned';
        setIsResignedMember(isResigned);
      })
      .catch(() => {
        setIsResignedMember(false);
      });
  }, [profileDetail?.profileId]);

  // Update current step based on application progress
  useEffect(() => {
    // Only set step after data is fully loaded
    if (loading) return;

    if (!personalDetail?.applicationId) {
      setCurrentStep(1);
    } else if (
      personalDetail?.applicationId &&
      !professionalDetail?.applicationId
    ) {
      setCurrentStep(2);
    } else if (
      personalDetail?.applicationId &&
      professionalDetail?.applicationId &&
      !subscriptionDetail?.applicationId
    ) {
      setCurrentStep(3);
    } else if (
      personalDetail?.applicationId &&
      professionalDetail?.applicationId &&
      subscriptionDetail?.applicationId
    ) {
      setCurrentStep(3);
    }
  }, [
    loading,
    personalDetail?.applicationId,
    professionalDetail?.applicationId,
    subscriptionDetail?.applicationId,
  ]);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSubscriptionSuccess = paymentData => {
    console.log('Payment Success from Dashboard:', paymentData);
    setIsModalVisible(false);
    setStatusModal({
      open: true,
      status: 'success',
      message: 'Payment completed successfully!',
    });
  };

  const handleSubscriptionFailure = errorMessage => {
    setIsModalVisible(false);
    setStatusModal({ open: true, status: 'error', message: errorMessage });
    setTimeout(() => {
      setStatusModal({ open: false, status: 'error', message: '' });
      // navigate('/');
    }, 2500);
  };

  const handleNext = () => {
    // Check if payment modal should be shown
    // Skip for undergraduate students based on category code
    const isUndergraduateStudent =
      categoryData?.code === 'undergraduate_student';

    if (currentStep === 3 && !isUndergraduateStudent) {
      setIsModalVisible(true);
    }
  };

  const stepToButtonText = {
    1: 'Start Application',
    2: 'Resume Application',
    3: 'Application Completed',
  };

  // Get button text based on application status
  const getApplicationButtonText = () => {
    if (!isApplicationActive) {
      return 'Start Application';
    }
    if (applicationStatus === 'rejected') {
      return 'Re-apply';
    }
    if (isApplicationSubmitted) {
      return 'Application Submitted';
    }
    return stepToButtonText[currentStep] || 'Continue';
  };

  // Format currency for display (use cents → euros logic like SubscriptionDetails)
  const formatCurrency = valueInCents => {
    const currency = (
      categoryData?.currentPricing?.currency || 'EUR'
    ).toUpperCase();

    if (!valueInCents || valueInCents === 0) {
      return currency === 'EUR' ? '€0.00' : `${currency}0.00`;
    }

    const amountInEuros = valueInCents / 100;
    const currencySymbol = currency === 'EUR' ? '€' : currency;

    return `${currencySymbol}${amountInEuros.toFixed(2)}`;
  };

  // Get payment amount based on payment type
  const getPaymentAmount = () => {
    if (!categoryData?.currentPricing?.price) return 0;
    const priceInEuros = categoryData.currentPricing.price / 100;

    // If payment type is set in subscription details
    const paymentType = subscriptionDetail?.subscriptionDetails?.paymentType;
    if (paymentType === 'deduction') {
      // Monthly payment (divide by 12 for monthly)
      return priceInEuros / 12;
    }

    // Default to annual price
    return priceInEuros;
  };

  // Calculate profile completion percentage based on application steps
  const getProfileCompletion = () => {
    // If application is submitted, profile is 100% complete
    if (isApplicationSubmitted) {
      return 100;
    }

    let completionPercentage = 0;

    // Step 1: Personal Detail completed = 33%
    if (personalDetail?.applicationId) {
      completionPercentage = 33;
    }

    // Step 2: Professional Detail completed = 67%
    if (professionalDetail?.applicationId) {
      completionPercentage = 67;
    }

    // Step 3: Subscription Detail completed (not submitted yet) = 90%
    if (subscriptionDetail?.applicationId) {
      completionPercentage = 90;
    }

    return completionPercentage;
  };

  const applicationQuickActionState = useMemo(
    () => {
      const subtitle =
        !isApplicationActive
          ? 'Start Application'
          : applicationStatus === 'approved'
          ? 'Approved'
          : applicationStatus === 'submitted'
          ? 'In Review'
          : applicationStatus === 'in-progress'
          ? 'In Progress'
          : applicationStatus === 'rejected'
          ? 'Start Application'
          : getApplicationButtonText();

      const disabled =
        loading ||
        appicationLoader ||
        applicationStatus === null ||
        (isApplicationActive &&
          (applicationStatus === 'submitted' ||
            applicationStatus === 'approved'));

      const colorScheme =
        !isApplicationActive
          ? 'blue'
          : applicationStatus === 'approved'
          ? 'green'
          : applicationStatus === 'submitted'
          ? 'blue'
          : applicationStatus === 'rejected'
          ? 'red'
          : 'blue';

      return { subtitle, disabled, colorScheme };
    },
    [
      applicationStatus,
      isApplicationActive,
      loading,
      appicationLoader,
      isApplicationSubmitted,
      currentStep,
      personalDetail?.applicationId,
      professionalDetail?.applicationId,
      subscriptionDetail?.applicationId,
    ],
  );

  const upcomingEvents = useMemo(
    () =>
      (dummyData?.events || [])
        .filter(event => event?.type?.toLowerCase() === 'upcoming')
        .slice(0, 3),
    [],
  );

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 lg:px-8 sm:py-6">
      {/* Welcome Header */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {user?.userFirstName || user?.fullName || 'Member'}!
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Here's a quick overview of your member account.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        {/* Left Column - Application Status & Events */}
        <div className="space-y-4 lg:col-span-2 sm:space-y-6">
          {/* Quick Actions Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-4 sm:text-xl">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              {/* Application Action */}
              <QuickActionButton
                title="Application"
                subtitle={applicationQuickActionState.subtitle}
                icon={FormOutlined}
                onClick={() => navigate('/applicationForm')}
                disabled={applicationQuickActionState.disabled}
                colorScheme={applicationQuickActionState.colorScheme}
              />

              {/* Profile Action - show when member */}
              {isMember && (
                <QuickActionButton
                  title="My Profile"
                  subtitle="View Profile"
                  icon={UserOutlined}
                  onClick={() => navigate('/profile')}
                  colorScheme="purple"
                />
              )}

              {/* Events Action */}
              <QuickActionButton
                title="Events"
                subtitle="View Events"
                icon={CalendarOutlined}
                onClick={() => navigate('/events')}
                colorScheme="orange"
              />

              {/* Payments Action */}
              {isMember && (
                <QuickActionButton
                  title="Payments"
                  subtitle="Pay Now"
                  icon={CreditCardOutlined}
                  onClick={handleNext}
                  colorScheme="teal"
                  disabled={
                  (typeof accountNetBalance?.net === 'number' &&
                    accountNetBalance.net <= 0)}
                />
              )}
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Upcoming Events
              </h2>
              <button
                onClick={() => navigate('/events')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 sm:text-sm">
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <UpcomingEventCard
                    key={event.id}
                    event={event}
                    onOpenDetail={setSelectedEvent}
                    onRegister={() => navigate('/events')}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600">
                  No upcoming events available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Payments */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Completion Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-4 sm:text-xl">
              Profile Completion
            </h2>
            <p className="mb-2.5 text-xs text-slate-600 sm:mb-4 sm:text-sm">
              {isApplicationSubmitted
                ? 'Your profile is complete! Well done.'
                : applicationStatus === 'rejected'
                ? 'Your application was rejected. Please re-apply to continue.'
                : 'Complete your profile to get the most out of your membership.'}
            </p>
            <div className="mb-2.5 sm:mb-4">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span
                  className={`text-xl sm:text-2xl font-bold ${
                    getProfileCompletion() === 100
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                  {getProfileCompletion()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    getProfileCompletion() === 100
                      ? 'bg-green-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${getProfileCompletion()}%` }}></div>
              </div>
            </div>
            {isMember && (
              <button
                disabled={
                  loading || appicationLoader || applicationStatus === null
                }
                onClick={() =>
                  navigate(
                    isApplicationSubmitted ? '/profile' : '/applicationForm',
                    !isApplicationSubmitted && isResignedMember
                      ? { state: { startFresh: true } }
                      : undefined,
                  )
                }
                className={`w-full px-4 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base ${
                  loading || appicationLoader || applicationStatus === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : isApplicationSubmitted
                      ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}>
                {isApplicationSubmitted
                  ? 'View Profile'
                  : applicationStatus === 'rejected'
                  ? 'Re-apply'
                  : 'Complete Profile'}
              </button>
            )}
          </div>

          {/* Payments & Billing Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 sm:mb-4 sm:text-xl">
              Payments & Billing
            </h2>
            <div className="space-y-2.5 sm:space-y-4">
              {profileDetail?.membershipNumber && (
                <div className="rounded-lg bg-slate-50 p-4 text-right">
                  <p className="mb-1 text-xs text-slate-600 sm:text-sm">
                    Net Balance
                    {accountNetBalance?.year && (
                      <span className="ml-1">({accountNetBalance.year})</span>
                    )}
                  </p>
                  {accountNetBalanceLoading ? (
                    <p className="animate-pulse text-2xl font-bold text-slate-500 sm:text-3xl">
                      Loading...
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-blue-600 sm:text-3xl">
                      {formatCurrency(accountNetBalance?.net ?? 0)}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={handleNext}
                disabled={
                  !isMember ||
                  accountNetBalanceLoading ||
                  (typeof accountNetBalance?.net === 'number' &&
                    accountNetBalance.net <= 0)
                }
                className={`w-full px-4 py-2.5 sm:py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base ${
                  !isMember ||
                  accountNetBalanceLoading ||
                  (typeof accountNetBalance?.net === 'number' &&
                    accountNetBalance.net <= 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}>
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>

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

      <Elements stripe={stripePromise}>
        <DashboardPaymentModal
          isVisible={isModalVisible}
          onClose={handleModalClose}
          onSuccess={handleSubscriptionSuccess}
          onFailure={handleSubscriptionFailure}
          formData={formData}
          membershipCategory={formData?.subscriptionDetails?.membershipCategory}
          netAmountInCents={accountNetBalance?.net ?? 0}
        />
      </Elements>

      <div>
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              {selectedEvent.image && (
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title || 'Event'}
                  className="mb-4 h-44 w-full rounded-lg object-cover"
                />
              )}
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                {selectedEvent.description || 'No additional details available.'}
              </p>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-600" />
                  <span>{selectedEvent.date || 'Date TBD'}</span>
                </p>
                {selectedEvent.time && (
                  <p className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-blue-600" />
                    <span>{selectedEvent.time}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-600" />
                  <span>{selectedEvent.location || 'Location TBD'}</span>
                </p>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    navigate('/events');
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
