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
import { Logo, ShellLogo } from '../../assets/images';
import { useMemberRole } from '../../hooks/useMemberRole';
import { useApplication } from '../../contexts/applicationContext';
import { canAccessProfile } from '../../helpers/role.helper';
import { isActiveApplicationPersonalDetail } from '../../helpers/applicationPayload.helper';

const Sidebar = ({ collapsed, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const { isMember } = useMemberRole();
  const { personalDetail, applicationStatus } = useApplication();
  const showProfile = canAccessProfile({
    isMember,
    applicationStatus:
      applicationStatus ?? personalDetail?.applicationStatus,
    isActive: personalDetail
      ? isActiveApplicationPersonalDetail(personalDetail)
      : undefined,
  });
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
      label: 'Events & Courses',
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
  ].filter(
    item =>
      !(item.key === '/profile' && !showProfile) &&
      !(MEMBER_ONLY_KEYS.includes(item.key) && !isMember),
  );

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
  ].filter(
    item =>
      !(item.key === '/profile' && !showProfile) &&
      !(MEMBER_ONLY_KEYS.includes(item.key) && !isMember),
  );

  // Items shown in "More" menu
  const moreMenuItems = [
    {
      key: '/application',
      icon: <FormOutlined />,
      label: 'Application',
      color: '#8b5cf6',
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

        {/* More Menu — match mobile bottom sheet */}
        <Drawer
          title={null}
          placement="bottom"
          onClose={() => setMoreMenuVisible(false)}
          open={moreMenuVisible}
          height="auto"
          closable={false}
          className="more-options-drawer"
          styles={{
            body: {
              padding: 0,
              background: '#F5F7FA',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
            },
            wrapper: {
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
            },
            content: {
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              maxHeight: '80vh',
            },
            mask: {
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
            },
          }}
        >
          <div className="flex max-h-[80vh] flex-col bg-[#F5F7FA]">
            {/* Handle */}
            <div className="flex justify-center bg-white pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="relative border-b border-gray-100 bg-white px-5 pb-4 pt-2 text-center">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMoreMenuVisible(false)}
                className="absolute left-4 top-2 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <span className="text-xl leading-none">×</span>
              </button>
              <h2 className="text-lg font-bold text-slate-900">More Options</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Access all your features
              </p>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto px-4 py-5 pb-8">
              <div className="grid grid-cols-3 gap-3">
                {moreMenuItems.map(item => {
                  const isActive = location.pathname === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        navigate(item.key);
                        setMoreMenuVisible(false);
                      }}
                      className="flex flex-col items-center justify-center rounded-2xl border bg-white px-2 py-4 shadow-sm transition active:scale-[0.98]"
                      style={{
                        borderColor: isActive ? `${item.color}99` : '#F3F4F6',
                        boxShadow: isActive
                          ? `0 0 0 2px ${item.color}33`
                          : '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white shadow-sm [&_.anticon]:!text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.icon}
                      </div>
                      <span className="text-center text-[11px] font-semibold leading-tight text-slate-700">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
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
          {/* Logo: shell icon when collapsed, full brand mark when expanded */}
          {collapsed ? (
            <div className="sidebar-logo-wrap relative mb-3 flex h-14 w-14 items-center justify-center">
              <div className="sidebar-logo-badge absolute inset-0 rounded-2xl bg-white shadow-md ring-1 ring-blue-200/80" />
              <img
                src={ShellLogo}
                alt="ProjectShell"
                className="relative z-10 h-10 w-10 object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          ) : (
            <div className="sidebar-logo-wrap relative mb-4 w-full max-w-[220px] px-1">
              <div className="sidebar-logo-badge rounded-2xl bg-white p-3 shadow-md ring-1 ring-blue-200/80">
                <img
                  src={Logo}
                  alt="ProjectShell"
                  className="hidden h-11 w-full object-contain sm:block md:h-12"
                />
                <img
                  src={ShellLogo}
                  alt="ProjectShell"
                  className="mx-auto h-12 w-12 object-contain sm:hidden"
                />
              </div>
            </div>
          )}
          
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
          .sidebar-logo-badge {
            background: #ffffff !important;
            border: 1px solid rgba(148, 163, 184, 0.4) !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35) !important;
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
