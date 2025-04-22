import React from 'react';
import { Card, Descriptions, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { dummyData } from '../services/dummyData';

const Profile = () => {
  const { user } = dummyData;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <div className="text-center">
            <Avatar size={120} src={user.avatar} icon={<UserOutlined />} />
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Profile Information">
          <Descriptions layout="vertical">
            <Descriptions.Item label="Full Name">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Member Since">{user.memberSince}</Descriptions.Item>
            <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );
};

export default Profile; 