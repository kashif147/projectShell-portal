import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Empty, Pagination, Spin } from 'antd';
import Button from '../components/common/Button';
import Receipt, { ReceiptPDF } from '../components/Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { useProfile } from '../contexts/profileContext';
import { getAccountStatementRequest } from '../api/account.api';
import { formatToDDMMYYYY } from '../helpers/date.helper';

const Payments = () => {
  const { subscriptionDetail, personalDetail, professionalDetail } =
    useApplication();
  const { categoryLookups } = useLookup();
  const { profileDetail, getProfileDetail } = useProfile();
  const [paymentRows, setPaymentRows] = useState([]);
  const [statementData, setStatementData] = useState(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Ensure profile is loaded for membership number
  useEffect(() => {
    getProfileDetail();
  }, []);

  // Fetch account statement when membership number is available
  useEffect(() => {
    const memberId = profileDetail?.membershipNumber;
    if (!memberId) {
      return;
    }
    setStatementLoading(true);
    getAccountStatementRequest(memberId)
      .then(res => {
        if (res?.status === 200 && res?.data?.data) {
          setStatementData(res.data.data);
        }
      })
      .catch(() => {
        setStatementData(null);
      })
      .finally(() => {
        setStatementLoading(false);
      });
  }, [profileDetail?.membershipNumber]);

  // Helper to derive amount (in cents) from transaction entries
  const getTxnAmountInCents = tx => {
    if (!tx) return 0;

    // Prefer explicit amount/total if API provides it
    if (typeof tx.amount === 'number') return Math.abs(tx.amount);
    if (typeof tx.total === 'number') return Math.abs(tx.total);

    const entries = Array.isArray(tx.entries) ? tx.entries : [];
    if (!entries.length) return 0;

    const memberId = statementData?.memberId;
    const relevant = memberId
      ? entries.filter(e => e.memberId === memberId)
      : entries;

    if (!relevant.length) return 0;

    // Net for member: Debits positive, Credits negative; then show absolute value
    const net = relevant.reduce((sum, e) => {
      const amount = typeof e.amount === 'number' ? e.amount : 0;
      if (!amount) return sum;
      return sum + (e.dc === 'C' ? -amount : amount);
    }, 0);

    return Math.abs(net);
  };

  // Build payment rows from statement transactions
  useEffect(() => {
    // Exclude Invoice documents from payment history
    const txns = Array.isArray(statementData?.txns)
      ? statementData.txns.filter(
          txn => String(txn.docType || '').toLowerCase() !== 'invoice',
        )
      : [];

    if (txns.length > 0) {
      const membershipCategoryId =
        professionalDetail?.professionalDetails?.membershipCategory ||
        subscriptionDetail?.subscriptionDetails?.membershipCategory;
      const category = categoryLookups?.find(
        cat => cat?._id === membershipCategoryId || cat?.id === membershipCategoryId,
      );
      const categoryName = category?.name || 'N/A';

      const mappedTxns = txns.map((txn, index) => {
        const amountInCents = getTxnAmountInCents(txn);
        const rawStatus = txn.settlement?.status || txn.status || 'PENDING';
        const upperStatus = String(rawStatus).toUpperCase();
        const status =
          upperStatus === 'SETTLED' || upperStatus === 'PAID'
            ? 'Paid'
            : upperStatus === 'PENDING'
              ? 'Pending'
              : rawStatus;

        return {
          key: txn._id || txn.id || txn.key || `txn-${index}`,
          date: txn.date
            ? formatToDDMMYYYY(txn.date)
            : txn.transactionDate
              ? formatToDDMMYYYY(txn.transactionDate)
              : 'N/A',
          description:
            txn.displayLabel ||
            txn.memo ||
            txn.description ||
            txn.docType ||
            'Transaction',
          amount: amountInCents,
          status,
          details: {
            ...personalDetail?.personalInfo,
            ...personalDetail?.contactInfo,
            ...professionalDetail?.professionalDetails,
            membershipCategoryName: categoryName,
            paymentData: {
              paymentMethod:
                txn.settlement?.provider ||
                txn.paymentMethod ||
                txn.paymentType ||
                'N/A',
              total: amountInCents,
              date: txn.date || txn.transactionDate,
              docNo: txn.docNo,
              docType: txn.docType,
            },
            ...txn,
          },
        };
      });

      setPaymentRows(mappedTxns);
    } else {
      setPaymentRows([]);
    }
    setCurrentPage(1);
  }, [
    statementData,
    subscriptionDetail,
    personalDetail,
    professionalDetail,
    categoryLookups,
  ]);

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
      render: description =>
        description || getMembershipCategoryLabel(description) || 'N/A',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => {
        // Amount is in cents from API; convert to euros
        const amountInEuros =
          typeof amount === 'number'
            ? (amount / 100).toFixed(2)
            : '0.00';
        return `€${amountInEuros}`;
      },
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
              {record.description ||
                getMembershipCategoryLabel(record.description) ||
                'N/A'}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-sm font-medium text-gray-800">
              {typeof record.amount === 'number'
                ? `€${(record.amount / 100).toFixed(2)}`
                : '€0.00'}
            </p>
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
        {statementLoading && profileDetail?.membershipNumber ? (
          <div className="py-12 flex justify-center items-center">
            <Spin size="large" tip="Loading transactions..." />
          </div>
        ) : paymentRows.length === 0 ? (
          <Empty
            description={
              profileDetail?.membershipNumber
                ? 'No transactions found.'
                : 'No payment history found.'
            }
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
