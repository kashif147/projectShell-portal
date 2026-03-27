import React, { useMemo, useState } from 'react';
import { Layout, Avatar, Dropdown, Badge, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Button from '../common/Button';
import { useDispatch } from 'react-redux';
import { signOut } from '../../services/auth.services';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLookup } from '../../contexts/lookupContext';
import { useProfile } from '../../contexts/profileContext';
import { useNotification } from '../../contexts/notificationContext';
import { useApplication } from '../../contexts/applicationContext';
import { useMemberRole } from '../../hooks/useMemberRole';

const Header = ({
  collapsed,
  setCollapsed,
  isMobile,
  setDrawerVisible,
  pageTitle,
}) => {
  const { user } = useSelector(state => state.auth);
  const { fetchAllLookups } = useLookup();
  const { profileDetail } = useProfile();
  const { unreadCount } = useNotification();
  const { isCrmUser } = useApplication();
  const { isMember } = useMemberRole();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const userDisplayName = useMemo(
    () =>
      `${user?.userFirstName || ''} ${user?.userLastName || user?.fullName || ''}`.trim() ||
      'Member User',
    [user?.userFirstName, user?.userLastName, user?.fullName],
  );
  const userSubLabel = isMember
    ? profileDetail?.membershipNumber || 'Membership Pending'
    : isCrmUser
      ? 'CRM User'
      : 'Non Member';

  const items = [
    {
      key: 'settings',
      label: 'Settings',
    },
    {
      key: 'logout',
      label: 'Log out',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(signOut(navigate));
    }
  };

  const handleSearch = value => {
    console.log('Search:', value);
    // Add your search logic here
  };

  return (
    <Layout.Header
      style={{
        padding: '0 16px',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 45%, rgba(238,245,255,0.98) 100%)',
        borderBottom: '1px solid rgba(219, 234, 254, 0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
        height: '74px',
      }}>
      {/* Left Section - Menu Button, Title, and Search */}
      <div className="flex items-center flex-1">
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-11 h-11 rounded-xl border border-blue-100 bg-white/80 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
          />
        )}
        <h1 className="header-title ml-3 text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
          {pageTitle}
        </h1>

        {/* Search Bar */}
        <div
          className="ml-5 hidden lg:block"
          style={{ maxWidth: '320px', width: '100%' }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onPressEnter={() => handleSearch(searchValue)}
            style={{
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}
            className="hover:bg-white hover:border-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Right Section - Membership Number, Notifications and User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Notification Bell */}
        <Badge
          count={unreadCount > 0 ? unreadCount : 0}
          size="small"
          offset={[-1, 2]}>
          <Button
            type="text"
            icon={
              <BellOutlined style={{ fontSize: '20px', color: '#334155' }} />
            }
            className="h-11 w-11 rounded-xl border border-blue-100 bg-white/80 hover:bg-blue-50 hover:border-blue-200 transition-all"
            onClick={() => navigate('/notifications')}
          />
        </Badge>

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          placement="bottomRight">
          <div className="group flex items-center space-x-3 cursor-pointer rounded-xl border border-blue-100 bg-white/80 px-3 py-2 hover:bg-blue-50/60 hover:border-blue-200 transition-all">
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                width: '38px',
                height: '38px',
                boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
              }}
            />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-900">
                {userDisplayName}
              </span>
              <span className="text-xs text-slate-500">
                {userSubLabel}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default Header;
