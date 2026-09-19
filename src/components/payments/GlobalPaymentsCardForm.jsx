import React, { useEffect, useId, useRef, useState } from 'react';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import {
  chargeGlobalPaymentsRequest,
  createGlobalPaymentsAccessTokenRequest,
} from '../../api/payment.api';
import {
  extractAccessTokenPayload,
  extractChargePayload,
  loadGlobalPaymentsSdk,
} from '../../helpers/globalPayments.helper';

/**
 * Global Payments Hosted Fields form.
 * Flow: access-token → tokenize → charge via account-service.
 */
const GlobalPaymentsCardForm = ({
  amount,
  currency = 'eur',
  purpose,
  applicationId,
  eventId,
  metadata = {},
  cardHolderName = '',
  submitLabel = 'Pay Now',
  disabled = false,
  onSuccess,
  onFailure,
  className = '',
}) => {
  const reactId = useId().replace(/:/g, '');
  const ids = {
    cardNumber: `gp-card-number-${reactId}`,
    cardExpiry: `gp-card-expiry-${reactId}`,
    cardCvv: `gp-card-cvv-${reactId}`,
    cardHolder: `gp-card-holder-${reactId}`,
    submit: `gp-card-submit-${reactId}`,
  };

  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState(null);
  const [charging, setCharging] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const formRef = useRef(null);
  const chargingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let cardForm = null;

    const init = async () => {
      setInitLoading(true);
      setInitError(null);

      try {
        const tokenRes = await createGlobalPaymentsAccessTokenRequest({
          purpose,
          applicationId,
          eventId,
        });
        const { accessToken, env } = extractAccessTokenPayload(tokenRes);

        if (!accessToken) {
          throw new Error('Missing Global Payments access token');
        }

        const GlobalPayments = await loadGlobalPaymentsSdk();

        if (cancelled) return;

        GlobalPayments.configure({
          accessToken,
          env: env || 'sandbox',
          apiVersion: '2021-03-22',
        });

        const fields = {
          'card-number': {
            placeholder: '•••• •••• •••• ••••',
            target: `#${ids.cardNumber}`,
          },
          'card-expiration': {
            placeholder: 'MM / YYYY',
            target: `#${ids.cardExpiry}`,
          },
          'card-cvv': {
            placeholder: '•••',
            target: `#${ids.cardCvv}`,
          },
          submit: {
            value: submitLabel,
            target: `#${ids.submit}`,
          },
        };

        if (cardHolderName) {
          fields['card-holder-name'] = {
            placeholder: cardHolderName,
            target: `#${ids.cardHolder}`,
            value: cardHolderName,
          };
        }

        cardForm = GlobalPayments.ui.form({ fields, styles: {} });
        formRef.current = cardForm;

        const handleTokenSuccess = async resp => {
          if (chargingRef.current) return;
          chargingRef.current = true;
          if (mountedRef.current) setCharging(true);

          try {
            const paymentReference =
              resp?.paymentReference ||
              resp?.payment_reference ||
              resp?.temporary_token ||
              null;

            if (!paymentReference) {
              throw new Error('Missing payment reference from Global Payments');
            }

            if (!amount || amount <= 0) {
              throw new Error('Invalid payment amount');
            }

            const chargeRes = await chargeGlobalPaymentsRequest({
              paymentReference,
              amount,
              currency: String(currency || 'eur').toLowerCase(),
              purpose,
              applicationId,
              eventId,
              metadata,
            });

            const charge = extractChargePayload(chargeRes);
            const ok =
              chargeRes?.data?.success !== false &&
              (!charge.status ||
                /CAPTURED|CAPTURE|APPROVED|SUCCESS|COMPLETED/i.test(
                  String(charge.status),
                ));

            if (!ok) {
              throw new Error(
                chargeRes?.data?.message ||
                  charge.status ||
                  'Global Payments charge failed',
              );
            }

            onSuccess?.({
              provider: 'GLOBAL_PAYMENTS',
              paymentMethod: 'card',
              paymentReference,
              transactionId: charge.transactionId,
              status: charge.status,
              charge: charge.raw,
              total: amount / 100,
            });
          } catch (err) {
            console.error('Global Payments charge error:', err);
            onFailure?.(
              err?.response?.data?.message ||
                err?.message ||
                'Global Payments charge failed',
            );
          } finally {
            chargingRef.current = false;
            if (mountedRef.current) setCharging(false);
          }
        };

        const handleTokenError = resp => {
          const message =
            resp?.error?.message ||
            resp?.reasons?.[0]?.message ||
            resp?.message ||
            'Card tokenization failed';
          onFailure?.(message);
        };

        cardForm.on('token-success', handleTokenSuccess);
        cardForm.on('token-error', handleTokenError);
        GlobalPayments.on('error', err => {
          const message =
            err?.reasons?.[0]?.message ||
            err?.message ||
            'Global Payments error';
          if (mountedRef.current) {
            setInitError(prev => prev || message);
          }
        });

        if (!cancelled && mountedRef.current) {
          setInitLoading(false);
        }
      } catch (error) {
        console.error('Global Payments init error:', error);
        if (!cancelled && mountedRef.current) {
          setInitError(
            error?.response?.data?.message ||
              error?.message ||
              'Unable to initialize Global Payments',
          );
          setInitLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      formRef.current = null;
      try {
        cardForm?.dispose?.();
      } catch {
        // ignore dispose errors on unmount
      }
    };
    // Remount on retry or when charge context identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, purpose, applicationId, eventId, amount, currency]);

  if (initError) {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-sm text-red-600">{initError}</p>
        <Button
          type="default"
          onClick={() => setRetryKey(k => k + 1)}
          disabled={disabled}>
          Retry Global Payments setup
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 relative ${className}`}>
      {initLoading && (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Spinner />
          <p className="text-sm text-gray-500">
            Initializing Global Payments…
          </p>
        </div>
      )}

      <div className={initLoading ? 'invisible h-0 overflow-hidden' : ''}>
        {cardHolderName ? (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Name on Card
            </label>
            <div
              id={ids.cardHolder}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 min-h-[42px]"
            />
          </div>
        ) : null}

        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            <span className="text-red-500 mr-1">*</span>Card Number
          </label>
          <div
            id={ids.cardNumber}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 min-h-[42px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              <span className="text-red-500 mr-1">*</span>Expiry Date
            </label>
            <div
              id={ids.cardExpiry}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 min-h-[42px]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              <span className="text-red-500 mr-1">*</span>Security Code
            </label>
            <div
              id={ids.cardCvv}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 min-h-[42px]"
            />
          </div>
        </div>

        <div
          id={ids.submit}
          className={`gp-submit-host ${disabled || charging ? 'pointer-events-none opacity-60' : ''}`}
        />

        {charging && (
          <p className="text-center text-sm text-gray-600 mt-2">
            Processing payment…
          </p>
        )}
      </div>
    </div>
  );
};

export default GlobalPaymentsCardForm;
