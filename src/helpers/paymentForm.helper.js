import dayjs from 'dayjs';
import { isDataFormat } from './date.helper';

export const PAYMENT_FORM_TYPES = {
  DIRECT_DEBIT: 'DD_MANDATE',
  SALARY_DEDUCTION: 'SALARY_DEDUCTION',
  STANDING_ORDER: 'STANDING_ORDER',
};

export const TAB_TO_FORM_TYPE = {
  'Direct Debit': PAYMENT_FORM_TYPES.DIRECT_DEBIT,
  'Salary Deduction': PAYMENT_FORM_TYPES.SALARY_DEDUCTION,
  'Standing Banking Order': PAYMENT_FORM_TYPES.STANDING_ORDER,
};

export const FORM_TYPE_TO_TAB = {
  [PAYMENT_FORM_TYPES.DIRECT_DEBIT]: 'Direct Debit',
  [PAYMENT_FORM_TYPES.SALARY_DEDUCTION]: 'Salary Deduction',
  [PAYMENT_FORM_TYPES.STANDING_ORDER]: 'Standing Banking Order',
};

export const ALL_PAYMENT_TAB_OPTIONS = [
  { value: 'Standing Banking Order', label: 'Standing Banking Order' },
  { value: 'Direct Debit', label: 'Direct Debit' },
  { value: 'Salary Deduction', label: 'Salary Deduction' },
];

export const getPaymentTypeFromProfileSubscription = subscription => {
  if (!subscription) return null;
  return (
    subscription.paymentType ??
    subscription.paymentMethod ??
    subscription.preferredPaymentType ??
    subscription._subscriptionService?.paymentType ??
    subscription.subscriptionService?.paymentType ??
    subscription.subscription?.paymentType ??
    null
  );
};

/** Normalize lookup / subscription / formTypeLabel values to portal tab key */
export const normalizePaymentType = paymentType => {
  if (!paymentType) return null;

  const normalized = paymentType.toString().toLowerCase();

  if (
    normalized.includes('standing') &&
    (normalized.includes('banker') ||
      normalized.includes('bank') ||
      normalized.includes('order'))
  ) {
    return 'Standing Banking Order';
  }

  if (normalized.includes('direct') && normalized.includes('debit')) {
    return 'Direct Debit';
  }

  if (
    (normalized.includes('salary') && normalized.includes('deduction')) ||
    normalized === 'deduction' ||
    normalized.includes('payroll')
  ) {
    return 'Salary Deduction';
  }

  return null;
};

export const getTabKeyForPortalForm = form => {
  if (!form) return null;
  return (
    FORM_TYPE_TO_TAB[form.formType] ||
    normalizePaymentType(form.formTypeLabel) ||
    normalizePaymentType(form.formType) ||
    null
  );
};

export const formMatchesProfilePaymentType = (form, profilePaymentTypeTab) => {
  if (!form || !profilePaymentTypeTab) return false;
  return getTabKeyForPortalForm(form) === profilePaymentTypeTab;
};

export const extractMyPortalPaymentForms = response => {
  const body = response?.data;
  if (!body || typeof body !== 'object') return [];

  let forms =
    body.data?.paymentForms ??
    body.data?.data?.paymentForms ??
    body.paymentForms ??
    body.data ??
    [];

  if (!Array.isArray(forms)) {
    if (forms?.paymentForms && Array.isArray(forms.paymentForms)) {
      forms = forms.paymentForms;
    } else if (forms && typeof forms === 'object') {
      forms = [forms];
    } else {
      forms = [];
    }
  }

  return forms.map(normalizePortalPaymentForm).filter(Boolean);
};

const sortFormsByRecent = (a, b) =>
  new Date(b?.updatedAt || b?.createdAt || 0) -
  new Date(a?.updatedAt || a?.createdAt || 0);

export const getActivePaymentFormForProfile = (forms, profilePaymentTypeTab) => {
  if (!Array.isArray(forms) || forms.length === 0) return null;

  const activeForms = forms.filter(
    form => String(form?.status || '').toLowerCase() === 'active',
  );

  if (activeForms.length === 0) return null;

  if (profilePaymentTypeTab) {
    const matched = activeForms
      .filter(form => formMatchesProfilePaymentType(form, profilePaymentTypeTab))
      .sort(sortFormsByRecent);
    return matched[0] ?? null;
  }

  return [...activeForms].sort(sortFormsByRecent)[0] ?? null;
};

