import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Modal, Empty, Pagination } from 'antd';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch category lookups on mount
  // useEffect(() => {
  //   if (!categoryLookups || categoryLookups.length === 0) {
  //     fetchLookups('category');
  //   }
  // }, []);

  useEffect(() => {
    if (subscriptionDetail) {
      const amount =
        subscriptionDetail?.subscriptionDetails?.totalAmount || '92';
      const categoryId =
        professionalDetail?.professionalDetails?.membershipCategory;

      // Get category name for receipt
      const category = categoryLookups?.find(
        cat => cat?._id === categoryId || cat?.id === categoryId,
      );
      const categoryName = category?.name || categoryId;

      // Handle multiple payments - check if payments is an array or single payment
      const payments = subscriptionDetail?.subscriptionDetails?.payments ||
        subscriptionDetail?.payments || [
          subscriptionDetail?.subscriptionDetails,
        ];

      // Ensure payments is an array
      const paymentsArray = Array.isArray(payments)
        ? payments
        : [subscriptionDetail?.subscriptionDetails];

      // Map payments to rows
      const mappedPayments = paymentsArray
        .filter(payment => payment) // Filter out null/undefined
        .map((payment, index) => ({
          key: payment.id || payment.key || index + 1,
          date: formatToDDMMYYYY(
            payment.submissionDate ||
              payment.date ||
              subscriptionDetail?.subscriptionDetails?.submissionDate,
          ),
          description: payment.membershipCategory || categoryId,
          amount: payment.totalAmount || payment.amount || amount,
          status: payment.status || 'Paid',
          details: {
            ...personalDetail?.personalInfo,
            ...personalDetail?.contactInfo,
            ...professionalDetail?.professionalDetails,
            membershipCategoryName: categoryName,
            paymentData: {
              paymentMethod:
                payment.paymentType ||
                subscriptionDetail?.subscriptionDetails?.paymentType ===
                  'Card Payment'
                  ? 'card'
                  : subscriptionDetail?.subscriptionDetails?.paymentType,
              total: payment.totalAmount || payment.amount || amount,
              date:
                payment.submissionDate ||
                payment.date ||
                subscriptionDetail?.subscriptionDetails?.submissionDate,
            },
          },
        }));

      setPaymentRows(mappedPayments);

      // Reset to first page when payments change
      setCurrentPage(1);
    } else {
      setPaymentRows([]);
      setCurrentPage(1);
    }
  }, [subscriptionDetail, personalDetail, professionalDetail, categoryLookups]);

  console.log('Payment==================>', paymentRows);

  // Get category name by ID from dynamic lookup
  const getMembershipCategoryLabel = categoryId => {
    if (!categoryId) return 'N/A';

    // Find category in the lookup by _id or id
    const category = categoryLookups?.find(
      cat => cat?._id === categoryId || cat?.id === categoryId,
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
      render: description => getMembershipCategoryLabel(description),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => {
        // Convert from cents to euros and format with € sign
        const amountInEuros = amount
          ? ((amount * 100) / 100).toFixed(2)
          : '0.00';
        return `€${amountInEuros}`;
      },
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

  // Calculate pagination - ensure we don't go out of bounds
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = paymentRows.slice(startIndex, endIndex);
  const totalPages = Math.ceil(paymentRows.length / pageSize);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (paymentRows.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [paymentRows.length, totalPages, currentPage]);

  // Render mobile card view
  const renderMobileCard = record => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm mb-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {record.date || 'N/A'}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm font-medium text-gray-800">
              {getMembershipCategoryLabel(record.description)}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-sm font-medium text-gray-800">
              {record.amount
                ? `€${((record.amount * 100) / 100).toFixed(2)}`
                : '€0.00'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <Tag
              color={record.status === 'Paid' ? 'green' : 'red'}
              className="mt-1">
              {record.status}
            </Tag>
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <Button
              size="small"
              onClick={() => {
                setReceiptData(record.details);
                setReceiptVisible(true);
              }}
              className="w-full">
              View Receipt
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-1 sm:px-6 py-4 sm:py-6">
      <Card title="Payment History" bodyStyle={{ padding: '8px' }}>
        {paymentRows.length === 0 ? (
          <Empty
            description="No payment history found."
            className="py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {paginatedRows.length > 0 ? (
                <>
                  {paginatedRows.map(record => (
                    <div key={record.key}>{renderMobileCard(record)}</div>
                  ))}

                  {/* Mobile Pagination - Show if more than pageSize items */}
                  {paymentRows.length > pageSize && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <Pagination
                        current={currentPage}
                        total={paymentRows.length}
                        pageSize={pageSize}
                        onChange={page => {
                          setCurrentPage(page);
                          // Scroll to top when page changes
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        showSizeChanger={false}
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} of ${total} payment${total > 1 ? 's' : ''}`
                        }
                        size="small"
                        simple={false}
                      />
                      <p className="text-xs text-gray-500">
                        Page {currentPage} of{' '}
                        {Math.ceil(paymentRows.length / pageSize)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Empty
                  description="No payments on this page."
                  className="py-8"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table
                dataSource={paymentRows}
                columns={columns}
                rowKey="key"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: paymentRows.length,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} payments`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                  onShowSizeChange: (current, size) => {
                    setCurrentPage(1);
                    setPageSize(size);
                  },
                }}
              />
            </div>
          </>
        )}
      </Card>

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
        width={800}
        style={{ 
          maxWidth: '90vw',
          maxHeight: '90vh',
          paddingBottom: 0
        }}
        bodyStyle={{ 
          padding: '0', 
          height: 'calc(90vh - 120px)',
          maxHeight: 'calc(90vh - 120px)', 
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
        centered>
        {receiptData && <Receipt data={receiptData} />}
      </Modal>
    </div>
  );
};

export default Payments;
