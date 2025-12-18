import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import {
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';
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
import { fetchCategoryByCategoryId } from '../api/category.api';
import { fetchAllLookups } from '../contexts/lookupContext';

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
  } = useApplication();
  const { profileDetail, getProfileDetail } = useProfile();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [appicationLoader, setApplicationLoader] = useState(true);
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

  useEffect(() => {
    getProfileDetail();
    fetchAllLookups();
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

  // Fetch personal detail on mount
  useEffect(() => {
    // Lookups are already fetched by LookupProvider on mount
    // No need to fetch again here to avoid redundant calls
    getPersonalDetail();
  }, []);

  // Check application status
  useEffect(() => {
    // Don't check status if personalDetail is still loading
    if (loading) {
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

            setApplicationStatus(status);
            setApplicationLoader(false);
            if (status === 'submitted' || status === 'approved') {
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
          setApplicationLoader(false);
        }
      } else {
        // No application exists, enable the button
        setApplicationStatus('none');
        setApplicationLoader(false);
      }
    };

    checkApplicationStatus();
  }, [personalDetail?.applicationId, loading]);

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
  useEffect(() => {
    const membershipCategory =
      subscriptionDetail?.subscriptionDetails?.membershipCategory;
    if (membershipCategory) {
      fetchCategoryByCategoryId(membershipCategory)
        .then(res => {
          const payload = res?.data?.data || res?.data;
          console.log('Category Data:', payload);
          setCategoryData(payload);
        })
        .catch(error => {
          console.error('Failed to fetch category data:', error);
        });
    }
  }, [professionalDetail?.professionalDetails?.membershipCategory]);

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
    if (isApplicationSubmitted) {
      return 'Application Submitted';
    }
    return stepToButtonText[currentStep] || 'Continue';
  };

  // Format currency for display
  const formatCurrency = value => {
    const currency = (
      categoryData?.currentPricing?.currency || 'EUR'
    ).toUpperCase();
    try {
      return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
      }).format(value || 0);
    } catch {
      return `€${(value || 0).toFixed(2)}`;
    }
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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
      {/* Welcome Header */}
      <div className="mb-3 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {user?.userFirstName || 'Member'}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Here's a quick overview of your member account.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6">
        {/* Left Column - Application Status & Events */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          {/* Quick Actions Section */}
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {/* Application Action */}
              <QuickActionButton
                title="Application"
                subtitle={
                  applicationStatus === 'approved'
                    ? 'Approved'
                    : applicationStatus === 'submitted'
                      ? 'In Review'
                      : applicationStatus === 'in-progress'
                        ? 'In Progress'
                        : getApplicationButtonText()
                }
                icon={FormOutlined}
                onClick={() => navigate('/applicationForm')}
                disabled={
                  loading ||
                  appicationLoader ||
                  applicationStatus === null ||
                  applicationStatus === 'submitted' ||
                  applicationStatus === 'approved'
                }
                colorScheme={
                  applicationStatus === 'approved'
                    ? 'green'
                    : applicationStatus === 'submitted'
                      ? 'blue'
                      : 'blue'
                }
                loading={appicationLoader}
              />

              {/* Profile Action */}
              <QuickActionButton
                title="My Profile"
                subtitle="View Profile"
                icon={UserOutlined}
                onClick={() => navigate('/profile')}
                colorScheme="purple"
              />

              {/* Events Action */}
              <QuickActionButton
                title="Events"
                subtitle="View Events"
                icon={CalendarOutlined}
                onClick={() => navigate('/events')}
                colorScheme="orange"
              />

              {/* Payments Action */}
              <QuickActionButton
                title="Payments"
                subtitle="Pay Now"
                icon={CreditCardOutlined}
                onClick={handleNext}
                colorScheme="teal"
              />
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Upcoming Events
              </h2>
              <button
                onClick={() => navigate('/events')}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-2.5 sm:space-y-4">
              {/* Event 1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CalendarOutlined className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                    Annual Member Mixer
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    July 15, 2024 @ 6:00 PM
                  </p>
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium">
                  Register
                </button>
              </div>

              {/* Event 2 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CalendarOutlined className="text-blue-600 text-lg sm:text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800">
                    Workshop: Advanced Techniques
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    August 2, 2024 @ 9:00 AM
                  </p>
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Payments */}
        <div className="space-y-3 sm:space-y-6">
          {/* Profile Completion Section */}
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Profile Completion
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mb-2.5 sm:mb-4">
              {isApplicationSubmitted
                ? 'Your profile is complete! Well done.'
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
            <button
              onClick={() =>
                navigate(
                  isApplicationSubmitted ? '/profile' : '/applicationForm',
                )
              }
              className={`w-full px-4 py-2.5 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base ${
                isApplicationSubmitted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              {isApplicationSubmitted ? 'View Profile' : 'Complete Profile'}
            </button>
          </div>

          {/* Payments & Billing Section */}
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Payments & Billing
            </h2>
            <div className="space-y-2.5 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Next Payment Due
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-800">
                  Dec 1, 2025
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {categoryData ? formatCurrency(getPaymentAmount()) : '€0.00'}
                </p>
                {categoryData &&
                  subscriptionDetail?.subscriptionDetails?.paymentType && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {subscriptionDetail.subscriptionDetails.paymentType ===
                      'deduction'
                        ? 'Monthly Payment'
                        : 'Annual Payment'}
                    </p>
                  )}
              </div>
              <button
                onClick={handleNext}
                disabled={!categoryData}
                className={`w-full px-4 py-2.5 sm:py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm sm:text-base ${
                  !categoryData ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                {categoryData ? 'Pay Now' : 'View History'}
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
          membershipCategory={formData.subscriptionDetails.membershipCategory}
        />
      </Elements>
    </div>
  );
};

export default Dashboard;
