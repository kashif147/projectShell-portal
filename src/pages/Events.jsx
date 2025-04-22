import React from 'react';
import { Card, Row, Col, List, Tag } from 'antd';
import Button from '../components/common/Button';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { dummyData } from '../services/dummyData';

const Events = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Upcoming Events">
            <List
              dataSource={dummyData.events}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <div className="flex justify-end mt-4">
                      <Button type="primary" key="register">
                        Register Now
                      </Button>
                    </div>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <>
                        <p>
                          <CalendarOutlined className="mr-2" />
                          {item.date}
                        </p>
                        <p>
                          <EnvironmentOutlined className="mr-2" />
                          {item.location}
                        </p>
                        <p>{item.description}</p>
                        <Tag color="blue">{item.status}</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Events; 