// src/components/modals/SubscriptionModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Divider,
} from 'antd';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import Button from '../common/Button';
import { fetchCategoryByCategoryId } from '../../api/category.api';
import { useSelector } from 'react-redux';
import Spinner from '../common/Spinner';

const SubscriptionModal = ({
  isVisible,
  onClose,
  onSuccess,
  onFailure,
  formData,
  membershipCategory,
  clientSecret,
}) => {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customPrice, setCustomPrice] = useState(null);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  const { userDetail, user } = useSelector(state => state.auth);

  // Debug: Log user data structure
  useEffect(() => {
    if (isVisible) {
      console.log('User data from API (SubscriptionModal):', { user, userDetail });
    }
  }, [isVisible, user, userDetail]);

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

  const priceInfo = useMemo(() => {
    const cents = product?.currentPricing?.price;
    if (typeof cents === 'number' && !Number.isNaN(cents)) {
      const full = cents / 100;
      const monthly = full / 4;
      return { full, monthly };
    }
    return { full: 0, monthly: 0 };
  }, [product]);

  const formatCurrency = value => {
    const currency = (product?.currentPricing?.currency || 'EUR').toUpperCase();
    try {
      return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
      }).format(value || 0);
    } catch {
      return `€${(value || 0).toFixed(2)}`;
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!membershipCategory) return;
      setProductLoading(true);
      try {
        const res = await fetchCategoryByCategoryId(membershipCategory);
        const payload = res?.data?.data || res?.data;
        setProduct(payload || null);
      } catch (e) {
        setProduct(null);
      } finally {
        setProductLoading(false);
      }
    };
    fetchProduct();
  }, [membershipCategory]);

  const getDisplayPrice = () => {
    const defaultPrice =
      formData?.subscriptionDetails?.paymentType === 'Card Payment'
        ? priceInfo.full
        : priceInfo.monthly;
    return customPrice || defaultPrice;
  };

  const handlePayNow = async () => {
    // Get user data for payment
    const userData = user || userDetail;
    const userName = userData?.userFirstName && userData?.userLastName
      ? `${userData.userFirstName} ${userData.userLastName}`
      : userData?.userName || 
        (formData?.personalInfo?.forename && formData?.personalInfo?.surname
          ? `${formData.personalInfo.forename} ${formData.personalInfo.surname}`
          : '');
    const userEmail = userData?.userEmail || userData?.email || 
      (formData?.personalInfo?.preferredEmail === 'work'
        ? formData?.personalInfo?.workEmail
        : formData?.personalInfo?.personalEmail) || '';

    // Validate user data
    if (!userName || !userEmail) {
      onFailure?.('User name and email are required');
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
      // Create payment method with card element
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

      // Confirm the payment with the payment method
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: stripePaymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      console.log('Payment Confirmation Response:', paymentIntent);

      // Check if payment was successful
      if (paymentIntent?.status === 'succeeded') {
        onSuccess?.({
          paymentMethod: 'card',
          total: getDisplayPrice(),
          paymentDetails: {
            name: userName,
            email: userEmail,
          },
          customPrice,
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
      title={
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1">Membership Subscription</h2>
          <p className="text-sm text-gray-500">
            Review your membership and complete payment
          </p>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth <= 768 ? '95%' : '550px'}
      centered>
      {productLoading ? (
        <div className="text-center py-8">
          <Spinner />
          <p className="text-gray-500 mt-2">Loading payment details...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          size="small">
          
          {/* Membership Category Details */}
          {product && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {product?.name || 'Membership Category'}
                  </h3>
                  {product?.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category Price:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(getDisplayPrice())}
                  </span>
                </div>
                {product?.currentPricing?.frequency && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Payment Frequency:</span>
                    <span className="font-medium text-gray-800">
                      {product.currentPricing.frequency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name on Card */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">* </span>Name on Card
            </label>
            <Input 
              value={user?.userFirstName && user?.userLastName
                ? `${user.userFirstName} ${user.userLastName}`
                : userDetail?.userFirstName && userDetail?.userLastName
                  ? `${userDetail.userFirstName} ${userDetail.userLastName}`
                  : formData?.personalInfo?.forename && formData?.personalInfo?.surname
                    ? `${formData.personalInfo.forename} ${formData.personalInfo.surname}`
                    : user?.userName || userDetail?.userName || ''}
              readOnly
              size="large"
              className="shadow-sm"
              style={{ 
                backgroundColor: '#f9fafb',
                fontWeight: '500',
                color: '#111827'
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              ✓ Pre-filled from your profile
            </p>
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">* </span>Email
            </label>
            <Input 
              type="email"
              value={user?.userEmail || userDetail?.userEmail || user?.email || userDetail?.email || 
                (formData?.personalInfo?.preferredEmail === 'work'
                  ? formData?.personalInfo?.workEmail
                  : formData?.personalInfo?.personalEmail) || ''}
              readOnly
              size="large"
              className="shadow-sm"
              style={{ 
                backgroundColor: '#f9fafb',
                fontWeight: '500',
                color: '#111827'
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              ✓ Pre-filled from your profile
            </p>
          </div>

        <Form.Item label="Card Number" required>
          <div className="p-3 border rounded-lg bg-white shadow-sm">
            <CardNumberElement
              options={ELEMENT_OPTIONS}
              onChange={(e) => {
                setCardComplete(prev => ({ ...prev, cardNumber: e.complete }));
              }}
            />
          </div>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Expiry Date" required>
            <div className="p-3 border rounded-lg bg-white shadow-sm">
              <CardExpiryElement
                options={ELEMENT_OPTIONS}
                onChange={(e) => {
                  setCardComplete(prev => ({ ...prev, cardExpiry: e.complete }));
                }}
              />
            </div>
          </Form.Item>

          <Form.Item label="Security Code" required>
            <div className="p-3 border rounded-lg bg-white shadow-sm">
              <CardCvcElement
                options={ELEMENT_OPTIONS}
                onChange={(e) => {
                  setCardComplete(prev => ({ ...prev, cardCvc: e.complete }));
                }}
              />
            </div>
          </Form.Item>
        </div>

          <Divider />
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Total: {formatCurrency(getDisplayPrice())}
              </p>
            </div>
            <Button
              type="primary"
              onClick={handlePayNow}
              loading={loading}
              disabled={!isCardReady}>
              Pay Now
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default SubscriptionModal;
