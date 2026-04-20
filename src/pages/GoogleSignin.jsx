import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleSignin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Google Sign-In</h1>
        <p className="mt-3 text-sm text-slate-600">
          This is a local placeholder page. Google OAuth integration can be added
          here next.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
        >
          Back to Landing
        </button>
      </div>
    </div>
  );
};

export default GoogleSignin;
