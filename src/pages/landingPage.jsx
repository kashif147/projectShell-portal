import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CreditCard,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { Logo, ShellLogo, Splash } from '../assets/images/index';
import { microSoftUrlRedirect } from '../helpers/B2C.helper';
import '../assets/theme/landing.css';

const FEATURES = [
  { icon: LayoutDashboard, label: 'Personal Dashboard' },
  { icon: LifeBuoy, label: 'Issue Management' },
  { icon: UserPlus, label: 'Apply for Membership' },
  { icon: CalendarDays, label: 'Events & Workshops' },
  { icon: BookOpen, label: 'Member Resources' },
  { icon: GraduationCap, label: 'Learning Courses' },
  { icon: MessageSquare, label: 'Messages & Notifications' },
  { icon: CreditCard, label: 'Secure Payments' },
];

function GoogleG() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const LandingPage = () => {
  const handleLogin = async () => {
    await microSoftUrlRedirect('signin');
  };

  const handleGoogleLogin = async () => {
    await microSoftUrlRedirect('gmail');
  };

  const handleSignUp = async () => {
    await microSoftUrlRedirect('signup');
  };

  return (
    <div className="landing">
      <section className="landing__hero">
        <img
          className="landing__hero-bg"
          src={Splash}
          alt="Members collaborating"
        />
        <div className="landing__hero-overlay" />

        <a
          className="landing__logo"
          href="/"
          onClick={e => e.preventDefault()}>
          <img
            src={ShellLogo}
            alt="ProjectShell"
            className="landing__logo-mark"
          />
          <img src={Logo} alt="ProjectShell" className="landing__logo-full" />
        </a>

        <div className="landing__hero-body">
          <span className="landing__eyebrow">
            <ShieldCheck size={14} /> Member Portal
          </span>
          <h1 className="hero-title">
            Your Gateway to<span>Excellence.</span>
          </h1>
          <p className="landing__lead">
            Manage your profile, track subscriptions, and handle payments in one
            secure, unified platform designed for our members.
          </p>

          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="feature-item">
                <span className="feature-ic">
                  <Icon size={18} />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="landing__trust">
            <span className="trust-item">
              <Lock size={16} /> Bank-grade encryption
            </span>
            <span className="trust-item">
              <Globe size={16} /> Global accessibility
            </span>
          </div>
        </div>
      </section>

      <section className="landing__auth">
        <div className="auth-card">
          <div className="auth-head">
            <h2>Already signed up?</h2>
            <span className="sso-pill">
              <ShieldCheck size={12} /> SECURE SSO
            </span>
          </div>
          <p className="auth-sub">Sign in to access your portal.</p>

          <button type="button" className="btn-signin" onClick={handleLogin}>
            <ShieldCheck size={18} /> Sign in with your email{' '}
            <ArrowRight size={17} />
          </button>

          <div className="or-divider">OR</div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}>
            <GoogleG /> Continue with Google
          </button>

          <div className="section-divider">FIRST TIME HERE?</div>

          <div className="new-block">
            <h3>New to the portal?</h3>
            <p>
              Apply for membership and create your account to access exclusive
              services.
            </p>
            <button type="button" className="btn-create" onClick={handleSignUp}>
              <Plus size={17} /> Create an Account <ArrowRight size={16} />
            </button>
          </div>

          <div className="auth-footer">
            <a href="#privacy" onClick={e => e.preventDefault()}>
              Privacy
            </a>
            <span className="dot">•</span>
            <a href="#terms" onClick={e => e.preventDefault()}>
              Terms
            </a>
            <span className="dot">•</span>
            <a href="#support" onClick={e => e.preventDefault()}>
              Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
