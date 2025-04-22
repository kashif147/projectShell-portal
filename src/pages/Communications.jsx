import React from 'react';
import { Card, List, Badge, Avatar } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { dummyData } from '../services/dummyData';

const Communications = () => {
  return (
    <Card title="All Communications">
      <List
        dataSource={dummyData.communications}
        renderItem={(item) => (
          <List.Item
            extra={item.date}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<MessageOutlined />} />}
              title={item.title}
              description={item.type}
            />
            <Badge 
              status={item.status === 'Read' ? 'success' : 'processing'} 
              text={item.status} 
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Communications; 