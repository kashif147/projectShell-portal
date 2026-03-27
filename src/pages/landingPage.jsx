import React from 'react';
import Button from '../components/common/Button';
import { Logo, Image1 } from '../assets/images/index';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';

const LandingPage = () => {
  const handleLogin = async () => {
    await microSoftUrlRedirect();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-100">
      <div className="relative hidden lg:block overflow-hidden">
        <img src={Image1} alt="Welcome" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-indigo-900/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_45%)]" />

        <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm w-fit">
            <img src={Logo} alt="Portal logo" className="h-7 w-7 rounded-md bg-white p-1" />
            <span className="text-sm font-medium tracking-wide">
              Member CRM Portal
            </span>
          </div>

          <div>
            <h2 className="max-w-xl text-4xl font-bold leading-tight">
              Manage your member profile, payments, and subscriptions in one place.
            </h2>
            <p className="mt-4 max-w-lg text-base text-blue-100">
              Secure single sign-on with Microsoft keeps your account protected
              while giving you quick access to every membership service.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70 md:p-10">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Portal logo" className="h-11 w-11 rounded-xl bg-slate-50 p-1.5" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  CRM Portal
                </p>
                <p className="text-sm text-slate-500">Member access</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Secure SSO
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Welcome back
          </h1>
          <p className="mb-8 mt-3 text-base text-slate-600 md:text-lg">
            Sign in with Microsoft to continue to your dashboard, profile, and
            account statements.
          </p>

          <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid grid-cols-2 gap-0.5">
                <span className="inline-block h-5 w-5 bg-[#F25022]" />
                <span className="inline-block h-5 w-5 bg-[#7FBA00]" />
                <span className="inline-block h-5 w-5 bg-[#00A4EF]" />
                <span className="inline-block h-5 w-5 bg-[#FFB900]" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                Continue with Microsoft
              </span>
            </div>
            <p className="text-sm text-slate-500">
              We use your organization account for secure authentication and
              seamless access to member services.
            </p>
          </div>

          <Button
            type="primary"
            onClick={handleLogin}
            className="h-12 w-full rounded-lg bg-blue-700 text-base font-semibold hover:bg-blue-800"
          >
            Sign In with Microsoft
          </Button>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Membership dashboard
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Subscription tracking
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Secure payments
            </span>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            By signing in, you continue with your organization account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;