export const formatIbanForDisplay = iban => {
  if (!iban) return '';
  const cleaned = String(iban).replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

/** Collect debtor (and related) fields from mine/portal shapes: root, nested, or summary */
export const extractDirectDebitMandateFields = form => {
  if (!form || typeof form !== 'object') return {};

  const nested =
    form.directDebitMandate ||
    form.mandate ||
    form.formData?.directDebitMandate ||
    form.details?.directDebitMandate ||
    {};

  return {
    debtorName: pickFirstNonEmpty(
      nested.debtorName,
      form.debtorName,
      form.memberFullName,
      form.memberName,
    ),
    debtorAddress: pickFirstNonEmpty(nested.debtorAddress, form.debtorAddress),
    debtorCity: pickFirstNonEmpty(nested.debtorCity, form.debtorCity),
    debtorPostcode: pickFirstNonEmpty(
      nested.debtorPostcode,
      nested.debtorPostCode,
      form.debtorPostcode,
      form.debtorPostCode,
    ),
    debtorCountry: pickFirstNonEmpty(
      nested.debtorCountry,
      form.debtorCountry,
      'Ireland',
    ),
    debtorIban: pickFirstNonEmpty(
      nested.debtorIban,
      nested.debtorIbanDisplay,
      form.debtorIban,
      form.debtorIbanDisplay,
    ),
    debtorBic: pickFirstNonEmpty(nested.debtorBic, form.debtorBic),
    signedDate: pickFirstNonEmpty(nested.signedDate, form.signedDate),
    isAuthorized: nested.isAuthorized ?? form.isAuthorized,
    paymentTypeRecurrent:
      nested.paymentTypeRecurrent ?? form.paymentTypeRecurrent,
    creditorName: pickFirstNonEmpty(nested.creditorName, form.creditorName),
    creditorIdentifier: pickFirstNonEmpty(
      nested.creditorIdentifier,
      form.creditorIdentifier,
    ),
    creditorAddress: pickFirstNonEmpty(
      nested.creditorAddress,
      form.creditorAddress,
    ),
    creditorCity: pickFirstNonEmpty(nested.creditorCity, form.creditorCity),
    creditorPostcode: pickFirstNonEmpty(
      nested.creditorPostcode,
      form.creditorPostcode,
    ),
    creditorCountry: pickFirstNonEmpty(
      nested.creditorCountry,
      form.creditorCountry,
    ),
    creditorIban: pickFirstNonEmpty(nested.creditorIban, form.creditorIban),
    creditorBic: pickFirstNonEmpty(nested.creditorBic, form.creditorBic),
    uniqueMandateReference: pickFirstNonEmpty(
      nested.uniqueMandateReference,
      form.uniqueMandateReference,
      form.membershipNumber,
    ),
  };
};

/** Normalize mine/portal list items so mandate fields live under directDebitMandate */
export const normalizePortalPaymentForm = form => {
  if (!form || typeof form !== 'object') return form;

  const tabKey = getTabKeyForPortalForm(form);
  if (tabKey !== 'Direct Debit' && form.formType !== PAYMENT_FORM_TYPES.DIRECT_DEBIT) {
    return form;
  }

  const mandateFields = extractDirectDebitMandateFields(form);

  return {
    ...form,
    directDebitMandate: {
      ...(form.directDebitMandate || {}),
      ...mandateFields,
    },
  };
};

export const mapDirectDebitFromMineForm = form => {
  if (!form) return {};
  const m = extractDirectDebitMandateFields(form);

  return {
    memberName: m.debtorName || '',
    memberAddress: m.debtorAddress || '',
    memberCity: m.debtorCity || '',
    memberPostCode: m.debtorPostcode || '',
    memberCountry: m.debtorCountry || 'Ireland',
    authorization: m.isAuthorized ?? false,
    signatureDate: m.signedDate || '',
    paymentType: m.paymentTypeRecurrent === false ? 'one-off' : 'recurrent',
    iban: formatIbanForDisplay(m.debtorIban || ''),
    bic: m.debtorBic || '',
  };
};

export const mapSalaryDeductionFromMineForm = form => {
  if (!form) return {};
  return {
    employedAt: form.employedAt || '',
    payrollStaffNo: form.payrollStaffNo || '',
    commencing: form.commencingDate || form.startDate || '',
    date: form.signedDate || '',
    inmoNo: form.membershipNumber || form.referenceMembershipNo || '',
  };
};

export const mapStandingOrderFromMineForm = form => {
  if (!form) return {};
  const signatureDates = form.signatureDates || [];
  const amount =
    form.installmentAmountEur === null || form.installmentAmountEur === undefined
      ? ''
      : String(form.installmentAmountEur);
  const annualMembershipFee =
    form.annualMembershipFeeEur === null ||
    form.annualMembershipFeeEur === undefined
      ? ''
      : String(form.annualMembershipFeeEur);
  return {
    bankName: form.debtorBankName || '',
    branchAddress: form.debtorBankAddress || '',
    accountName: form.debtorAccountName || form.debtorName || '',
    iban: form.debtorIban || form.debtorIbanDisplay || '',
    bic: form.debtorBic || '',
    frequency: form.paymentFrequency || 'Monthly',
    amount,
    annualMembershipFee,
    startDate: form.startDate || '',
    accountHolderSignatureDate: signatureDates[0] || form.signedDate || '',
    secondSignatureDate: signatureDates[1] || '',
  };
};

export const isPaymentApiSuccess = response =>
  response?.status >= 200 && response?.status < 300;

export const getPaymentApiErrorMessage = (response, fallback) => {
  const data = response?.data;
  if (!data) {
    return response?.status
      ? `${fallback} (HTTP ${response.status})`
      : fallback;
  }
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error?.message) return data.error.message;
  if (typeof data.error === 'string') return data.error;
  return fallback;
};

