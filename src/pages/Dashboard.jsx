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
import { PaymentStatusModal, SubscriptionModal } from '../components/modals';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateSubscriptionDetailRequest } from '../api/application.api';

const stripePromise = loadStripe(
  'pk_test_51Rut8HQeJh5X1hcfNrG7yUZjkR9F3jURKHAiz5UCpJiOjaHjfx43ZimY7nJvLT3EvgrUtIMq1nrgwMgo5js7TOL1006raA9kpv',
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
  } = useApplication();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
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
    if (personalDetail) {
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
    }
  }, [professionalDetail]);

  useEffect(() => {
    if (subscriptionDetail) {
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

  useEffect(() => {
    getPersonalDetail();
  }, []);

  console.log('Application ID', personalDetail?.ApplicationId);

  useEffect(() => {
    if (!personalDetail) {
      setCurrentStep(1);
    } else if (personalDetail && !professionalDetail) {
      setCurrentStep(2);
    } else if (personalDetail && professionalDetail && !subscriptionDetail) {
      setCurrentStep(3);
    } else if (personalDetail && professionalDetail && subscriptionDetail) {
      setCurrentStep(3);
    }
  }, [personalDetail, professionalDetail, subscriptionDetail]);

  const updateSubscriptionDetail = data => {
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
    updateSubscriptionDetailRequest(
      personalDetail?.ApplicationId,
      subscriptionInfo,
    )
      .then(res => {
        if (res.status === 200) {
          getSubscriptionDetail();
          setStatusModal({ open: true, status: 'success', message: '' });
          setTimeout(() => {
            setStatusModal({ open: false, status: 'success', message: '' });
          }, 3000);
          // toast.success('Application update successfully');
        } else {
          toast.error(
            res.data.message ?? 'Unable to update subscription detail',
          );
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSubscriptionSuccess = paymentData => {
    if (
      currentStep === 3 &&
      professionalDetail?.professionalDetails?.membershipCategory !==
      'undergraduate_student'
    ) {
      updateSubscriptionDetail(formData.subscriptionDetails);
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Members Portal</h1>
      <p className="text-gray-600 mb-8">
        Access all your membership services in one place
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Application"
          description="Start or continue your membership application"
          icon={<FormOutlined />}
          link="/applicationForm"
          onPress={() => navigate("/applicationForm")}
          buttonText={stepToButtonText[currentStep] || 'Continue'}
          disabled={currentStep === 3 && subscriptionDetail}
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
        <SubscriptionModal
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
