import React from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  CreditCardOutlined,
  FormOutlined,
} from '@ant-design/icons';

const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome to Members Portal</h1>
      <p className="text-gray-600 mb-8">Access all your membership services in one place</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Application"
          description="Start or continue your membership application"
          icon={<FormOutlined />}
          link="/application"
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
          title="Communications"
          description="View latest announcements and messages"
          icon={<MessageOutlined />}
          link="/communications"
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

export default Home; 