export const extractPortalPaymentForm = response => {
  const body = response?.data;
  if (!body || typeof body !== 'object') return null;

  if (body._id || body.id || body.formType) {
    return body;
  }

  const nested = body.data;
  if (nested && typeof nested === 'object' && (nested._id || nested.id || nested.formType)) {
    return nested;
  }

  return null;
};

export const getPortalFormId = form => {
  if (!form) return null;
  return form._id ?? form.id ?? null;
};

export const extractPortalFormId = response => {
  const fromForm = getPortalFormId(extractPortalPaymentForm(response));
  if (fromForm) return fromForm;

  const body = response?.data;
  if (!body || typeof body !== 'object') return null;

  const findId = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object' || depth > 4) return null;
    if (typeof obj._id === 'string' && obj._id.length > 0) return obj._id;
    for (const value of Object.values(obj)) {
      const found = findId(value, depth + 1);
      if (found) return found;
    }
    return null;
  };

  return findId(body);
};

export const shouldRetryCreateAsPatch = response => {
  const status = response?.status;
  const msg = getPaymentApiErrorMessage(response, '').toLowerCase();
  return (
    status === 409 ||
    status === 400 ||
    status === 422 ||
    msg.includes('already exist') ||
    msg.includes('duplicate')
  );
};

export const toIsoDate = value => {
  if (!value) return null;
  if (dayjs(value).isValid()) {
    return dayjs(value).toISOString();
  }
  return isDataFormat(value);
};

export const cleanIban = iban => (iban || '').replace(/\s/g, '').toUpperCase();

export const buildGdprPayload = () => ({
  consentCapturedAt: new Date().toISOString(),
});

export const buildDirectDebitPayload = formState => ({
  formType: PAYMENT_FORM_TYPES.DIRECT_DEBIT,
  directDebitMandate: {
    debtorName: formState.memberName,
    debtorAddress: formState.memberAddress || '',
    debtorCity: formState.memberCity || '',
    debtorPostcode: formState.memberPostCode || '',
    debtorCountry: formState.memberCountry || '',
    debtorIban: cleanIban(formState.iban),
    debtorBic: formState.bic || '',
    signedDate: toIsoDate(formState.signatureDate),
    isAuthorized: !!formState.authorization,
  },
  gdpr: buildGdprPayload(),
});

