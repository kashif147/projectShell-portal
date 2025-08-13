import React from 'react';
import { Card, Row, Col, Tag, Empty, Button, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const application = location.state?.application;

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <Empty
            description="No application data available"
            className="py-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  const { personalDetail, professionalDetail, subscriptionDetail } = application;

  const getStatusIcon = (status) => {
    const statusIcons = {
      Active: <CheckCircleOutlined className="text-green-500" />,
      Pending: <ClockCircleOutlined className="text-orange-500" />,
      Inactive: <CloseCircleOutlined className="text-red-500" />,
      Approved: <CheckCircleOutlined className="text-blue-500" />,
      Rejected: <CloseCircleOutlined className="text-red-500" />,
    };
    return statusIcons[status] || <ClockCircleOutlined className="text-gray-500" />;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Active: 'green',
      Pending: 'orange',
      Inactive: 'red',
      Approved: 'blue',
      Rejected: 'red',
    };
    return statusColors[status] || 'default';
  };

  const formatToDDMMYYYY = value => {
    if (!value) return 'N/A';
    if (
      typeof value === 'string' &&
      /^(\d{2})\/(\d{2})\/(\d{4})$/.test(value)
    ) {
      return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const renderSection = (title, data, icon, color = 'blue') => {
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
            <div className={`p-1 rounded-md bg-${color}-100`}>
              {React.cloneElement(icon, { className: `text-${color}-500 text-sm` })}
            </div>
            <span className="text-base font-semibold text-gray-800">{title}</span>
          </div>
        }
        className="mb-3 shadow-sm border-0 bg-white"
        headStyle={{
          borderBottom: '1px solid #f3f4f6',
          padding: '10px 14px',
        }}
        bodyStyle={{ padding: '10px 14px' }}
      >
        <Row gutter={[12, 8]}>
          {nonNullData.map(([key, value]) => (
            <Col xs={24} sm={12} lg={8} key={key}>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-100 hover:shadow-sm hover:bg-gray-100 transition-all">
                <div className="text-[10px] font-medium text-gray-600 uppercase tracking-wide mb-0.5">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, s => s.toUpperCase())}
                </div>
                <div className="text-xs font-medium text-gray-800">
                  {typeof value === 'boolean' ? (
                    <Tag
                      color={value ? 'green' : 'red'}
                      className="text-[10px] px-1 py-0 h-auto"
                    >
                      {value ? 'Yes' : 'No'}
                    </Tag>
                  ) : typeof value === 'string' && value.includes('_') ? (
                    <span className="capitalize text-gray-900">
                      {value
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ) : (
                    <span className="text-gray-900">{String(value)}</span>
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
    return { ...personalInfo, ...contactInfo };
  };

  const formatProfessionalInfo = () => {
    const professionalInfo = professionalDetail?.professionalDetails || {};
    const status = subscriptionDetail?.subscriptionDetails?.memberStatus || 'Pending';
    const submissionDate = subscriptionDetail?.subscriptionDetails?.submissionDate;
    const membershipCategory = professionalDetail?.professionalDetails?.membershipCategory || 'N/A';

    // Add summary data to professional info
    return {
      ...professionalInfo,
      'Application Status': status,
      'Submission Date': submissionDate ? formatToDDMMYYYY(submissionDate) : 'N/A',
      'Membership Category': membershipCategory,
    };
  };

  const formatSubscriptionInfo = () => {
    return subscriptionDetail?.subscriptionDetails || {};
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/application')}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 h-auto text-sm">
            Back to Applications
          </Button>
        </div>

        {/* Application Data Sections */}
        {hasAnyData() ? (
          <div className="space-y-4">
            {renderSection(
              'Personal Information',
              formatPersonalInfo(),
              <UserOutlined />,
              'blue'
            )}

            {renderSection(
              'Professional Information',
              formatProfessionalInfo(),
              <IdcardOutlined />,
              'green'
            )}

            {renderSection(
              'Subscription Information',
              formatSubscriptionInfo(),
              <CreditCardOutlined />,
              'purple'
            )}
          </div>
        ) : (
          <Card className="shadow-md border-0 bg-white">
            <Empty
              description="No application data available to display"
              className="py-12"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}

        {/* Footer Actions */}
        <div className="mt-6 text-center">
          <Button
            type="primary"
            size="middle"
            onClick={() => navigate('/application')}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 px-6 py-2 h-auto text-sm">
            Back to Applications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
