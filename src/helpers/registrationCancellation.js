// A registration that no longer holds a place: rejected by staff in the CRM (approvalStatus
// "rejected") or cancelled (status "cancelled"). Members can't cancel from the portal; staff reject or
// cancel in the CRM. Shown on the portal card as "Cancelled". Dependency-free so node --test can import it.

const lower = value => String(value || '').toLowerCase();

export const CANCELLED_CARD_STATUS = 'cancelled';

export const isCancelledRegistration = (item = {}) =>
  lower(item?.approvalStatus) === 'rejected' ||
  ['cancelled', 'canceled', 'rejected'].includes(lower(item?.status));
