import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Space, Divider, Tooltip } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircleOutlined, InfoCircleOutlined, CreditCardOutlined, BankOutlined } from '@ant-design/icons';
import Button from '../common/Button';

const membershipPrices = {
  'General (all grades)': { full: 299.0, monthly: 99.67 },
  'Postgraduate Student': { full: 299.0, monthly: 99.67 },
  'Short-term/ Relief (under 15 hrs/wk average)': { full: 228.0, monthly: 76.0 },
  'Private nursing home': { full: 288.0, monthly: 96.0 },
  'Affiliate members (non-practicing)': { full: 116.0, monthly: 38.67 },
  'Lecturing (employed in universities and IT institutes)': { full: 116.0, monthly: 38.67 },
  'Associate (not currently employed as a nurse/midwife)': { full: 75.0, monthly: 25.0 },
  'Retired Associate': { full: 25.0, monthly: 25.0 },
  'Undergraduate Student': { full: 0.0, monthly: 0.0 },
};

const SubscriptionModal = ({ isVisible, onClose, onSuccess, membershipCategory }) => {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Get price info from mapping
  const priceInfo = membershipPrices[membershipCategory] || { full: 0, monthly: 0 };

  const handleSubmit = async (values) => {
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);
    try {
      if (paymentMethod === 'card') {
        const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
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
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
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
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Membership Subscription</h2>
          <p className="text-gray-500">Review your membership and complete payment</p>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth <= 768 ? '95%' : '70%'}
      centered
      className="subscription-modal"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="mb-6 p-4 rounded-lg border border-blue-100 bg-blue-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircleOutlined className="text-blue-500 text-2xl" />
          <div>
            <div className="text-base font-semibold text-blue-900">Membership Category</div>
            <div className="text-lg font-bold text-blue-700">{membershipCategory || 'N/A'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Annual Fee</div>
          <div className="text-xl font-bold text-blue-700">€{priceInfo.full.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Monthly Payment: <span className="font-semibold text-blue-600">€{priceInfo.monthly.toFixed(2)}</span></div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-6"
      >
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <Form.Item
            name="paymentMethod"
            label={
              <span className="text-base font-medium">
                Payment Method
                <Tooltip title="Choose your preferred payment method">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </span>
            }
            initialValue="card"
          >
            <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)}>
              <Space direction="vertical" className="w-full">
                <Radio value="card" className="w-full">
                  <div className="flex items-center">
                    <CreditCardOutlined className="mr-2" />
                    <span>Credit/Debit Card</span>
                  </div>
                </Radio>
                <Radio value="bank" className="w-full">
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Name on Card"
                rules={[{ required: true, message: 'Please enter the name on card' }]}
              >
                <Input placeholder="John Doe" className="h-10" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="john@example.com" className="h-10" />
              </Form.Item>
            </div>

            <Form.Item
              label="Card Details"
              required
              className="mb-4"
            >
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <CardElement options={cardElementOptions} />
              </div>
            </Form.Item>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <Form.Item
            name="bankDetails"
            label="Bank Account Details"
            rules={[{ required: true, message: 'Please enter bank details' }]}
          >
            <Input.TextArea
              placeholder="Enter your bank account details"
              rows={4}
              className="rounded-lg"
            />
          </Form.Item>
        )}

        <Divider className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            <p className="text-lg font-semibold text-gray-800">
              Total Amount: <span className="text-blue-600">€{priceInfo.monthly.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-500">Billed monthly • Cancel anytime</p>
          </div>
          <Space size="middle">
            <Button onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="px-8"
              disabled={priceInfo.monthly === 0}
            >
              Subscribe Now
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default SubscriptionModal;