// P5 payer binding (account-service + events-service): a registration PaymentIntent is created
// for exactly the event/course the registration is later submitted for, and its purpose must
// match that registration's type. Both the payment page and buildEventsRegistrationPayload use
// these helpers, so the intent and the registration can never diverge.
//
// The portal submits every registration (events and CPD courses alike) to events-service as
// registrationType 'event' with eventId (see buildEventsRegistrationPayload). The payment
// purpose and target therefore follow that same type: 'eventRegistration' + entityType 'event'.
// A 'course' mapping exists for when the portal starts submitting events-service courses.

export const PORTAL_REGISTRATION_TYPE = 'event';

/** The id the registration is submitted with (same order as the registration payload). */
export const resolvePortalRegistrationEntityId = ({ eventId, courseId, event } = {}) =>
  eventId || courseId || event?.id || undefined;

/** Purpose, target and target metadata for a registration PaymentIntent. */
export const registrationPaymentBinding = ({
  registrationType = PORTAL_REGISTRATION_TYPE,
  entityId,
} = {}) => {
  if (registrationType === 'course') {
    return {
      purpose: 'courseRegistration',
      entityType: 'course',
      entityId,
      metadata: { courseId: entityId },
    };
  }
  return {
    purpose: 'eventRegistration',
    entityType: 'event',
    entityId,
    metadata: { eventId: entityId },
  };
};
