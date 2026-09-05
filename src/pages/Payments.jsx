import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Empty, Pagination, Spin, Tag } from 'antd';
import {
  CreditCardOutlined,
  FilePdfOutlined,
  DollarCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Button from '../components/common/Button';
import Receipt, { ReceiptPDF } from '../components/Receipt';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { useProfile } from '../contexts/profileContext';
import { getAccountStatementRequest } from '../api/account.api';
import { formatToDDMMYYYY } from '../helpers/date.helper';
import { getSettlementStatusMemberLabel } from '../helpers/paymentIntent.helper';

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

  useEffect(() => {
    getProfileDetail();
  }, []);

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

  const getTxnAmountInCents = tx => {
    if (!tx) return 0;

    if (typeof tx.amount === 'number') return Math.abs(tx.amount);
    if (typeof tx.total === 'number') return Math.abs(tx.total);

    const entries = Array.isArray(tx.entries) ? tx.entries : [];
    if (!entries.length) return 0;

    const memberId = statementData?.memberId;
    const relevant = memberId
      ? entries.filter(e => e.memberId === memberId)
      : entries;

    if (!relevant.length) return 0;

    const net = relevant.reduce((sum, e) => {
      const amount = typeof e.amount === 'number' ? e.amount : 0;
      if (!amount) return sum;
      return sum + (e.dc === 'C' ? -amount : amount);
    }, 0);

    return Math.abs(net);
  };

  useEffect(() => {
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
        const status = getSettlementStatusMemberLabel(rawStatus);

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

  const getMembershipCategoryLabel = categoryId => {
    if (!categoryId) return 'N/A';

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
      render: val => <span className="font-semibold text-slate-700">{val}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: description => (
        <span className="font-medium text-slate-900">
          {description || getMembershipCategoryLabel(description) || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => {
        const amountInEuros =
          typeof amount === 'number'
            ? (amount / 100).toFixed(2)
            : '0.00';
        return <span className="font-extrabold text-slate-900">€{amountInEuros}</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="default"
          icon={<FilePdfOutlined />}
          onClick={() => {
            setReceiptData(record.details);
            setReceiptVisible(true);
          }}>
          View Receipt
        </Button>
      ),
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = paymentRows.slice(startIndex, endIndex);
  const totalPages = Math.ceil(paymentRows.length / pageSize);

  useEffect(() => {
    if (paymentRows.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [paymentRows.length, totalPages, currentPage]);

  const renderMobileCard = record => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm mb-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">{record.date || 'N/A'}</span>
          <span className="text-base font-black text-slate-900">
            {typeof record.amount === 'number'
              ? `€${(record.amount / 100).toFixed(2)}`
              : '€0.00'}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">
            {record.description || getMembershipCategoryLabel(record.description) || 'N/A'}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button
            size="middle"
            type="default"
            icon={<FilePdfOutlined />}
            onClick={() => {
              setReceiptData(record.details);
              setReceiptVisible(true);
            }}
            className="w-full">
            View Receipt
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <DollarCircleOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Processed Transactions
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {paymentRows.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <CreditCardOutlined />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Account Status
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {profileDetail?.membershipNumber ? `Member #${profileDetail.membershipNumber}` : 'Account Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between py-1">
            <span className="font-poppins text-lg font-bold text-slate-900">
              Payment History
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {paymentRows.length} records
            </span>
          </div>
        }
        className="overflow-hidden border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)]">
        {statementLoading && profileDetail?.membershipNumber ? (
          <div className="py-16 flex justify-center items-center">
            <Spin size="large" tip="Loading transactions..." />
          </div>
        ) : paymentRows.length === 0 ? (
          <Empty
            description={
              profileDetail?.membershipNumber
                ? 'No transactions found.'
                : 'No payment history found.'
            }
            className="py-16"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedRows.length > 0 ? (
                <>
                  {paginatedRows.map(record => (
                    <div key={record.key}>{renderMobileCard(record)}</div>
                  ))}

                  {paymentRows.length > pageSize && (
                    <div className="mt-4 flex flex-col items-center gap-2 pt-2">
                      <Pagination
                        current={currentPage}
                        total={paymentRows.length}
                        pageSize={pageSize}
                        onChange={page => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        showSizeChanger={false}
                        size="small"
                      />
                      <p className="text-xs text-slate-500">
                        Page {currentPage} of {Math.ceil(paymentRows.length / pageSize)}
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
            <div className="hidden md:block overflow-x-auto">
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
              <Button type="primary" size="large" icon={<FilePdfOutlined />} loading={loading}>
                {loading ? 'Preparing PDF...' : 'Download PDF Receipt'}
              </Button>
            )}
          </PDFDownloadLink>,
        ]}
        title="Payment Receipt"
        width={800}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          paddingBottom: 0,
        }}
        bodyStyle={{
          padding: '0',
          height: 'calc(90vh - 120px)',
          maxHeight: 'calc(90vh - 120px)',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
        centered>
        {receiptData && <Receipt data={receiptData} />}
      </Modal>
    </div>
  );
};

export default Payments;
