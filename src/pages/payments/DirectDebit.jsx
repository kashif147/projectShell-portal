import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import SignaturePad from '../../components/common/SignaturePad';
import Button from '../../components/common/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { useProfile } from '../../contexts/profileContext';
import { fetchCategoryByCategoryId } from '../../api/category.api';
import SepaDirectDebitPrintTemplate from './SepaDirectDebitPrintTemplate';
import logo from '../../assets/images/logo.png';
import shellLogo from '../../assets/images/shell-logo.png';
import PaymentFormSubheader from './PaymentFormSubheader';
import { PAYMENT_FORM_META } from './paymentFormMeta';
import { toast } from 'react-toastify';
import { getPaymentFormPrefill } from '../../api/paymentForms.api';
import usePortalPaymentForm from '../../hooks/usePortalPaymentForm';
import {
  PAYMENT_FORM_TYPES,
  buildDirectDebitPatchPayload,
  buildDirectDebitPayload,
  extractPaymentFormPrefill,
  getUniqueMandateReferenceFromForm,
  hasCreditorOrganizationDetails,
  isPaymentApiSuccess,
  mapCreditorOrganizationDetails,
  mapDirectDebitFromPortal,
  mergePaymentFormWithPrefill,
  normalizePortalPaymentForm,
  toIsoDate,
} from '../../helpers/paymentForm.helper';

const EMPTY_CREDITOR_DETAILS = {
  name: '',
  identifier: '',
  address: '',
  city: '',
  postCode: '',
  country: '',
};

const EEA_SEPA_COUNTRIES = [
  'Ireland',
  'United Kingdom',
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Monaco',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'San Marino',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Andorra',
];

const isEeaSepaCountry = country => {
  if (!country) return true;
  return EEA_SEPA_COUNTRIES.some(
    c => c.toLowerCase() === country.trim().toLowerCase(),
  );
};

