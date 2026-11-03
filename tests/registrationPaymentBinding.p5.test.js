// P5 payer binding: the portal's registration PaymentIntent purpose/target must match the
// registration it later submits (events-service registrationType + eventId), or
// account-service refuses the attach (PURPOSE_MISMATCH / TARGET_MISMATCH).
// node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PORTAL_REGISTRATION_TYPE,
  registrationPaymentBinding,
  resolvePortalRegistrationEntityId,
} from '../src/helpers/registrationPaymentBinding.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');

test('the portal submits registrations as events-service type event, so intents are eventRegistration for that event', () => {
  assert.equal(PORTAL_REGISTRATION_TYPE, 'event');
  assert.deepEqual(registrationPaymentBinding({ entityId: 'e1' }), {
    purpose: 'eventRegistration', entityType: 'event', entityId: 'e1', metadata: { eventId: 'e1' },
  });
});

test('explicit course mapping (used only once the portal submits events-service courses)', () => {
  assert.deepEqual(registrationPaymentBinding({ registrationType: 'course', entityId: 'c1' }), {
    purpose: 'courseRegistration', entityType: 'course', entityId: 'c1', metadata: { courseId: 'c1' },
  });
});

test('the intent target id is resolved in the same order as the registration payload id', () => {
  assert.equal(resolvePortalRegistrationEntityId({ eventId: 'e1', courseId: 'c1' }), 'e1');
  assert.equal(resolvePortalRegistrationEntityId({ courseId: 'c1', event: { id: 'x' } }), 'c1');
  assert.equal(resolvePortalRegistrationEntityId({ event: { id: 'x' } }), 'x');
  assert.equal(resolvePortalRegistrationEntityId({}), undefined);
});

test('payment page and registration payload builder both use the shared binding (no divergent literals)', () => {
  const page = read('pages/RegistrationPayment.jsx');
  const helper = read('helpers/events.helper.js');
  assert.match(page, /registrationPaymentBinding\(\{ entityId: registrationEntityId \}\)/);
  assert.match(page, /resolvePortalRegistrationEntityId\(/);
  assert.match(page, /entityType: paymentBinding\.entityType/);
  assert.doesNotMatch(page, /purpose\s*=\s*'eventRegistration'|purpose="eventRegistration"/);
  assert.match(helper, /const registrationType = PORTAL_REGISTRATION_TYPE;/);
  assert.match(helper, /resolvePortalRegistrationEntityId\(\{ eventId, courseId, event \}\)/);
});
