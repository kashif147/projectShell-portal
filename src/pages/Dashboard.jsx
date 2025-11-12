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
import { Elements } from '@stripe/react-stripe-js';
import { PaymentStatusModal, DashboardPaymentModal } from '../components/modals';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  applicationConfirmationRequest 
} from '../api/application.api';
import { fetchCategoryByCategoryId } from '../api/category.api';

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
    loading
  } = useApplication();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [categoryData, setCategoryData] = useState(null);
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
  useEffect(() => {
    if (personalDetail?.ApplicationId) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          title: personalDetail?.personalInfo?.title || prev.personalInfo.title || '',
          surname: personalDetail?.personalInfo?.surname || prev.personalInfo.surname || user?.userLastName || '',
          forename: personalDetail?.personalInfo?.forename || prev.personalInfo.forename || user?.userFirstName || '',
          gender: personalDetail?.personalInfo?.gender || prev.personalInfo.gender || '',
          dateOfBirth: personalDetail?.personalInfo?.dateOfBirth || prev.personalInfo.dateOfBirth || '',
          countryPrimaryQualification:
            personalDetail?.personalInfo?.countryPrimaryQualification || prev.personalInfo.countryPrimaryQualification || '',
          personalEmail: personalDetail?.contactInfo?.personalEmail || prev.personalInfo.personalEmail || user?.userEmail || '',
          mobileNo: personalDetail?.contactInfo?.mobileNumber || prev.personalInfo.mobileNo || user?.userMobilePhone || '',
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
        },
      }));
    }
  }, [personalDetail?.ApplicationId]);

  useEffect(() => {
    if (professionalDetail?.ApplicationId) {
      setFormData(prev => ({
        ...prev,
        professionalDetails: {
          membershipCategory:
            professionalDetail?.professionalDetails?.membershipCategory || prev.professionalDetails.membershipCategory || '',
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
    }
  }, [professionalDetail?.ApplicationId]);

  useEffect(() => {
    if (subscriptionDetail?.ApplicationId) {
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

  // Fetch personal detail on mount
  useEffect(() => {
    getPersonalDetail();
  }, []);

  // Check application status
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (personalDetail?.ApplicationId) {
        try {
          const response = await applicationConfirmationRequest(personalDetail.ApplicationId);
          console.log('Application Status Response:', response);
          
          if (response?.status === 200 || response?.data?.status === 'success') {
            const applicationStatus = response?.data?.data?.applicationStatus || response?.data?.applicationStatus;
            
            if (applicationStatus === 'submitted') {
              setIsApplicationSubmitted(true);
            } else {
              setIsApplicationSubmitted(false);
            }
          }
        } catch (error) {
          console.error('Failed to fetch application status:', error);
          setIsApplicationSubmitted(false);
        }
      }
    };

    checkApplicationStatus();
  }, [personalDetail?.ApplicationId]);

  // Update current step based on application progress
  useEffect(() => {
    if (!personalDetail?.ApplicationId) {
      setCurrentStep(1);
    } else if (personalDetail?.ApplicationId && !professionalDetail?.ApplicationId) {
      setCurrentStep(2);
    } else if (personalDetail?.ApplicationId && professionalDetail?.ApplicationId && !subscriptionDetail?.ApplicationId) {
      setCurrentStep(3);
    } else if (personalDetail?.ApplicationId && professionalDetail?.ApplicationId && subscriptionDetail?.ApplicationId) {
      setCurrentStep(3);
    }
  }, [personalDetail?.ApplicationId, professionalDetail?.ApplicationId, subscriptionDetail?.ApplicationId]);

  // Fetch category data for pricing
  useEffect(() => {
    const membershipCategory = professionalDetail?.professionalDetails?.membershipCategory;
    console.log('MemberShipCategory===========>',membershipCategory)
    if (membershipCategory) {
      fetchCategoryByCategoryId(membershipCategory)
      .then(res => {
          const payload = res?.data?.data || res?.data;
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
      message: 'Payment completed successfully!' 
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
    if (
      currentStep === 3 &&
      professionalDetail?.professionalDetails?.membershipCategory !==
      'undergraduate_student'
    ) {
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
  const formatCurrency = (value) => {
    const currency = (categoryData?.currentPricing?.currency || 'EUR').toUpperCase();
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
    if (personalDetail?.ApplicationId) {
      completionPercentage = 33;
    }

    // Step 2: Professional Detail completed = 67%
    if (professionalDetail?.ApplicationId) {
      completionPercentage = 67;
    }

    // Step 3: Subscription Detail completed (not submitted yet) = 90%
    if (subscriptionDetail?.ApplicationId) {
      completionPercentage = 90;
    }

    return completionPercentage;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.userFirstName || 'Member'}!
        </h1>
        <p className="text-gray-600">
          Here's a quick overview of your member account.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Application Status & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Application Action */}
              <QuickActionButton
          title="Application"
                subtitle={isApplicationSubmitted ? 'Submitted' : getApplicationButtonText()}
                icon={FormOutlined}
                onClick={() => !isApplicationSubmitted && navigate("/applicationForm")}
                // onClick={() => navigate("/applicationForm")}
                disabled={isApplicationSubmitted}
                colorScheme={isApplicationSubmitted ? 'green' : 'blue'}
        />

              {/* Profile Action */}
              <QuickActionButton
          title="My Profile"
                subtitle="View Profile"
                icon={UserOutlined}
                onClick={() => navigate("/profile")}
                colorScheme="purple"
              />

              {/* Events Action */}
              <QuickActionButton
          title="Events"
                subtitle="View Events"
                icon={CalendarOutlined}
                onClick={() => navigate("/events")}
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

          {/* Application Status Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Application Status</h2>
            <div className="space-y-4">
              {/* Application Submitted */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isApplicationSubmitted ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {isApplicationSubmitted ? (
                    <span className="text-blue-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Application Submitted</h3>
                  <p className="text-sm text-gray-500">
                    {isApplicationSubmitted ? 'Completed: June 5, 2024' : 'Not completed yet'}
                  </p>
                </div>
              </div>

              {/* In Review */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isApplicationSubmitted ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <FormOutlined className={`text-sm ${
                    isApplicationSubmitted ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">In Review</h3>
                  <p className="text-sm text-gray-500">
                    {isApplicationSubmitted ? 'Current Stage' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Approved */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                  <span className="text-gray-400">○</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Approved</h3>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <button 
                onClick={() => navigate("/events")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Event 1 */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CalendarOutlined className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Annual Member Mixer</h3>
                  <p className="text-sm text-gray-600">July 15, 2024 @ 6:00 PM</p>
                </div>
                <button 
                  onClick={() => navigate("/events")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Register
                </button>
              </div>

              {/* Event 2 */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CalendarOutlined className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">Workshop: Advanced Techniques</h3>
                  <p className="text-sm text-gray-600">August 2, 2024 @ 9:00 AM</p>
                </div>
                <button 
                  onClick={() => navigate("/events")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Payments */}
        <div className="space-y-6">
          {/* Profile Completion Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
            <p className="text-gray-600 text-sm mb-4">
              {isApplicationSubmitted 
                ? "Your profile is complete! Well done." 
                : "Complete your profile to get the most out of your membership."}
            </p>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl font-bold ${
                  getProfileCompletion() === 100 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {getProfileCompletion()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    getProfileCompletion() === 100 ? 'bg-green-600' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${getProfileCompletion()}%` }}>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate(isApplicationSubmitted ? "/profile" : "/applicationForm")}
              className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                isApplicationSubmitted 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
              {isApplicationSubmitted ? 'View Profile' : 'Complete Profile'}
            </button>
          </div>

          {/* Payments & Billing Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payments & Billing</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Payment Due</p>
                <p className="text-lg font-semibold text-gray-800">Dec 1, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">
                  {categoryData ? formatCurrency(getPaymentAmount()) : '€0.00'}
                </p>
                {categoryData && subscriptionDetail?.subscriptionDetails?.paymentType && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subscriptionDetail.subscriptionDetails.paymentType === 'deduction' 
                      ? 'Monthly Payment' 
                      : 'Annual Payment'}
                  </p>
                )}
              </div>
              <button 
                onClick={handleNext}
                disabled={!categoryData}
                className={`w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium ${
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
          membershipCategory={formData.professionalDetails.membershipCategory}
        />
      </Elements>
    </div>
  );
};

export default Dashboard;
