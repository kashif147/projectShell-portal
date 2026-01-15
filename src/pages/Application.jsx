import React, { useEffect } from 'react';
import { Table, Empty, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { useProfile } from '../contexts/profileContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';
import Spinner from '../components/common/Spinner';

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail, categoryData, categoryLoading, getCategoryData } =
    useApplication();
  const { profileDetail } = useProfile();
  const { categoryLookups, fetchLookups } = useLookup();
  const navigate = useNavigate();

  // Fetch category data when subscriptionDetail membershipCategory changes
  useEffect(() => {
    const membershipCategory = subscriptionDetail?.subscriptionDetails?.membershipCategory;
    if (membershipCategory) {
      getCategoryData(membershipCategory, categoryLookups);
    }
  }, [subscriptionDetail?.subscriptionDetails?.membershipCategory, getCategoryData, categoryLookups]);

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

  const columns = [
    {
      title: 'Membership Category',
      dataIndex: 'membershipCategory',
      key: 'membershipCategory',
      render: (_, record) => {
        return (
          <span className="text-gray-700">
            {categoryData?.name || 'N/A'}
          </span>
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
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
      render: (_, record) => {
        const workLocation =
          record.professionalDetail?.professionalDetails?.workLocation || '';
        const otherWorkLocation =
          record.professionalDetail?.professionalDetails?.otherWorkLocation || '';
        const displayLocation = workLocation === 'other' && otherWorkLocation 
          ? otherWorkLocation 
          : workLocation;
        return displayLocation ? (
          <span className="text-gray-700">{displayLocation}</span>
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
    const category = categoryData?.name || 'N/A';
    const submissionDate = record.submissionDate;
    const workLocation =
      record.professionalDetail?.professionalDetails?.workLocation || '';
    const otherWorkLocation =
      record.professionalDetail?.professionalDetails?.otherWorkLocation || '';
    const displayLocation = workLocation === 'other' && otherWorkLocation 
      ? otherWorkLocation 
      : workLocation || 'N/A';

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm mb-3">
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Membership Category</p>
              <p className={`text-sm font-medium ${category !== 'N/A' ? 'text-gray-800' : 'text-gray-400'}`}>
                {category}
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
            <p className="text-xs text-gray-500 mb-1">Work Location</p>
            <p className={`text-sm font-medium ${displayLocation !== 'N/A' ? 'text-gray-800' : 'text-gray-400'}`}>
              {displayLocation}
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

  // Get member status based on profileId (same logic as Profile.jsx)
  const memberStatus = profileDetail?.profileId ? 'Member' : 'Non Member';
  const isMember = profileDetail?.profileId;

  // Show full-screen loading overlay
  if (categoryLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading application data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-6">
      <div className={`mb-4 sm:mb-6 border rounded-lg p-3 sm:p-4 ${
        isMember 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs mb-1 ${isMember ? 'text-blue-600' : 'text-gray-600'}`}>
              Member Status
            </p>
            <p className={`text-base sm:text-lg font-semibold ${
              isMember ? 'text-blue-900' : 'text-gray-700'
            }`}>
              {memberStatus}
            </p>
          </div>
          <Tag color={isMember ? 'blue' : 'default'} className="text-sm">
            {memberStatus}
          </Tag>
        </div>
      </div>
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
