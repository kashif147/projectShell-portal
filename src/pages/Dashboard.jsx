import React from 'react';
import { Card, Row, Col, Statistic, List, Badge, Avatar } from 'antd';
import Button from '../components/common/Button';
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const Dashboard = () => {
  // Define quick actions
  const quickActions = [
    {
      icon: <UserOutlined className="text-2xl" />,
      title: 'Update Profile',
      onClick: () => console.log('Update Profile clicked'),
    },
    {
      icon: <CreditCardOutlined className="text-2xl" />,
      title: 'Pay Fees',
      onClick: () => console.log('Pay Fees clicked'),
    },
    {
      icon: <CalendarOutlined className="text-2xl" />,
      title: 'Register for Event',
      onClick: () => console.log('Register for Event clicked'),
    },
  ];

  // Define communications data
  const communications = [
    {
      title: 'Annual General Meeting',
      date: '02/05/2024',
      type: 'Meeting',
    },
    {
      title: 'Membership Renewal Notice',
      date: '01/25/2024',
      type: 'Notice',
    },
    {
      title: 'Monthly Newsletter',
      date: '01/15/2024',
      type: 'Newsletter',
    },
  ];

  // Define statistics data
  const statistics = {
    totalEvents: 15,
    upcomingEvents: 5,
    unreadMessages: 3,
    cpd_points: 45,
  };

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, John Doe</h1>
        <div className="flex items-center gap-2">
          <Badge count={1}>
            <Avatar icon={<UserOutlined />} />
          </Badge>
          <div className="flex flex-col">
            <span>John Doe</span>
            <Button type="link" size="small">Settings</Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={statistics.totalEvents}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Upcoming Events"
              value={statistics.upcomingEvents}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Unread Messages"
              value={statistics.unreadMessages}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="CPD Points"
              value={statistics.cpd_points}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-8">
        {quickActions.map((action, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card hoverable onClick={action.onClick}>
              <div className="flex items-center gap-4">
                {action.icon}
                <span>{action.title}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Communications and Status */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Latest Communications" extra={<Button type="link">View All</Button>}>
            <List
              dataSource={communications}
              renderItem={(item) => (
                <List.Item extra={item.date}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<MessageOutlined />} />}
                    title={item.title}
                    description={item.type}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Current Subscription Status">
            <Badge status="success" text="Active" />
            <p className="mt-2">Ends: 12/31/2024</p>
            <div className="mt-4">
              <h4>Upcoming Events</h4>
              <div className="mt-2">
                <Badge status="processing" text="Professional Development Workshop" />
                <p className="text-sm text-gray-500 ml-4">May 10, 2024</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 