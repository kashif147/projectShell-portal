import React from 'react';

const IncomeProtectionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-8 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                INMO Income Protection Scheme – Automatic Access and 9 Months' Free Cover!
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <p>The INMO has negotiated automatic membership of the INMO Income Protection Scheme, for new INMO graduate members who:</p>
                <ol className="list-decimal ml-6 space-y-1">
                  <li>Join the INMO via this Graduate application form, <strong>and</strong></li>
                  <li>Consent to sharing their union data with Cornmarket, <strong>and</strong></li>
                  <li>Are committed as a new INMO Graduate member <strong>and</strong></li>
                  <li>Meet the eligibility criteria of the Scheme.</li>
                </ol>
                <p className="mt-3">This gives graduates the time of completing an application form and avoids potential medical underwriting.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">The Scheme Includes:</h3>
          
          <div className="space-y-4">
            {/* Disability Benefit */}
            <div className="bg-blue-700 text-white p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Disability Benefit</h4>
                  <p className="text-sm">provides a replacement income if you can't work due to illness or injury</p>
                </div>
              </div>
            </div>

            {/* Death Benefit */}
            <div className="bg-blue-700 text-white p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Death Benefit</h4>
                  <p className="text-sm">provides a lump sum of typically twice your annual salary if you die</p>
                </div>
              </div>
            </div>

            {/* Specified Illness Benefit */}
            <div className="bg-blue-700 text-white p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Specified Illness Benefit</h4>
                  <p className="text-sm">provides a lump sum if you are diagnosed with one of the illnesses covered</p>
                </div>
              </div>
            </div>

            {/* MyDoc */}
            <div className="bg-blue-700 text-white p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">MyDoc</h4>
                  <p className="text-sm">easy, online healthcare service for you and your family</p>
                </div>
              </div>
            </div>
          </div>

          {/* More Information Section */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>For more information on the Scheme,</strong> visit{' '}
              <a href="https://cornmarket.ie/inmo" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                cornmarket.ie/inmo
              </a>{' '}
              or scan the QR code
            </p>
          </div>

          {/* Data Privacy and How It Works Section */}
          <div className="mt-8 bg-blue-900 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Cornmarket and Irish Life Data Privacy Notices</h3>
            <p className="text-sm mb-4">
              Where consent to share your union membership data has been provided by you, confirmed member data will be shared with 
              Cornmarket Group Financial Services Ltd (Scheme Administrator) and Irish Life (Scheme Insurer), for the purposes of providing 
              eligible members with cover under the INMO Income Protection Scheme (including 9 Months Free). Cornmarket's Data Privacy 
              Notice is available at{' '}
              <a href="https://www.insinmo.ie/privacy-notices" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">
                www.insinmo.ie/privacy-notices
              </a>
            </p>
            <p className="text-sm mb-4">
              The information provided by you on this form will be used by the INMO, Cornmarket and Irish Life. If Cornmarket already has your 
              details on their system, they will update your contact details based on the information you provide on this form.
            </p>
            
            <h3 className="text-xl font-bold mb-3 mt-6">How it works</h3>
            <p className="text-sm mb-3">
              If you consent to sharing your union membership data with Cornmarket, further details regarding the Scheme will be sent to you. 
              Your application will be reviewed and accepted you as a new graduate member of the INMO. For full details of Scheme benefits, 
              please go to{' '}
              <a href="https://cornmarket.ie/inmo" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline hover:text-blue-200">
                cornmarket.ie/inmo
              </a>.
            </p>
            <p className="text-sm mb-3">
              Cover will not begin until Cornmarket writes to you confirming you have been accepted as a member of the Scheme. If accepted as 
              a member, you can cancel your cover at any time by contacting Cornmarket.
            </p>
            <p className="text-sm">
              Premiums will start at the end of the 9-month free period, either automatically from your salary, or via direct debit if you provide 
              your direct debit details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeProtectionModal;

