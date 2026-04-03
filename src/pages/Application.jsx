import React, { useEffect, useState } from 'react';
import { Table, Empty, Tag, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';
import Spinner from '../components/common/Spinner';
import { useMemberRole } from '../hooks/useMemberRole';
import { fetchAllApplications, getApplicationById } from '../api/profile.api';
import {
  extractApplicationsFromMeResponse,
  normalizeApplicationDetailResponse,
} from '../helpers/applicationPayload.helper';

const Application = () => {
  const { isCrmUser } = useApplication();
  const { isMember: hasMemberRole } = useMemberRole();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [viewingApplicationId, setViewingApplicationId] = useState(null);

  useEffect(() => {
    setListLoading(true);
    fetchAllApplications()
      .then(res => {
        const items = extractApplicationsFromMeResponse(res);
        setApplications(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        toast.error('Failed to load application history.');
        setApplications([]);
      })
      .finally(() => {
        setListLoading(false);
      });
  }, []);

  const handleViewApplication = async record => {
    const id = record?.applicationId;
    if (!id) {
      toast.error('Missing application id.');
      return;
    }
    setViewingApplicationId(id);
    try {
      const res = await getApplicationById(id);
      const normalized = normalizeApplicationDetailResponse(res, {
        applicationId: id,
        submissionDate: record.submissionDate,
        applicationStatus: record.applicationStatus,
        membershipCategory: record.membershipCategory,
      });
      if (!normalized) {
        toast.error('Could not load application details.');
        return;
      }
      navigate('/application/detail', {
        state: {
          application: normalized,
          applicationId: id,
        },
      });
    } catch {
      toast.error('Failed to load application details.');
    } finally {
      setViewingApplicationId(null);
    }
  };

  const columns = [
    {
      title: 'Membership Category',
      dataIndex: 'membershipCategory',
      key: 'membershipCategory',
      render: (text, record) => (
        <span className="text-gray-700">
          {text || record.membershipCategory || 'N/A'}
        </span>
      ),
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
      render: () => <span className="text-gray-400">N/A</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          loading={viewingApplicationId === record.applicationId}
          disabled={
            !!viewingApplicationId &&
            viewingApplicationId !== record.applicationId
          }
          onClick={() => handleViewApplication(record)}
          className="bg-blue-500 hover:bg-blue-600 border-blue-500">
          View
        </Button>
      ),
    },
  ];

  const renderMobileCard = record => {
    const category = record.membershipCategory || 'N/A';
    const submissionDate = record.submissionDate;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm mb-3">
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Membership Category</p>
              <p
                className={`text-sm font-medium ${category !== 'N/A' ? 'text-gray-800' : 'text-gray-400'}`}>
                {category}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <p className="text-xs text-gray-500 mb-1">Submission Date</p>
            <p
              className={`text-sm font-medium ${submissionDate ? 'text-gray-800' : 'text-gray-400'}`}>
              {submissionDate ? formatToDDMMYYYY(submissionDate) : 'N/A'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <p className="text-xs text-gray-500 mb-1">Work Location</p>
            <p className="text-sm font-medium text-gray-400">N/A</p>
          </div>

          <div className="border-t border-gray-100 pt-2.5 sm:pt-3">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              loading={viewingApplicationId === record.applicationId}
              disabled={
                !!viewingApplicationId &&
                viewingApplicationId !== record.applicationId
              }
              onClick={() => handleViewApplication(record)}
              className="w-full bg-blue-500 hover:bg-blue-600 border-blue-500">
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const isMember = hasMemberRole || isCrmUser;
  const memberStatus = isMember ? 'Member' : 'Non Member';

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-6">
      <div
        className={`mb-4 sm:mb-6 border rounded-lg p-3 sm:p-4 ${
          isMember ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-xs mb-1 ${isMember ? 'text-blue-600' : 'text-gray-600'}`}>
              Member Status
            </p>
            <p
              className={`text-base sm:text-lg font-semibold ${
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
      <Card title="Application History" bodyStyle={{ padding: '8px' }}>
        <div className="space-y-4 sm:space-y-6">
          {listLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : applications.length > 0 ? (
            <>
              <div className="block md:hidden">
                {applications.map(record => (
                  <div key={record.applicationId}>
                    {renderMobileCard(record)}
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table
                  dataSource={applications}
                  columns={columns}
                  rowKey={record => record.applicationId}
                  pagination={false}
                />
              </div>
            </>
          ) : (
            <Empty
              description="No application history found."
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
