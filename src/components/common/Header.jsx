import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { logout } from '../../store/slice/auth.slice';

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const items = [
    {
      key: 'settings',
      label: 'Settings',
    },
    {
      key: 'logout',
      label: 'Log out',
      onClick: () => dispatch(logout()),
    },
  ];

  return (
    <div className="flex justify-between items-center p-4 bg-white border-b">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <BellOutlined className="text-xl cursor-pointer" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            2
          </span>
        </div>
        <Dropdown menu={{ items }} placement="bottomRight">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span>{user?.name || 'John Doe'}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header; 