import React, { useState } from 'react';
import { Card, Table, Empty, Tag, Avatar, Space } from 'antd';
import { EyeOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { ApplicationViewModal } from '../components/modals';

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } = useApplication();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const hasData = personalDetail || professionalDetail || subscriptionDetail;
  const application = hasData
    ? {
        id: personalDetail?.ApplicationId,
        personalDetail,
        professionalDetail,
        subscriptionDetail,
      }
    : null;

  const handleViewApplication = (record) => {
    setSelectedApplication(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedApplication(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Active': 'green',
      'Pending': 'orange',
      'Inactive': 'red',
      'Approved': 'blue',
      'Rejected': 'red'
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">{id || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        const forename = record.personalDetail?.personalInfo?.forename || '';
        const surname = record.personalDetail?.personalInfo?.surname || '';
        const fullName = `${forename} ${surname}`.trim();
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">
              {fullName || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (_, record) => {
        const email = record.personalDetail?.contactInfo?.personalEmail || '';
        return (
          <div className="flex items-center gap-2">
            <MailOutlined className="text-gray-400" />
            <span className="text-gray-600">{email || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (_, record) => {
        const mobile = record.personalDetail?.contactInfo?.mobileNumber || '';
        return (
          <div className="flex items-center gap-2">
            <PhoneOutlined className="text-gray-400" />
            <span className="text-gray-600">{mobile || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      title: 'Membership Category',
      dataIndex: 'membershipCategory',
      key: 'membershipCategory',
      render: (_, record) => {
        const category = record.professionalDetail?.professionalDetails?.membershipCategory || '';
        return category ? (
          <Tag color="blue" className="font-medium">
            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Tag>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      },
    },
    {
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
      render: (_, record) => {
        const location = record.professionalDetail?.professionalDetails?.workLocation || '';
        return (
          <div className="flex items-center gap-2">
            <IdcardOutlined className="text-gray-400" />
            <span className="text-gray-600">{location || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (_, record) => {
        const paymentType = record.subscriptionDetail?.subscriptionDetails?.paymentType || '';
        return paymentType ? (
          <Tag color="green" className="font-medium">
            {paymentType}
          </Tag>
        ) : (
          <span className="text-gray-400">N/A</span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const status = record.subscriptionDetail?.subscriptionDetails?.memberStatus || '';
        return status ? (
          <Tag color={getStatusColor(status)} className="font-medium">
            {status}
          </Tag>
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
          className="bg-blue-500 hover:bg-blue-600 border-blue-500"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card 
        title={
          <div className="flex items-center gap-3">
           
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Applications</h1>
            </div>
          </div>
        }
        className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50"
        headStyle={{ 
          borderBottom: '1px solid #e5e7eb',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {hasData ? (
          <Table
            dataSource={[application]}
            columns={columns}
            rowKey="id"
            pagination={false}
            className="application-table"
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
          />
        ) : (
          <Empty 
            description="No application data found." 
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      <ApplicationViewModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        application={selectedApplication}
      />
    </div>
  );
};

export default Application;
