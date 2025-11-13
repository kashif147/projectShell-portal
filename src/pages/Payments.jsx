import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Modal } from 'antd';
import Button from '../components/common/Button';
import Receipt, { ReceiptPDF } from '../components/Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { formatToDDMMYYYY } from '../helpers/date.helper';

const Payments = () => {
  const { subscriptionDetail, personalDetail, professionalDetail } =
    useApplication();
  const { categoryLookups, fetchLookups } = useLookup();
  const [paymentRows, setPaymentRows] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  // Fetch category lookups on mount
  useEffect(() => {
    if (!categoryLookups || categoryLookups.length === 0) {
      fetchLookups('category');
    }
  }, []);

  useEffect(() => {
    if (subscriptionDetail) {
      const amount = subscriptionDetail?.subscriptionDetails?.totalAmount || '92';
      const categoryId = professionalDetail?.professionalDetails?.membershipCategory;
      
      // Get category name for receipt
      const category = categoryLookups?.find(
        cat => (cat?._id === categoryId || cat?.id === categoryId)
      );
      const categoryName = category?.name || categoryId;
      
      setPaymentRows([
        {
          key: 1,
          date: formatToDDMMYYYY(subscriptionDetail?.subscriptionDetails?.submissionDate),
          description: categoryId,
          amount: amount,
          status: 'Paid',
          details: {
            ...personalDetail?.personalInfo,
            ...personalDetail?.contactInfo,
            ...professionalDetail?.professionalDetails,
            membershipCategoryName: categoryName, // Add resolved category name
            paymentData: {
              paymentMethod: subscriptionDetail?.subscriptionDetails?.paymentType === 'Card Payment' ? 'card' : subscriptionDetail?.subscriptionDetails?.paymentType,
              total: amount,
              date: subscriptionDetail?.subscriptionDetails?.submissionDate,
            },
          },
        },
      ]);
    } else {
      setPaymentRows([]);
    }
  }, [subscriptionDetail, personalDetail, professionalDetail, categoryLookups]);

  console.log('Payment==================>', paymentRows);

  // Get category name by ID from dynamic lookup
  const getMembershipCategoryLabel = (categoryId) => {
    if (!categoryId) return 'N/A';
    
    // Find category in the lookup by _id or id
    const category = categoryLookups?.find(
      cat => (cat?._id === categoryId || cat?.id === categoryId)
    );
    
    return category?.name || 'N/A';
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
            document={<ReceiptPDF data={receiptData || {}} />}
            fileName={`receipt-${new Date().getTime()}.pdf`}>
            {({ loading }) => (
              <Button type="primary" loading={loading}>
                {loading ? 'Preparing PDF...' : 'Download as PDF'}
              </Button>
            )}
          </PDFDownloadLink>,
        ]}
        title="Payment Receipt"
        width={750}
        centered>
        {receiptData && <Receipt data={receiptData} />}
      </Modal>
    </Card>
  );
};

export default Payments;
