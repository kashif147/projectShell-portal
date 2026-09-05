import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, CompassOutlined } from '@ant-design/icons';
import Button from '../components/common/Button';

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-100/60 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-indigo-100/60 blur-2xl" />

        <div className="relative z-10 space-y-5">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-sm border border-blue-100">
            <CompassOutlined />
          </div>

          <div>
            <p className="text-6xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              404
            </p>
            <h2 className="text-xl font-bold text-slate-900 mt-2 font-poppins">
              Page Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
