import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Avatar, Dropdown, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../../services/auth.services';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/profileContext';
import { useNotification } from '../../contexts/notificationContext';
import { useMemberRole } from '../../hooks/useMemberRole';
import { fetchNotiticationRequest } from '../../api/notification.api';
import { Logo, ShellLogo } from '../../assets/images';

const Header = ({
  collapsed,
  setCollapsed,
  isMobile,
  setDrawerVisible,
  pageTitle,
}) => {
  const { user, userDetail, isSignedIn } = useSelector(state => state.auth);
  const { profileDetail } = useProfile();
  const { unreadCount, setUnreadCountValue } = useNotification();
  const { isMember } = useMemberRole();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const authUserId =
    user?.id ||
    user?._id ||
    user?.userId ||
    userDetail?.id ||
    userDetail?._id ||
    null;

  const userDisplayName = useMemo(() => {
    if (!isSignedIn) return 'Member User';

    const profileName =
      profileDetail?.personalInfo?.fullName ||
      [
        profileDetail?.personalInfo?.forename,
        profileDetail?.personalInfo?.surname,
      ]
        .filter(Boolean)
        .join(' ');

    const firstName =
      user?.userFirstName ||
      user?.firstName ||
      userDetail?.userFirstName ||
      userDetail?.firstName;
    const lastName =
      user?.userLastName ||
      user?.lastName ||
      userDetail?.userLastName ||
      userDetail?.lastName;
    const authName = `${firstName || ''} ${lastName || ''}`.trim();
    const fullName = user?.fullName || userDetail?.fullName || userDetail?.name;

    return profileName || authName || fullName || 'Member User';
  }, [
    isSignedIn,
    authUserId,
    user?.userFirstName,
    user?.userLastName,
    user?.firstName,
    user?.lastName,
    user?.fullName,
    userDetail,
    profileDetail?.personalInfo,
  ]);

  const userSubLabel = useMemo(() => {
    if (!isMember) return 'Non Member';
    return profileDetail?.membershipNumber || 'Member';
  }, [isMember, profileDetail?.membershipNumber]);

  useEffect(() => {
    let isMounted = true;

    const syncUnreadCount = async () => {
      try {
        const response = await fetchNotiticationRequest({ page: 1, limit: 1 });
        if (!isMounted) return;
        if (response?.status === 200 && response?.data?.success) {
          const count = response?.data?.data?.unreadCount;
          if (typeof count === 'number') {
            setUnreadCountValue(count);
          }
        }
      } catch {
        // Keep current badge value if request fails
      }
    };

    syncUnreadCount();
    return () => {
      isMounted = false;
    };
  }, [location.pathname, setUnreadCountValue]);

  const items = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 px-1">
          <p className="text-xs font-semibold text-slate-900 truncate mb-0.5">
            {userDisplayName}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <SafetyCertificateOutlined className="text-[10px]" /> {userSubLabel}
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-rose-500" />,
      label: <span className="text-rose-600 font-medium">Log out</span>,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(signOut(navigate));
    }
  };

  return (
    <Layout.Header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          {!isMobile ? (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="app-header__icon-btn"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            />
          ) : (
            <button
              type="button"
              className="app-header__brand"
              onClick={() => setDrawerVisible?.(true)}
              aria-label="Open menu">
              <img
                src={ShellLogo}
                alt="ProjectShell"
                className="h-7 w-7 object-contain lg:hidden"
              />
              <img
                src={Logo}
                alt="ProjectShell"
                className="hidden h-6 w-auto max-w-[130px] object-contain lg:block"
              />
            </button>
          )}

          <div className="app-header__title-wrap">
            <h1 className="app-header__title">{pageTitle}</h1>
          </div>
        </div>

        <div className="app-header__right">
          <Badge
            count={unreadCount > 0 ? unreadCount : 0}
            size="small"
            offset={[-2, 2]}>
            <Button
              type="text"
              icon={<BellOutlined className="text-slate-600" />}
              className="app-header__icon-btn relative"
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
            />
          </Badge>

          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="custom-user-dropdown">
            <button type="button" className="app-header__profile group">
              <Avatar
                size={34}
                icon={<UserOutlined />}
                className="app-header__avatar"
              />
              <span className="app-header__profile-meta">
                <span className="app-header__profile-name group-hover:text-blue-600 transition-colors">
                  {userDisplayName}
                </span>
                <span className="app-header__profile-role">{userSubLabel}</span>
              </span>
            </button>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};

export default Header;
