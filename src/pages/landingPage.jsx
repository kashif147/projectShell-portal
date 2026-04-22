import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  CreditCard,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MessageSquare,
  Plus,
  Shield,
  Users,
} from 'lucide-react';
import { Logo } from '../assets/images/index';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';

const LandingPage = () => {
  const navigate = useNavigate();
  const portalFeatures = [
    { label: 'Personal Dashboard', icon: LayoutDashboard },
    { label: 'Issue Management', icon: LifeBuoy },
    { label: 'Apply for Membership', icon: Users },
    { label: 'Events & Workshops', icon: Calendar },
    { label: 'Member Resources', icon: BookOpen },
    { label: 'Learning Courses', icon: GraduationCap },
    { label: 'Messages & Notifications', icon: MessageSquare },
    { label: 'Secure Payments', icon: CreditCard },
  ];

  const handleLogin = async () => {
    await microSoftUrlRedirect('signin');
  };

  const handleGoogleLogin = async() => {
    await microSoftUrlRedirect('google');
    // navigate('/google-signin');
  };

  const handleSignUp = async () => {
    await microSoftUrlRedirect('signup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white lg:flex-row">
      <div className="relative w-full overflow-hidden p-8 text-white md:p-14 lg:w-3/5">
        <img
          src={`https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200`}
          alt="Members collaborating"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3f3d8f]/80 via-[#4e4bb0]/75 to-[#2d2b6b]/82" />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.18),_transparent_50%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <img src={Logo} alt="Portal logo" className="h-8 w-8 rounded-lg bg-white p-1" />
            <span className="text-xl font-bold tracking-tight">MemberHub</span>
          </div>

          <div className="my-12 lg:my-0">
            <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-6xl">
              Your Gateway to <br />
              <span className="text-blue-200">Excellence.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100 md:text-xl">
              Manage your profile, track subscriptions, and handle payments in one
              secure, unified platform designed for our members.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 text-blue-50 sm:grid-cols-2">
              {portalFeatures.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="text-base text-blue-200">
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-white/15 pt-7 text-sm text-blue-200">
            <span className="inline-flex items-center gap-2">
              <Lock size={16} />
              Bank-grade encryption
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe size={16} />
              Global accessibility
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-slate-50 p-6 md:p-10 lg:w-2/5">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 md:p-10">
          <div className="mb-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Already signed up?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in to access your portal.
                </p>
              </div>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Secure SSO
              </span>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#2563EB] sm:text-base"
              >
                <Shield size={18} />
                <span>Sign in with your email</span>
                <ArrowRight size={18} />
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-white px-2 font-bold uppercase tracking-widest text-slate-400">
                    OR
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                  alt="Google"
                  className="h-5 w-5"
                  referrerPolicy="no-referrer"
                />
                <span className="font-semibold text-slate-700">Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="relative mb-2 py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-white px-4 font-bold uppercase tracking-widest text-slate-400">
                First time here?
              </span>
            </div>
          </div>

          <div className="text-center">
            <h3 className="mb-2 text-lg font-bold text-slate-900">New to the portal?</h3>
            <p className="mb-6 px-4 text-sm text-slate-500">
              Apply for membership and create your account to access exclusive
              services.
            </p>

            <button
              type="button"
              onClick={handleSignUp}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#CBD5E1] bg-[#EEF2FF] px-4 py-3 font-bold text-[#1E3A8A] transition-all hover:bg-[#E0E7FF]"
            >
                <Plus size={18} />
                <span>Create an Account</span>
                <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <div className="flex justify-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-400">
              <span>Privacy</span>
              <span>•</span>
              <span>Terms</span>
              <span>•</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;