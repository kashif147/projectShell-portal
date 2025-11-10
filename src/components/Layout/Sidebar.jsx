import React, { useState } from 'react';
import { Menu, Drawer } from 'antd';
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
  MenuOutlined,
} from '@ant-design/icons';

const Sidebar = ({ collapsed, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

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

  // Mobile bottom tab items - only show 4 main items + More button
  const mobileTabItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: 'Payments',
    },
  ];

  // Items shown in "More" menu
  const moreMenuItems = [
    {
      key: '/application',
      icon: <FormOutlined />,
      label: 'Application',
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

  // Mobile Bottom Navigation Bar
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          <div className="flex justify-around items-center h-16 px-2">
            {mobileTabItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  <div className={`text-xl mb-1 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full" />
                  )}
                </button>
              );
            })}
            
            {/* More Menu Button */}
            <button
              onClick={() => setMoreMenuVisible(true)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-gray-600"
            >
              <div className="text-xl mb-1">
                <MenuOutlined />
              </div>
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>

        {/* More Menu Drawer */}
        <Drawer
          title={
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <p className="text-sm text-gray-500">More options</p>
            </div>
          }
          placement="bottom"
          onClose={() => setMoreMenuVisible(false)}
          open={moreMenuVisible}
          height="70vh"
          closable={true}
          bodyStyle={{ padding: '16px 0' }}
        >
          <div className="grid grid-cols-3 gap-4 px-4">
            {moreMenuItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.key);
                    setMoreMenuVisible(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                      : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className={`text-3xl mb-2 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Drawer>
      </>
    );
  }

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
