import React from 'react';
import Button from '../components/common/Button';
import { Logo } from '../assets/images/index';
import { setVerifier } from '../helpers/verifier.helper';
import { generatePKCE } from '../helpers/crypt.helper';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';

const LandingPage = () => {
  const handleLogin = async () => {
    await microSoftUrlRedirect()
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Spinning Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={Logo}
          alt="Logo"
          className="w-72 h-72 md:w-[40vw] md:h-[40vw] lg:w-[35vw] lg:h-[35vw] 
               opacity-15 animate-spin object-contain"
          style={{ animationDuration: '25s' }}
        />
      </div>

      {/* Content Container */}
      <div className="text-center z-10 max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Welcome to Members Portal
        </h1>
        <p className="text-gray-600 mb-8 text-lg md:text-xl">
          Access all your membership services in one place
        </p>

        {/* Centered Button Container */}
        <div className="flex justify-center">
          <Button
            type="primary"
            onClick={handleLogin}
            className="w-full md:w-auto px-10 py-4 text-lg md:text-xl"
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;