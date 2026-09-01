import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Spin } from 'antd';
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
        title: 'Type',
        dataIndex: 'subject',
        key: 'subject',
      },
      {
        title: 'Date Received',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color={status === 'Open' ? 'blue' : status === 'Closed' ? 'green' : 'orange'}>
            {status}
          </Tag>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
    ],
    [],
  );

  return (
    <div>
      <Card
        title="Queries & Cases"
        extra={
          <Button type="primary" onClick={() => navigate('/queries/create')}>
            New Complaint
          </Button>
        }>
        <Spin spinning={loading}>
          <Table
            dataSource={issues}
            columns={columns}
            rowKey={record => String(record.id)}
            locale={{ emptyText: 'No complaints found' }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Queries;
