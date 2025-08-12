import React from 'react';
import { Table, Empty, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } =
    useApplication();
  const navigate = useNavigate();

  const formatToDDMMYYYY = value => {
    if (!value) return 'N/A';
    if (
      typeof value === 'string' &&
      /^(\d{2})\/(\d{2})\/(\d{4})$/.test(value)
    ) {
      return value; // already dd/mm/yyyy
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const hasData = personalDetail || professionalDetail || subscriptionDetail;
  const application = hasData
    ? {
        id: personalDetail?.ApplicationId,
        submissionDate:
          subscriptionDetail?.subscriptionDetails?.submissionDate || null,
        personalDetail,
        professionalDetail,
        subscriptionDetail,
      }
    : null;

  const handleViewApplication = record => {
    navigate('/application/detail', { state: { application: record } });
  };

  const getStatusColor = status => {
    const statusColors = {
      Active: 'green',
      Pending: 'orange',
      Inactive: 'red',
      Approved: 'blue',
      Rejected: 'red',
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'Membership Category',
      dataIndex: 'membershipCategory',
      key: 'membershipCategory',
      render: (_, record) => {
        const category =
          record.professionalDetail?.professionalDetails?.membershipCategory ||
          '';
        return category ? (
          <span className="text-gray-700">{category}</span>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      },
    },
    {
      title: 'Submission Date',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      render: date =>
        date ? (
          <span className="text-gray-700">{formatToDDMMYYYY(date)}</span>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const status =
          record.subscriptionDetail?.subscriptionDetails?.memberStatus || '';
        return status ? (
          <span className="text-gray-700">{status}</span>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewApplication(record)}
          className="bg-blue-500 hover:bg-blue-600 border-blue-500">
          View
        </Button>
      ),
    },
  ];

  return (
    <Card title="Application History">
      <div className="space-y-6">
        {hasData ? (
          <Table
            dataSource={[application]}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty
            description="No application data found."
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}


      </div>
    </Card>
  );
};

export default Application;
