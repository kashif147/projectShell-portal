import React from 'react';
import { Card, Table, Tag } from 'antd';
import Button from '../components/common/Button';

const Queries = () => {
  const dummyQueries = [
    {
      id: 1,
      subject: 'Technical Support',
      date: '2024-02-01',
      status: 'Open',
      priority: 'High',
    },
    {
      id: 2,
      subject: 'Billing Question',
      date: '2024-01-28',
      status: 'Closed',
      priority: 'Medium',
    },
  ];

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Open' ? 'blue' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const color = {
          High: 'red',
          Medium: 'orange',
          Low: 'green',
        }[priority];
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button size="small">View Details</Button>,
    },
  ];

  return (
    <div>
      <Card 
        title="Queries & Cases" 
        extra={<Button type="primary">New Query</Button>}
      >
        <Table
          dataSource={dummyQueries}
          columns={columns}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default Queries; 