import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  Divider,
  InputNumber,
} from 'antd';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import Button from '../common/Button';
import { createPaymentIntentRequest } from '../../api/payment.api';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { useLookup } from '../../contexts/lookupContext';
import Spinner from '../common/Spinner';

const DashboardPaymentModal = ({
  isVisible,
  onClose,
  onSuccess,
  onFailure,
  formData,
  membershipCategory,
}) => {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [editablePrice, setEditablePrice] = useState(0);
  const [clientSecret, setClientSecret] = useState(null);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Refs for auto-focusing card elements
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  const { userDetail, user } = useSelector(state => state.auth);
  const { personalDetail, categoryData, categoryLoading, getCategoryData } = useApplication();
  const { categoryLookups } = useLookup();

  // Debug: Log user data structure
  useEffect(() => {
    if (isVisible) {
      console.log('User data from API:', { user, userDetail });
    }
  }, [isVisible, user, userDetail]);

  // Handle window resize to make modal responsive
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Check if all card fields are complete
  const isCardReady = cardComplete.cardNumber && cardComplete.cardExpiry && cardComplete.cardCvc;

  // Stripe element styling options
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
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Fetch category data when membershipCategory changes
  useEffect(() => {
    if (membershipCategory && isVisible) {
      getCategoryData(membershipCategory, categoryLookups);
    }
  }, [membershipCategory, isVisible, getCategoryData, categoryLookups]);

  // Set default price from category when categoryData is available
  useEffect(() => {
    if (categoryData?.currentPricing?.price) {
      const priceInEuros = categoryData.currentPricing.price / 100;
      setEditablePrice(priceInEuros);
    }
  }, [categoryData]);

  const formatCurrency = value => {
    const currency = (categoryData?.currentPricing?.currency || 'EUR').toUpperCase();
    try {
      return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
      }).format(value || 0);
    } catch {
      return `€${(value || 0).toFixed(2)}`;
    }
  };

  const handlePayNow = async () => {
    // Get user data for payment
    const userData = user || userDetail;
    const userName = userData?.userFirstName && userData?.userLastName
      ? `${userData.userFirstName} ${userData.userLastName}`
      : userData?.userName || '';
    const userEmail = userData?.userEmail || userData?.email || '';

    // Validate user data
    if (!userName || !userEmail) {
      onFailure?.('User name and email are required');
      return;
    }

    if (!editablePrice || editablePrice <= 0) {
      onFailure?.('Please enter a valid price amount');
      return;
    }

    if (!stripe || !elements) {
      onFailure?.('Stripe not initialized yet.');
      return;
    }

    if (!isCardReady) {
      onFailure?.('Please complete all card details');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Payment Intent with the edited price
      const amountInCents = Math.round(editablePrice * 100); // Convert to cents
      const currency = categoryData?.currentPricing?.currency || 'eur';
      const applicationId = personalDetail?.ApplicationId;
      const userId = userDetail?.id || userDetail?._id;
      const tenantId = userDetail?.tenantId || userDetail?.userTenantId;

      const paymentData = {
        purpose: 'subscriptionFee',
        amount: amountInCents,
        currency,
        metadata: {
          memberId: applicationId,
          description: 'Membership payment from dashboard',
          tenantId,
          userId,
          membershipCategory,
          paymentType: 'Card Payment',
        },
      };

      console.log('Creating Payment Intent with:', paymentData);

      const intentResponse = await createPaymentIntentRequest(paymentData);
      console.log('Payment Intent Response:', intentResponse);

      const secret =
        intentResponse?.data?.data?.clientSecret ||
        intentResponse?.data?.client_secret ||
        intentResponse?.data?.clientSecret;

      if (!secret) {
        throw new Error('Missing client secret from payment intent response');
      }

      setClientSecret(secret);

      // Step 2: Create payment method with card element
      const { error: methodError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: userName,
          email: userEmail,
        },
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      console.log('Payment Method Created:', stripePaymentMethod);

      // Step 3: Confirm the payment with the payment method
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        secret,
        {
          payment_method: stripePaymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      console.log('Payment Confirmation Response:', paymentIntent);

      // Step 4: Check if payment was successful
      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.({
          paymentMethod: 'card',
          total: editablePrice,
          paymentDetails: {
            name: userName,
            email: userEmail,
          },
          customPrice: editablePrice,
          paymentIntent: paymentIntent,
        });
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      onFailure?.(err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={windowWidth <= 768 ? '95%' : '600px'}
      centered
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      }>
      
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-lg">
        <div className="text-center text-white">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Membership Subscription</h2>
          <p className="text-indigo-100 text-sm">
            Review your membership and complete payment
          </p>
        </div>
      </div>

      {categoryLoading ? (
        <div className="text-center py-12">
          <Spinner />
          <p className="text-gray-500 mt-4 font-medium">Loading payment details...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          className="space-y-5">
          
          {/* Membership Category Details - Modern Card */}
          {categoryData && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {categoryData?.name || 'Membership Category'}
                    </h3>
                    {categoryData?.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {categoryData.description}
                      </p>
                    )}
                  </div>
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold ml-3">
                    Active
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-indigo-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Category Price</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatCurrency(categoryData?.currentPricing?.price / 100 || 0)}
                    </span>
                  </div>
                  {categoryData?.currentPricing?.frequency && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Payment Frequency</span>
                      <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full">
                        {categoryData.currentPricing.frequency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Editable Price Input - Modern Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Amount to Pay
              <span className="ml-2 text-xs font-normal text-gray-500">(Editable)</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="pl-10 pr-4 border-2 border-gray-200 rounded-lg bg-white shadow-sm group-hover:border-indigo-300 transition-colors overflow-hidden">
                <InputNumber
                  value={editablePrice}
                  onChange={setEditablePrice}
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix="€"
                  style={{ width: '100%', border: 'none', boxShadow: 'none' }}
                  className="!border-0 !shadow-none"
                  placeholder="Enter amount"
                  size="large"
                />
              </div>
              {editablePrice > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Default price: {formatCurrency(categoryData?.currentPricing?.price / 100 || 0)}
            </div>
          </div>

          {/* Name on Card - Modern Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Name on Card
            </label>
            <div className="relative">
              <Input 
                value={user?.userFirstName && user?.userLastName
                  ? `${user.userFirstName} ${user.userLastName}`
                  : userDetail?.userFirstName && userDetail?.userLastName
                    ? `${userDetail.userFirstName} ${userDetail.userLastName}`
                    : user?.userName || userDetail?.userName || ''}
                readOnly
                size="large"
                className="shadow-sm rounded-lg"
                prefix={
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                style={{ 
                  backgroundColor: '#f9fafb',
                  fontWeight: '500',
                  color: '#111827',
                  borderColor: '#e5e7eb'
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Auto-filled
                </span>
              </div>
            </div>
          </div>
          
          {/* Email - Modern Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Email
            </label>
            <div className="relative">
              <Input 
                type="email"
                value={user?.userEmail || userDetail?.userEmail || user?.email || userDetail?.email || ''}
                readOnly
                size="large"
                className="shadow-sm rounded-lg"
                prefix={
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                style={{ 
                  backgroundColor: '#f9fafb',
                  fontWeight: '500',
                  color: '#111827',
                  borderColor: '#e5e7eb'
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Auto-filled
                </span>
              </div>
            </div>
          </div>

          {/* Card Number - Modern Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>Card Number
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white shadow-sm group-hover:border-indigo-300 transition-colors">
                <CardNumberElement
                  options={ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setCardComplete(prev => ({ ...prev, cardNumber: e.complete }));
                    // Auto-focus expiry field when card number is complete
                    if (e.complete && cardExpiryRef.current) {
                      cardExpiryRef.current.focus();
                    }
                  }}
                />
              </div>
              {cardComplete.cardNumber && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Expiry & CVC - Modern Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Expiry Date
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white shadow-sm group-hover:border-indigo-300 transition-colors">
                  <CardExpiryElement
                    onReady={element => (cardExpiryRef.current = element)}
                    options={ELEMENT_OPTIONS}
                    onChange={(e) => {
                      setCardComplete(prev => ({ ...prev, cardExpiry: e.complete }));
                      // Auto-focus CVC field when expiry is complete
                      if (e.complete && cardCvcRef.current) {
                        cardCvcRef.current.focus();
                      }
                    }}
                  />
                </div>
                {cardComplete.cardExpiry && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>Security Code
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white shadow-sm group-hover:border-indigo-300 transition-colors">
                  <CardCvcElement
                    onReady={element => (cardCvcRef.current = element)}
                    options={ELEMENT_OPTIONS}
                    onChange={(e) => {
                      setCardComplete(prev => ({ ...prev, cardCvc: e.complete }));
                    }}
                  />
                </div>
                {cardComplete.cardCvc && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Footer with Total and Pay Button */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(editablePrice)}
              </p>
            </div>
            <Button
              type="primary"
              onClick={handlePayNow}
              loading={loading}
              disabled={!isCardReady || !editablePrice || editablePrice <= 0}
              className="!h-12 !px-8 !text-base !font-semibold !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !border-0 !shadow-lg hover:!shadow-xl !transition-all !duration-200 disabled:!bg-gradient-to-r disabled:!from-indigo-300 disabled:!to-purple-300 disabled:!text-white disabled:!opacity-100 disabled:!cursor-not-allowed disabled:!shadow-md">
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment powered by Stripe
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default DashboardPaymentModal;