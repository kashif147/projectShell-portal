import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/applicationContext';
import { applicationConfirmationRequest } from '../../api/application.api';
import StandingBankersOrder from './StandingBankersOrder';
import DirectDebit from './DirectDebit';
import SalaryDeduction from './SalaryDeduction';
import { PAYMENT_FORM_META } from './paymentFormMeta';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const {
    personalDetail,
    subscriptionDetail,
    applicationStatus: contextApplicationStatus,
  } = useApplication();
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize payment type to match component mapping
  const normalizePaymentType = (paymentType) => {
    if (!paymentType) return null;
    
    const normalized = paymentType.toString().toLowerCase();
    
    // Handle Standing Bankers Order variations
    if (
      normalized.includes('standing') &&
      (normalized.includes('banker') || normalized.includes('bank') || normalized.includes('order'))
    ) {
      return 'Standing Banking Order';
    }
    
    // Handle Direct Debit
    if (normalized.includes('direct') && normalized.includes('debit')) {
      return 'Direct Debit';
    }

    // Handle Salary Deduction variations
    if (
      (normalized.includes('salary') && normalized.includes('deduction')) ||
      normalized.includes('payroll')
    ) {
      return 'Salary Deduction';
    }
    
    // Return null for unrecognized payment types
    return null;
  };

  // Get default payment type based on application status
  const getDefaultPaymentType = () => {
    if (applicationStatus === 'approved' || applicationStatus === 'submitted') {
      const paymentType = subscriptionDetail?.subscriptionDetails?.paymentType;
      if (paymentType) {
        const normalized = normalizePaymentType(paymentType);
        // Only return if it's a valid payment type (Standing Banking Order or Direct Debit)
        if (normalized) {
          return normalized;
        }
      }
    }
    return null; // No default payment type
  };

  // Use context applicationStatus when available (from aggregated CRM), else fetch
  useEffect(() => {
    if (contextApplicationStatus != null) {
      setApplicationStatus(contextApplicationStatus);
      setLoading(false);
      return;
    }

    const checkApplicationStatus = async () => {
      if (personalDetail?.applicationId) {
        try {
          const response = await applicationConfirmationRequest(
            personalDetail.applicationId,
          );

          if (
            response?.status === 200 ||
            response?.data?.status === 'success'
          ) {
            const status =
              response?.data?.data?.applicationStatus ||
              response?.data?.applicationStatus;
            setApplicationStatus(status);
          }
        } catch (error) {
          console.error('Failed to fetch application status:', error);
          setApplicationStatus(null);
        }
      }
      setLoading(false);
    };

    checkApplicationStatus();
  }, [personalDetail?.applicationId, contextApplicationStatus]);

  // Set default payment type once status is checked
  useEffect(() => {
    if (!loading) {
      const defaultType = getDefaultPaymentType();
      setSelectedPaymentType(defaultType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationStatus, subscriptionDetail?.subscriptionDetails?.paymentType, loading]);

  const paymentTypes = [
    { value: 'Standing Banking Order', label: 'Standing Banking Order' },
    { value: 'Direct Debit', label: 'Direct Debit' },
    { value: 'Salary Deduction', label: 'Salary Deduction' },
  ];

  const activeTabMeta = selectedPaymentType
    ? PAYMENT_FORM_META[selectedPaymentType]
    : null;

  // Render the appropriate payment component
  const renderPaymentComponent = () => {
    if (!selectedPaymentType) {
      return null;
    }

    switch (selectedPaymentType) {
      case 'Standing Banking Order':
        return <StandingBankersOrder embedded />;
      case 'Direct Debit':
        return <DirectDebit embedded />;
      case 'Salary Deduction':
        return <SalaryDeduction embedded />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  const tabList = (
    <div
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 shrink-0"
      role="tablist"
      aria-label="Payment method">
      {paymentTypes.map(type => (
        <button
          key={type.value}
          type="button"
          role="tab"
          aria-selected={selectedPaymentType === type.value}
          onClick={() => setSelectedPaymentType(type.value)}
          className={`h-9 px-2.5 sm:px-4 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-150 ${
            selectedPaymentType === type.value
              ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
          }`}>
          {type.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-3 sm:py-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Go back">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                {activeTabMeta ? (
                  <>
                    <h1 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                      {activeTabMeta.title}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {activeTabMeta.subtitle}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    Select a payment method to continue
                  </p>
                )}
              </div>
              <div className="flex shrink-0 justify-end sm:ml-4">{tabList}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Component Container */}
      <div className="relative">
        {selectedPaymentType ? (
          renderPaymentComponent()
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Change Your Payment Method
              </h2>
              <p className="text-gray-600 mb-6">
                Please select a payment method from the tabs above to continue.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
