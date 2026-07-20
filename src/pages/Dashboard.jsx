import React, { useEffect, useMemo, useState } from 'react';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import UpcomingEventCard from '../components/dashboard/UpcomingEventCard';
import ProfileCompletionCard from '../components/dashboard/ProfileCompletionCard';
import PaymentsBillingCard from '../components/dashboard/PaymentsBillingCard';
import EventDetailModal from '../components/dashboard/EventDetailModal';
import {
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FormOutlined,
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
import {
  detailBelongsToApplication,
  getApplicationCompletionPercentage,
  isActiveApplicationPersonalDetail,
  isResumablePortalApplication,
  resolveApplicationId,
} from '../helpers/applicationPayload.helper';
import {
  STRIPE_PUBLISHABLE_KEY,
  INITIAL_STATUS_MODAL,
  createInitialDashboardFormData,
  buildDashboardPersonalInfo,
  buildDashboardProfessionalDetails,
  buildDashboardSubscriptionDetails,
  resolvePersonalDetailActive,
  buildApplicationStatusState,
  parseApplicationConfirmationResponse,
  resolveApplicationStep,
  isLatestSubscriptionResigned,
  getApplicationQuickActionState,
  formatCentsCurrency,
  getProfileCompletionCopy,
  shouldOpenPaymentModal,
  isPayDisabled,
  getUpcomingEvents,
  buildPaymentSuccessModal,
} from '../helpers/dashboard.helper';
import { getAccountNetBalanceRequest } from '../api/account.api';
import { useMemberRole } from '../hooks/useMemberRole';
import { dummyData } from '../services/dummyData';
import { getSubscriptionRequest } from '../api/subscription.api';
import { canAccessProfile } from '../helpers/role.helper';
import '../assets/theme/dashboard.css';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const Dashboard = () => {
  const {
    getPersonalDetail,
    currentStep,
    subscriptionDetail,
    setCurrentStep,
    personalDetail,
    professionalDetail,
    getProfessionalDetail,
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
  const [statusModal, setStatusModal] = useState(INITIAL_STATUS_MODAL);
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isApplicationActive, setIsApplicationActive] = useState(true);
  const [isResignedMember, setIsResignedMember] = useState(false);
  const [appicationLoader, setApplicationLoader] = useState(true);
  const [accountNetBalance, setAccountNetBalance] = useState(null);
  const [accountNetBalanceLoading, setAccountNetBalanceLoading] =
    useState(false);
  const [formData, setFormData] = useState(() =>
    createInitialDashboardFormData(user),
  );

  const applyApplicationStatusState = state => {
    setApplicationStatus(state.applicationStatus);
    setIsApplicationActive(state.isApplicationActive);
    setIsApplicationSubmitted(state.isApplicationSubmitted);
  };

  const applicationId = useMemo(
    () =>
      resolveApplicationId({
        personalDetail,
        professionalDetail,
        subscriptionDetail,
      }),
    [
      personalDetail?.applicationId,
      professionalDetail?.applicationId,
      subscriptionDetail?.applicationId,
    ],
  );

  const activeApplicationId = useMemo(
    () =>
      isResumablePortalApplication(personalDetail, contextApplicationStatus)
        ? personalDetail?.applicationId
        : null,
    [personalDetail, contextApplicationStatus],
  );

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

  useEffect(() => {
    getProfileDetail();
    getPersonalDetail();
  }, []);

  useEffect(() => {
    if (!activeApplicationId) return;
    if (!activeProfessionalDetail) getProfessionalDetail(activeApplicationId);
    if (!activeSubscriptionDetail) getSubscriptionDetail(activeApplicationId);
  }, [
    activeApplicationId,
    activeProfessionalDetail?.applicationId,
    activeSubscriptionDetail?.applicationId,
  ]);

  useEffect(() => {
    if (!applicationId) return;
    setFormData(prev => ({
      ...prev,
      personalInfo: buildDashboardPersonalInfo(
        personalDetail,
        prev.personalInfo,
        user,
      ),
    }));
  }, [
    applicationId,
    personalDetail,
    user?.userLastName,
    user?.userFirstName,
    user?.userEmail,
    user?.userMobilePhone,
  ]);

  useEffect(() => {
    if (!professionalDetail?.applicationId) return;
    setFormData(prev => ({
      ...prev,
      professionalDetails: buildDashboardProfessionalDetails(
        professionalDetail,
        prev.professionalDetails,
      ),
    }));
  }, [professionalDetail?.applicationId]);

  useEffect(() => {
    if (!subscriptionDetail?.applicationId) return;
    setFormData(prev => ({
      ...prev,
      subscriptionDetails: buildDashboardSubscriptionDetails(
        subscriptionDetail,
        prev.subscriptionDetails,
      ),
    }));
  }, [subscriptionDetail?.applicationId]);

  useEffect(() => {
    const membershipCategory =
      subscriptionDetail?.subscriptionDetails?.membershipCategory;
    if (membershipCategory && categoryLookups?.length > 0) {
      getCategoryData(membershipCategory, categoryLookups);
    }
  }, [
    subscriptionDetail?.subscriptionDetails?.membershipCategory,
    categoryLookups,
  ]);

  useEffect(() => {
    if (loading) return;

    if (contextApplicationStatus != null) {
      applyApplicationStatusState(
        buildApplicationStatusState({
          status: contextApplicationStatus,
          isActive: resolvePersonalDetailActive(personalDetail),
        }),
      );
      setApplicationLoader(false);
      return;
    }

    const checkApplicationStatus = async () => {
      if (!applicationId) {
        applyApplicationStatusState(
          buildApplicationStatusState({ status: 'none', isActive: true }),
        );
        setApplicationLoader(false);
        return;
      }

      try {
        setApplicationLoader(true);
        const response = await applicationConfirmationRequest(applicationId);
        if (response?.status === 200 || response?.data?.status === 'success') {
          applyApplicationStatusState(
            parseApplicationConfirmationResponse(
              response,
              resolvePersonalDetailActive(personalDetail),
            ),
          );
        }
      } catch (error) {
        console.error('Failed to fetch application status:', error);
        applyApplicationStatusState(
          buildApplicationStatusState({ status: null, isActive: true }),
        );
      } finally {
        setApplicationLoader(false);
      }
    };

    checkApplicationStatus();
  }, [
    applicationId,
    loading,
    contextApplicationStatus,
    personalDetail?.meta?.isActive,
    personalDetail?.isActive,
  ]);

  const getAccountNetBalance = async () => {
    const memberId = profileDetail?.membershipNumber;
    if (!memberId) return;

    setAccountNetBalanceLoading(true);
    getAccountNetBalanceRequest(memberId)
      .then(res => {
        if (res?.status === 200 && res?.data?.data) {
          setAccountNetBalance(res.data.data);
        }
      })
      .catch(() => setAccountNetBalance(null))
      .finally(() => setAccountNetBalanceLoading(false));
  };

  useEffect(() => {
    getAccountNetBalance();
  }, [profileDetail?.membershipNumber, isMember]);

  useEffect(() => {
    const profileId = profileDetail?.profileId;
    if (!profileId) {
      setIsResignedMember(false);
      return;
    }

    getSubscriptionRequest(profileId)
      .then(res => {
        setIsResignedMember(
          isLatestSubscriptionResigned(res?.data?.data?.data || []),
        );
      })
      .catch(() => setIsResignedMember(false));
  }, [profileDetail?.profileId]);

  useEffect(() => {
    if (loading) return;
    setCurrentStep(
      resolveApplicationStep({
        applicationId,
        professionalId: professionalDetail?.applicationId,
        subscriptionId: subscriptionDetail?.applicationId,
      }),
    );
  }, [
    loading,
    applicationId,
    professionalDetail?.applicationId,
    subscriptionDetail?.applicationId,
  ]);

  const handleModalClose = () => setIsModalVisible(false);

  const handleSubscriptionSuccess = paymentData => {
    setIsModalVisible(false);
    setStatusModal(buildPaymentSuccessModal(paymentData));
  };

  const handleSubscriptionFailure = errorMessage => {
    setIsModalVisible(false);
    setStatusModal({ open: true, status: 'error', message: errorMessage });
    setTimeout(() => {
      setStatusModal({ open: false, status: 'error', message: '' });
    }, 2500);
  };

  const handleNext = () => {
    if (
      shouldOpenPaymentModal({
        isMember,
        currentStep,
        categoryCode: categoryData?.code,
      })
    ) {
      setIsModalVisible(true);
    }
  };

  const showProfile = canAccessProfile({
    isMember,
    applicationStatus: applicationStatus || contextApplicationStatus,
    isActive: personalDetail
      ? isActiveApplicationPersonalDetail(personalDetail)
      : isApplicationActive,
  });

  const formatCurrency = valueInCents =>
    formatCentsCurrency(
      valueInCents,
      categoryData?.currentPricing?.currency || 'EUR',
    );

  const profileCompletion = getApplicationCompletionPercentage({
    personalDetail,
    professionalDetail,
    subscriptionDetail,
    applicationStatus: applicationStatus || contextApplicationStatus,
    isApplicationSubmitted,
  });

  const applicationQuickActionState = useMemo(
    () =>
      getApplicationQuickActionState({
        isApplicationActive,
        applicationStatus,
        loading,
        applicationLoader: appicationLoader,
        isApplicationSubmitted,
        currentStep,
      }),
    [
      applicationStatus,
      isApplicationActive,
      loading,
      appicationLoader,
      isApplicationSubmitted,
      currentStep,
    ],
  );

  const payDisabled = isPayDisabled({
    isMember,
    accountNetBalanceLoading,
    netBalance: accountNetBalance?.net,
  });

  const quickActions = useMemo(
    () =>
      [
        {
          key: 'application',
          title: 'Application',
          subtitle: applicationQuickActionState.subtitle,
          icon: FormOutlined,
          onClick: () => navigate('/applicationForm'),
          disabled: applicationQuickActionState.disabled,
          colorScheme: applicationQuickActionState.colorScheme,
          visible: true,
        },
        {
          key: 'profile',
          title: 'My Profile',
          subtitle: 'View Profile',
          icon: UserOutlined,
          onClick: () => navigate('/profile'),
          colorScheme: 'purple',
          visible: showProfile,
        },
        {
          key: 'events',
          title: 'Events',
          subtitle: 'View Events',
          icon: CalendarOutlined,
          onClick: () => navigate('/events'),
          colorScheme: 'orange',
          visible: true,
        },
        {
          key: 'payments',
          title: 'Payments',
          subtitle: 'Pay Now',
          icon: CreditCardOutlined,
          onClick: handleNext,
          colorScheme: 'teal',
          disabled:
            typeof accountNetBalance?.net === 'number' &&
            accountNetBalance.net <= 0,
          visible: isMember,
        },
      ].filter(action => action.visible),
    [
      applicationQuickActionState,
      showProfile,
      isMember,
      accountNetBalance?.net,
      navigate,
    ],
  );

  const { message: profileCompletionMessage, buttonLabel: profileButtonLabel } =
    getProfileCompletionCopy({ isApplicationSubmitted, applicationStatus });

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(dummyData?.events),
    [],
  );

  const paymentsBillingSection = (
    <PaymentsBillingCard
      membershipNumber={profileDetail?.membershipNumber}
      accountNetBalance={accountNetBalance}
      accountNetBalanceLoading={accountNetBalanceLoading}
      formatCurrency={formatCurrency}
      payDisabled={payDisabled}
      onPay={handleNext}
    />
  );

  return (
    <div className="dashboard-page">
      <div className="page-title-row">
        <h1>
          Welcome back, {user?.userFirstName || user?.fullName || 'Member'}!
        </h1>
        <p>Here's a quick overview of your member account.</p>
      </div>

      <div className="lg:hidden mb-6">{paymentsBillingSection}</div>

      <div className="dash-top-row">
        <div className="section-card">
          <div className="card-head-row">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            {quickActions.map(
              ({ key, title, subtitle, icon, onClick, disabled, colorScheme }) => (
                <QuickActionButton
                  key={key}
                  title={title}
                  subtitle={subtitle}
                  icon={icon}
                  onClick={onClick}
                  disabled={disabled}
                  colorScheme={colorScheme}
                />
              ),
            )}
          </div>
        </div>

        <ProfileCompletionCard
          percent={profileCompletion}
          message={profileCompletionMessage}
          isMember={isMember}
          isComplete={profileCompletion === 100}
          buttonDisabled={
            loading || appicationLoader || applicationStatus === null
          }
          buttonLabel={profileButtonLabel}
          onButtonClick={() =>
            navigate(
              isApplicationSubmitted ? '/profile' : '/applicationForm',
              !isApplicationSubmitted && isResignedMember
                ? { state: { startFresh: true } }
                : undefined,
            )
          }
        />
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <div className="section-card">
            <div className="card-head-row">
              <h2>Upcoming Events</h2>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700">
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

        <div className="dash-col">
          <div className="hidden lg:block">{paymentsBillingSection}</div>
        </div>
      </div>

      <PaymentStatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        subTitle={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, open: false }))}
        onPrimary={() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          getAccountNetBalance();
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

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => {
          setSelectedEvent(null);
          navigate('/events');
        }}
      />
    </div>
  );
};

export default Dashboard;
