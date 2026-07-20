import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Modal, Form, Input } from 'antd';
import Button from '../components/common/Button';
import { PaymentStatusModal } from '../components/modals';

const formatCurrency = value => {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

const sanitizeDigits = value => String(value || '').replace(/\D/g, '');

const formatCardNumber = value => {
  const digits = sanitizeDigits(value).slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const RegistrationPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userDetail } = useSelector(state => state.auth);
  const paymentPayload = location.state || {};

  const source = paymentPayload.source || 'course-registration';
  const title =
    paymentPayload.courseTitle || paymentPayload.eventTitle || 'Registration';
  const summaryLabel = source === 'course-registration' ? 'Course Enrollment' : 'Event Registration';
  const totalCost = Number(paymentPayload.totalCost) || 0;

  const defaultName =
    (user?.userFirstName && user?.userLastName && `${user.userFirstName} ${user.userLastName}`) ||
    (userDetail?.userFirstName &&
      userDetail?.userLastName &&
      `${userDetail.userFirstName} ${userDetail.userLastName}`) ||
    user?.userName ||
    userDetail?.userName ||
    '';
  const defaultEmail = user?.userEmail || userDetail?.userEmail || user?.email || userDetail?.email || '';

  const [nameOnCard, setNameOnCard] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });

  const isReady = useMemo(() => {
    return (
      Boolean(nameOnCard.trim()) &&
      Boolean(email.trim()) &&
      sanitizeDigits(cardNumber).length >= 12 &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      sanitizeDigits(cvc).length >= 3
    );
  }, [nameOnCard, email, cardNumber, expiry, cvc]);

  const onExpiryChange = e => {
    const digits = sanitizeDigits(e.target.value).slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setExpiry(formatted);
  };

  const handleAutoFill = () => {
    setNameOnCard(defaultName);
    setEmail(defaultEmail);
  };

  const handlePay = () => {
    if (!isReady || isPaying) return;
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStatusModal({
        open: true,
        status: 'success',
        message:
          source === 'course-registration'
            ? 'Course registration payment completed successfully.'
            : 'Event registration payment completed successfully.',
      });
    }, 900);
  };

  if (!location.state || !title) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Payment Session Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">
            Start from event or course registration to continue payment.
          </p>
          <Button type="default" className="mt-4" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Modal
        title={null}
        open={true}
        onCancel={() => navigate(-1)}
        footer={null}
        width={window.innerWidth <= 768 ? '95%' : '600px'}
        centered
        maskClosable={false}
        closeIcon={
          <span className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        }>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-lg">
          <div className="text-center text-white">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {source === 'course-registration' ? 'Enroll & Pay' : 'Register & Pay'}
            </h2>
            <p className="text-indigo-100 text-sm">Review details and complete payment</p>
          </div>
        </div>

        <Form layout="vertical" className="space-y-5">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16" />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {source === 'course-registration' ? 'Course' : 'Event'}
                  </p>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{summaryLabel}</p>
                </div>
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold ml-3">
                  Active
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-200/60">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Name on Card
            </label>
            <div className="relative">
              <Input
                value={nameOnCard}
                onChange={e => setNameOnCard(e.target.value)}
                size="large"
                className="shadow-sm rounded-lg"
                placeholder="Full name"
                prefix={
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Email
            </label>
            <div className="relative">
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                size="large"
                className="shadow-sm rounded-lg"
                placeholder="you@example.com"
                prefix={
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoFill}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
            Auto-fill from profile
          </button>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Card Details
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                className="shadow-sm rounded-lg sm:col-span-1"
                size="large"
                placeholder="4242..."
              />
              <Input
                value={expiry}
                onChange={onExpiryChange}
                className="shadow-sm rounded-lg"
                size="large"
                placeholder="MM/YY"
              />
              <Input
                value={cvc}
                onChange={e => setCvc(sanitizeDigits(e.target.value).slice(0, 4))}
                className="shadow-sm rounded-lg"
                size="large"
                placeholder="CVC"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 my-6" />

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalCost)}</p>
            </div>
            <Button
              type="primary"
              onClick={handlePay}
              loading={isPaying}
              disabled={!isReady}
              className="!h-12 !px-8 !text-base !font-semibold !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !border-0 !shadow-lg hover:!shadow-xl !transition-all !duration-200 disabled:!bg-gradient-to-r disabled:!from-indigo-300 disabled:!to-purple-300 disabled:!text-white disabled:!opacity-100 disabled:!cursor-not-allowed disabled:!shadow-md">
              {source === 'course-registration' ? 'Enroll & Pay' : 'Register & Pay'}
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment powered by Stripe
          </div>
        </Form>
      </Modal>

      <PaymentStatusModal
        open={statusModal.open}
        status={statusModal.status}
        subTitle={statusModal.message}
        primaryText="Go to payments"
        onClose={() => setStatusModal(prev => ({ ...prev, open: false }))}
        onPrimary={() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          navigate('/payments');
        }}
      />
    </div>
  );
};

export default RegistrationPayment;

