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

  return {
    formType: PAYMENT_FORM_TYPES.STANDING_ORDER,
    standingOrder: {
      debtorBankName: formState.bankName,
      debtorBankAddress: formState.branchAddress,
      debtorAccountName: formState.accountName,
      debtorIban: cleanIban(formState.iban),
      debtorBic: formState.bic || '',
      startDate: toIsoDate(formState.startDate),
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
  if (portalForm.formType && portalForm.formType !== formType) {
    return false;
  }
  return Boolean(
    portalForm._id ||
      portalForm.id ||
      portalForm.formType === formType ||
      portalForm.directDebitMandate ||
      portalForm.salaryDeduction ||
      portalForm.standingOrder,
  );
};

export const mapDirectDebitFromPortal = mandate => {
  if (!mandate) return {};
  return {
    memberName: mandate.debtorName || '',
    memberAddress: mandate.debtorAddress || '',
    memberCity: mandate.debtorCity || '',
    memberPostCode: mandate.debtorPostcode || '',
    memberCountry: mandate.debtorCountry || 'Ireland',
    iban: mandate.debtorIban || '',
    bic: mandate.debtorBic || '',
    signatureDate: mandate.signedDate || '',
    authorization: mandate.isAuthorized ?? false,
  };
};

export const mapSalaryDeductionFromPortal = salaryDeduction => {
  if (!salaryDeduction) return {};
  return {
    employedAt: salaryDeduction.employedAt || '',
    payrollStaffNo: salaryDeduction.payrollStaffNo || '',
    commencing: salaryDeduction.commencingDate || '',
    date: salaryDeduction.signedDate || '',
  };
};

export const mapStandingOrderFromPortal = standingOrder => {
  if (!standingOrder) return {};
  const [primaryDate, secondaryDate] = standingOrder.signatureDates || [];
  return {
    bankName: standingOrder.debtorBankName || '',
    branchAddress: standingOrder.debtorBankAddress || '',
    accountName: standingOrder.debtorAccountName || '',
    iban: standingOrder.debtorIban || '',
    bic: standingOrder.debtorBic || '',
    startDate: standingOrder.startDate || '',
    accountHolderSignatureDate: primaryDate || '',
    secondSignatureDate: secondaryDate || '',
  };
};
