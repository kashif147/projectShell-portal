import React from 'react';
import Button from '../components/common/Button';
import { Logo, Image1 } from '../assets/images/index';
import { setVerifier } from '../helpers/verifier.helper';
import { generatePKCE } from '../helpers/crypt.helper';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';

const LandingPage = () => {
  const handleLogin = async () => {
    await microSoftUrlRedirect()
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Image */}
      <div className="hidden md:block relative">
        <img src={Image1} alt="Welcome" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Right Content */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          {/* Microsoft Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-5 h-5 bg-[#F25022] inline-block" />
              <span className="w-5 h-5 bg-[#7FBA00] inline-block" />
              <span className="w-5 h-5 bg-[#00A4EF] inline-block" />
              <span className="w-5 h-5 bg-[#FFB900] inline-block" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Microsoft</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome to Members Portal
          </h1>
          <p className="text-gray-600 mb-8 text-base md:text-lg">
            Sign in to access your membership services and continue your application.
          </p>

          <Button
            type="primary"
            onClick={handleLogin}
            className="w-full px-6 py-4 text-base md:text-lg"
          >
            Continue with Microsoft
          </Button>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Continue to sign in with your Microsoft account
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;