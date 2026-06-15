import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalize a mobile number to E.164 (+<country><number>) for API storage.
 * Irish local numbers (e.g. 087 456 7890, 87 456 7890) become +353874567890.
 */
export const normalizeMobileToE164 = (mobileNo, defaultCountry = 'IE') => {
  const raw = String(mobileNo || '').trim();
  if (!raw) {
    return '';
  }

  if (raw.startsWith('+')) {
    const parsedInternational = parsePhoneNumberFromString(raw);
    if (parsedInternational?.isValid()) {
      return parsedInternational.format('E.164');
    }
    return raw;
  }

  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  if (parsed?.isValid()) {
    return parsed.format('E.164');
  }

  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('00')) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith('353')) {
    return `+${digits}`;
  }

  if (digits.startsWith('08')) {
    return `+353${digits.slice(1)}`;
  }

  if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 10) {
    return `+353${digits}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  return `+${digits}`;
};

export const isValidMobileE164 = (mobileNo, defaultCountry = 'IE') => {
  const e164 = normalizeMobileToE164(mobileNo, defaultCountry);
  if (!e164 || !e164.startsWith('+')) {
    return false;
  }
  const parsed = parsePhoneNumberFromString(e164);
  return Boolean(parsed?.isValid());
};
