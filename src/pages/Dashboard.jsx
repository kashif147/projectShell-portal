import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Members Portal</h1>
      <p className="text-gray-600 mb-8">
        Access all your membership services in one place
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Application"
          description={
            isApplicationSubmitted 
              ? "Your application has been successfully submitted" 
              : "Start or continue your membership application"
          }
          icon={<FormOutlined />}
          link="/applicationForm"
          onPress={() => navigate("/applicationForm")}
          buttonText={getApplicationButtonText()}
          disabled={isApplicationSubmitted}
        />
        <DashboardCard
          title="My Profile"
          buttonText={'View My Profile'}
          description="View and update your profile information"
          icon={<UserOutlined />}
          link="/profile"
          onPress={() => navigate("/profile")}
        />
        <DashboardCard
          title="Events"
          buttonText={'View Events'}
          description="Browse and register for upcoming events"
          icon={<CalendarOutlined />}
          link="/events"
          onPress={() => navigate("/events")}
        />
        <DashboardCard
          title="Payments"
          buttonText={'Pay Now'}
          description="Manage your payments and subscriptions"
          icon={<CreditCardOutlined />}
          onPress={handleNext}
        />
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
