import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { useLookup } from '../../contexts/lookupContext';
import StandingBankersOrderModal from '../modals/StandingBankersOrderModal';
import { useProfile } from '../../contexts/profileContext';
import { getPaymentFormPrefill } from '../../api/paymentForms.api';
import { extractPaymentFormPrefill, getOrganizationNameFromPrefill, isPaymentApiSuccess } from '../../helpers/paymentForm.helper';
import { calculateAgeFromDateOfBirth } from '../../helpers/date.helper';
import {
  getDefaultFrequencyForPaymentType,
  getFrequencyOptionsForPaymentType,
  getPaymentFrequencyCategory,
  getPriceForFrequency,
  getSubscriptionFeeLabel,
  isSalaryDeductionPaymentType,
  workLocationAllowsSalaryDeduction,
} from '../../helpers/subscriptionPricing.helper';

const SubscriptionDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
  categoryData = null,
  dateOfBirth = '',
  workLocation = '',
}) => {
  const { profileDetail } = useProfile();
  const [organizationName, setOrganizationName] = useState('');
  const {
    primarySectionLookups,
    secondarySectionLookups,
    paymentLooups,
    youthForumLookups,
    workLocationLookups,
  } = useLookup();

  const memberAge = calculateAgeFromDateOfBirth(dateOfBirth);
  const isUnder35 = memberAge !== null && memberAge < 35;
  const isNewOrGraduate =
    formData?.memberStatus === 'new' || formData?.memberStatus === 'graduate';
  const isRejoinOrCareerBreak =
    formData?.memberStatus === 'rejoin' ||
    formData?.memberStatus === 'careerBreak';

  useEffect(() => {
    let cancelled = false;

    const loadOrganizationName = async () => {
      const profileId = profileDetail?.profileId;
      if (!profileId) return;

      try {
        const response = await getPaymentFormPrefill(profileId);
        if (cancelled || !isPaymentApiSuccess(response)) return;

        const prefill = extractPaymentFormPrefill(response);
        const name = getOrganizationNameFromPrefill(prefill);
        if (name) setOrganizationName(name);
      } catch (error) {
        console.error('Failed to load organization name from prefill:', error);
      }
    };

    loadOrganizationName();

    return () => {
      cancelled = true;
    };
  }, [profileDetail?.profileId]);
  

  const primaryOptions = (primarySectionLookups || []).map(l => ({
    value: l?.DisplayName || l?.lookupname,
    label: l?.DisplayName || l?.lookupname,
  }));
  const secondaryOptions = (secondarySectionLookups || []).map(l => ({
    value: l?.DisplayName || l?.lookupname,
    label: l?.DisplayName || l?.lookupname,
  }));
  const allowSalaryDeduction = workLocationAllowsSalaryDeduction(
    workLocation,
    workLocationLookups,
  );

  const paymentOptions = useMemo(
    () =>
      (paymentLooups || [])
        .map(l => ({
          value: l?.DisplayName || l?.lookupname,
          label: l?.DisplayName || l?.lookupname,
          code: l?.code,
        }))
        .filter(option => {
          if (isSalaryDeductionPaymentType(option.value)) {
            return allowSalaryDeduction;
          }
          return true;
        }),
    [paymentLooups, allowSalaryDeduction],
  );

  const paymentFrequencyCategory = getPaymentFrequencyCategory(
    formData?.paymentType,
  );
  const frequencyOptions = getFrequencyOptionsForPaymentType(
    formData?.paymentType,
  );
  const isFrequencyAutoAnnual = paymentFrequencyCategory === 'annual';
  const showFrequencyDropdown = Boolean(paymentFrequencyCategory);

  const selectedFrequency =
    formData?.paymentFrequency ||
    getDefaultFrequencyForPaymentType(formData?.paymentType) ||
    'Annually';

  const selectedPricing = getPriceForFrequency(
    categoryData,
    selectedFrequency || 'Annually',
  );
  const displayPrice = selectedPricing?.price;
  const displayCurrency =
    selectedPricing?.currency ||
    categoryData?.currentPricing?.currency ||
    'EUR';
  const feeLabel = getSubscriptionFeeLabel(selectedFrequency);
  const youthForumOptions = (youthForumLookups || []).map(l => ({
    value: l?.DisplayName || l?.lookupname,
    label: l?.DisplayName || l?.lookupname,
  }));

  const requiresPayrollNo = paymentType =>
    isSalaryDeductionPaymentType(paymentType);

  useEffect(() => {
    if (
      !formData?.paymentType ||
      !isSalaryDeductionPaymentType(formData.paymentType) ||
      allowSalaryDeduction
    ) {
      return;
    }

    onFormDataChange({
      ...formData,
      paymentType: '',
      paymentFrequency: '',
      payrollNo: '',
    });
  }, [allowSalaryDeduction, workLocation]);

  useEffect(() => {
    if (!formData?.paymentType || !paymentFrequencyCategory) return;

    const defaultFrequency = getDefaultFrequencyForPaymentType(
      formData.paymentType,
    );
    const validFrequencies = getFrequencyOptionsForPaymentType(
      formData.paymentType,
    ).map(option => option.value);
    const currentFrequency = formData?.paymentFrequency;

    if (paymentFrequencyCategory === 'annual') {
      if (currentFrequency !== 'Annually') {
        onFormDataChange({
          ...formData,
          paymentFrequency: 'Annually',
        });
      }
      return;
    }

    if (!validFrequencies.includes(currentFrequency)) {
      onFormDataChange({
        ...formData,
        paymentFrequency: defaultFrequency,
      });
    }
  }, [formData?.paymentType, paymentFrequencyCategory]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'paymentType') {
      const newPaymentType = value;
      const oldPaymentType = formData?.paymentType;
      const defaultFrequency = getDefaultFrequencyForPaymentType(newPaymentType);

      onFormDataChange({
        ...formData,
        paymentType: newPaymentType,
        paymentFrequency: defaultFrequency,
        payrollNo:
          requiresPayrollNo(oldPaymentType) && !requiresPayrollNo(newPaymentType)
            ? ''
            : formData?.payrollNo || '',
      });
    } else {
      onFormDataChange({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Format price - convert from cents to currency
  const formatPrice = (priceInCents, currency = 'EUR') => {
    if (!priceInCents || priceInCents === 0) return '€0.00';
    const priceInEuros = priceInCents / 100;
    const currencySymbol =
      currency.toUpperCase() === 'EUR' ? '€' : currency.toUpperCase();
    return `${currencySymbol}${priceInEuros.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Your Subscription Fees Section */}
      {categoryData && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Subscription Fees
                </h2>
                <p className="text-xs text-gray-500">
                  Based on the {categoryData?.name} membership
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">{feeLabel}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatPrice(displayPrice, displayCurrency)}
              </p>
              {formData?.paymentType && selectedFrequency && (
                <p className="text-xs text-gray-500 mt-1">
                  Payment frequency: {selectedFrequency}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg
              className="w-6 h-6 text-white"
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select your preferred payment method.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Payment Type"
            name="paymentType"
            required
            value={formData?.paymentType || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Select payment type"
            options={paymentOptions}
          />
          {showFrequencyDropdown && (
            <Select
              label="Payment Frequency"
              name="paymentFrequency"
              required
              value={selectedFrequency}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Select payment frequency"
              options={
                isFrequencyAutoAnnual
                  ? [{ value: 'Annually', label: 'Annually' }]
                  : frequencyOptions
              }
              disabled={isFrequencyAutoAnnual}
            />
          )}
          <Input
            label="Payroll No"
            name="payrollNo"
            required={requiresPayrollNo(formData?.paymentType)}
            disabled={!requiresPayrollNo(formData?.paymentType)}
            value={formData?.payrollNo || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Enter your payroll number"
          />
        </div>
      </div>

      {/* Member Status Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{organizationName} Rewards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please select the most appropriate option below.
            </p>
          </div>
        </div>

        <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <Radio
            label="Please select the most appropriate option below"
            name="memberStatus"
            required
            value={formData?.memberStatus || ''}
            onChange={e => {
              const newStatus = e.target.value;
              const updatedData = {
                ...formData,
                memberStatus: newStatus,
                exclusiveDiscountsAndOffers: false,
                incomeProtectionScheme: false,
                inmoRewards: false,
                otherIrishTradeUnion: '',
                otherIrishTradeUnionName: '',
                otherScheme: '',
                previousMembershipNumber: '',
              };
              onFormDataChange(updatedData);
            }}
            showValidation={showValidation}
            options={[
              { value: 'new', label: 'New member' },
              { value: 'graduate', label: 'Newly graduated' },
              {
                value: 'rejoin',
                label: `Rejoining (Previous ${organizationName} Member)`,
              },
              {
                value: 'careerBreak',
                label: 'Returning from career break',
              },
              {
                value: 'nursingAbroad',
                label: 'Returning from nursing abroad',
              },
            ]}
          />
        </div>

        {isRejoinOrCareerBreak && (
          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <Input
              label="Membership Number"
              name="previousMembershipNumber"
              value={formData?.previousMembershipNumber || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Enter previous membership number (optional)"
            />
          </div>
        )}

        {isNewOrGraduate && (
          <div className="mt-6 space-y-6">
            <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <Radio
                label="Are you a member of another Trade Union? If yes, which Union?"
                name="otherIrishTradeUnion"
                required
                value={formData?.otherIrishTradeUnion || ''}
                onChange={e => {
                  const newValue = e.target.value;
                  onFormDataChange({
                    ...formData,
                    otherIrishTradeUnion: newValue,
                    otherIrishTradeUnionName:
                      newValue === 'no'
                        ? ''
                        : formData?.otherIrishTradeUnionName || '',
                  });
                }}
                showValidation={showValidation}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
              {formData?.otherIrishTradeUnion === 'yes' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="If yes, which Union?"
                    name="otherIrishTradeUnionName"
                    required={formData?.otherIrishTradeUnion === 'yes'}
                    value={formData?.otherIrishTradeUnionName || ''}
                    onChange={handleInputChange}
                    showValidation={showValidation}
                    placeholder="Enter Union Name"
                  />
                </div>
              )}
            </div>

            <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <Radio
                label="Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?"
                name="otherScheme"
                required
                value={formData?.otherScheme || ''}
                onChange={e => {
                  const newValue = e.target.value;
                  onFormDataChange({
                    ...formData,
                    otherScheme: newValue,
                    ...(newValue === 'yes'
                      ? {
                          inmoRewards: false,
                          exclusiveDiscountsAndOffers: false,
                          incomeProtectionScheme: false,
                        }
                      : {}),
                  });
                }}
                showValidation={showValidation}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
            </div>

            {formData?.otherScheme === 'no' &&
              formData?.memberStatus === 'new' && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Additional Options for New Members
                  </p>
                  <div className="flex items-start">
                    <Checkbox
                      label={
                        <div>
                          <span className="font-semibold text-gray-900">
                            Tick here to join{' '}
                            <a
                              href="https://cornmarket.ie/rewards"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800 cursor-pointer">
                              Rewards
                            </a>{' '}
                            for INMO members
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            By ticking here, you confirm that you agree to the
                            Terms & Conditions available on{' '}
                            <a
                              href="https://cornmarket.ie/rewards-club-terms"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800">
                              Cornmarket.ie/rewards-club-terms
                            </a>{' '}
                            and the Data Protection Statement available on{' '}
                            <a
                              href="https://cornmarket.ie/rewards-dps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800">
                              Cornmarket.ie/rewards-dps
                            </a>
                            . Cornmarket will contact you about your Rewards
                            Benefits. You can opt out at any time.
                          </p>
                        </div>
                      }
                      name="inmoRewards"
                      checked={formData?.inmoRewards || false}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

            {formData?.otherScheme === 'no' &&
              formData?.memberStatus === 'graduate' && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Additional Options for Newly Graduated Members
                  </p>
                  <div className="flex items-start">
                    <Checkbox
                      label={
                        <span className="font-semibold text-gray-900">
                          Would you like to hear about exclusive discounts and
                          offers for INMO members?
                        </span>
                      }
                      name="exclusiveDiscountsAndOffers"
                      checked={formData?.exclusiveDiscountsAndOffers || false}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex items-start">
                    <Checkbox
                      label={
                        <div>
                          <span className="font-semibold text-gray-900">
                            I consent to{' '}
                            <a
                              href="https://cornmarket.ie/income-protection"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800 cursor-pointer">
                              INMO Income Protection Scheme
                            </a>
                            .
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            By selecting 'I consent' below, you are agreeing
                            to the INMO, sharing your Trade Union membership
                            details with Cornmarket. Cornmarket as Scheme
                            Administrator will process and retain details of your
                            Trade Union membership for the purposes of assessing
                            eligibility and admitting eligible members
                            (automatically) to the Income Protection Scheme (with
                            9 Months' Free Cover), and for the ongoing
                            administration of the Scheme. Where you have also
                            opted in to receiving marketing communications,
                            Cornmarket will provide you with information on
                            discounts and offers they have for INMO members.
                            This consent can be withdrawn at any time by emailing
                            Cornmarket at dataprotection@cornmarket.ie. Please
                            note, if you do consent below, your data will be
                            shared with Cornmarket, and you will be assessed for
                            eligibility for automatic Income Protection Scheme
                            membership. If you do not consent, your data will
                            not be shared with Cornmarket for this purpose, you
                            will not be assessed for automatic Scheme membership
                            (including 9 Months' Free Cover) and you will have
                            to contact Cornmarket separately should you wish to
                            apply for Scheme membership. This offer will run on
                            a pilot basis. Terms and conditions apply and are
                            subject to change.
                          </p>
                          <p className="text-xs font-semibold text-gray-900 mt-2">
                            Important: If you do not give your consent, your
                            Trade union membership data will not be shared with
                            Cornmarket for this purpose. This means you will
                            not be assessed for Automatic Access to the Scheme.
                          </p>
                        </div>
                      }
                      name="incomeProtectionScheme"
                      checked={formData?.incomeProtectionScheme || false}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {isUnder35 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Youth Forum</h2>
              <p className="text-sm text-gray-600 mt-1">
                Available to members under 35 years of age.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <Radio
                label="Would you like to join Youth Forum?"
                name="joinYouthForum"
                required
                value={formData?.joinYouthForum || ''}
                onChange={e => {
                  const newValue = e.target.value;
                  onFormDataChange({
                    ...formData,
                    joinYouthForum: newValue,
                    youthForum: newValue === 'yes' ? formData?.youthForum || '' : '',
                  });
                }}
                showValidation={showValidation}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
            </div>

            {formData?.joinYouthForum === 'yes' && (
              <Select
                label="Youth Forum"
                name="youthForum"
                required
                value={formData?.youthForum || ''}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Select Youth Forum"
                options={youthForumOptions}
              />
            )}
          </div>
        </div>
      )}

      {/* Recruitment Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recruitment Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Were you recruited by another member?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Recruited By"
            name="recuritedBy"
            value={formData?.recuritedBy || ''}
            onChange={handleInputChange}
            placeholder="Enter Name"
          />
          <Input
            label="Recruited By (Membership No)"
            name="recuritedByMembershipNo"
            value={formData?.recuritedByMembershipNo || ''}
            onChange={handleInputChange}
            placeholder="Enter Membership No"
          />
        </div>
      </div>

      {/* Section Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Section Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select your primary and secondary sections.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Primary Section"
              name="primarySection"
              value={formData?.primarySection || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Select primary section"
              options={[...primaryOptions, { value: 'other', label: 'Other' }]}
            />
            <Input
              label="Other Primary Section"
              name="otherPrimarySection"
              required={formData?.primarySection === 'other'}
              disabled={formData?.primarySection !== 'other'}
              value={formData?.otherPrimarySection || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Specify primary section"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Secondary Section"
              name="secondarySection"
              value={formData?.secondarySection || ''}
              onChange={handleInputChange}
              placeholder="Select secondary section"
              options={[
                ...secondaryOptions,
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Other Secondary Section"
              name="otherSecondarySection"
              required={formData?.secondarySection === 'other'}
              disabled={formData?.secondarySection !== 'other'}
              value={formData?.otherSecondarySection || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Specify secondary section"
            />
          </div>
        </div>
      </div>

      {/* Additional Services & Terms Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Additional Services & Terms
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select additional services and agree to terms.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <Checkbox
              label={
                <span className="font-semibold text-gray-900">
                  Tick here to allow our partners to contact you about Value
                  added Services by Email and SMS
                </span>
              }
              name="valueAddedServices"
              checked={formData?.valueAddedServices || false}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-start">
            <Checkbox
              label={
                <div>
                  <span className="font-semibold text-gray-900">
                    I have read and agree to the{' '}
                    <a
                      href="#"
                      className="text-blue-600 underline hover:text-blue-800">
                      CRM Data Protection Statement
                    </a>
                    , the{' '}
                    <a
                      href="#"
                      className="text-blue-600 underline hover:text-blue-800">
                      CRM Privacy Statement
                    </a>{' '}
                    and the{' '}
                    <a
                      href="#"
                      className="text-blue-600 underline hover:text-blue-800">
                      CRM Conditions of Membership
                    </a>
                  </span>
                  {!formData?.termsAndConditions && showValidation && (
                    <p className="text-xs text-red-600 mt-1">
                      This field is required
                    </p>
                  )}
                </div>
              }
              name="termsAndConditions"
              checked={formData?.termsAndConditions || false}
              onChange={handleInputChange}
              required
              showValidation={showValidation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
