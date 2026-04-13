import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { applicationConfirmationRequest } from '../api/application.api';
import {
  extractApplicationsFromMeResponse,
  normalizeApplicationDetailResponse,
  buildApplicationBundleFromContext,
} from '../helpers/applicationPayload.helper';

const resolvePersonalIsActive = record => {
  if (typeof record.personalIsActive === 'boolean') {
    return record.personalIsActive;
  }
  const v = record.personalDetails && record.personalDetails.meta
    ? record.personalDetails.meta.isActive
    : undefined;
  if (typeof v === 'boolean') {
    return v;
  }
  return null;
};

const renderPersonalActiveCell = record => {
  const active = resolvePersonalIsActive(record);
  if (active === true) {
    return (
      <Tag color="success" className="m-0">
        Active
      </Tag>
    );
  }
  if (active === false) {
    return (
      <Tag color="error" className="m-0">
        Inactive
      </Tag>
    );
  }
  return <span className="text-gray-400">N/A</span>;
};

const Application = () => {
  const {
    isCrmUser,
    loading,
    personalDetail,
    professionalDetail,
    subscriptionDetail,
    applicationStatus: contextApplicationStatus,
  } = useApplication();
  const { isMember: hasMemberRole } = useMemberRole();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [viewingApplicationId, setViewingApplicationId] = useState(null);
  const [resolvedStatus, setResolvedStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const isApprovedListMode =
    String(resolvedStatus || '').toLowerCase() === 'approved';

  useEffect(() => {
    if (loading) {
      return;
    }

    if (contextApplicationStatus != null) {
      setResolvedStatus(
        String(contextApplicationStatus).trim().toLowerCase(),
      );
      setStatusLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (!personalDetail || !personalDetail.applicationId) {
        if (!cancelled) {
          setResolvedStatus('none');
          setStatusLoading(false);
        }
        return;
      }

      setStatusLoading(true);
      try {
        const response = await applicationConfirmationRequest(
          personalDetail.applicationId,
        );
        if (cancelled) return;
        if (
          response &&
          (response.status === 200 || response.data?.status === 'success')
        ) {
          const status =
            response.data?.data?.applicationStatus ||
            response.data?.applicationStatus;
          setResolvedStatus(
            status != null ? String(status).trim().toLowerCase() : 'none',
          );
        } else if (!cancelled) {
          setResolvedStatus('none');
        }
      } catch {
        if (!cancelled) {
          setResolvedStatus('none');
        }
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [loading, personalDetail?.applicationId, contextApplicationStatus]);

  // Approved members may have no portal personal-detail applicationId; infer from /me list.
  useEffect(() => {
    if (loading || statusLoading) return;
    if (contextApplicationStatus != null) return;
    if (personalDetail && personalDetail.applicationId) return;
    if (resolvedStatus !== 'none') return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAllApplications();
        if (cancelled) return;
        const items = extractApplicationsFromMeResponse(res);
        const hasApproved =
          Array.isArray(items) &&
          items.some(
            row =>
              String(row.applicationStatus || '')
                .trim()
                .toLowerCase() === 'approved',
          );
        if (hasApproved && !cancelled) {
          setResolvedStatus('approved');
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    loading,
    statusLoading,
    contextApplicationStatus,
    personalDetail,
    resolvedStatus,
  ]);

  useEffect(() => {
    if (!isApprovedListMode) {
      setApplications([]);
      setListLoading(false);
      return;
    }

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
  }, [isApprovedListMode]);

  const portalApplicationRecord = useMemo(() => {
    if (!personalDetail || !personalDetail.applicationId) {
      return null;
    }
    const category =
      professionalDetail?.professionalDetails?.membershipCategory ||
      subscriptionDetail?.subscriptionDetails?.membershipCategory ||
      'N/A';
    const submissionDate =
      personalDetail.submissionDate ||
      personalDetail.personalInfo?.submissionDate ||
      subscriptionDetail?.subscriptionDetails?.submissionDate ||
      null;
    const metaIsActive =
      personalDetail.meta != null &&
      typeof personalDetail.meta.isActive === 'boolean'
        ? personalDetail.meta.isActive
        : null;
    return {
      applicationId: personalDetail.applicationId,
      membershipCategory: category,
      submissionDate,
      applicationStatus: personalDetail.applicationStatus,
      personalIsActive: metaIsActive,
    };
  }, [personalDetail, professionalDetail, subscriptionDetail]);

  const displayRows = isApprovedListMode
    ? applications
    : portalApplicationRecord
      ? [portalApplicationRecord]
      : [];

  const handleViewApplication = useCallback(
    async record => {
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
    },
    [navigate],
  );

  const handleViewPortalApplication = useCallback(() => {
    const bundle = buildApplicationBundleFromContext({
      personalDetail,
      professionalDetail,
      subscriptionDetail,
    });
    const id = bundle.applicationId;
    if (!id) {
      toast.error('Missing application id.');
      return;
    }
    navigate('/application/detail', {
      state: {
        application: bundle,
        applicationId: id,
      },
    });
  }, [navigate, personalDetail, professionalDetail, subscriptionDetail]);

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
      title: 'Active',
      key: 'personalIsActive',
      render: (_, record) => renderPersonalActiveCell(record),
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
          onClick={() =>
            isApprovedListMode
              ? handleViewApplication(record)
              : handleViewPortalApplication()
          }
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
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <div className="text-sm">{renderPersonalActiveCell(record)}</div>
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
              onClick={() =>
                isApprovedListMode
                  ? handleViewApplication(record)
                  : handleViewPortalApplication()
              }
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

  const pageBusy =
    loading || statusLoading || (isApprovedListMode && listLoading);

  const emptyDescription = isApprovedListMode
    ? 'No application history found.'
    : "You don't have an application yet.";

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
          {pageBusy ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : displayRows.length > 0 ? (
            <>
              <div className="block md:hidden">
                {displayRows.map(record => (
                  <div key={record.applicationId}>
                    {renderMobileCard(record)}
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table
                  dataSource={displayRows}
                  columns={columns}
                  rowKey={record => record.applicationId}
                  pagination={false}
                />
              </div>
            </>
          ) : (
            <Empty
              description={emptyDescription}
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
