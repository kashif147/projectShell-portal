import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Tag, Modal } from 'antd';
import Button from '../components/common/Button';
import Receipt, { ReceiptPDF } from '../components/Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useApplication } from '../contexts/applicationContext';

const Payments = () => {
  const { subscriptionDetail, personalDetail, professionalDetail } =
    useApplication();
  const [paymentRows, setPaymentRows] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    if (subscriptionDetail) {
      setPaymentRows([
        {
          key: 1,
          date: new Date('2025-08-06T14:55:00.000Z').toLocaleDateString(),
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

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('receipt.pdf');
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
        description.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
