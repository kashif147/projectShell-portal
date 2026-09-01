import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardOutlined } from '@ant-design/icons';
import { useProfile } from '../../contexts/profileContext';
import { getSubscriptionRequest } from '../../api/subscription.api';
import {
  getMyPortalPaymentForms,
  getPaymentFormPrefill,
} from '../../api/paymentForms.api';
import StandingBankersOrder from './StandingBankersOrder';
import DirectDebit from './DirectDebit';
import SalaryDeduction from './SalaryDeduction';
import { PAYMENT_FORM_META, PAYMENT_UNAVAILABLE_META } from './paymentFormMeta';
import {
  extractMyPortalPaymentForms,
  extractPaymentFormPrefill,
  getExistingPaymentFormForProfile,
  getPaymentTypeFromProfileSubscription,
  getTabKeyForPortalForm,
  formMatchesProfilePaymentType,
  isPaymentApiSuccess,
  isPortalPaymentFormTab,
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

        let paymentForms = [];
        const mineRes = await getMyPortalPaymentForms();
        if (isPaymentApiSuccess(mineRes)) {
          paymentForms = extractMyPortalPaymentForms(mineRes);

          if (!profilePaymentTypeTab && paymentForms.length > 0) {
            const firstActive = paymentForms.find(
              form => String(form?.status || '').toLowerCase() === 'active',
            );
            profilePaymentTypeTab = getTabKeyForPortalForm(firstActive);
          }
        }

        const activeForm =
          profilePaymentTypeTab && isPortalPaymentFormTab(profilePaymentTypeTab)
            ? getExistingPaymentFormForProfile(
                paymentForms,
                profilePaymentTypeTab,
              )
            : !profilePaymentTypeTab
              ? getExistingPaymentFormForProfile(paymentForms, null)
              : null;

        setActivePortalForm(activeForm);

        const candidateTab =
          profilePaymentTypeTab ||
          (activeForm ? getTabKeyForPortalForm(activeForm) : null);
        const paymentTab = isPortalPaymentFormTab(candidateTab)
          ? candidateTab
          : null;
        setSelectedPaymentType(paymentTab);

        if (paymentTab && isPortalPaymentFormTab(paymentTab)) {
          const prefill = await loadPaymentFormPrefill(
            profileDetail.profileId,
            paymentTab,
          );
          setPrefillPortalForm(prefill);
        } else {
          setPrefillPortalForm(null);
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

  const isActivePaymentMethod = useMemo(() => {
    const status = String(activePortalForm?.status || '').toLowerCase();
    return status === 'active' || status === 'submitted';
  }, [activePortalForm]);

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
    if (!profileDetail?.profileId) {
      return {
        title: 'Payment Method',
        subtitle: 'A member profile is required to manage payment methods',
      };
    }
    return PAYMENT_UNAVAILABLE_META;
  }, [activePortalForm, prefillPortalForm, selectedPaymentType, profileDetail?.profileId]);

  const renderPaymentComponent = () => {
    if (!selectedPaymentType || !isPortalPaymentFormTab(selectedPaymentType)) {
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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_6px_16px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
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
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-poppins">
                {headerMeta.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
            {isActivePaymentMethod && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● {activePortalForm.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        {selectedPaymentType ? (
          renderPaymentComponent()
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full rounded-2xl bg-white shadow-sm border border-slate-200 p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-2xl text-slate-400">
                <CreditCardOutlined />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {!profileDetail?.profileId
                  ? 'Please complete your member profile before managing payment methods.'
                  : 'Your current payment type does not use a portal authorization form. If you need to update your payment method, please contact support or update it from your profile settings.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;
