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
import { Logo } from '../../assets/images';
import { useMemberRole } from '../../hooks/useMemberRole';

const Sidebar = ({ collapsed, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const { isMember } = useMemberRole();
  const MEMBER_ONLY_KEYS = ['/payments/method', '/membership', '/work-location', '/queries', '/voting', '/communications'];

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
      key: '/payments/method',
      icon: <CreditCardOutlined style={{ color: '#3b82f6' }} />,
      label: 'Payment Method',
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
      key: '/courses',
      icon: <BookOutlined style={{ color: '#2563eb' }} />,
      label: 'Courses',
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
  ].filter(item => !(item.key === '/profile' && !isMember) && !(MEMBER_ONLY_KEYS.includes(item.key) && !isMember));

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
  ].filter(item => !(item.key === '/profile' && !isMember) && !(MEMBER_ONLY_KEYS.includes(item.key) && !isMember));

  // Items shown in "More" menu
  const moreMenuItems = [
    {
      key: '/application',
      icon: <FormOutlined />,
      label: 'Application',
      color: '#8b5cf6',
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: 'Courses',
      color: '#2563eb',
    },
    {
      key: '/payments/method',
      icon: <CreditCardOutlined />,
      label: 'Payment Method',
      color: '#3b82f6',
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
  ].filter(item => !(MEMBER_ONLY_KEYS.includes(item.key) && !isMember));

  // Mobile tab bar colors (match mobile app: white bar, black inactive, primary active + underline)
  const MOBILE_PRIMARY = '#3A7BF6';
  const MOBILE_INACTIVE = '#1A1A1A';

  // Mobile Bottom Navigation Bar
  if (isMobile) {
    return (
      <>
        <div className="sidebar-mobile-nav fixed bottom-0 left-0 right-0 border-t border-blue-100 bg-gradient-to-r from-white via-blue-50 to-indigo-50 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-1">
              {mobileTabItems.map((item) => {
                const isActive = location.pathname === item.key;
                const iconAndLabelColor = isActive ? MOBILE_PRIMARY : MOBILE_INACTIVE;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    className="relative flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
                  >
                    <div className="text-xl mb-0.5" style={{ color: iconAndLabelColor }}>
                      {item.icon}
                    </div>
                    <span
                      className="text-[10px] transition-colors duration-200"
                      style={{
                        color: iconAndLabelColor,
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{ backgroundColor: MOBILE_PRIMARY }}
                      />
                    )}
                  </button>
                );
              })}

              {/* More Menu Button - same inactive style as other tabs */}
              <button
                onClick={() => setMoreMenuVisible(true)}
                className="relative flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200"
              >
                <div className="text-xl mb-0.5" style={{ color: MOBILE_INACTIVE }}>
                  <MenuOutlined />
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: MOBILE_INACTIVE }}
                >
                  More
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
            background: 'linear-gradient(to bottom, #f8fbff, #eef4ff)',
            borderRadius: '24px 24px 0 0'
          }}
          headerStyle={{
            borderBottom: '1px solid #dbeafe',
            paddingTop: '24px',
            paddingBottom: '16px',
            background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
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
                  className="relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 group overflow-hidden bg-white shadow-sm hover:shadow-xl border border-gray-100 hover:border-transparent"
                >
                  {/* Animated gradient background on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}80 100%)`
                    }}
                  />
                  
                  {/* Icon container with gradient background and shadow */}
                  <div className="relative z-10 mb-3">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md group-hover:shadow-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        boxShadow: `0 4px 12px ${item.color}40`
                      }}
                    >
                      <div className="text-2xl text-white">
                      {item.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Label with better typography */}
                  <span className="relative z-10 text-[11px] font-semibold text-center leading-tight text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item.label}
                  </span>
                  
                  {/* Active indicator with glow */}
                  {isActive && (
                    <>
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}`
                        }}
                      />
                      <div 
                        className="absolute inset-0 rounded-2xl border-2 animate-pulse"
                        style={{ borderColor: `${item.color}60` }}
                    />
                    </>
                  )}
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
    <div className="sidebar-shell h-full bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/50 flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 -left-20 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className={`sidebar-header ${collapsed ? 'p-4' : 'p-6'} text-center border-b border-blue-100/80 transition-all duration-300`}>
        <div className="flex flex-col items-center justify-center">
          {/* Logo with smooth transitions */}
          <div
            className={`relative transition-all duration-300 mb-3 ${
              collapsed ? 'w-12 h-12' : 'w-20 h-20'
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-white/80 ring-1 ring-blue-100 shadow-sm" />
            <img
              src={Logo}
              alt="Logo"
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
          </div>
          
          {/* Title and subtitle - only show when not collapsed */}
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Member Portal</h1>
              <p className="text-sm text-gray-500">organization.com</p>
              <div className="mt-2 inline-flex items-center rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-[11px] font-medium text-blue-700">
                Secure CRM Workspace
              </div>
            </div>
          )}
          
          {/* Collapsed state - show initials */}
          {collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-gray-900">MP</h1>
            </div>
          )}
        </div>
      </div>
      <div className="sidebar-scroll relative flex-1 overflow-y-auto px-1 py-2">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#1f2937',
          }}
          className="sidebar-menu"
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
      </div>
      <div className="sidebar-footer border-t border-blue-100/80 bg-white/50 backdrop-blur-sm p-4">
        <div
          className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-slate-700 hover:bg-white/80 hover:text-blue-600 transition-colors"
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
          margin: 6px 8px;
          border-radius: 12px;
          min-height: 42px;
          display: flex !important;
          align-items: center !important;
          padding-left: 14px !important;
          transition: all 0.22s ease;
          border: 1px solid transparent;
        }
        .sidebar-menu .ant-menu-item-selected {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.16) 0%,
            rgba(99, 102, 241, 0.1) 100%
          ) !important;
          color: #0f172a !important;
          border-color: rgba(147, 197, 253, 0.7) !important;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.12);
        }
        .sidebar-menu .ant-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.82) !important;
          color: #1f2937 !important;
          border-color: rgba(191, 219, 254, 0.65) !important;
          transform: translateX(2px);
        }
        .sidebar-menu .ant-menu-item-icon {
          font-size: 18px !important;
          transition: transform 0.22s ease;
        }
        .sidebar-menu .ant-menu-item:hover .ant-menu-item-icon,
        .sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
          transform: scale(1.08);
        }
        .sidebar-menu .ant-menu-item::after {
          display: none !important;
        }
        .sidebar-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }

        .sidebar-shell {
          --sidebar-fg: #1f2937;
          --sidebar-header-border: rgba(191, 219, 254, 0.8);
          --sidebar-footer-border: rgba(191, 219, 254, 0.8);
          --sidebar-footer-bg: rgba(255, 255, 255, 0.5);
          --sidebar-item-fg: #1f2937;
          --sidebar-item-selected-fg: #0f172a;
          --sidebar-item-hover-bg: rgba(255, 255, 255, 0.82);
          --sidebar-item-hover-border: rgba(191, 219, 254, 0.65);
          --sidebar-item-selected-border: rgba(147, 197, 253, 0.7);
          --sidebar-item-selected-shadow: 0 6px 16px rgba(59, 130, 246, 0.12);
        }

        .sidebar-header {
          border-bottom-color: var(--sidebar-header-border) !important;
        }
        .sidebar-footer {
          border-top-color: var(--sidebar-footer-border) !important;
          background: var(--sidebar-footer-bg) !important;
        }
        .sidebar-menu .ant-menu-item {
          color: var(--sidebar-item-fg) !important;
        }
        .sidebar-menu .ant-menu-item-selected {
          color: var(--sidebar-item-selected-fg) !important;
          border-color: var(--sidebar-item-selected-border) !important;
          box-shadow: var(--sidebar-item-selected-shadow) !important;
        }
        .sidebar-menu .ant-menu-item:hover {
          background-color: var(--sidebar-item-hover-bg) !important;
          border-color: var(--sidebar-item-hover-border) !important;
        }

        @media (prefers-color-scheme: dark) {
          .sidebar-shell {
            color: #e5e7eb;
            background: linear-gradient(
              180deg,
              rgba(15, 23, 42, 0.98) 0%,
              rgba(17, 24, 39, 0.96) 55%,
              rgba(30, 41, 59, 0.95) 100%
            ) !important;
            --sidebar-header-border: rgba(71, 85, 105, 0.7);
            --sidebar-footer-border: rgba(71, 85, 105, 0.7);
            --sidebar-footer-bg: rgba(15, 23, 42, 0.55);
            --sidebar-item-fg: #dbeafe;
            --sidebar-item-selected-fg: #ffffff;
            --sidebar-item-hover-bg: rgba(30, 41, 59, 0.7);
            --sidebar-item-hover-border: rgba(71, 85, 105, 0.9);
            --sidebar-item-selected-border: rgba(96, 165, 250, 0.55);
            --sidebar-item-selected-shadow: 0 10px 20px rgba(2, 132, 199, 0.2);
          }

          .sidebar-shell h1 {
            color: #f8fafc !important;
          }
          .sidebar-shell p {
            color: #94a3b8 !important;
          }
          .sidebar-footer {
            backdrop-filter: blur(8px);
          }
          .sidebar-mobile-nav {
            border-top-color: rgba(71, 85, 105, 0.85) !important;
            background: linear-gradient(
              90deg,
              rgba(15, 23, 42, 0.98) 0%,
              rgba(30, 41, 59, 0.96) 50%,
              rgba(17, 24, 39, 0.98) 100%
            ) !important;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
