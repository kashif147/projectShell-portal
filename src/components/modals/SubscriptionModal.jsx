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

  const handleSubmit = async values => {
    if (!stripe || !elements) {
      onFailure?.('Stripe not initialized yet.');
      return;
    }

    setLoading(true);
    try {
      // Create payment method with card element
      const { error: methodError, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: values.name,
          email: values.email,
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
          paymentDetails: values,
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
      width={window.innerWidth <= 768 ? '95%' : '500px'}
      centered>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="small"
        initialValues={{
          name:
            formData?.personalInfo?.forename &&
            formData?.personalInfo?.surname
              ? `${formData.personalInfo.forename} ${formData.personalInfo.surname}`
              : '',
          email:
            formData?.personalInfo?.preferredEmail === 'work'
              ? formData?.personalInfo?.workEmail
              : formData?.personalInfo?.personalEmail,
        }}>
        <Form.Item 
          name="name" 
          label="Name on Card" 
          required
          rules={[{ required: true, message: 'Please enter name on card' }]}>
          <div className="p-3 border rounded-lg bg-white shadow-sm">
            <Input 
              bordered={false} 
              placeholder="Enter name on card"
              style={{ padding: 0 }}
            />
          </div>
        </Form.Item>
        
        <Form.Item 
          name="email" 
          label="Email" 
          required
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}>
          <div className="p-3 border rounded-lg bg-white shadow-sm">
            <Input 
              type="email" 
              bordered={false} 
              placeholder="Enter email address"
              style={{ padding: 0 }}
            />
          </div>
        </Form.Item>

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
            htmlType="submit"
            loading={loading}
            disabled={!isCardReady}>
            Pay Now
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SubscriptionModal;
