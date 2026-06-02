import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/profileContext';
import { getSubscriptionRequest } from '../../api/subscription.api';
import {
  getMyPortalPaymentForms,
  getPaymentFormPrefill,
} from '../../api/paymentForms.api';
import StandingBankersOrder from './StandingBankersOrder';
import DirectDebit from './DirectDebit';
import SalaryDeduction from './SalaryDeduction';
import { PAYMENT_FORM_META } from './paymentFormMeta';
import {
  extractMyPortalPaymentForms,
  extractPaymentFormPrefill,
  getActivePaymentFormForProfile,
  getPaymentTypeFromProfileSubscription,
  getTabKeyForPortalForm,
  formMatchesProfilePaymentType,
  isPaymentApiSuccess,
  mergePaymentFormWithPrefill,
  normalizePaymentType,
} from '../../helpers/paymentForm.helper';

const loadPaymentFormPrefill = async (profileId, paymentTab) => {
  if (!profileId || !paymentTab) return null;
  try {
    const prefillRes = await getPaymentFormPrefill(profileId);
    if (!isPaymentApiSuccess(prefillRes)) return null;
    const prefill = extractPaymentFormPrefill(prefillRes);
    if (!prefill) return null;
    if (formMatchesProfilePaymentType(prefill, paymentTab)) {
      return prefill;
    }
    const tabFromPrefill =
      getTabKeyForPortalForm(prefill) ||
      normalizePaymentType(prefill.memberPaymentType);
    return tabFromPrefill === paymentTab ? prefill : null;
  } catch (error) {
    console.error('Failed to load payment form prefill:', error);
    return null;
  }
};

const PaymentMethod = () => {
  const navigate = useNavigate();
  const { profileDetail } = useProfile();
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [activePortalForm, setActivePortalForm] = useState(null);
  const [prefillPortalForm, setPrefillPortalForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentMethod = async () => {
      if (!profileDetail?.profileId) {
        setActivePortalForm(null);
        setPrefillPortalForm(null);
        setSelectedPaymentType(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setPrefillPortalForm(null);
      try {
        let profilePaymentTypeTab = null;

        const subRes = await getSubscriptionRequest(profileDetail.profileId);
        if (isPaymentApiSuccess(subRes)) {
          const items = subRes?.data?.data?.data ?? subRes?.data?.data ?? [];
          const subscriptions = Array.isArray(items)
            ? items
            : items
            ? [items]
            : [];
          const activeSubscription =
            subscriptions.find(
              sub =>
                String(sub?.subscriptionStatus || '').toLowerCase() === 'active',
            ) || subscriptions[0];
          const raw = getPaymentTypeFromProfileSubscription(activeSubscription);
          profilePaymentTypeTab = normalizePaymentType(raw);
        }

        const mineRes = await getMyPortalPaymentForms();
        if (isPaymentApiSuccess(mineRes)) {
          const paymentForms = extractMyPortalPaymentForms(mineRes);

          if (!profilePaymentTypeTab && paymentForms.length > 0) {
            const firstActive = paymentForms.find(
              form => String(form?.status || '').toLowerCase() === 'active',
            );
            profilePaymentTypeTab = getTabKeyForPortalForm(firstActive);
          }

          const activeForm = getActivePaymentFormForProfile(
            paymentForms,
            profilePaymentTypeTab,
          );

          setActivePortalForm(activeForm);
          const paymentTab =
            profilePaymentTypeTab || getTabKeyForPortalForm(activeForm);
          setSelectedPaymentType(paymentTab);

          if (paymentTab) {
            const prefill = await loadPaymentFormPrefill(
              profileDetail.profileId,
              paymentTab,
            );
            setPrefillPortalForm(prefill);
          }
        } else {
          setActivePortalForm(null);
          setSelectedPaymentType(profilePaymentTypeTab);
          if (profilePaymentTypeTab) {
            const prefill = await loadPaymentFormPrefill(
              profileDetail.profileId,
              profilePaymentTypeTab,
            );
            setPrefillPortalForm(prefill);
          }
        }
      } catch (error) {
        console.error('Failed to load payment method:', error);
        setActivePortalForm(null);
        setPrefillPortalForm(null);
        setSelectedPaymentType(null);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethod();
  }, [profileDetail?.profileId]);

  const seedPortalForm = useMemo(() => {
    if (activePortalForm) {
      return mergePaymentFormWithPrefill(activePortalForm, prefillPortalForm);
    }
    return prefillPortalForm;
  }, [activePortalForm, prefillPortalForm]);

  const isActivePaymentMethod = useMemo(
    () => String(activePortalForm?.status || '').toLowerCase() === 'active',
    [activePortalForm],
  );

  const headerMeta = useMemo(() => {
    if (activePortalForm?.formTypeLabel) {
      const tabKey = getTabKeyForPortalForm(activePortalForm);
      const fallback = tabKey ? PAYMENT_FORM_META[tabKey] : null;
      return {
        title: activePortalForm.formTypeLabel,
        subtitle:
          fallback?.subtitle ||
          'View and manage your active payment authorization',
      };
    }
    if (prefillPortalForm?.formTypeLabel) {
      const tabKey = getTabKeyForPortalForm(prefillPortalForm);
      const fallback = tabKey ? PAYMENT_FORM_META[tabKey] : null;
      return {
        title: prefillPortalForm.formTypeLabel,
        subtitle:
          fallback?.subtitle ||
          'Complete and submit your payment authorization',
      };
    }
    if (selectedPaymentType && PAYMENT_FORM_META[selectedPaymentType]) {
      return PAYMENT_FORM_META[selectedPaymentType];
    }
    return null;
  }, [activePortalForm, prefillPortalForm, selectedPaymentType]);

  const renderPaymentComponent = () => {
    if (!selectedPaymentType) {
      return null;
    }

    switch (selectedPaymentType) {
      case 'Standing Banking Order':
      case 'Standing Order':
        return (
          <StandingBankersOrder embedded seedPortalForm={seedPortalForm} />
        );
      case 'Direct Debit':
        return <DirectDebit embedded seedPortalForm={seedPortalForm} />;
      case 'Salary Deduction':
        return <SalaryDeduction embedded seedPortalForm={seedPortalForm} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-3 sm:py-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Go back">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                {headerMeta ? (
                  <>
                    <h1 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                      {headerMeta.title}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                      {headerMeta.subtitle}
                    </p>
                    {isActivePaymentMethod && (
                      <span className="inline-flex mt-1.5 items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700 ring-1 ring-green-600/20">
                        {activePortalForm.status}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-500">
                    Payment method is not available for your profile
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {selectedPaymentType ? (
          renderPaymentComponent()
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Method Unavailable
              </h2>
              <p className="text-gray-600 mb-6">
                {!profileDetail?.profileId
                  ? 'A member profile is required to manage payment methods.'
                  : 'No payment method is configured for your profile.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
