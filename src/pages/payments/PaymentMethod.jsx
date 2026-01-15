import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/applicationContext';
import { applicationConfirmationRequest } from '../../api/application.api';
import StandingBankersOrder from './StandingBankersOrder';
import DirectDebit from './DirectDebit';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const { personalDetail, subscriptionDetail } = useApplication();
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
    
    // Return null for unrecognized payment types (Credit Card, Salary Deduction, etc.)
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

  // Check application status on mount
  useEffect(() => {
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
  }, [personalDetail?.applicationId]);

  // Set default payment type once status is checked
  useEffect(() => {
    if (!loading) {
      const defaultType = getDefaultPaymentType();
      setSelectedPaymentType(defaultType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationStatus, subscriptionDetail?.subscriptionDetails?.paymentType, loading]);

  // Payment type options - only Standing Banking Order and Direct Debit
  const paymentTypes = [
    { value: 'Standing Banking Order', label: 'Standing Banking Order' },
    { value: 'Direct Debit', label: 'Direct Debit' },
  ];

  // Render the appropriate payment component
  const renderPaymentComponent = () => {
    if (!selectedPaymentType) {
      return null;
    }

    switch (selectedPaymentType) {
      case 'Standing Banking Order':
        return <StandingBankersOrder />;
      case 'Direct Debit':
        return <DirectDebit />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Type Selector Bar - Sticky at top */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 -ml-0.5 sm:ml-0">
              <svg
                className="w-5 h-5 text-gray-600"
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
            
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                Payment Method
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Select your preferred payment method
              </p>
            </div>

            {/* Payment Type Selector - Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
              {paymentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedPaymentType(type.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap relative ${
                    selectedPaymentType === type.value
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Type Selector - Mobile Dropdown */}
          <div className="md:hidden pb-3 -mt-1">
            <select
              value={selectedPaymentType || ''}
              onChange={(e) => setSelectedPaymentType(e.target.value || null)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all">
              <option value="">Select payment method</option>
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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
                Please select a payment method from the options above to continue.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
