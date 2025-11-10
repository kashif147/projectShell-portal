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
  FormOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
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
      key: '/application',
      icon: <FormOutlined />,
      label: 'Application',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: 'Payments',
    },
    {
      key: '/membership',
      icon: <AppstoreOutlined />,
      label: 'Change of Category',
    },
    {
      key: '/work-location',
      icon: <EnvironmentOutlined />,
      label: 'Transfer Request',
    },
    {
      key: '/subscriptions',
      icon: <CreditCardOutlined />,
      label: 'Subscriptions',
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
    <div className="h-full bg-white flex flex-col">
      <div className={`${collapsed ? 'p-4' : 'p-6'} text-center border-b border-gray-200`}>
        {!collapsed && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Member Portal</h1>
            <p className="text-sm text-gray-500 mt-1">organization.com</p>
          </>
        )}
        {collapsed && <h1 className="text-xl font-bold text-gray-900">MP</h1>}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ 
            background: 'white',
            border: 'none',
            color: '#1f2937'
          }}
          className="sidebar-menu"
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
      </div>
      <div className="border-t border-gray-200 p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate('/help')}
        >
          <QuestionCircleOutlined className="text-lg" />
          {!collapsed && <span className="font-medium">Help Center</span>}
        </div>
      </div>
      <style jsx="true">{`
        .sidebar-menu .ant-menu-item {
          color: #1f2937 !important;
          font-weight: 500;
          margin: 4px 8px;
          border-radius: 8px;
          padding-left: 16px !important;
        }
        .sidebar-menu .ant-menu-item-selected {
          background-color: #dbeafe !important;
          color: #2563eb !important;
        }
        .sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: #2563eb !important;
        }
        .sidebar-menu .ant-menu-item:hover {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        .sidebar-menu .ant-menu-item-icon {
          color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