export const buildDirectDebitPatchPayload = formState => ({
  directDebitMandate: buildDirectDebitPayload(formState).directDebitMandate,
  gdpr: buildGdprPayload(),
});

export const buildSalaryDeductionPayload = formState => ({
  formType: PAYMENT_FORM_TYPES.SALARY_DEDUCTION,
  salaryDeduction: {
    employedAt: formState.employedAt,
    payrollStaffNo: formState.payrollStaffNo,
    commencingDate: toIsoDate(formState.commencing),
    signedDate: toIsoDate(formState.date),
  },
  gdpr: buildGdprPayload(),
});

export const buildSalaryDeductionPatchPayload = formState => ({
  salaryDeduction: buildSalaryDeductionPayload(formState).salaryDeduction,
  gdpr: buildGdprPayload(),
});

export const buildStandingOrderPayload = formState => {
  const signatureDates = [
    toIsoDate(formState.accountHolderSignatureDate),
    toIsoDate(formState.secondSignatureDate),
  ].filter(Boolean);
  const installmentAmountEur = Number(formState.amount);

  return {
    formType: PAYMENT_FORM_TYPES.STANDING_ORDER,
    standingOrder: {
      debtorBankName: formState.bankName,
      debtorBankAddress: formState.branchAddress,
      debtorAccountName: formState.accountName,
      debtorIban: cleanIban(formState.iban),
      debtorBic: formState.bic || '',
      startDate: toIsoDate(formState.startDate),
      paymentFrequency: formState.frequency,
      installmentAmountEur: Number.isFinite(installmentAmountEur)
        ? installmentAmountEur
        : undefined,
      signatureDates,
    },
    gdpr: buildGdprPayload(),
  };
};

export const buildStandingOrderPatchPayload = formState => ({
  standingOrder: buildStandingOrderPayload(formState).standingOrder,
  gdpr: buildGdprPayload(),
});

export const portalFormHasExistingRecord = (portalForm, formType) => {
  if (!portalForm) return false;
  if (portalForm.unsaved === true) return false;
  if (portalForm.formType && portalForm.formType !== formType) {
    return false;
  }
  return Boolean(portalForm._id || portalForm.id);
};

export const mapDirectDebitFromPortal = mandateOrForm => {
  if (!mandateOrForm) return {};

  const isFullDocument = Boolean(
    mandateOrForm.formType === PAYMENT_FORM_TYPES.DIRECT_DEBIT ||
      mandateOrForm._id ||
      mandateOrForm.id ||
      mandateOrForm.status ||
      getTabKeyForPortalForm(mandateOrForm) === 'Direct Debit',
  );

  if (isFullDocument) {
    return mapDirectDebitFromMineForm(normalizePortalPaymentForm(mandateOrForm));
  }

  return mapDirectDebitFromMineForm({
    directDebitMandate: mandateOrForm,
    ...mandateOrForm,
  });
};

export const mapSalaryDeductionFromPortal = salaryDeductionOrForm => {
  if (!salaryDeductionOrForm) return {};
  if (salaryDeductionOrForm.formType === PAYMENT_FORM_TYPES.SALARY_DEDUCTION) {
    return mapSalaryDeductionFromMineForm(salaryDeductionOrForm);
  }
  const salaryDeduction = salaryDeductionOrForm;
  return {
    employedAt: salaryDeduction.employedAt || '',
    payrollStaffNo: salaryDeduction.payrollStaffNo || '',
    commencing: salaryDeduction.commencingDate || '',
    date: salaryDeduction.signedDate || '',
  };
};

export const mapStandingOrderFromPortal = standingOrderOrForm => {
  if (!standingOrderOrForm) return {};
  if (standingOrderOrForm.formType === PAYMENT_FORM_TYPES.STANDING_ORDER) {
    return mapStandingOrderFromMineForm(standingOrderOrForm);
  }
  const standingOrder = standingOrderOrForm;
  const [primaryDate, secondaryDate] = standingOrder.signatureDates || [];
  return {
    bankName: standingOrder.debtorBankName || '',
    branchAddress: standingOrder.debtorBankAddress || '',
    accountName: standingOrder.debtorAccountName || '',
    iban: standingOrder.debtorIban || '',
    bic: standingOrder.debtorBic || '',
    frequency: standingOrder.paymentFrequency || 'Monthly',
    amount:
      standingOrder.installmentAmountEur === null ||
      standingOrder.installmentAmountEur === undefined
        ? ''
        : String(standingOrder.installmentAmountEur),
    annualMembershipFee:
      standingOrder.annualMembershipFeeEur === null ||
      standingOrder.annualMembershipFeeEur === undefined
        ? ''
        : String(standingOrder.annualMembershipFeeEur),
    startDate: standingOrder.startDate || '',
    accountHolderSignatureDate: primaryDate || '',
    secondSignatureDate: secondaryDate || '',
  };
};

