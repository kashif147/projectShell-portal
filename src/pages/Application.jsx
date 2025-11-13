import React, { useEffect, useState } from 'react';
import { Table, Empty, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } =
    useApplication();
  const { categoryLookups, fetchLookups } = useLookup();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState(null);


  // Fetch category lookups on mount
  useEffect(() => {
    if (!categoryLookups || categoryLookups.length === 0) {
      fetchLookups('category');
    }
  }, []);

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

  // Get category name by ID from dynamic lookup
  const getMembershipCategoryLabel = (categoryId) => {
    if (!categoryId) return 'N/A';
    
    // Find category in the lookup by _id or id
    const category = categoryLookups?.find(
      cat => (cat?._id === categoryId || cat?.id === categoryId)
    );
    
    return category?.name || categoryId;
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
