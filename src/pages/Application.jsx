import React from 'react';
import { Card, Table, Empty } from 'antd';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ApplicationPDF } from '../components/Receipt';

const renderDetailsList = data => (
  <ul style={{ margin: 0, paddingLeft: 16 }}>
    {Object.entries(data || {}).map(([key, value]) => (
      <li key={key} style={{ marginBottom: 4 }}>
        <b>
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
        </b>{' '}
        {String(value)}
      </li>
    ))}
  </ul>
);

const Application = () => {
  const { personalDetail, professionalDetail, subscriptionDetail } =
    useApplication();

  const hasData = personalDetail || professionalDetail || subscriptionDetail;
  const application = hasData
    ? {
        id: personalDetail?.ApplicationId,
        personalDetail,
        professionalDetail,
        subscriptionDetail,
      }
    : null;

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) =>
        `${record.personalDetail?.personalInfo?.forename || ''} ${record.personalDetail?.personalInfo?.surname || ''}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (_, record) =>
        record.personalDetail?.contactInfo?.personalEmail || '',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (_, record) =>
        record.personalDetail?.contactInfo?.mobileNumber || '',
    },
    {
      title: 'Membership Category',
      dataIndex: 'membershipCategory',
      key: 'membershipCategory',
      render: (_, record) =>
        record.professionalDetail?.professionalDetails?.membershipCategory ||
        '',
    },
    {
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
      render: (_, record) =>
        record.professionalDetail?.professionalDetails?.workLocation || '',
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (_, record) =>
        record.subscriptionDetail?.subscriptionDetails?.paymentType || '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) =>
        record.subscriptionDetail?.subscriptionDetails?.memberStatus || '',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <PDFDownloadLink
            document={<ApplicationPDF application={record} />}
            fileName={`application-${record.id}.pdf`}>
            {({ loading }) => (
              <Button>{loading ? 'Preparing...' : 'Download PDF'}</Button>
            )}
          </PDFDownloadLink>
        </>
      ),
    },
  ];

  return (
    <Card title="Application">
      {hasData ? (
        <Table
          dataSource={[application]}
          columns={columns}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowRender: record => (
              <div
                style={{ background: '#fafcff', padding: 16, borderRadius: 8 }}>
                <h4 style={{ marginBottom: 8, color: '#1a3a5d' }}>
                  Personal Information
                </h4>
                {renderDetailsList(record.personalDetail?.personalInfo)}
                {renderDetailsList(record.personalDetail?.contactInfo)}
                <h4 style={{ margin: '16px 0 8px', color: '#1a3a5d' }}>
                  Professional Information
                </h4>
                {renderDetailsList(
                  record.professionalDetail?.professionalDetails,
                )}
                <h4 style={{ margin: '16px 0 8px', color: '#1a3a5d' }}>
                  Subscription Information
                </h4>
                {renderDetailsList(
                  record.subscriptionDetail?.subscriptionDetails,
                )}
              </div>
            ),
            defaultExpandAllRows: true,
          }}
        />
      ) : (
        <Empty description="No application data found." />
      )}
    </Card>
  );
};

export default Application;
