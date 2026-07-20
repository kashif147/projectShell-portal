import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Button from '../components/common/Button';
import { PaymentStatusModal } from '../components/modals';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#424770',
      letterSpacing: '0.025em',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};

const formatCurrency = value => {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
};

const RegistrationPaymentInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const paymentPayload = location.state || {};

  const source = paymentPayload.source || 'course-registration';
  const title = paymentPayload.courseTitle || paymentPayload.eventTitle || 'Registration';
  const summaryLabel = source === 'course-registration' ? 'Course Enrollment' : 'Event Registration';
  const totalCost = Number(paymentPayload.totalCost) || 0;
  const clientSecret = paymentPayload.clientSecret;

  const [isPaying, setIsPaying] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, status: 'success', message: '' });

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret || isPaying) return;
    setIsPaying(true);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      });
      if (result.error) {
        setStatusModal({ open: true, status: 'error', message: result.error.message || 'Payment failed' });
        return;
      }
      setStatusModal({
        open: true,
        status: 'success',
        message:
          source === 'course-registration'
            ? 'Course registration payment completed successfully.'
            : 'Event registration payment completed successfully.',
      });
    } catch (err) {
      setStatusModal({ open: true, status: 'error', message: err?.message || 'Payment failed' });
    } finally {
      setIsPaying(false);
    }
  };

  if (!location.state || !title || !clientSecret) {
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
    <div className="px-3 py-4 sm:px-6 sm:py-6">
      <Modal
        title={null}
        open={true}
        onCancel={() => navigate(-1)}
        footer={null}
        width={window.innerWidth <= 768 ? '95%' : '600px'}
        centered
        maskClosable={false}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-lg">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">
              {source === 'course-registration' ? 'Enroll & Pay' : 'Register & Pay'}
            </h2>
            <p className="text-indigo-100 text-sm">Review details and complete payment</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
            <div className="relative p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {source === 'course-registration' ? 'Course' : 'Event'}
              </p>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{summaryLabel}</p>
              <div className="mt-4 pt-4 border-t border-indigo-200/60 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-600">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Card Number
            </label>
            <div className="rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm">
              <CardNumberElement options={ELEMENT_OPTIONS} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry</label>
              <div className="rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm">
                <CardExpiryElement options={ELEMENT_OPTIONS} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CVC</label>
              <div className="rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm">
                <CardCvcElement options={ELEMENT_OPTIONS} />
              </div>
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
              className="!h-12 !px-8 !text-base !font-semibold !bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-0">
              {source === 'course-registration' ? 'Enroll & Pay' : 'Register & Pay'}
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
            Secure payment powered by Stripe
          </div>
        </div>
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

const RegistrationPayment = () => (
  <Elements stripe={stripePromise}>
    <RegistrationPaymentInner />
  </Elements>
);

export default RegistrationPayment;
