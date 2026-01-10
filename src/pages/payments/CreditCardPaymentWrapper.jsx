import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CreditCardPayment from './CreditCardPayment';

const stripePromise = loadStripe(
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV',
);

const CreditCardPaymentWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <CreditCardPayment />
    </Elements>
  );
};

export default CreditCardPaymentWrapper;
