import React from 'react';
import { Table, Empty, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';

const membershipCategoryOptions = [
  { value: 'general', label: 'General (all grades)' },
  { value: 'postgraduate_student', label: 'Postgraduate Student' },
  {
    value: 'short_term_relief',
    label: 'Short-term/ Relief (under 15 hrs/wk average)',
  },
  { value: 'private_nursing_home', label: 'Private nursing home' },
  {
    value: 'affiliate_non_practicing',
    label: 'Affiliate members (non-practicing)',
  },
  {
    value: 'lecturing',
    label: 'Lecturing (employed in universities and IT institutes)',
  },
  {
    value: 'associate',
    label: 'Associate (not currently employed as a nurse/midwife)',
  },
  { value: 'retired_associate', label: 'Retired Associate' },
  {
    value: 'undergraduate_student',
    label: 'Undergraduate Student',
  },
];

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } =
    useApplication();
  const navigate = useNavigate();


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

  const getMembershipCategoryLabel = (value) => {
    const option = membershipCategoryOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'N/A';
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
          <span className="text-gray-700">
            {getMembershipCategoryLabel(category)
            }
          </span>
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
