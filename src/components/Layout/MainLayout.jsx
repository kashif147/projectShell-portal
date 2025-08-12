import React, { useState, useEffect } from 'react';
import { Layout, Drawer, theme } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = Layout;

const routeTitleMap = {
  '/': 'Dashboard',
  '/profile': 'Profile',
  '/subscriptions': 'Subscriptions',
  '/application': 'Application',
  '/payments': 'Payments',
  '/events': 'Events',
  '/communications': 'Communications',
  '/queries': 'Queries',
  '/voting': 'Voting',
  '/resources': 'Resources',
  '/membership': 'Membership of Category',
  '/work-location': 'Work Location',
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setDrawerVisible(false);
    }
  }, [location, isMobile]);

  const renderSidebar = () => {
    if (isMobile) {
      return (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
          bodyStyle={{ padding: 0, background: '#0A1929' }}
          headerStyle={{ display: 'none' }}
        >
          <Sidebar collapsed={false} />
        </Drawer>
      );
    }

    return (
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        style={{
          background: '#0A1929',
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <Sidebar collapsed={collapsed} />
      </Layout.Sider>
    );
  };

  const pageTitle = routeTitleMap[location.pathname] || 'Dashboard';

  return (
    <Layout>
      {renderSidebar()}
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 220), 
        transition: 'all 0.2s' 
      }}>
        <Header 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          setDrawerVisible={setDrawerVisible}
          pageTitle={pageTitle}
        />
        <Content
          style={{
            margin: '12px 12px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 