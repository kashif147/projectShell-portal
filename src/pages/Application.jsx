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

  // Render mobile card view
  const renderMobileCard = (record) => {
    const category =
      record.professionalDetail?.professionalDetails?.membershipCategory || '';
    const categoryLabel = category ? getMembershipCategoryLabel(category) : 'N/A';
    const submissionDate = record.submissionDate;
    const status = record.subscriptionDetail?.subscriptionDetails?.memberStatus || 'N/A';

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm mb-3">
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Membership Category</p>
              <p className={`text-sm font-medium ${category ? 'text-gray-800' : 'text-gray-400'}`}>
                {categoryLabel}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <p className="text-xs text-gray-500 mb-1">Submission Date</p>
            <p className={`text-sm font-medium ${submissionDate ? 'text-gray-800' : 'text-gray-400'}`}>
              {submissionDate ? formatToDDMMYYYY(submissionDate) : 'N/A'}
            </p>
          </div>
          
          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className={`text-sm font-medium ${status !== 'N/A' ? 'text-gray-800' : 'text-gray-400'}`}>
              {status}
            </p>
          </div>
          
          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewApplication(record)}
              className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500">
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-6">
      <Card 
        title="Application History"
        // className="shadow-sm"
        bodyStyle={{ padding: '8px' }}
      >
        <div className="space-y-4 sm:space-y-6">
          {hasData ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden">
                {[application].map((record) => (
                  <div key={record.id}>
                    {renderMobileCard(record)}
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table
                  dataSource={[application]}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            </>
          ) : (
            <Empty
              description="No application data found."
              className="py-12"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Application;
