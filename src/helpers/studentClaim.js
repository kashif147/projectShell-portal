// P5 STUDENT policy - portal side of the student pricing claim (events-service is authoritative).
// A non-member choosing the Student rate declares an institution; the price stays provisional until an
// organiser verifies the claim in the CRM (approval/capture is blocked until then, and a rejected claim
// rejects the registration). An undergraduate-student member is verified by membership and declares
// nothing. Group Student is CRM-only and is never offered here.
// Pure module (no imports) so node --test can load it directly.

export const STUDENT_TIER_TYPE = 'STUDENT';
export const STUDENT_INSTITUTION_MIN = 2;
export const STUDENT_INSTITUTION_MAX = 200;

export const STUDENT_PROVISIONAL_COPY =
  'Student price is provisional until verified by the organiser; your card is authorised, not charged.';

/** Collapse whitespace the same way the server stores it. */
export const normalizeStudentInstitution = value =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

/** { ok, value, error } for the institution input. */
export const validateStudentInstitution = value => {
  const normalized = normalizeStudentInstitution(value);
  if (!normalized) {
    return { ok: false, value: '', error: 'Enter the name of your college or university.' };
  }
  if (normalized.length < STUDENT_INSTITUTION_MIN) {
    return {
      ok: false,
      value: normalized,
      error: `Institution must be at least ${STUDENT_INSTITUTION_MIN} characters.`,
    };
  }
  if (normalized.length > STUDENT_INSTITUTION_MAX) {
    return {
      ok: false,
      value: normalized,
      error: `Institution must be at most ${STUDENT_INSTITUTION_MAX} characters.`,
    };
  }
  return { ok: true, value: normalized, error: null };
};

/** A Student option needs a declaration unless the caller is a verified undergraduate-student member. */
export const studentOptionRequiresInstitution = ({ isMember, isUndergraduate } = {}) =>
  !(Boolean(isMember) && Boolean(isUndergraduate));

/** True when a selected (quantity > 0) pricing option needs an institution declaration. */
export const isStudentClaimRequired = (options = [], quantities = {}) =>
  (options || []).some(
    option =>
      option?.tierType === STUDENT_TIER_TYPE &&
      option?.requiresInstitution === true &&
      Math.max(0, Number(quantities?.[option.id]) || 0) > 0,
  );

/**
 * The `studentClaim` request field, or null when none applies. Only sent with a STUDENT line item.
 * An older events-service ignores the unknown field, so sending it is backwards compatible.
 */
export const buildStudentClaim = ({ lineItems = [], institution } = {}) => {
  const hasStudentLine = (lineItems || []).some(
    item => (item?.tierKey || item?.tierType) === STUDENT_TIER_TYPE && Number(item?.quantity) > 0,
  );
  if (!hasStudentLine) return null;
  const checked = validateStudentInstitution(institution);
  return checked.ok ? { institution: checked.value } : null;
};

const REGISTRATION_ERROR_MESSAGES = Object.freeze({
  STUDENT_CLAIM_REQUIRED:
    'Please enter your college or university to register at the Student rate.',
  GROUP_STUDENT_CRM_ONLY:
    'Group Student registrations are arranged by the organiser. Please contact them to book a group.',
  MEMBERSHIP_LOOKUP_FAILED:
    'We could not confirm your membership right now. Please try again in a few minutes.',
});

/** Error code from an events-service response body (`{ error: { code } }` or `{ code }`). */
export const registrationErrorCode = data => data?.error?.code || data?.code || null;

/** User-facing message for a failed registration response; never a fallback price. */
export const registrationErrorMessage = (res, fallback = 'Unable to create registration.') => {
  const code = registrationErrorCode(res?.data);
  if (code && REGISTRATION_ERROR_MESSAGES[code]) return REGISTRATION_ERROR_MESSAGES[code];
  return res?.data?.message || res?.data?.error?.message || fallback;
};

/**
 * Member-facing status line for a registration's student claim (server sends
 * { source, institution, verification: { status } }), or null when there is nothing to show.
 */
export const studentClaimStatusLabel = studentEligibility => {
  if (!studentEligibility || studentEligibility.source !== 'declared_claim') return null;
  const status = studentEligibility.verification?.status;
  if (status === 'pending') return 'Student pricing: awaiting verification by the organiser';
  if (status === 'verified') return 'Student pricing: verified';
  if (status === 'rejected') return 'Student pricing: not verified — registration rejected';
  return null;
};
