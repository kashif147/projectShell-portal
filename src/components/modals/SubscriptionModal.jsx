import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Space, Divider, Tooltip } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  BankOutlined,
} from '@ant-design/icons';
import Button from '../common/Button';

const membershipPrices = {
  general: { full: 299.0, monthly: 74.75 },
  postgraduate_student: { full: 299.0, monthly: 74.75 },
  short_term_relief: { full: 228.0, monthly: 57.00 },
  private_nursing_home: { full: 288.0, monthly: 72.00 },
  affiliate_members: { full: 116.0, monthly: 29.00 },
  lecturing: { full: 116.0, monthly: 29.00 },
  associate: { full: 75.0, monthly: 18.75 },
  retired_associate: { full: 25.0, monthly: 25.0 },
  undergraduate_student: { full: 0.0, monthly: 0.0 },
};

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

  // Set payment method based on formData
  const initialPaymentMethod =
    formData?.subscriptionDetails?.paymentType === 'Payroll Deduction'
      ? 'bank'
      : 'card';
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);

  const priceInfo = membershipPrices[membershipCategory] || {
    full: 0,
    monthly: 0,
  };

  const getDisplayPrice = () => {
    if (formData?.subscriptionDetails?.paymentType === 'Card Payment') {
      return priceInfo.full;
    } else {
      return priceInfo.monthly;
    }
  };

  const defaultEmail =
    formData?.personalInfo?.preferredEmail === 'work'
      ? formData?.personalInfo?.workEmail
      : formData?.personalInfo?.personalEmail;

  const handleSubmit = async values => {
    if (!stripe || !elements) {
      onFailure?.('Stripe is not initialised yet. Please try again in a moment.');
      return;
    }
    setLoading(true);
    try {
      if (paymentMethod === 'card') {
        const { error, paymentMethod: stripePaymentMethod } =
          await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: {
              name: values.name,
              email: values.email,
            },
          });
        if (error) {
          throw new Error(error.message);
        }
        console.log('Payment Method:', stripePaymentMethod);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess({
        paymentMethod,
        total: priceInfo.monthly,
        paymentDetails:
          paymentMethod === 'card'
            ? values
            : { bankDetails: values.bankDetails },
      });
    } catch (error) {
      console.error('Payment error:', error);
      onFailure?.(error?.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
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
      centered
      className="subscription-modal"
      bodyStyle={{ padding: '16px' }}>
      <div className="mb-4 p-3 rounded-lg border border-blue-100 bg-blue-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-blue-500 text-xl" />
          <div>
            <div className="text-sm font-semibold text-blue-900">
              Membership Category
            </div>
            <div className="text-base font-bold text-blue-700">
              {membershipCategory || 'N/A'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">
            Price
            {/* {formData?.subscriptionDetails?.paymentType === 'Card Payment' ? 'Full Price' : 'Monthly Price'} */}
          </div>
          <div className="text-lg font-bold text-blue-700">
            €{getDisplayPrice().toFixed(2)}
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        size="small"
        initialValues={{
          email: defaultEmail,
          name:
            formData?.personalInfo?.forename && formData?.personalInfo?.surname
              ? `${formData.personalInfo.forename} ${formData.personalInfo.surname}`
              : undefined,
        }}>
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <Form.Item
            name="paymentMethod"
            label={
              <span className="text-sm font-medium">
                Payment Method
                <Tooltip title="Choose your preferred payment method">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
            initialValue={initialPaymentMethod}>
            <Radio.Group onChange={e => setPaymentMethod(e.target.value)}>
              <Space direction="vertical" className="w-full">
                <Radio
                  value="card"
                  className="w-full"
                  disabled={
                    formData?.subscriptionDetails?.paymentType ===
                    'Payroll Deduction'
                  }>
                  <div className="flex items-center">
                    <CreditCardOutlined className="mr-2" />
                    <span>Credit/Debit Card</span>
                  </div>
                </Radio>
                <Radio
                  value="bank"
                  className="w-full"
                  disabled={
                    formData?.subscriptionDetails?.paymentType ===
                    'Card Payment'
                  }>
                  <div className="flex items-center">
                    <BankOutlined className="mr-2" />
                    <span>Bank Transfer</span>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>

        {paymentMethod === 'card' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                name="name"
                label="Name on Card"
                rules={[
                  { required: true, message: 'Please enter the name on card' },
                ]}>
                <Input
                  placeholder={`${formData?.personalInfo?.forename} ${formData?.personalInfo?.surname}`}
                  className="h-8"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}>
                <Input placeholder={defaultEmail} className="h-8" />
              </Form.Item>
            </div>

            <Form.Item label="Card Details" required className="mb-3">
              <div className="p-3 border rounded-lg bg-white shadow-sm">
                <CardElement options={cardElementOptions} />
              </div>
            </Form.Item>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <Form.Item
            name="bankDetails"
            label="Bank Account Details"
            rules={[{ required: true, message: 'Please enter bank details' }]}>
            <Input.TextArea
              placeholder="Enter your bank account details"
              rows={3}
              className="rounded-lg"
            />
          </Form.Item>
        )}

        <Divider className="my-4" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-gray-600">
            <p className="text-base font-semibold text-gray-800">
              Total Amount:{' '}
              <span className="text-blue-600">
                €{getDisplayPrice().toFixed(2)}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {formData?.subscriptionDetails?.paymentType === 'Card Payment'
                ? 'Billed once via card'
                : 'Billed three month via payroll deduction'}
            </p>
          </div>
          <Space size="small">
            <Button onClick={onClose} className="px-4">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="px-6"
              disabled={getDisplayPrice() === 0}>
              Subscribe Now
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default SubscriptionModal;
