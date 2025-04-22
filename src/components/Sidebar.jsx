import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  BookOutlined,
} from '@ant-design/icons';

const Sidebar = () => {
  return (
    <div className="h-screen bg-[#0A1929] text-white">
      <div className="p-4 text-xl font-bold">MEMBERS PORTAL</div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        style={{ background: '#0A1929' }}
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
          },
          {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'My Profile',
          },
          {
            key: 'subscriptions',
            icon: <CreditCardOutlined />,
            label: 'Subscriptions',
          },
          {
            key: 'payments',
            icon: <CreditCardOutlined />,
            label: 'Payments',
          },
          {
            key: 'events',
            icon: <CalendarOutlined />,
            label: 'Events & CPD',
          },
          {
            key: 'communications',
            icon: <MessageOutlined />,
            label: 'Communications',
          },
          {
            key: 'queries',
            icon: <QuestionCircleOutlined />,
            label: 'Queries & Cases',
          },
          {
            key: 'voting',
            icon: <FileOutlined />,
            label: 'Voting',
          },
          {
            key: 'resources',
            icon: <BookOutlined />,
            label: 'Resources',
          },
        ]}
      />
    </div>
  );
};

export default Sidebar; 