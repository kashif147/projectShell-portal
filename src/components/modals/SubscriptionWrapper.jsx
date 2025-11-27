import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import SubscriptionModal from './SubscriptionModal';
import { createPaymentIntentRequest } from '../../api/payment.api';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { fetchCategoryByCategoryId } from '../../api/category.api';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const SubscriptionWrapper = ({
  isVisible,
  onClose,
  onSuccess,
  onFailure,
  formData,
  membershipCategory,
}) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Access user and application context data
  const { userDetail } = useSelector(state => state.auth);
  const { personalDetail, subscriptionDetail } = useApplication();

  useEffect(() => {
    const initPayment = async () => {
      if (!isVisible || !personalDetail?.applicationId || !membershipCategory)
        return;

      setLoading(true);

      try {
        // ✅ Step 1: Fetch category details
        const categoryRes = await fetchCategoryByCategoryId(membershipCategory);
        const categoryData = categoryRes?.data?.data || categoryRes?.data;
        // console.log('CategoryData========>', categoryData);
        const currentPricing = categoryData?.currentPricing || {};

        const basePrice = currentPricing?.price; // Stripe expects amount in cents
        const currency = currentPricing?.currency || 'eur';

        if (!basePrice) throw new Error('Invalid category price data');

        // Calculate amount based on payment type
        const paymentType = formData?.subscriptionDetails?.paymentType;
        // Retired Associate gets full price regardless of payment type (special offer)
        const isRetiredAssociate = categoryData?.name === 'Retired Associate';
        const amountInCents = isRetiredAssociate
          ? basePrice // Full price for Retired Associate
          : paymentType === 'Credit Card' 
            ? basePrice 
            : Math.round(basePrice / 4); // Divide by 4 for other payment types

        // ✅ Step 2: Prepare dynamic data
        // console.log('userDetail=======>', userDetail);
        const applicationId = personalDetail?.applicationId;
        const userId = userDetail?.id || userDetail?._id;
        const tenantId = userDetail?.tenantId || userDetail?.userTenantId;

        // ✅ Step 3: Create Payment Intent
        const paymentData = {
          purpose: 'subscriptionFee',
          amount: amountInCents, // Stripe amount is in smallest currency unit
          currency,
          metadata: {
            applicationId,
            description: paymentType === 'Credit Card' 
              ? 'Annual membership fees' 
              : 'Quarterly membership fees',
            tenantId,
            userId,
            membershipCategory,
            paymentType: formData?.subscriptionDetails?.paymentType,
          },
        };

        console.log('🧾 Creating Payment Intent with:', paymentData);

        const res = await createPaymentIntentRequest(paymentData);
        console.log('Payment Intent Response:', res);
        
        const secret =
          res?.data?.data?.clientSecret ||
          res?.data?.client_secret ||
          res?.data?.clientSecret;

        if (!secret) throw new Error('Missing client secret from response');

        setClientSecret(secret);
      } catch (error) {
        console.error('❌ Payment initialization error:', error);
        onFailure?.(error.message || 'Payment initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [isVisible, membershipCategory]);

  if (!isVisible) return null;

  if (loading || !clientSecret) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">
            Initializing payment form...
          </p>
          <p className="text-gray-500 text-sm">
            Please wait while we prepare your payment
          </p>
        </div>
      </div>
    );
  }

  const options = { clientSecret };

  return (
    <Elements stripe={stripePromise} options={options}>
      <SubscriptionModal
        isVisible={isVisible}
        onClose={onClose}
        onSuccess={onSuccess}
        onFailure={onFailure}
        formData={formData}
        membershipCategory={membershipCategory}
        clientSecret={clientSecret}
      />
    </Elements>
  );
};

export default SubscriptionWrapper;
