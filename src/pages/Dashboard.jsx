import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import {
  UserOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';

const Dashboard = () => {
  const {
    getPersonalDetail,
    currentStep,
    subscriptionDetail,
    setCurrentStep,
    personalDetail,
    professionalDetail,
  } = useApplication();

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
          buttonText={stepToButtonText[currentStep] || 'Continue'}
          disabled={currentStep === 3 && subscriptionDetail}
        />
        <DashboardCard
          title="My Profile"
          buttonText={'View My Profile'}
          description="View and update your profile information"
          icon={<UserOutlined />}
          link="/profile"
        />
        <DashboardCard
          title="Events"
          buttonText={'View Events'}
          description="Browse and register for upcoming events"
          icon={<CalendarOutlined />}
          link="/events"
        />
        <DashboardCard
          title="Payments"
          buttonText={'Pay Now'}
          description="Manage your payments and subscriptions"
          icon={<CreditCardOutlined />}
          link={currentStep === 3 && subscriptionDetail ? '/applicationForm' : '/'}
        />
      </div>
    </div>
  );
};

export default Dashboard;
