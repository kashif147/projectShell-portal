import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import Button from '../../components/common/Button';
import { useSelector } from 'react-redux';
import { useApplication } from '../../contexts/applicationContext';
import { fetchCategoryByCategoryId } from '../../api/category.api';

const DirectDebit = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { personalDetail, subscriptionDetail } = useApplication();
  const ibanInputRef = useRef(null);

  // Get category data
  const membershipCategory =
    subscriptionDetail?.subscriptionDetails?.membershipCategory;
  const [categoryData, setCategoryData] = useState(null);

  // Form state
  const [formState, setFormState] = useState({
    bankName: '',
    branchAddress: '',
    authorization: false,
    accountHolderName: '',
    accountNumber: '',
    bic: '',
    iban: '',
    personalAddress: '',
    personalTelephone: '',
    personalEmail: '',
  });

  const [showValidation, setShowValidation] = useState(false);
  const [ibanError, setIbanError] = useState('');

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

  // Beneficiary details (hardcoded)
  const beneficiaryDetails = {
    accountName: 'Global Services Ltd.',
    iban: 'GB12 CPBK 9876 5432 1098 76',
    reference: `REF: MEM-2023-${user?.id || '0000'}`,
  };

  // Fetch category data and auto-populate user data
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

  // Auto-populate user data
  useEffect(() => {
    // Account Holder Name
    const accountHolderName =
      personalDetail?.personalInfo?.forename && personalDetail?.personalInfo?.surname
        ? `${personalDetail.personalInfo.forename} ${personalDetail.personalInfo.surname}`
        : user?.userFirstName && user?.userLastName
        ? `${user.userFirstName} ${user.userLastName}`
        : user?.userName || '';

    // Personal Address
    const contactInfo = personalDetail?.contactInfo || {};
    const addressParts = [
      contactInfo.buildingOrHouse,
      contactInfo.streetOrRoad,
      contactInfo.areaOrTown,
      contactInfo.countyCityOrPostCode,
    ].filter(Boolean);
    const personalAddress = addressParts.join(', ') || '';

    // Personal Telephone
    const personalTelephone =
      contactInfo.mobileNumber || user?.userMobilePhone || '';

    // Personal Email
    const personalEmail =
      contactInfo.personalEmail || user?.userEmail || '';

    setFormState(prev => ({
      ...prev,
      accountHolderName,
      personalAddress,
      personalTelephone,
      personalEmail,
    }));
  }, [personalDetail, user]);

  // Auto-populate branch address based on bank selection
  useEffect(() => {
    if (formState.bankName) {
      const branchAddresses = {
        AIB: '123 Financial District, London, EC1A 1BB, United Kingdom',
        BOI: '15 Grafton St, Dublin, Ireland',
        ULSTER: '20 College Green, Dublin, Ireland',
        PERMANENT: "25 O'Connell St, Dublin, Ireland",
        KBC: '30 Dame St, Dublin, Ireland',
        REVOLUT: 'Online Banking',
        OTHER: 'Please enter branch address',
      };
      setFormState(prev => ({
        ...prev,
        branchAddress: branchAddresses[formState.bankName] || '',
      }));
    }
  }, [formState.bankName]);

  // IBAN formatting function - adds spaces every 4 characters
  const formatIBAN = (value, cursorPosition = null) => {
    // Remove all spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase();

    // Calculate cursor position in cleaned string (before spaces)
    let cursorInCleaned = cursorPosition;
    if (cursorPosition !== null && cursorPosition >= 0) {
      // Count spaces before cursor position in original value
      const beforeCursor = value.substring(0, cursorPosition);
      const spacesBefore = (beforeCursor.match(/\s/g) || []).length;
      cursorInCleaned = Math.max(0, cursorPosition - spacesBefore);
    }

    // Add space every 4 characters
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();

    // Calculate new cursor position
    if (cursorPosition !== null && cursorInCleaned !== null && cursorInCleaned >= 0) {
      // Count how many spaces would be before the cursor position in formatted string
      // Each group of 4 characters gets a space after it
      const groupsBeforeCursor = Math.floor(Math.max(0, cursorInCleaned) / 4);
      const newCursorPosition = Math.min(
        cursorInCleaned + groupsBeforeCursor,
        formatted.length,
      );
      return { formatted, cursorPosition: Math.max(0, newCursorPosition) };
    }

    return { formatted, cursorPosition: null };
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
      // Get current cursor position
      const cursorPosition = e.target.selectionStart;

      // Format IBAN as user types
      const { formatted, cursorPosition: newCursorPosition } = formatIBAN(
        value,
        cursorPosition,
      );

      setFormState(prev => ({
        ...prev,
        [name]: formatted,
      }));

      // Restore cursor position after state update
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

  const validateForm = () => {
    if (!formState.bankName) return false;
    if (!formState.branchAddress) return false;
    if (!formState.authorization) return false;
    if (!formState.accountHolderName) return false;
    if (!formState.accountNumber) return false;
    if (!formState.iban) return false;

    // Validate IBAN format
    const ibanValidation = validateIBAN(formState.iban);
    if (!ibanValidation.isValid) {
      setIbanError(ibanValidation.message);
      return false;
    }
    setIbanError('');

    if (!formState.personalAddress) return false;
    if (!formState.personalTelephone) return false;
    if (!formState.personalEmail) return false;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.personalEmail)) {
      return false;
    }

    return true;
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleConfirm = () => {
    setShowValidation(true);
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const formData = {
      ...formState,
      beneficiaryDetails,
      totalAmount: categoryData?.currentPricing?.price
        ? categoryData.currentPricing.price / 100
        : 0,
      currency: categoryData?.currentPricing?.currency || 'EUR',
    };

    console.log('Direct Debit Form Data:', formData);
    // TODO: Add API call to save direct debit authorization
    alert('Direct Debit authorization submitted successfully!');
    navigate('/');
  };

  // Calculate total amount
  const totalAmount = categoryData?.currentPricing?.price
    ? categoryData.currentPricing.price / 100
    : 0;
  const currency = categoryData?.currentPricing?.currency || 'EUR';
  const currencySymbol = currency.toUpperCase() === 'EUR' ? '€' : currency;

  const isFormValid = validateForm();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Direct Debit
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Set up automatic payments from your bank account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
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
              <Select
                label="Bank Name"
                name="bankName"
                required
                value={formState.bankName}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Select your bank (System Lookup)"
                options={bankOptions}
                tooltip="Branch address will be populated automatically based on selection."
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

              <div className="mb-3 sm:mb-4 p-3 sm:p-4 md:p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <Checkbox
                  label="Authorization Declaration *"
                  name="authorization"
                  required
                  checked={formState.authorization}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                />
                <p className="text-xs sm:text-sm text-gray-700 mt-2 ml-6">
                  By signing up to this form, I have authorised a recurring debit
                  to my bank account.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Holder Name"
                  name="accountHolderName"
                  required
                  value={formState.accountHolderName}
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

              <Input
                label="BIC (Swift Code)"
                name="bic"
                value={formState.bic}
                onChange={handleInputChange}
                placeholder="e.g. ABCDGB22"
              />

              <div>
                <Input
                  ref={ibanInputRef}
                  label="IBAN"
                  name="iban"
                  required
                  value={formState.iban}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="GB29 ABCD 1234 5678 9012 34"
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

              <Input
                label="Personal Address"
                name="personalAddress"
                required
                readOnly
                value={formState.personalAddress}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Pre-populated from member file"
              />
              <p className="text-xs text-gray-500 -mt-2">
                Pre-populated from member file.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Personal Telephone"
                  name="personalTelephone"
                  required
                  value={formState.personalTelephone}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="+44 7700 900077"
                />

                <Input
                  label="Personal Email"
                  name="personalEmail"
                  type="email"
                  required
                  value={formState.personalEmail}
                  onChange={handleInputChange}
                  showValidation={showValidation}
                  placeholder="member@example.com"
                />
              </div>
            </div>
          </div>

          {/* Beneficiary Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600"
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
                Beneficiary (Receiver) Details
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <Input
                label="Receiver Message (Reference)"
                name="beneficiaryReference"
                readOnly
                value={beneficiaryDetails.reference}
              />

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Monthly Recurring
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              type="default"
              onClick={handleCancel}
              className="w-full sm:w-auto !text-sm sm:!text-base !h-10 sm:!h-11">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }>
              Confirm and Authorize
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectDebit;