const DirectDebit = ({ embedded = false, seedPortalForm = null }) => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { personalDetail, subscriptionDetail } = useApplication();
  const { profileDetail } = useProfile();
  const ibanInputRef = useRef(null);
  const printRef = useRef(null);

  const membershipCategory =
    subscriptionDetail?.subscriptionDetails?.membershipCategory;
  const [categoryData, setCategoryData] = useState(null);

  const membershipNo =
    profileDetail?.membershipNumber ||
    subscriptionDetail?.subscriptionDetails?.membershipNo ||
    subscriptionDetail?.subscriptionDetails?.membershipNumber ||
    '';

  const [formState, setFormState] = useState({
    paymentType: 'recurrent',
    authorization: false,
    memberName: '',
    memberAddress: '',
    memberCity: '',
    memberPostCode: '',
    memberCountry: 'Ireland',
    iban: '',
    bic: '',
    signature: null,
    secondSignature: null,
    signatureDate: '',
  });

  const [showValidation, setShowValidation] = useState(false);
  const [ibanError, setIbanError] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [prefillForm, setPrefillForm] = useState(null);
  const {
    portalForm,
    loading: portalFormLoading,
    saving,
    persistAndSubmit,
  } = usePortalPaymentForm(PAYMENT_FORM_TYPES.DIRECT_DEBIT, { seedPortalForm });

  const formSource = useMemo(() => {
    const base = normalizePortalPaymentForm(seedPortalForm ?? portalForm);
    const prefill = normalizePortalPaymentForm(prefillForm);
    return mergePaymentFormWithPrefill(base, prefill) ?? prefill ?? base;
  }, [seedPortalForm, portalForm, prefillForm]);

  useEffect(() => {
    let cancelled = false;

    const loadPrefill = async () => {
      const profileId = profileDetail?.profileId;
      if (!profileId) return;

      const base = normalizePortalPaymentForm(seedPortalForm ?? portalForm);
      if (
        hasCreditorOrganizationDetails(base) &&
        String(base?.status || '').toLowerCase() === 'active'
      ) {
        return;
      }

      try {
        const res = await getPaymentFormPrefill(profileId);
        if (cancelled || !isPaymentApiSuccess(res)) return;

        const prefill = extractPaymentFormPrefill(res);
        if (!prefill || cancelled) return;

        setPrefillForm(prefill);
      } catch (error) {
        console.error('Failed to load direct debit prefill:', error);
      }
    };

    loadPrefill();

    return () => {
      cancelled = true;
    };
  }, [profileDetail?.profileId, seedPortalForm, portalForm]);

  const organizationDetails = useMemo(() => {
    return (
      mapCreditorOrganizationDetails(formSource) ?? EMPTY_CREDITOR_DETAILS
    );
  }, [formSource]);

  const uniqueMandateReference = useMemo(() => {
    const fromForm = getUniqueMandateReferenceFromForm(formSource);
    return fromForm || membershipNo || `MEM-${user?.id || '0000'}`;
  }, [formSource, membershipNo, user?.id]);

  const creditorAddressLine = useMemo(() => {
    const address = organizationDetails.address || '';
    return address.replace(/\n/g, ', ');
  }, [organizationDetails.address]);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!membershipCategory) return;
      try {
        const res = await fetchCategoryByCategoryId(membershipCategory);
        const payload = res?.data?.data || res?.data;
        setCategoryData(payload);
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    };
    fetchCategory();
  }, [membershipCategory]);

  const formSourceKey = useMemo(() => {
    if (!formSource) return '';
    const mandate = formSource.directDebitMandate;
    return [
      formSource._id,
      formSource.id,
      formSource.status,
      formSource.unsaved,
      mandate?.debtorName,
      mandate?.debtorIban,
      mandate?.debtorAddress,
      mandate?.debtorCity,
    ].join('|');
  }, [formSource]);

  useEffect(() => {
    if (portalFormLoading || !formSource) {
      return;
    }

    const mapped = mapDirectDebitFromPortal(formSource);
    const contactInfo = personalDetail?.contactInfo || {};
    const profileName =
      personalDetail?.personalInfo?.forename &&
      personalDetail?.personalInfo?.surname
        ? `${personalDetail.personalInfo.forename} ${personalDetail.personalInfo.surname}`
        : user?.userFirstName && user?.userLastName
          ? `${user.userFirstName} ${user.userLastName}`
          : user?.userName || '';
    const profileAddress = [
      contactInfo.buildingOrHouse,
      contactInfo.streetOrRoad,
    ]
      .filter(Boolean)
      .join(', ');

    const isActiveRecord =
      String(formSource?.status || '').toLowerCase() === 'active';

    setFormState(prev => ({
      ...prev,
      ...mapped,
      memberName: isActiveRecord
        ? mapped.memberName || prev.memberName
        : mapped.memberName || profileName || prev.memberName,
      memberAddress: isActiveRecord
        ? mapped.memberAddress || prev.memberAddress
        : mapped.memberAddress || profileAddress || prev.memberAddress,
      memberCity: isActiveRecord
        ? mapped.memberCity || prev.memberCity
        : mapped.memberCity || contactInfo.areaOrTown || prev.memberCity,
      memberPostCode: isActiveRecord
        ? mapped.memberPostCode || prev.memberPostCode
        : mapped.memberPostCode ||
          contactInfo.eircode ||
          contactInfo.countyCityOrPostCode ||
          prev.memberPostCode,
      memberCountry: isActiveRecord
        ? mapped.memberCountry || prev.memberCountry
        : mapped.memberCountry || contactInfo.country || prev.memberCountry,
      iban: mapped.iban || prev.iban,
      bic: mapped.bic || prev.bic,
      paymentType: mapped.paymentType || prev.paymentType,
      authorization:
        mapped.authorization !== undefined
          ? mapped.authorization
          : prev.authorization,
      signatureDate: mapped.signatureDate || prev.signatureDate,
    }));
  }, [
    formSource,
    formSourceKey,
    portalFormLoading,
    personalDetail,
    user,
  ]);

  const formatIBAN = (value, cursorPosition = null) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();

    let cursorInCleaned = cursorPosition;
    if (cursorPosition !== null && cursorPosition >= 0) {
      const beforeCursor = value.substring(0, cursorPosition);
      const spacesBefore = (beforeCursor.match(/\s/g) || []).length;
      cursorInCleaned = Math.max(0, cursorPosition - spacesBefore);
    }

    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();

    if (
      cursorPosition !== null &&
      cursorInCleaned !== null &&
      cursorInCleaned >= 0
    ) {
      const groupsBeforeCursor = Math.floor(Math.max(0, cursorInCleaned) / 4);
      const newCursorPosition = Math.min(
        cursorInCleaned + groupsBeforeCursor,
        formatted.length,
      );
      return { formatted, cursorPosition: Math.max(0, newCursorPosition) };
    }

    return { formatted, cursorPosition: null };
  };

  const validateIBAN = iban => {
    if (!iban) return { isValid: false, message: 'IBAN is required' };

    const cleaned = iban.replace(/\s/g, '');
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(cleaned)) {
      return {
        isValid: false,
        message: 'Invalid IBAN format. Format: CC00 XXXX XXXX XXXX...',
      };
    }

    if (cleaned.length < 15 || cleaned.length > 34) {
      return {
        isValid: false,
        message: 'IBAN must be between 15 and 34 characters',
      };
    }

    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    const numericString = rearranged
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        return code >= 65 && code <= 90 ? code - 55 : char;
      })
      .join('');

    let remainder = '';
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder + numericString[i]) % 97;
    }

    if (remainder !== 1) {
      return {
        isValid: false,
        message: 'Invalid IBAN check digits',
      };
    }

    return { isValid: true, message: '' };
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;

    if (name === 'paymentType') {
      setFormState(prev => ({ ...prev, paymentType: value }));
      return;
    }

    if (name === 'iban') {
      const cursorPosition = e.target.selectionStart;
      const { formatted, cursorPosition: newCursorPosition } = formatIBAN(
        value,
        cursorPosition,
      );

      setFormState(prev => ({ ...prev, iban: formatted }));

      if (newCursorPosition !== null && ibanInputRef.current) {
        setTimeout(() => {
          if (ibanInputRef.current) {
            ibanInputRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition,
            );
          }
        }, 0);
      }

      if (formatted) {
        const validation = validateIBAN(formatted);
        if (validation.isValid) {
          setIbanError('');
        } else if (formatted.replace(/\s/g, '').length > 4) {
          setIbanError(validation.message);
        } else {
          setIbanError('');
        }
      } else {
        setIbanError('');
      }
      return;
    }

    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSignatureChange = (signatureType, signatureData) => {
    setFormState(prev => ({
      ...prev,
      [signatureType]: signatureData,
    }));
  };

  const isFormValid = useMemo(() => {
    if (!formState.authorization) return false;
    if (!formState.paymentType) return false;
    if (!formState.memberName) return false;
    if (!formState.iban) return false;
    if (!validateIBAN(formState.iban).isValid) return false;
    if (
      !isEeaSepaCountry(formState.memberCountry) &&
      !formState.memberAddress
    ) {
      return false;
    }
    if (!formState.signature) return false;
    if (!formState.signatureDate) return false;
    return true;
  }, [formState]);

  const validateForm = () => {
    if (!formState.iban) {
      return false;
    }
    const ibanValidation = validateIBAN(formState.iban);
    if (!ibanValidation.isValid) {
      setIbanError(ibanValidation.message);
      return false;
    }
    setIbanError('');
    return isFormValid;
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleConfirm = async () => {
    setShowValidation(true);
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const signedDate =
      toIsoDate(formState.signatureDate) || new Date().toISOString();
    const signatures = [];

    if (formState.signature) {
      signatures.push({
        imageBase64: formState.signature,
        slot: 0,
        signedDate,
      });
    }

    if (formState.secondSignature) {
      signatures.push({
        imageBase64: formState.secondSignature,
        slot: 1,
        signedDate,
      });
    }

    try {
      await persistAndSubmit({
        createPayload: buildDirectDebitPayload(formState),
        patchPayload: buildDirectDebitPatchPayload(formState),
        signatures,
      });
      toast.success('Direct Debit mandate submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Direct debit save failed:', error);
      toast.error(
        error?.message ||
          'Failed to submit direct debit mandate. Please try again.',
      );
    }
  };

  const handlePrint = async () => {
    if (!printRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      const printElement = printRef.current;
      const originalStyle = {
        visibility: printElement.style.visibility,
        position: printElement.style.position,
        left: printElement.style.left,
        top: printElement.style.top,
        opacity: printElement.style.opacity,
        zIndex: printElement.style.zIndex,
      };

      printElement.style.visibility = 'visible';
      printElement.style.position = 'fixed';
      printElement.style.left = '-9999px';
      printElement.style.top = '0';
      printElement.style.opacity = '1';
      printElement.style.zIndex = '-1';

      const images = printElement.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          img =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = reject;
                setTimeout(() => reject(new Error('Image load timeout')), 5000);
              }
            }),
        ),
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(printElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: printElement.scrollWidth,
        height: printElement.scrollHeight,
      });

      Object.keys(originalStyle).forEach(key => {
        if (originalStyle[key]) {
          printElement.style[key] = originalStyle[key];
        } else {
          printElement.style[key] = '';
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to capture content');
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('sepa-direct-debit-mandate.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const totalAmount = categoryData?.currentPricing?.price
    ? categoryData.currentPricing.price / 100
    : 0;
  const currency = categoryData?.currentPricing?.currency || 'EUR';
  const currencySymbol = currency.toUpperCase() === 'EUR' ? '€' : currency;

  const requiresMemberAddress = !isEeaSepaCountry(formState.memberCountry);
  const orgName = organizationDetails.name;
  const formMeta = PAYMENT_FORM_META['Direct Debit'];

  const formContent = (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div
          ref={printRef}
          className="fixed left-[-9999px] top-0"
          style={{
            opacity: 0,
            visibility: 'hidden',
            zIndex: -1,
            pointerEvents: 'none',
          }}>
          <SepaDirectDebitPrintTemplate
            formState={formState}
            organizationDetails={organizationDetails}
            uniqueMandateReference={uniqueMandateReference}
            totalAmount={totalAmount}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              SEPA Direct Debit Mandate
            </h2>
            <div className="flex items-center gap-2.5 sm:gap-3 sm:shrink-0 sm:max-w-[55%] sm:justify-end">
              <div className="flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200 sm:p-2">
                <img
                  src={shellLogo}
                  alt={orgName}
                  className="h-9 w-9 object-contain sm:hidden"
                />
                <img
                  src={logo}
                  alt={orgName}
                  className="hidden h-9 w-auto max-w-[200px] object-contain sm:block md:h-10 md:max-w-[240px]"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 leading-snug break-words min-w-0 sm:text-right">
                {orgName}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Input
              label="Unique Mandate Reference"
              name="uniqueMandateReference"
              readOnly
              value={uniqueMandateReference}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Unique Mandate Reference (UMR) – to be completed by {orgName}
          </p>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="p-3 sm:p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
            <Checkbox
              name="authorization"
              required
              checked={formState.authorization}
              onChange={handleInputChange}
              showValidation={showValidation}
              label={
                <span className="block space-y-3 text-sm text-gray-700 leading-relaxed">
                  <span className="block">
                    By signing this mandate form, you authorise (A){' '}
                    <strong className="font-semibold text-gray-900">
                      {orgName}
                    </strong>{' '}
                    to send instructions to your bank to debit your account and
                    (B) your bank to debit your account in accordance with the
                    instructions from{' '}
                    <strong className="font-semibold text-gray-900">
                      {orgName}
                    </strong>
                    .
                  </span>
                  <span className="block">
                    As part of your rights, you are entitled to a refund from
                    your bank under the terms and conditions of your agreement
                    with your bank. A refund must be claimed within 8 weeks
                    starting from the date on which your account was debited.
                    Your rights are explained in a statement that you can obtain
                    from your bank.
                  </span>
                </span>
              }
            />
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Creditor's Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Creditor's Name"
              name="orgName"
              readOnly
              value={organizationDetails.name}
            />
            <Input
              label="Creditor's Identifier"
              name="orgIdentifier"
              readOnly
              value={organizationDetails.identifier}
            />
            <div className="md:col-span-2">
              <Input
                label="Creditor's Address"
                name="orgAddress"
                readOnly
                value={organizationDetails.address}
              />
            </div>
            <Input
              label="City"
              name="orgCity"
              readOnly
              value={organizationDetails.city}
            />
            <Input
              label="Post Code"
              name="orgPostCode"
              readOnly
              value={organizationDetails.postCode}
            />
            <Input
              label="Country"
              name="orgCountry"
              readOnly
              value={organizationDetails.country}
            />
          </div>
        </div>

        {/* Type of payment */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Type of payment *
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="recurrent"
                checked={formState.paymentType === 'recurrent'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Recurrent payment</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="one-off"
                checked={formState.paymentType === 'one-off'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">One-off payment</span>
            </label>
          </div>
          {totalAmount > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              Membership amount: {currencySymbol}
              {totalAmount.toFixed(2)}
              {formState.paymentType === 'recurrent' && (
                <span className="ml-2 text-xs text-green-700 font-medium">
                  (recurring)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Debtor Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Debtor&apos;s Information
          </h3>
          <p className="mt-1 mb-3 sm:mb-4 text-sm font-medium text-gray-900">
            Please complete all the fields marked *
          </p>
          <div className="space-y-3 sm:space-y-4">
            <Input
              label="Debtor's Name"
              name="memberName"
              required
              // readOnly
              value={formState.memberName}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Full name"
            />
            <Input
              label="Debtor's Address"
              name="memberAddress"
              required={requiresMemberAddress}
              // readOnly={!requiresMemberAddress}
              value={formState.memberAddress}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Street address"
            />
            <p className="text-xs text-gray-500 -mt-2">
              Address of Debtor † Mandatory when collecting from a non EEA SEPA
              country or territory
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                name="memberCity"
                // readOnly
                value={formState.memberCity}
                onChange={handleInputChange}
                placeholder="City"
              />
              <Input
                label="Post Code"
                name="memberPostCode"
                // readOnly
                value={formState.memberPostCode}
                onChange={handleInputChange}
                placeholder="Post code"
              />
              <Input
                label="Country"
                name="memberCountry"
                // readOnly
                value={formState.memberCountry}
                onChange={handleInputChange}
                placeholder="Country"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  ref={ibanInputRef}
                  label="Debtor's account number – IBAN"
                  name="iban"
                  required
                  value={formState.iban}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="IE00 BOFI 9000 0000 0000 00"
                  maxLength={42}
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                />
                {ibanError && (
                  <p className="mt-1 text-xs text-red-600">{ibanError}</p>
                )}
                {formState.iban && !ibanError && (
                  <p className="mt-1 text-xs text-green-600">
                    Valid IBAN format
                  </p>
                )}
              </div>
              <div className="md:col-span-1">
                <Input
                  label="Debtor's bank identifier code – BIC"
                  name="bic"
                  value={formState.bic}
                  onChange={handleInputChange}
                  placeholder="e.g. BOFIIE2D"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Signature & Date */}
        <div className="bg-gray-100 rounded-lg border border-gray-300 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Signature &amp; Date *
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Where the account being debited is a joint account and more than 1
            person is needed to withdraw funds, then all parties must sign this
            form.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase">
                Signature
              </h4>
              <SignaturePad
                onSignatureChange={sig =>
                  handleSignatureChange('signature', sig)
                }
                value={formState.signature}
                required
                showValidation={showValidation}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase">
                Second Signature (If Joint)
              </h4>
              <SignaturePad
                onSignatureChange={sig =>
                  handleSignatureChange('secondSignature', sig)
                }
                value={formState.secondSignature}
              />
            </div>
          </div>
          <div className="mt-4 max-w-xs">
            <DatePicker
              label="Date"
              name="signatureDate"
              required
              value={formState.signatureDate}
              disableAgeValidation={true}
              onChange={handleInputChange}
              showValidation={showValidation}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm font-medium text-gray-800">
            Please return this mandate to the Organization
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {organizationDetails.name}
            {creditorAddressLine ? ` · ${creditorAddressLine}` : ''}
            {organizationDetails.city || organizationDetails.postCode
              ? ` · ${[organizationDetails.city, organizationDetails.postCode]
                  .filter(Boolean)
                  .join(' ')}`
              : ''}
            {organizationDetails.country
              ? ` · ${organizationDetails.country}`
              : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-gray-200 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <Button
            type="default"
            onClick={handlePrint}
            loading={isGeneratingPDF}
            disabled={isGeneratingPDF}
            className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
          <Button
            type="default"
            onClick={handleCancel}
            className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={saving}
            disabled={!isFormValid || saving || portalFormLoading}
            className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
            Confirm and Authorize
          </Button>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentFormSubheader
        title={formMeta.title}
        subtitle={formMeta.subtitle}
      />
      {formContent}
    </div>
  );
};

export default DirectDebit;
