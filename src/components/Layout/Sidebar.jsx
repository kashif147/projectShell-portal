import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      key: '/subscriptions',
      icon: <CreditCardOutlined />,
      label: 'Subscriptions',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: 'Payments',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events & CPD',
    },
    {
      key: '/communications',
      icon: <MessageOutlined />,
      label: 'Communications',
    },
    {
      key: '/queries',
      icon: <QuestionCircleOutlined />,
      label: 'Queries & Cases',
    },
    {
      key: '/voting',
      icon: <FileOutlined />,
      label: 'Voting',
    },
    {
      key: '/resources',
      icon: <BookOutlined />,
      label: 'Resources',
    },
  ];

  return (
    <div>
      <div className={`${collapsed ? 'p-4' : 'p-4'} text-white`}>
        <h1 className={`${collapsed ? 'text-center text-xl' : 'text-xl'} font-bold`}>
          {collapsed ? 'MP' : 'MEMBERS PORTAL'}
        </h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ background: '#0A1929' }}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
    </div>
  );
};

export default Sidebar; 