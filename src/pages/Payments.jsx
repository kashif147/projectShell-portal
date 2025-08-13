import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Modal } from 'antd';
import Button from '../components/common/Button';
import Receipt, { ReceiptPDF } from '../components/Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
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

const Payments = () => {
  const { subscriptionDetail, personalDetail, professionalDetail } =
    useApplication();
  const [paymentRows, setPaymentRows] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  useEffect(() => {
    if (subscriptionDetail) {
      setPaymentRows([
        {
          key: 1,
          date: formatToDDMMYYYY(subscriptionDetail?.subscriptionDetails?.submissionDate),
          description:
            professionalDetail?.professionalDetails?.membershipCategory,
          amount: '92',
          status: 'Paid',
          details: {
            ...personalDetail?.personalInfo,
            ...personalDetail?.contactInfo,
            ...professionalDetail?.professionalDetails,
          },
        },
      ]);
    } else {
      setPaymentRows([]);
    }
  }, []);

  console.log('Payment==================>', paymentRows);

  const getMembershipCategoryLabel = (value) => {
    const option = membershipCategoryOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'N/A';
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: description =>
        getMembershipCategoryLabel(description)
      ,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `$${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'Paid' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => {
            setReceiptData(record.details);
            setReceiptVisible(true);
          }}>
          View Receipt
        </Button>
      ),
    },
  ];

  return (
    <Card title="Payment History">
      <Table dataSource={paymentRows} columns={columns} rowKey="key" />
      <Modal
        open={receiptVisible}
        onCancel={() => setReceiptVisible(false)}
        footer={[
          <PDFDownloadLink
            key="download"
            document={<ReceiptPDF data={receiptData} />}
            fileName="receipt.pdf">
            {({ loading }) => (
              <Button>
                {loading ? 'Preparing PDF...' : 'Download as PDF'}
              </Button>
            )}
          </PDFDownloadLink>,
        ]}
        title="Payment Receipt"
        width={650}>
        {receiptData && <Receipt data={receiptData} />}
      </Modal>
    </Card>
  );
};

export default Payments;
