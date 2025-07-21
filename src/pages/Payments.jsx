import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Tag, Modal } from 'antd';
import Button from '../components/common/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Receipt from '../components/Receipt';

const Payments = () => {
  const [paymentRows, setPaymentRows] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const formData = JSON.parse(localStorage.getItem('applicationFormData'));
    if (
      formData &&
      formData.subscriptionDetails &&
      formData.subscriptionDetails.paymentData
    ) {
      const sub = formData.subscriptionDetails;
      setPaymentRows([
        {
          key: 1,
          date: sub.dateOfSubscription
            ? new Date(sub.dateOfSubscription).toLocaleDateString()
            : '',
          description: formData.professionalDetails.membershipCategory,
          amount: sub.paymentData.total,
          status: 'Paid',
          details: {
            ...formData.personalInfo,
            ...formData.professionalDetails,
            ...sub,
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
          <Button key="download" onClick={handleDownloadPDF}>
            Download as PDF
          </Button>,
        ]}
        title="Payment Receipt"
        width={650}>
        {receiptData && <Receipt ref={receiptRef} data={receiptData} />}
      </Modal>
    </Card>
  );
};

export default Payments;
