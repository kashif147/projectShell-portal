import React from 'react';
import { Card, List, Button, Tag } from 'antd';
import { FileOutlined, DownloadOutlined } from '@ant-design/icons';

const Resources = () => {
  const dummyResources = [
    {
      id: 1,
      title: 'Member Handbook 2024',
      type: 'PDF',
      size: '2.5 MB',
      category: 'Guidelines',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Professional Standards Guide',
      type: 'PDF',
      size: '1.8 MB',
      category: 'Standards',
      date: '2024-01-10',
    },
    {
      id: 3,
      title: 'Annual Report 2023',
      type: 'PDF',
      size: '5.2 MB',
      category: 'Reports',
      date: '2023-12-31',
    },
  ];

  return (
    <Card title="Resources Library">
      <List
        dataSource={dummyResources}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button 
                key="download" 
                type="primary" 
                icon={<DownloadOutlined />}
              >
                Download
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<FileOutlined style={{ fontSize: '24px' }} />}
              title={item.title}
              description={
                <>
                  <Tag color="blue">{item.category}</Tag>
                  <Tag color="green">{item.type}</Tag>
                  <span className="ml-2">{item.size}</span>
                  <p className="mt-2">Added: {item.date}</p>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Resources; 