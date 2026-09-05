import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Modal, Form, Input } from 'antd';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { PaymentStatusModal } from '../components/modals';
import { createPaymentIntentRequest } from '../api/payment.api';
import { createRegistrationRequest } from '../api/events.api';
import { buildEventsRegistrationPayload } from '../helpers/events.helper';
import {
  buildRegistrationIntentCacheKey,
  clearRegistrationPaymentIntentCache,
  getOrCreateRegistrationPaymentIntent,
  resolvePaymentIntentOutcome,
} from '../helpers/paymentIntent.helper';

const formatCurrency = value => {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
};

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#424770',
      letterSpacing: '0.025em',
      fontFamily: 'Source Code Pro, monospace',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const RegistrationPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { user, userDetail } = useSelector(state => state.auth);
  const paymentPayload = location.state || {};

  const source = paymentPayload.source || 'course-registration';
  const isCourse = source === 'course-registration';
  const title =
    paymentPayload.courseTitle || paymentPayload.eventTitle || 'Registration';
  const summaryLabel = isCourse ? 'Course Enrollment' : 'Event Registration';
  const totalCost = Number(paymentPayload.totalCost) || 0;
  const amountInCents = Math.round(totalCost * 100);
  const isFree = amountInCents <= 0;

  const defaultName =
    (user?.userFirstName &&
      user?.userLastName &&
      `${user.userFirstName} ${user.userLastName}`) ||
    (userDetail?.userFirstName &&
      userDetail?.userLastName &&
      `${userDetail.userFirstName} ${userDetail.userLastName}`) ||
    user?.userName ||
    userDetail?.userName ||
    '';
  const defaultEmail =
    user?.userEmail ||
    userDetail?.userEmail ||
    user?.email ||
    userDetail?.email ||
    paymentPayload.registrationProfile?.email ||
    '';

  const [nameOnCard, setNameOnCard] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [clientSecret, setClientSecret] = useState(null);
  const [initLoading, setInitLoading] = useState(!isFree);
  const [initError, setInitError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'success',
    message: '',
  });
  const [retryKey, setRetryKey] = useState(0);

  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const clientSecretRef = useRef(null);
  const stripePaymentIntentIdRef = useRef(null);
  const intentCacheKeyRef = useRef(null);

  const registrationEntityId =
    paymentPayload.courseId ||
    paymentPayload.eventId ||
    paymentPayload.course?.courseId ||
    paymentPayload.course?.id ||
    paymentPayload.event?.id;
  const userId = user?.id || user?._id || userDetail?.id || userDetail?._id;
  const tenantId =
    user?.tenantId ||
    user?.userTenantId ||
    userDetail?.tenantId ||
    userDetail?.userTenantId;

  const isCardReady =
    cardComplete.cardNumber && cardComplete.cardExpiry && cardComplete.cardCvc;

  const isReady = useMemo(() => {
    if (!nameOnCard.trim() || !email.trim()) return false;
    if (isFree) return true;
    return (
      Boolean(clientSecret) &&
      isCardReady &&
      Boolean(stripe) &&
      Boolean(elements)
    );
  }, [nameOnCard, email, isFree, clientSecret, isCardReady, stripe, elements]);

  useEffect(() => {
    if (!location.state || !registrationEntityId) {
      setInitLoading(false);
      return undefined;
    }

    if (isFree) {
      setInitLoading(false);
      setClientSecret(null);
      clientSecretRef.current = null;
      stripePaymentIntentIdRef.current = null;
      setInitError(null);
      return undefined;
    }

    const purpose = 'eventRegistration';
    const cacheKey = buildRegistrationIntentCacheKey({
      purpose,
      eventId: registrationEntityId,
      amountInCents,
    });
    intentCacheKeyRef.current = cacheKey;

    // Reuse an already-fetched secret (e.g. React Strict Mode remount).
    if (clientSecretRef.current) {
      setClientSecret(clientSecretRef.current);
      setInitLoading(false);
      setInitError(null);
      return undefined;
    }

    let cancelled = false;

    const initPayment = async () => {
      setInitLoading(true);
      setInitError(null);

      try {
        const paymentData = {
          purpose,
          amount: amountInCents,
          currency: 'eur',
          metadata: {
            ...(isCourse
              ? { eventId: registrationEntityId }
              : { eventId: registrationEntityId }),
            eventTitle: title,
            tenantId,
            userId,
          },
        };

        const { clientSecret, stripePaymentIntentId } =
          await getOrCreateRegistrationPaymentIntent({
            cacheKey,
            paymentData,
            createIntentRequest: createPaymentIntentRequest,
          });

        clientSecretRef.current = clientSecret;
        stripePaymentIntentIdRef.current = stripePaymentIntentId;
        if (!cancelled) {
          setClientSecret(clientSecret);
          setInitLoading(false);
        }
      } catch (error) {
        console.error('Registration payment intent failed:', error);
        clientSecretRef.current = null;
        stripePaymentIntentIdRef.current = null;
        if (!cancelled) {
          setInitError(
            error?.response?.data?.message ||
              error?.message ||
              'Unable to initialize payment.',
          );
          setClientSecret(null);
          setInitLoading(false);
        }
      }
    };

    initPayment();

    return () => {
      cancelled = true;
    };
    // Intentionally omit userId/tenantId/lineItems so auth hydration does not
    // cancel a successful intent and leave the UI stuck loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationEntityId, isFree, isCourse, amountInCents, title, retryKey]);

  const submitRegistration = async stripePaymentIntentId => {
    const registrationPayload = buildEventsRegistrationPayload({
      source,
      eventId: paymentPayload.eventId,
      courseId: paymentPayload.courseId,
      event: paymentPayload.event || paymentPayload.course,
      lineItems: paymentPayload.lineItems,
      selectedDays: paymentPayload.selectedDays,
      profile: paymentPayload.registrationProfile,
      paymentMethod: 'stripe',
      registeredVia: 'portal',
      stripePaymentIntentId,
    });

    if (!registrationPayload.profile?.email) {
      throw new Error('Missing registration profile details.');
    }

    if (registrationPayload.registrationType === 'course') {
      if (!registrationPayload.courseId) {
        throw new Error('Missing course id for registration.');
      }
    } else if (!registrationPayload.lineItems?.length) {
      throw new Error('Missing registration line items.');
    }

    const res = await createRegistrationRequest(registrationPayload);
    if (res?.status !== 200 && res?.status !== 201) {
      throw new Error(
        res?.data?.message ||
          res?.data?.error?.message ||
          'Unable to create registration.',
      );
    }
    return res;
  };

  const handleAutoFill = () => {
    setNameOnCard(defaultName);
    setEmail(defaultEmail);
  };

  const handleRetryInit = () => {
    if (intentCacheKeyRef.current) {
      clearRegistrationPaymentIntentCache(intentCacheKeyRef.current);
    }
    clientSecretRef.current = null;
    stripePaymentIntentIdRef.current = null;
    setClientSecret(null);
    setInitError(null);
    setInitLoading(true);
    setRetryKey(key => key + 1);
  };

  const handlePay = async () => {
    if (!isReady || isPaying) return;
    setIsPaying(true);

    try {
      let stripePaymentIntentId = stripePaymentIntentIdRef.current;

      if (!isFree) {
        if (!stripe || !elements || !clientSecret) {
          throw new Error('Payment is not ready yet. Please wait or try again.');
        }

        const { error: methodError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardNumberElement),
            billing_details: {
              name: nameOnCard.trim(),
              email: email.trim(),
            },
          });

        if (methodError) {
          throw new Error(methodError.message);
        }

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id,
          });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        const outcome = resolvePaymentIntentOutcome(paymentIntent?.status, {
          isApplicationPayment: false,
        });

        if (!outcome.success) {
          throw new Error(outcome.message || 'Payment was not completed.');
        }

        stripePaymentIntentId =
          paymentIntent?.id || stripePaymentIntentIdRef.current;
      }

      await submitRegistration(stripePaymentIntentId);

      setStatusModal({
        open: true,
        status: 'success',
        message: isCourse
          ? 'Course registration payment completed successfully.'
          : 'Event registration payment completed successfully.',
      });
    } catch (error) {
      console.error('Registration payment failed:', error);
      toast.error(error?.message || 'Registration payment failed.');
      setStatusModal({
        open: true,
        status: 'error',
        message: error?.message || 'Registration payment failed.',
      });
    } finally {
      setIsPaying(false);
    }
  };

  if (!location.state || !title) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Payment Session Not Found
          </h1>
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        }>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-lg">
          <div className="text-center text-white">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isCourse ? 'Enroll & Pay' : 'Register & Pay'}
            </h2>
            <p className="text-indigo-100 text-sm">
              Review details and complete payment
            </p>
          </div>
        </div>

        {initLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner />
            <p className="text-sm text-slate-600">Initializing secure payment…</p>
          </div>
        ) : initError ? (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-red-600">{initError}</p>
            <Button type="primary" onClick={handleRetryInit}>
              Retry payment setup
            </Button>
          </div>
        ) : (
          <Form layout="vertical" className="space-y-5">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {isCourse ? 'Course' : 'Event'}
                    </p>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {summaryLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Name on Card
              </label>
              <Input
                value={nameOnCard}
                onChange={e => setNameOnCard(e.target.value)}
                size="large"
                className="shadow-sm rounded-lg"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Email
              </label>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                size="large"
                className="shadow-sm rounded-lg"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
              Auto-fill from profile
            </button>

            {!isFree ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500 mr-1">*</span>Card Details
                </label>
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
                    <CardNumberElement
                      options={ELEMENT_OPTIONS}
                      onChange={e => {
                        setCardComplete(prev => ({
                          ...prev,
                          cardNumber: e.complete,
                        }));
                        if (e.complete && cardExpiryRef.current) {
                          cardExpiryRef.current.focus();
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
                      <CardExpiryElement
                        options={ELEMENT_OPTIONS}
                        onReady={el => {
                          cardExpiryRef.current = el;
                        }}
                        onChange={e => {
                          setCardComplete(prev => ({
                            ...prev,
                            cardExpiry: e.complete,
                          }));
                          if (e.complete && cardCvcRef.current) {
                            cardCvcRef.current.focus();
                          }
                        }}
                      />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
                      <CardCvcElement
                        options={ELEMENT_OPTIONS}
                        onReady={el => {
                          cardCvcRef.current = el;
                        }}
                        onChange={e => {
                          setCardComplete(prev => ({
                            ...prev,
                            cardCvc: e.complete,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                No payment required for this registration.
              </p>
            )}

            <div className="border-t border-gray-200 my-6" />

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(totalCost)}
                </p>
              </div>
              <Button
                type="primary"
                onClick={handlePay}
                loading={isPaying}
                disabled={!isReady}
                className="!h-12 !px-8 !text-base !font-semibold !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !border-0 !shadow-lg hover:!shadow-xl !transition-all !duration-200 disabled:!bg-gradient-to-r disabled:!from-indigo-300 disabled:!to-purple-300 disabled:!text-white disabled:!opacity-100 disabled:!cursor-not-allowed disabled:!shadow-md">
                {isFree
                  ? isCourse
                    ? 'Complete Enrollment'
                    : 'Complete Registration'
                  : isCourse
                    ? 'Enroll & Pay'
                    : 'Register & Pay'}
              </Button>
            </div>

            <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure payment powered by Stripe
            </div>
          </Form>
        )}
      </Modal>

      <PaymentStatusModal
        open={statusModal.open}
        status={statusModal.status}
        subTitle={statusModal.message}
        primaryText={
          statusModal.status === 'success' ? 'Go to Events & Courses' : 'Try again'
        }
        onClose={() => setStatusModal(prev => ({ ...prev, open: false }))}
        onPrimary={() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          if (statusModal.status === 'success') {
            navigate(isCourse ? '/events?type=course' : '/events?type=event');
          }
        }}
      />
    </div>
  );
};

export default RegistrationPayment;
