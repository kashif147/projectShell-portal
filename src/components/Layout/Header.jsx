import React, { useEffect, useState } from 'react';
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

const Header = ({
  collapsed,
  setCollapsed,
  isMobile,
  setDrawerVisible,
  pageTitle,
}) => {
  const { user } = useSelector(state => state.auth);
  const {  fetchAllLookups } = useLookup();
  const { profileDetail } = useProfile();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
     fetchAllLookups()
  }, []);

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
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        height: '72px',
      }}>
      {/* Left Section - Menu Button, Title, and Search */}
      <div className="flex items-center flex-1">
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="ml-[-24px] w-16 h-16"
          />
        )}
        <h1 className="header-title text-2xl ml-4 text-gray-800 tracking-tight">
          {pageTitle}
        </h1>

        {/* Search Bar */}
        <div
          className="ml-8 hidden md:block"
          style={{ maxWidth: '300px', width: '100%' }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onPressEnter={() => handleSearch(searchValue)}
            style={{
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              border: 'none',
            }}
            className="hover:bg-gray-100 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Membership Number, Notifications and User Profile */}
      <div className="flex items-center space-x-4">
        {/* Membership Number */}
        {profileDetail?.membershipNumber && (
          <div className="flex bg-green-50 border border-green-200 rounded-lg px-2 md:px-3 py-1 md:py-1.5">
            <div className="flex flex-col">
              <p className="text-[10px] md:text-xs text-green-600 font-medium leading-tight">
                <span className="hidden sm:inline">Membership Number</span>
                <span className="sm:hidden">Member #</span>
              </p>
              <p className="text-xs md:text-sm font-semibold text-green-900 leading-tight">
                {profileDetail?.membershipNumber}
              </p>
            </div>
          </div>
        )}

        {/* Notification Bell */}
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={
              <BellOutlined style={{ fontSize: '20px', color: '#52525b' }} />
            }
            className="hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/notifications')}
          />
        </Badge>

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          placement="bottomRight">
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#71717a',
                width: '40px',
                height: '40px',
              }}
            />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">
                {user?.userFirstName || ''} {user?.userLastName || ''}
              </span>
              <span className="text-xs text-gray-500">{profileDetail?.profileId ?'Member' : 'Non Member'}</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default Header;
