import React from 'react';
import { Modal, Card, Row, Col, Tag, Empty } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const ApplicationViewModal = ({ isVisible, onClose, application }) => {
  if (!application) return null;

  const { personalDetail, professionalDetail, subscriptionDetail } =
    application;

  const renderSection = (title, data, icon) => {
    if (!data || Object.keys(data).length === 0) return null;

    const nonNullData = Object.entries(data).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        value !== '' &&
        value !== false,
    );

    if (nonNullData.length === 0) return null;

    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
        }
        className="mb-4 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50"
        headStyle={{
          borderBottom: '1px solid #e5e7eb',
          color: 'white',
          borderRadius: '8px 8px 0 0',
        }}
        bodyStyle={{ padding: '20px' }}>
        <Row gutter={[16, 12]}>
          {nonNullData.map(([key, value]) => (
            <Col xs={24} sm={12} key={key}>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, s => s.toUpperCase())}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {typeof value === 'boolean' ? (
                    <Tag color={value ? 'green' : 'red'}>
                      {value ? 'Yes' : 'No'}
                    </Tag>
                  ) : typeof value === 'string' && value.includes('_') ? (
                    <span className="capitalize">
                      {value
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  const formatPersonalInfo = () => {
    const personalInfo = personalDetail?.personalInfo || {};
    const contactInfo = personalDetail?.contactInfo || {};

    // Combine and format personal information
    const combinedInfo = {
      ...personalInfo,
      ...contactInfo,
    };

    // Remove any null/undefined values and format the data
    const formattedInfo = {};
    Object.entries(combinedInfo).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formattedInfo[key] = value;
      }
    });

    return formattedInfo;
  };

  const formatProfessionalInfo = () => {
    const professionalInfo = professionalDetail?.professionalDetails || {};

    // Format professional information
    const formattedInfo = {};
    Object.entries(professionalInfo).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formattedInfo[key] = value;
      }
    });

    return formattedInfo;
  };

  const formatSubscriptionInfo = () => {
    const subscriptionInfo = subscriptionDetail?.subscriptionDetails || {};

    // Format subscription information
    const formattedInfo = {};
    Object.entries(subscriptionInfo).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formattedInfo[key] = value;
      }
    });

    return formattedInfo;
  };

  const hasAnyData = () => {
    const personalInfo = formatPersonalInfo();
    const professionalInfo = formatProfessionalInfo();
    const subscriptionInfo = formatSubscriptionInfo();

    return (
      Object.keys(personalInfo).length > 0 ||
      Object.keys(professionalInfo).length > 0 ||
      Object.keys(subscriptionInfo).length > 0
    );
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <h2 className="text-2xl font-bold my-1 text-gray-800">
            Application Details
          </h2>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth <= 768 ? '95%' : '800px'}
      centered
      className="application-view-modal"
      bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
      {hasAnyData() ? (
        <div className="space-y-6">
          {renderSection(
            'Personal Information',
            formatPersonalInfo(),
            <UserOutlined className="text-blue-500" />,
          )}

          {renderSection(
            'Professional Information',
            formatProfessionalInfo(),
            <IdcardOutlined className="text-green-500" />,
          )}

          {renderSection(
            'Subscription Information',
            formatSubscriptionInfo(),
            <CreditCardOutlined className="text-purple-500" />,
          )}
        </div>
      ) : (
        <Empty
          description="No application data available to display"
          className="py-12"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Modal>
  );
};

export default ApplicationViewModal;
