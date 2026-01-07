import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplication } from '../../contexts/applicationContext';
import { applicationConfirmationRequest } from '../../api/application.api';
import CreditCardPaymentWrapper from './CreditCardPaymentWrapper';
import StandingBankersOrder from './StandingBankersOrder';
import DirectDebit from './DirectDebit';
import SalaryDeduction from './SalaryDeduction';

const PaymentMethod = () => {
  const navigate = useNavigate();
  const { personalDetail, subscriptionDetail } = useApplication();
  const [selectedPaymentType, setSelectedPaymentType] = useState('Credit Card');
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize payment type to match component mapping
  const normalizePaymentType = (paymentType) => {
    if (!paymentType) return 'Credit Card';
    
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
    
    // Handle Salary Deduction
    if (normalized.includes('salary') || normalized.includes('deduction')) {
      return 'Salary Deduction';
    }
    
    // Handle Credit Card
    if (normalized.includes('credit') || normalized.includes('card')) {
      return 'Credit Card';
    }
    
    // Default fallback
    return 'Credit Card';
  };

  // Get default payment type based on application status
  const getDefaultPaymentType = () => {
    if (applicationStatus === 'approved' || applicationStatus === 'submitted') {
      const paymentType = subscriptionDetail?.subscriptionDetails?.paymentType;
      if (paymentType) {
        return normalizePaymentType(paymentType);
      }
    }
    return 'Credit Card'; // Default fallback
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

  // Payment type options
  const paymentTypes = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Standing Banking Order', label: 'Standing Banking Order' },
    { value: 'Direct Debit', label: 'Direct Debit' },
    { value: 'Salary Deduction', label: 'Salary Deduction' },
  ];

  // Render the appropriate payment component
  const renderPaymentComponent = () => {
    switch (selectedPaymentType) {
      case 'Credit Card':
        return <CreditCardPaymentWrapper />;
      case 'Standing Banking Order':
        return <StandingBankersOrder />;
      case 'Direct Debit':
        return <DirectDebit />;
      case 'Salary Deduction':
        return <SalaryDeduction />;
      default:
        return <CreditCardPaymentWrapper />;
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
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all">
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
        {renderPaymentComponent()}
      </div>
    </div>
  );
};

export default PaymentMethod;
