import React from 'react';
import { Layout, Avatar, Dropdown, Badge } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, BellOutlined } from '@ant-design/icons';
import Button from '../common/Button';
// import { useSelector } from 'react-redux';

const Header = ({ collapsed, setCollapsed, isMobile, setDrawerVisible }) => {
  // const user = useSelector((state) => state.auth?.user);

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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: '72px',
      }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
          className="ml-[-24px] w-16 h-16"
        />
        <h1 className="header-title text-2xl ml-4 text-gray-800 tracking-tight">Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <Badge count={2} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: '20px' }} />}
            className="hover:bg-gray-50 transition-colors"
          />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomRight">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#1890ff',
                boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
              }} 
            />
            <span className="hidden sm:inline user-name text-gray-700">{'John Doe'}</span>
          </div>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default Header; 