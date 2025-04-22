import React from 'react';
import { Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const Home = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'My Profile',
      icon: <UserOutlined className="text-3xl" />,
      path: '/profile',
      description: 'View and update your profile information',
    },
    {
      title: 'Events',
      icon: <CalendarOutlined className="text-3xl" />,
      path: '/events',
      description: 'Browse and register for upcoming events',
    },
    {
      title: 'Communications',
      icon: <MessageOutlined className="text-3xl" />,
      path: '/communications',
      description: 'View latest announcements and messages',
    },
    {
      title: 'Payments',
      icon: <CreditCardOutlined className="text-3xl" />,
      path: '/payments',
      description: 'Manage your payments and subscriptions',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome to Members Portal</h1>
        <p className="text-gray-600">Access all your membership services in one place</p>
      </div>

      <Row gutter={[16, 16]}>
        {quickLinks.map((link, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              hoverable
              className="text-center h-full "
              onClick={() => navigate(link.path)}
            >
              <div className="flex flex-col items-center gap-4">
                {link.icon}
                <h3 className="text-lg font-semibold">{link.title}</h3>
                <p className="text-gray-500 text-sm">{link.description}</p>
                <Button type="primary" onClick={() => navigate(link.path)}>
                  View {link.title}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home; 