export const extractPaymentFormPrefill = response => {
  const body = response?.data;
  if (!body || typeof body !== 'object') return null;
  const form = body.data?.paymentForm ?? body.paymentForm ?? null;
  return form ? normalizePortalPaymentForm(form) : null;
};

const pickNonEmpty = (primary, fallback) => {
  const value = primary ?? fallback;
  if (value === null || value === undefined) return '';
  return String(value).trim() ? value : fallback ?? '';
};

export const hasCreditorOrganizationDetails = paymentForm => {
  const details = mapCreditorOrganizationDetails(paymentForm);
  return Boolean(details?.name?.trim());
};

export const hasDebtorMandateDetails = paymentForm => {
  if (!paymentForm) return false;
  const mandate = paymentForm.directDebitMandate || paymentForm;
  return Boolean(
    mandate.debtorName?.trim() ||
      mandate.debtorIban?.trim() ||
      mandate.debtorIbanDisplay?.trim() ||
      paymentForm.debtorIban?.trim(),
  );
};

/** Add creditor/org fields from prefill without changing saved/active record metadata */
export const mergePaymentFormWithPrefill = (existing, prefill) => {
  if (!existing) return prefill ? normalizePortalPaymentForm(prefill) : null;
  if (!prefill) return normalizePortalPaymentForm(existing);

  const normalizedExisting = normalizePortalPaymentForm(existing);
  const normalizedPrefill = normalizePortalPaymentForm(prefill);

  const existingMandate = extractDirectDebitMandateFields(normalizedExisting);
  const prefillMandate = extractDirectDebitMandateFields(normalizedPrefill);

  return {
    ...normalizedExisting,
    membershipNumber: pickNonEmpty(
      normalizedExisting.membershipNumber,
      normalizedPrefill.membershipNumber,
    ),
    organisationSnapshot:
      normalizedExisting.organisationSnapshot ||
      normalizedPrefill.organisationSnapshot,
    directDebitMandate: {
      ...existingMandate,
      creditorName: pickNonEmpty(
        existingMandate.creditorName,
        prefillMandate.creditorName,
      ),
      creditorIdentifier: pickNonEmpty(
        existingMandate.creditorIdentifier,
        prefillMandate.creditorIdentifier,
      ),
      creditorAddress: pickNonEmpty(
        existingMandate.creditorAddress,
        prefillMandate.creditorAddress,
      ),
      creditorCity: pickNonEmpty(
        existingMandate.creditorCity,
        prefillMandate.creditorCity,
      ),
      creditorPostcode: pickNonEmpty(
        existingMandate.creditorPostcode,
        prefillMandate.creditorPostcode,
      ),
      creditorCountry: pickNonEmpty(
        existingMandate.creditorCountry,
        prefillMandate.creditorCountry,
      ),
      creditorIban: pickNonEmpty(
        existingMandate.creditorIban,
        prefillMandate.creditorIban,
      ),
      creditorBic: pickNonEmpty(
        existingMandate.creditorBic,
        prefillMandate.creditorBic,
      ),
      uniqueMandateReference: pickNonEmpty(
        existingMandate.uniqueMandateReference,
        prefillMandate.uniqueMandateReference,
      ),
      debtorName: pickNonEmpty(
        existingMandate.debtorName,
        prefillMandate.debtorName,
      ),
      debtorAddress: pickNonEmpty(
        existingMandate.debtorAddress,
        prefillMandate.debtorAddress,
      ),
      debtorCity: pickNonEmpty(
        existingMandate.debtorCity,
        prefillMandate.debtorCity,
      ),
      debtorPostcode: pickNonEmpty(
        existingMandate.debtorPostcode,
        prefillMandate.debtorPostcode,
      ),
      debtorCountry: pickNonEmpty(
        existingMandate.debtorCountry,
        prefillMandate.debtorCountry,
      ),
      debtorIban: pickNonEmpty(
        existingMandate.debtorIban,
        prefillMandate.debtorIban,
      ),
      debtorBic: pickNonEmpty(
        existingMandate.debtorBic,
        prefillMandate.debtorBic,
      ),
      paymentTypeRecurrent:
        existingMandate.paymentTypeRecurrent ??
        prefillMandate.paymentTypeRecurrent,
      isAuthorized:
        existingMandate.isAuthorized ?? prefillMandate.isAuthorized,
    },
  };
};

