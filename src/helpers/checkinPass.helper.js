// P5 attendance (events-service): in-person attendance is recorded by the ORGANISER scanning the
// member's check-in pass; online sessions also allow self-marking inside the window. Pure helpers so
// they can be tested with node --test.

const MESSAGES = {
  ATTENDANCE_NOT_OPEN: 'Check-in for this session is not open yet.',
  ATTENDANCE_CLOSED: 'Check-in for this session has closed. Please contact the organiser.',
  ATTENDANCE_WINDOW_UNAVAILABLE: 'Check-in is not available for this event yet. Please contact the organiser.',
  SESSION_TIMING_INCOMPLETE: 'Check-in is not available for this session yet. Please contact the organiser.',
  ATTENDANCE_SELF_NOT_ALLOWED_IN_PERSON: 'For in-person sessions, show your check-in pass to the organiser.',
  REGISTRATION_NOT_ELIGIBLE: 'Your registration is not confirmed yet.',
  SESSION_NOT_SELECTED: 'This session is not part of your booking.',
};

export const checkinErrorMessage = (error) => {
  const body = error?.response?.data?.error || error?.data?.error || {};
  const base = MESSAGES[body.code] || body.message || 'Something went wrong. Please try again.';
  if (body.code === 'ATTENDANCE_NOT_OPEN' && body.opensAt) {
    return `${base} It opens at ${formatLocal(body.opensAt)}.`;
  }
  return base;
};

export const formatLocal = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

/** A pass can only be shown for an approved, confirmed booking of an event (not a course). */
export const canShowCheckin = (event) =>
  Boolean(event?.registrationId) &&
  String(event?.approvalStatus || '').toLowerCase() === 'approved' &&
  String(event?.kind || event?.registrationType || 'event').toLowerCase() === 'event';

/** Sessions of the event, from the API payload (never the UI schedule). */
export const checkinSessions = (event) => {
  const list = event?.apiSessions || event?.raw?.sessions || event?.sessions || [];
  return (Array.isArray(list) ? list : [])
    .filter((s) => s && (s._id || s.id) && s.isDeleted !== true)
    .map((s) => ({ id: String(s._id || s.id), label: s.label || 'Session', isVirtual: s.isVirtual === true }));
};
