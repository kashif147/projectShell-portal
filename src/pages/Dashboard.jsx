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
  // const { getPersonalDetail } = useApplication()
  const [hasInProgressApplication, setHasInProgressApplication] = useState(false);

  // useEffect(() => {
  //   getPersonalDetail()
  // }, [])

  useEffect(() => {
    const savedData = localStorage.getItem('applicationFormData');
    const savedStep = localStorage.getItem('applicationCurrentStep');
    setHasInProgressApplication(!!(savedData && savedStep));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Members Portal</h1>
      <p className="text-gray-600 mb-8">
        Access all your membership services in one place
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Let's get started"
          description="Start or continue your membership application"
          icon={<FormOutlined />}
          link="/application"
          buttonText={hasInProgressApplication ? 'Resume Application' : 'Start Application'}
        />
        <DashboardCard
          title="My Profile"
          description="View and update your profile information"
          icon={<UserOutlined />}
          link="/profile"
        />
        <DashboardCard
          title="Events"
          description="Browse and register for upcoming events"
          icon={<CalendarOutlined />}
          link="/events"
        />
        <DashboardCard
          title="Payments"
          description="Manage your payments and subscriptions"
          icon={<CreditCardOutlined />}
          link="/payments"
        />
      </div>
    </div>
  );
};

export default Dashboard;