const formatOrganisationBankAddress = bankAddress => {
  if (!bankAddress || typeof bankAddress !== 'object') return '';
  const line1 = [bankAddress.buildingOrHouse, bankAddress.streetOrRoad]
    .filter(Boolean)
    .join(', ');
  const line2 = [
    bankAddress.areaOrTown,
    bankAddress.countyCityOrPostCode,
    bankAddress.country,
  ]
    .filter(Boolean)
    .join(', ');
  return [line1, line2].filter(Boolean).join('\n');
};

/** Creditor block for SEPA mandate UI / PDF from prefill or saved portal form */
export const mapCreditorOrganizationDetails = paymentForm => {
  if (!paymentForm) return null;

  const mandate = paymentForm.directDebitMandate;
  const org = paymentForm.organisationSnapshot;

  if (
    !mandate &&
    (paymentForm.creditorName ||
      paymentForm.creditorIban ||
      paymentForm.creditorIdentifier)
  ) {
    return {
      name: paymentForm.creditorName || '',
      identifier: paymentForm.creditorIdentifier || '',
      address: paymentForm.creditorAddress || '',
      city: paymentForm.creditorCity || '',
      postCode: paymentForm.creditorPostcode || '',
      country: paymentForm.creditorCountry || '',
      iban: paymentForm.creditorIban || '',
      bic: paymentForm.creditorBic || '',
    };
  }

  if (mandate) {
    const bankAddress = formatOrganisationBankAddress(org?.bankAddress);
    return {
      name:
        mandate.creditorName ||
        org?.legalName ||
        org?.tradingName ||
        org?.bankName ||
        '',
      identifier:
        mandate.creditorIdentifier ||
        org?.sepaOriginatorIdentificationNumber ||
        '',
      address: mandate.creditorAddress || bankAddress || '',
      city: mandate.creditorCity || org?.bankAddress?.areaOrTown || '',
      postCode:
        mandate.creditorPostcode ||
        org?.bankAddress?.countyCityOrPostCode ||
        '',
      country: mandate.creditorCountry || org?.bankAddress?.country || '',
      iban: mandate.creditorIban || org?.iban || '',
      bic: mandate.creditorBic || org?.bic || '',
    };
  }

  if (!org) return null;

  return {
    name: org.legalName || org.tradingName || org.bankName || '',
    identifier: org.sepaOriginatorIdentificationNumber || '',
    address: formatOrganisationBankAddress(org.bankAddress),
    city: org.bankAddress?.areaOrTown || '',
    postCode: org.bankAddress?.countyCityOrPostCode || '',
    country: org.bankAddress?.country || '',
    iban: org.iban || '',
    bic: org.bic || '',
  };
};

export const getUniqueMandateReferenceFromForm = paymentForm => {
  if (!paymentForm) return '';
  return (
    paymentForm.directDebitMandate?.uniqueMandateReference ||
    paymentForm.membershipNumber ||
    ''
  );
};

/** Organisation display name from prefill / portal payment form */
export const getOrganizationNameFromPrefill = paymentForm => {
  if (!paymentForm) return '';

  const creditor = mapCreditorOrganizationDetails(paymentForm);
  if (creditor?.name?.trim()) return creditor.name.trim();

  const standingOrder = paymentForm.standingOrder || {};
  const org = paymentForm.organisationSnapshot || {};

  return (
    standingOrder.beneficiaryAccountName ||
    standingOrder.creditorName ||
    org.legalName ||
    org.tradingName ||
    org.bankName ||
    ''
  );
};
