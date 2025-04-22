import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const menuItems = [
  { icon: <DashboardOutlined />, label: 'Dashboard', path: '/dashboard' },
  { icon: <UserOutlined />, label: 'My Profile', path: '/profile' },
  { icon: <CreditCardOutlined />, label: 'Subscriptions', path: '/subscriptions' },
  { icon: <CreditCardOutlined />, label: 'Payments', path: '/payments' },
  { icon: <CalendarOutlined />, label: 'Events & CPD', path: '/events' },
  { icon: <MessageOutlined />, label: 'Communications', path: '/communications' },
  { icon: <QuestionCircleOutlined />, label: 'Queries & Cases', path: '/queries' },
  { icon: <TeamOutlined />, label: 'Voting', path: '/voting' },
  { icon: <FileOutlined />, label: 'Resources', path: '/resources' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-[#0A1F44] min-h-screen text-white p-4">
      <div className="text-xl font-bold mb-8 p-2">MEMBERS PORTAL</div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg mb-2 hover:bg-blue-800 transition-colors ${
              location.pathname === item.path ? 'bg-blue-800' : ''
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 