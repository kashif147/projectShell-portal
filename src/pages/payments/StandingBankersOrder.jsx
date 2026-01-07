import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DatePicker } from '../../components/ui/DatePicker';
import SignaturePad from '../../components/common/SignaturePad';
import Button from '../../components/common/Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { fetchCategoryByCategoryId } from '../../api/category.api';
import dayjs from 'dayjs';

const StandingBankersOrder = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { subscriptionDetail } = useApplication();
  const printRef = useRef(null);

  // Get category data
  const membershipCategory =
    subscriptionDetail?.subscriptionDetails?.membershipCategory;
  const [categoryData, setCategoryData] = useState(null);

  // Form state
  const [formState, setFormState] = useState({
    bankName: '',
    branchAddress: '',
    authorization: false,
    accountName: '',
    accountNumber: '',
    bic: '',
    iban: '',
    message: '',
    frequency: 'Monthly',
    amount: '',
    startDate: '',
    numberOfPayments: 'indefinite',
    specificNumberOfPayments: '',
    accountHolderSignature: null,
    accountHolderSignatureDate: '',
    secondSignature: null,
    secondSignatureDate: '',
  });

  const [showValidation, setShowValidation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [ibanError, setIbanError] = useState('');

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      if (!membershipCategory) return;
      try {
        const res = await fetchCategoryByCategoryId(membershipCategory);
        const payload = res?.data?.data || res?.data;
        setCategoryData(payload);

        if (payload?.currentPricing?.price) {
          const priceInEuros = payload.currentPricing.price / 100;
          setFormState(prev => ({
            ...prev,
            amount: priceInEuros.toFixed(2),
            accountName:
              user?.userFirstName && user?.userLastName
                ? `${user.userFirstName} ${user.userLastName}`
                : user?.userName || '',
          }));
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    };
    fetchCategory();
  }, [membershipCategory, user]);

  // Bank list
  const bankOptions = [
    { value: 'AIB', label: 'Allied Irish Banks (AIB)' },
    { value: 'BOI', label: 'Bank of Ireland' },
    { value: 'ULSTER', label: 'Ulster Bank' },
    { value: 'PERMANENT', label: 'Permanent TSB' },
    { value: 'KBC', label: 'KBC Bank' },
    { value: 'REVOLUT', label: 'Revolut' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annually', label: 'Annually' },
  ];

  // Beneficiary details
  const beneficiaryDetails = {
    accountName: 'Irish Nurses and Midwives Organization (INMO)',
    iban: 'IE99 BOFI 9000 1234 5678 99',
    reference: `MEMB-2023-${user?.id || '0000'}`,
  };

  // Auto-populate branch address based on bank selection
  useEffect(() => {
    if (formState.bankName) {
      const branchAddresses = {
        AIB: '12 Main St, Dublin (Auto-filled)',
        BOI: '15 Grafton St, Dublin (Auto-filled)',
        ULSTER: '20 College Green, Dublin (Auto-filled)',
        PERMANENT: "25 O'Connell St, Dublin (Auto-filled)",
        KBC: '30 Dame St, Dublin (Auto-filled)',
        REVOLUT: 'Online Banking (Auto-filled)',
        OTHER: 'Please enter branch address',
      };
      setFormState(prev => ({
        ...prev,
        branchAddress: branchAddresses[formState.bankName] || '',
      }));
    }
  }, [formState.bankName]);

  // IBAN formatting function - adds spaces every 4 characters
  const formatIBAN = value => {
    // Remove all spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    // Add space every 4 characters
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  // IBAN validation function
  const validateIBAN = iban => {
    if (!iban) return { isValid: false, message: 'IBAN is required' };

    // Remove spaces for validation
    const cleaned = iban.replace(/\s/g, '');

    // Basic format check: 2 letters (country code) + 2 digits (check digits) + up to 30 alphanumeric
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(cleaned)) {
      return {
        isValid: false,
        message: 'Invalid IBAN format. Format: CC00 XXXX XXXX XXXX...',
      };
    }

    // Length check (IBAN should be between 15 and 34 characters)
    if (cleaned.length < 15 || cleaned.length > 34) {
      return {
        isValid: false,
        message: 'IBAN must be between 15 and 34 characters',
      };
    }

    // Mod-97 check (basic IBAN validation algorithm)
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

    // Special handling for IBAN field
    if (name === 'iban') {
      // Format IBAN as user types
      const formatted = formatIBAN(value);
      setFormState(prev => ({
        ...prev,
        [name]: formatted,
      }));

      // Validate IBAN in real-time
      if (formatted) {
        const validation = validateIBAN(formatted);
        if (validation.isValid) {
          setIbanError('');
        } else {
          // Only show error if user has typed something meaningful (more than 4 chars)
          if (formatted.replace(/\s/g, '').length > 4) {
            setIbanError(validation.message);
          } else {
            setIbanError('');
          }
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

  const validateForm = () => {
    if (!formState.bankName) return false;
    if (!formState.branchAddress) return false;
    if (!formState.authorization) return false;
    if (!formState.accountName) return false;
    if (!formState.accountNumber) return false;
    if (!formState.iban) return false;

    // Validate IBAN format
    const ibanValidation = validateIBAN(formState.iban);
    if (!ibanValidation.isValid) {
      setIbanError(ibanValidation.message);
      return false;
    }
    setIbanError('');

    if (!formState.frequency) return false;
    if (!formState.amount) return false;
    if (!formState.startDate) return false;
    if (!formState.accountHolderSignature) return false;
    if (
      formState.numberOfPayments === 'specific' &&
      !formState.specificNumberOfPayments
    ) {
      return false;
    }
    return true;
  };

  const handleSaveOrder = () => {
    setShowValidation(true);
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const orderData = {
      ...formState,
      beneficiaryDetails,
      userDetails: {
        name:
          user?.userFirstName && user?.userLastName
            ? `${user.userFirstName} ${user.userLastName}`
            : user?.userName || '',
        email: user?.userEmail || user?.email || '',
      },
    };

    console.log('Standing Order Data:', orderData);
    // TODO: Add API call to save order
    alert('Order saved successfully!');
    navigate('/');
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

      pdf.save('standing-bankers-order.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again or use browser print.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailToBank = () => {
    console.log('Email to Bank functionality - to be implemented with backend');
    alert(
      'Email to Bank functionality will be implemented with backend integration',
    );
  };

  const isFormValid = validateForm();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
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
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                Standing Banking Order Setup
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Please complete the form below to authorize a new standing
                order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Print Content (hidden visually, used for PDF generation) */}
          <div
            ref={printRef}
            className="fixed left-[-9999px] top-0 w-[210mm] bg-white p-8"
            style={{
              opacity: 0,
              visibility: 'hidden',
              zIndex: -1,
              pointerEvents: 'none',
            }}>
            <div
              className="p-8 space-y-6 bg-white"
              style={{ minHeight: '297mm' }}>
              <h2 className="text-2xl font-bold text-center mb-6">
                Standing Banking Order Setup
              </h2>
              <p className="text-center text-sm text-gray-600 mb-6">
                Please complete the form below to authorize a new standing
                order.
              </p>

              {/* Your Account Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Your Account Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Bank Name:</strong>{' '}
                    {formState.bankName || 'Not provided'}
                  </div>
                  <div className="col-span-2">
                    <strong>Branch Address:</strong>{' '}
                    {formState.branchAddress || 'Not provided'}
                  </div>
                  <div>
                    <strong>Authorization:</strong>{' '}
                    {formState.authorization ? (
                      <span className="text-green-600">
                        ✓ Authorized - I/We hereby authorise and request you to
                        debit my/our account.
                      </span>
                    ) : (
                      <span className="text-red-600">Not authorized</span>
                    )}
                  </div>
                  <div>
                    <strong>Account Name:</strong>{' '}
                    {formState.accountName || 'Not provided'}
                  </div>
                  <div>
                    <strong>Account Number:</strong>{' '}
                    {formState.accountNumber || 'Not provided'}
                  </div>
                  <div>
                    <strong>BIC:</strong> {formState.bic || 'Not provided'}
                  </div>
                  <div className="col-span-2">
                    <strong>IBAN:</strong> {formState.iban || 'Not provided'}
                  </div>
                  {formState.message && (
                    <div className="col-span-2 mt-2">
                      <strong>Message:</strong> {formState.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Beneficiary Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Account Name:</strong>{' '}
                    {beneficiaryDetails.accountName}
                  </div>
                  <div>
                    <strong>IBAN:</strong> {beneficiaryDetails.iban}
                  </div>
                  <div>
                    <strong>Reference:</strong> {beneficiaryDetails.reference}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Frequency:</strong> {formState.frequency}
                  </div>
                  <div>
                    <strong>Amount:</strong> €{formState.amount}
                  </div>
                  <div>
                    <strong>Start Date:</strong>{' '}
                    {formState.startDate
                      ? dayjs(formState.startDate).isValid()
                        ? dayjs(formState.startDate).format('DD/MM/YYYY')
                        : formState.startDate
                      : 'Not set'}
                  </div>
                  <div>
                    <strong>Number of Payments:</strong>{' '}
                    {formState.numberOfPayments === 'indefinite'
                      ? 'Indefinite'
                      : formState.specificNumberOfPayments}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="border border-gray-300 p-4 rounded">
                  <h4 className="font-semibold mb-3 text-base">
                    Account Holder Signature
                  </h4>
                  {formState.accountHolderSignature ? (
                    <img
                      src={formState.accountHolderSignature}
                      alt="Account Holder Signature"
                      className="border border-gray-300 p-2 bg-white"
                      style={{
                        maxHeight: '150px',
                        width: 'auto',
                        display: 'block',
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
                      No signature provided
                    </div>
                  )}
                  <div className="mt-3 text-sm">
                    <strong>Date:</strong>{' '}
                    {formState.accountHolderSignatureDate
                      ? dayjs(formState.accountHolderSignatureDate).isValid()
                        ? dayjs(formState.accountHolderSignatureDate).format(
                            'DD/MM/YYYY',
                          )
                        : formState.accountHolderSignatureDate
                      : 'Not set'}
                  </div>
                </div>
                <div className="border border-gray-300 p-4 rounded">
                  <h4 className="font-semibold mb-3 text-base">
                    Second Signature (If Joint)
                  </h4>
                  {formState.secondSignature ? (
                    <img
                      src={formState.secondSignature}
                      alt="Second Signature"
                      className="border border-gray-300 p-2 bg-white"
                      style={{
                        maxHeight: '150px',
                        width: 'auto',
                        display: 'block',
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
                      No signature provided
                    </div>
                  )}
                  <div className="mt-3 text-sm">
                    <strong>Date:</strong>{' '}
                    {formState.secondSignatureDate
                      ? dayjs(formState.secondSignatureDate).isValid()
                        ? dayjs(formState.secondSignatureDate).format(
                            'DD/MM/YYYY',
                          )
                        : formState.secondSignatureDate
                      : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Account Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Your Account Details
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Bank Name"
                  name="bankName"
                  required
                  value={formState.bankName}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="Select your bank..."
                  options={bankOptions}
                  tooltip="System will attempt to lookup branch details."
                />

                <Input
                  label="Branch Address"
                  name="branchAddress"
                  required
                  readOnly
                  value={formState.branchAddress}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="Auto-populated from system"
                />
              </div>
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <Checkbox
                  label="I/We hereby authorise and request you to debit my/our account."
                  name="authorization"
                  required
                  checked={formState.authorization}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Name"
                  name="accountName"
                  required
                  value={formState.accountName}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="e.g. John Doe"
                />

                <Input
                  label="Account Number"
                  name="accountNumber"
                  required
                  value={formState.accountNumber}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="e.g. 12345678"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="BIC"
                  name="bic"
                  value={formState.bic}
                  onChange={handleInputChange}
                />

                <div>
                  <Input
                    label="IBAN"
                    name="iban"
                    required
                    value={formState.iban}
                    onChange={handleInputChange}
                    showValidation={showValidation}
                    placeholder="IE00 BOFI 9000 0000 0000 00"
                    maxLength={34}
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  />
                  {ibanError && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {ibanError}
                    </p>
                  )}
                  {formState.iban && !ibanError && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Valid IBAN format
                    </p>
                  )}
                </div>
              </div>

              <Input
                label="Your Message (Optional)"
                name="message"
                multiline
                value={formState.message}
                onChange={handleInputChange}
                placeholder="Optional message"
              />
            </div>
          </div>

          {/* Beneficiary Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-green-600"
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Beneficiary (Receivers) Details
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Input
                label="Account Name"
                name="beneficiaryAccountName"
                readOnly
                value={beneficiaryDetails.accountName}
              />

              <Input
                label="IBAN"
                name="beneficiaryIban"
                readOnly
                value={beneficiaryDetails.iban}
              />

              <Input
                label="Receiver Message (Reference)"
                name="beneficiaryReference"
                readOnly
                value={beneficiaryDetails.reference}
              />
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600"
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Payment Details
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Frequency"
                  name="frequency"
                  value={formState.frequency}
                  onChange={handleInputChange}
                  options={frequencyOptions}
                />

                <Input
                  label="Amount"
                  name="amount"
                  type="number"
                  required
                  value={formState.amount}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="€ 50.00"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Start Date"
                  name="startDate"
                  required
                  value={formState.startDate}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  disableAgeValidation={true}
                />

                <div className="mb-3 sm:mb-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Number of Payments
                  </label>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="numberOfPayments"
                        checked={formState.numberOfPayments === 'indefinite'}
                        onChange={e => {
                          setFormState(prev => ({
                            ...prev,
                            numberOfPayments: e.target.checked
                              ? 'indefinite'
                              : 'specific',
                            specificNumberOfPayments: e.target.checked
                              ? ''
                              : prev.specificNumberOfPayments,
                          }));
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">
                        Indefinite
                      </span>
                    </label>
                    <span className="text-xs sm:text-sm text-gray-500">or</span>
                    <div className="flex items-center">
                      <Input
                        name="specificNumberOfPayments"
                        type="number"
                        value={formState.specificNumberOfPayments}
                        onChange={handleInputChange}
                        disabled={formState.numberOfPayments === 'indefinite'}
                        placeholder="#"
                        className="w-16 sm:w-20"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Signatures
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                For printing or digital sign
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Account Holder Signature */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase">
                  Account Holder Signature
                </h4>
                <SignaturePad
                  onSignatureChange={signature =>
                    handleSignatureChange('accountHolderSignature', signature)
                  }
                  value={formState.accountHolderSignature}
                  required
                  showValidation={showValidation}
                />
                <DatePicker
                  label="Date"
                  name="accountHolderSignatureDate"
                  value={formState.accountHolderSignatureDate}
                  disableAgeValidation={true}
                  onChange={handleInputChange}
                />
              </div>

              {/* Second Signature */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase">
                  Second Signature (If Joint)
                </h4>
                <SignaturePad
                  onSignatureChange={signature =>
                    handleSignatureChange('secondSignature', signature)
                  }
                  value={formState.secondSignature}
                />
                <DatePicker
                  label="Date"
                  name="secondSignatureDate"
                  value={formState.secondSignatureDate}
                  disableAgeValidation={true}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4 border-t bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <Button
              type="default"
              onClick={handlePrint}
              loading={isGeneratingPDF}
              disabled={isGeneratingPDF}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              }>
              {isGeneratingPDF ? 'Generating PDF...' : 'Print Form'}
            </Button>
            <Button
              type="default"
              onClick={handleEmailToBank}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }>
              Email to Bank
            </Button>
            <Button
              type="primary"
              onClick={handleSaveOrder}
              disabled={!isFormValid}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }>
              Save Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingBankersOrder;
