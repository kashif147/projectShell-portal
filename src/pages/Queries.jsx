import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Spin, Empty } from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import { fetchMyPortalIssues } from '../api/issue.api';
import {
  getIssueApiErrorMessage,
  isIssueApiSuccess,
  mapPortalIssueToListItem,
  parseIssuesListResponse,
} from '../helpers/issues.helper';

const Queries = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchMyPortalIssues();
      if (isIssueApiSuccess(response)) {
        setIssues(
          parseIssuesListResponse(response).map(mapPortalIssueToListItem),
        );
      } else {
        setIssues([]);
        toast.error(getIssueApiErrorMessage(response, 'Failed to load complaints'));
      }
    } catch (error) {
      setIssues([]);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const columns = useMemo(
    () => [
      {
        title: 'Subject / Type',
        dataIndex: 'subject',
        key: 'subject',
        render: val => <span className="font-bold text-slate-900">{val}</span>,
      },
      {
        title: 'Date Submitted',
        dataIndex: 'date',
        key: 'date',
        render: val => <span className="font-medium text-slate-600">{val}</span>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => {
          const s = String(status || '').toLowerCase();
          let color = 'default';
          if (s.includes('open') || s.includes('new')) color = 'processing';
          else if (s.includes('closed') || s.includes('resolved')) color = 'success';
          else if (s.includes('progress') || s.includes('pending')) color = 'warning';

          return (
            <Tag color={color} className="px-2.5 py-0.5 font-semibold text-xs rounded-full capitalize">
              {status}
            </Tag>
          );
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: val => <span className="text-slate-500 line-clamp-1">{val}</span>,
      },
    ],
    [],
  );

  const openCount = issues.filter(i =>
    String(i.status || '').toLowerCase().includes('open'),
  ).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-100/50 blur-2xl" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Queries & Cases
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Track your open support requests, dispute inquiries, and official representations.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/queries/create')}
            className="shrink-0">
            Submit New Case
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <QuestionCircleOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Cases
              </p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {issues.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <ClockCircleOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Open / Active
              </p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">
                {openCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <CheckCircleOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolved
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                {issues.length - openCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-poppins text-lg font-bold text-slate-900">
              Submitted Cases
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {issues.length} total
            </span>
          </div>
        }
        className="overflow-hidden border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)]">
        <Spin spinning={loading}>
          {issues.length === 0 && !loading ? (
            <Empty
              description="No complaints or cases found."
              className="py-16"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table
                dataSource={issues}
                columns={columns}
                rowKey={record => String(record.id)}
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Queries;
