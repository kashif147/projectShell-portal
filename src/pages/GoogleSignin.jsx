import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';

const GoogleSignin = () => {
  const navigate = useNavigate();
  const [starting, setStarting] = React.useState(false);

  const handleContinue = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await microSoftUrlRedirect('gmail');
    } catch (error) {
      setStarting(false);
      toast.error(
        error?.message || 'Unable to start Google sign-in. Please try again.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Google Sign-In</h1>
        <p className="mt-3 text-sm text-slate-600">
          Continue with your Google account through the secure Microsoft B2C
          flow.
        </p>
        <button
          type="button"
          disabled={starting}
          onClick={handleContinue}
          className="mt-6 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {starting ? 'Starting…' : 'Continue with Google'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-3 block w-full rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Landing
        </button>
      </div>
    </div>
  );
};

export default GoogleSignin;
