import React from 'react';
import { Card, Row, Col, Badge, List, Tag } from 'antd';
import Button from '../components/common/Button';
import { dummyData } from '../services/dummyData';

const Subscriptions = () => {
  const { subscriptionStatus } = dummyData;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Current Subscription">
            <div className="mb-4">
              <Badge status="success" text={subscriptionStatus.status} />
              <h3 className="text-xl mt-2">{subscriptionStatus.type} Membership</h3>
            </div>
            <p>Valid from: {subscriptionStatus.startDate}</p>
            <p>Valid until: {subscriptionStatus.endDate}</p>
            <div className="mt-4">
              <h4 className="mb-2">Features Included:</h4>
              <List
                dataSource={subscriptionStatus.features}
                renderItem={(item) => (
                  <List.Item>
                    <Tag color="blue">{item}</Tag>
                  </List.Item>
                )}
              />
            </div>
            <Button type="primary" className="mt-4">Renew Subscription</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Subscription History">
            <List
              dataSource={dummyData.payments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.description}
                    description={item.date}
                  />
                  <div>${item.amount}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Subscriptions; 