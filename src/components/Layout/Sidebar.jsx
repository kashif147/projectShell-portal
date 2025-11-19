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
      icon: <DashboardOutlined style={{ color: '#3b82f6' }} />,
      label: 'Dashboard',
    },
    {
      key: '/application',
      icon: <FormOutlined style={{ color: '#8b5cf6' }} />,
      label: 'Application',
    },
    {
      key: '/profile',
      icon: <UserOutlined style={{ color: '#06b6d4' }} />,
      label: 'My Profile',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined style={{ color: '#10b981' }} />,
      label: 'Payments',
    },
    {
      key: '/membership',
      icon: <AppstoreOutlined style={{ color: '#f59e0b' }} />,
      label: 'Change of Category',
    },
    {
      key: '/work-location',
      icon: <EnvironmentOutlined style={{ color: '#ef4444' }} />,
      label: 'Transfer Request',
    },
    {
      key: '/subscriptions',
      icon: <CreditCardOutlined style={{ color: '#84cc16' }} />,
      label: 'Subscriptions',
    },
    {
      key: '/events',
      icon: <CalendarOutlined style={{ color: '#ec4899' }} />,
      label: 'Events & CPD',
    },
    {
      key: '/communications',
      icon: <MessageOutlined style={{ color: '#14b8a6' }} />,
      label: 'Communications',
    },
    {
      key: '/queries',
      icon: <QuestionCircleOutlined style={{ color: '#f97316' }} />,
      label: 'Queries & Cases',
    },
    {
      key: '/voting',
      icon: <FileOutlined style={{ color: '#6366f1' }} />,
      label: 'Voting',
    },
    {
      key: '/resources',
      icon: <BookOutlined style={{ color: '#a855f7' }} />,
      label: 'Resources',
    },
  ];

  // Mobile bottom tab items - only show 4 main items + More button
  const mobileTabItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      color: '#3b82f6',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
      color: '#06b6d4',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: 'Events',
      color: '#ec4899',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: 'Payments',
      color: '#10b981',
    },
  ];

  // Items shown in "More" menu
  const moreMenuItems = [
    {
      key: '/application',
      icon: <FormOutlined />,
      label: 'Application',
      color: '#8b5cf6',
    },
    {
      key: '/membership',
      icon: <AppstoreOutlined />,
      label: 'Change of Category',
      color: '#f59e0b',
    },
    {
      key: '/work-location',
      icon: <EnvironmentOutlined />,
      label: 'Transfer Request',
      color: '#ef4444',
    },
    {
      key: '/subscriptions',
      icon: <CreditCardOutlined />,
      label: 'Subscriptions',
      color: '#84cc16',
    },
    {
      key: '/communications',
      icon: <MessageOutlined />,
      label: 'Communications',
      color: '#14b8a6',
    },
    {
      key: '/queries',
      icon: <QuestionCircleOutlined />,
      label: 'Queries & Cases',
      color: '#f97316',
    },
    {
      key: '/voting',
      icon: <FileOutlined />,
      label: 'Voting',
      color: '#6366f1',
    },
    {
      key: '/resources',
      icon: <BookOutlined />,
      label: 'Resources',
      color: '#a855f7',
    },
  ];

  // Mobile Bottom Navigation Bar
  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Safe area padding for devices with bottom notch */}
          <div className="safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-1">
              {mobileTabItems.map((item) => {
                const isActive = location.pathname === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out group"
                  >
                    {/* Active background pill */}
                    {isActive && (
                      <div 
                        className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-10 rounded-2xl transition-all duration-300 opacity-10"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    
                    {/* Icon container with bounce animation */}
                    <div className="relative">
                      <div 
                        className={`text-2xl mb-0.5 transition-all duration-300 ${
                          isActive 
                            ? 'scale-110 -translate-y-0.5' 
                            : 'scale-100 group-active:scale-90'
                        }`}
                        style={{ 
                          color: item.color,
                          opacity: isActive ? 1 : 0.6
                        }}
                      >
                        {item.icon}
                      </div>
                      
                      {/* Active dot indicator */}
                      {isActive && (
                        <div 
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                    </div>
                    
                    {/* Label with fade effect */}
                    <span 
                      className={`text-[10px] font-semibold transition-all duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-70'
                      }`}
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </span>
                    
                    {/* Ripple effect on tap */}
                    <span className="absolute inset-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 transform scale-0 group-active:scale-100 bg-gray-200 rounded-full transition-transform duration-300 opacity-30" />
                    </span>
                  </button>
                );
              })}
              
              {/* More Menu Button with enhanced styling */}
              <button
                onClick={() => setMoreMenuVisible(true)}
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="text-2xl mb-0.5 transition-all duration-300 group-active:scale-90" style={{ color: '#8b5cf6', opacity: 0.7 }}>
                    <MenuOutlined />
                  </div>
                </div>
                <span className="text-[10px] font-semibold opacity-70" style={{ color: '#8b5cf6' }}>
                  More
                </span>
                
                {/* Ripple effect */}
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute inset-0 transform scale-0 group-active:scale-100 bg-gray-200 rounded-full transition-transform duration-300 opacity-30" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* More Menu Drawer - Enhanced */}
        <Drawer
          title={
            <div className="text-center pb-2">
              <h2 className="text-xl font-bold text-gray-900 mb-1">More Options</h2>
              <p className="text-xs text-gray-500">Access all your features</p>
            </div>
          }
          placement="bottom"
          onClose={() => setMoreMenuVisible(false)}
          open={moreMenuVisible}
          height="75vh"
          closable={true}
          bodyStyle={{ 
            padding: '20px 16px', 
            background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
            borderRadius: '24px 24px 0 0'
          }}
          headerStyle={{
            borderBottom: '1px solid #e5e7eb',
            paddingTop: '24px',
            paddingBottom: '16px'
          }}
        >
          <div className="grid grid-cols-3 gap-3 px-2">
            {moreMenuItems.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.key);
                    setMoreMenuVisible(false);
                  }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border-2 group overflow-hidden ${
                    isActive 
                      ? 'shadow-lg transform scale-105' 
                      : 'bg-white shadow-sm hover:shadow-md hover:scale-105 border-gray-100'
                  }`}
                  style={isActive ? {
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}40`
                  } : {}}
                >
                  {/* Background gradient on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  {/* Icon with animation */}
                  <div className="relative z-10">
                    <div 
                      className={`text-3xl mb-2 transition-all duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                      style={{ color: isActive ? item.color : '#6b7280' }}
                    >
                      {item.icon}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="relative z-10 text-[10px] font-semibold text-center leading-tight"
                    style={{ color: isActive ? item.color : '#374151' }}
                  >
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Bottom padding for visual balance */}
          <div className="h-8" />
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
          background-color: #f0f9ff !important;
          color: #1f2937 !important;
        }
        .sidebar-menu .ant-menu-item:hover {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        .sidebar-menu .ant-menu-item-icon {
          font-size: 18px !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
