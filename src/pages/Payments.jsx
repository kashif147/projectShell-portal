import React from 'react';
import { Card, Table, Tag } from 'antd';
import Button from '../components/common/Button';
import { dummyData } from '../services/dummyData';

const Payments = () => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button size="small">View Receipt</Button>,
    },
  ];

  return (
    <Card title="Payment History">
      <Table
        dataSource={dummyData.payments}
        columns={columns}
        rowKey="id"
      />
    </Card>
  );
};

export default Payments; 