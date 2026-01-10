import React, { useState } from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentMethodSelectionModal = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const [showPaymentTypes, setShowPaymentTypes] = useState(false);

  const handleCreditCard = () => {
    onClose();
    navigate('/payments/credit-card');
  };

  const handleStandingOrder = () => {
    onClose();
    navigate('/payments/standing-order');
  };

  const handleDirectDebit = () => {
    onClose();
    navigate('/payments/direct-debit');
  };

  return (
    <Modal
      title={null}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      }>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Select Payment Method
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Choose how you would like to make your payment
        </p>

        {!showPaymentTypes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Credit Card */}
            <button
              onClick={handleCreditCard}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Credit Card
                </h3>
                <p className="text-sm text-gray-600">
                  Pay securely with your credit or debit card
                </p>
              </div>
            </button>

            {/* Option 2: Payment Type Selection */}
            <button
              onClick={() => setShowPaymentTypes(true)}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 text-left group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Type Selection
                </h3>
                <p className="text-sm text-gray-600">
                  Choose between Standing Order or Direct Debit
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setShowPaymentTypes(false)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <svg
                className="w-5 h-5 mr-2"
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
              Back
            </button>

            <div className="grid grid-cols-1 gap-4">
              {/* Standing Bankers Order */}
              <button
                onClick={handleStandingOrder}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Standing Bankers Order
                    </h3>
                    <p className="text-sm text-gray-600">
                      Set up a recurring payment order with your bank
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>

              {/* Direct Debit */}
              <button
                onClick={handleDirectDebit}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Direct Debit
                    </h3>
                    <p className="text-sm text-gray-600">
                      Authorize automatic payments from your bank account
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentMethodSelectionModal;
