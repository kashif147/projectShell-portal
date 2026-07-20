import React, { useState, useEffect } from 'react';
import { Layout, theme, Drawer } from 'antd';
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
  '/courses': 'Courses',
  '/communications': 'Communications',
  '/queries': 'Queries',
  '/queries/create': 'New Query',
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
    token: { borderRadiusLG },
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
      // Return bottom navigation bar for mobile + drawer for full menu
      return (
        <>
          <Drawer
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
            bodyStyle={{ padding: 0, background: 'white' }}
            headerStyle={{ display: 'none' }}
          >
            <Sidebar collapsed={false} />
          </Drawer>
          <Sidebar isMobile={true} />
        </>
      );
    }

    return (
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        style={{
          background: 'white',
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
    <Layout className="app-main-shell" style={{ minHeight: '100vh' }}>
      {renderSidebar()}
      <Layout
        className="app-main-shell app-main-shell--content"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: 'all 0.2s',
          height: '100vh',
          overflow: 'hidden',
        }}>
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          setDrawerVisible={setDrawerVisible}
          pageTitle={pageTitle}
        />
        <Content
          className="app-content"
          style={{
            borderRadius: borderRadiusLG,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 