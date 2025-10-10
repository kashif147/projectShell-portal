// src/components/modals/SubscriptionModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Radio,
  Space,
  Divider,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';
import Button from '../common/Button';
import { fetchCategoryByCategoryId } from '../../api/category.api';

const SubscriptionModal = ({
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
  const [customPrice, setCustomPrice] = useState(null);
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  // Set initial payment method
  const initialPaymentMethod =
    formData?.subscriptionDetails?.paymentType === 'Payroll Deduction'
      ? 'bank'
      : 'card';
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);

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

    if (paymentMethod === 'card') {
      setLoading(true);
      try {
        const responseConfirm = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: 'if_required',
        });
        
        console.log('Element=====>',responseConfirm)
        if (responseConfirm.error) throw new Error(responseConfirm.error.message);

        onSuccess({
          paymentMethod,
          total: getDisplayPrice(),
          paymentDetails: values,
          customPrice,
        });
      } catch (err) {
        console.error(err);
        onFailure?.(err.message || 'Payment failed.');
      } finally {
        setLoading(false);
      }
    } else {
      onSuccess({
        paymentMethod,
        total: getDisplayPrice(),
        paymentDetails: { bankDetails: values.bankDetails },
        customPrice,
      });
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
          name="paymentMethod"
          label="Payment Method"
          initialValue={initialPaymentMethod}>
          <Radio.Group onChange={e => setPaymentMethod(e.target.value)}>
            <Space direction="vertical" className="w-full">
              <Radio value="card">
                <CreditCardOutlined className="mr-2" /> Credit/Debit Card
              </Radio>
              <Radio value="bank">
                <BankOutlined className="mr-2" /> Bank Transfer
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {paymentMethod === 'card' && (
          <>
            <Form.Item name="name" label="Name on Card" required>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" required>
              <Input type="email" />
            </Form.Item>

            <Form.Item label="Card Details" required>
              <div className="p-3 border rounded-lg bg-white shadow-sm">
                <PaymentElement
                  onReady={() => setIsPaymentElementReady(true)}
                  onChange={e =>
                    setIsPaymentElementReady(!e?.error && e?.complete)
                  }
                />
              </div>
            </Form.Item>
          </>
        )}

        {paymentMethod === 'bank' && (
          <Form.Item
            name="bankDetails"
            label="Bank Account Details"
            rules={[{ required: true, message: 'Please enter bank details' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        )}

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
            disabled={paymentMethod === 'card' && !isPaymentElementReady}>
            Pay Now
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SubscriptionModal;
