import React from 'react';

const RewardsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-t-xl border-b-4 border-blue-600">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">INMO</h2>
                <p className="text-xl font-semibold text-blue-600">REWARDS</p>
                <p className="text-sm text-gray-600 mt-1">Supported by Cornmarket</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl font-bold ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Introduction */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <p className="text-center text-gray-700">
              Rewards offers new INMO members exclusive access to MyDoc, an online GP service, 
              for 12 months and other discounts, offers, competitions and more (benefits).
            </p>
            <p className="text-center text-sm text-gray-600 mt-3">
              Rewards is run by Cornmarket Group Financial Services Ltd. (Cornmarket).
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            {/* 12 months FREE MyDoc */}
            <div className="bg-cyan-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                12 months <span className="text-green-600 font-bold">FREE</span> MyDoc*
              </p>
            </div>

            {/* 100% FREE Mortgage Advice */}
            <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                100% <span className="text-green-600 font-bold">FREE</span> Mortgage Advice Service**
              </p>
            </div>

            {/* 9 months FREE Income Protection */}
            <div className="bg-cyan-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                9 months <span className="text-green-600 font-bold">FREE</span> Income Protection***
              </p>
            </div>

            {/* Financial Health Check */}
            <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                Your <span className="font-bold">first</span> Financial Health Check
              </p>
            </div>

            {/* Discount Bundle */}
            <div className="bg-cyan-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                <span className="font-bold">Discount Bundle</span> for Cornmarket Insurance Products
              </p>
            </div>

            {/* Competitions and More */}
            <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-900">
                Competitions, webinars and <span className="font-bold">more</span>
              </p>
            </div>
          </div>

          {/* Links and Information */}
          <div className="mt-8 space-y-2 text-sm text-gray-600">
            <p>
              To get more information about Rewards Benefits, visit:{' '}
              <a href="https://cornmarket.ie/rewards-inmo" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Cornmarket.ie/rewards-inmo/
              </a>
            </p>
            <p>
              For Rewards Membership Terms & Conditions, visit:{' '}
              <a href="https://cornmarket.ie/rewards-club-terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Cornmarket.ie/rewards-club-terms
              </a>
            </p>
            <p>
              For Income Data Protection Statement, visit:{' '}
              <a href="https://cornmarket.ie/rewards-privacy-notices" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                Cornmarket.ie/rewards-privacy-notices
              </a>
            </p>
            <p className="italic">*Terms and conditions apply</p>
          </div>

          {/* Call to Action Footer */}
          <div className="mt-8 bg-blue-900 text-white p-6 rounded-lg text-center">
            <p className="text-xl font-bold mb-2">Don't miss out. Join Rewards today by ticking the box</p>
            <p className="text-sm">on the INMO application form below</p>
            <p className="text-xs mt-4 opacity-75">
              Cornmarket Group Financial Services Ltd. is regulated by the Central Bank of Ireland.<br/>
              A member of the Irish Life Group Ltd. which is part of the Great-West Lifeco Group of companies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;

