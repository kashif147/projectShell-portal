// My Events: a cancelled / CRM-rejected registration shows a prominent "Cancelled" marker on its card
// (red status pill with icon, red banner, red border) instead of the raw lower-case status in the grey
// default pill. node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANCELLED_CARD_STATUS,
  isCancelledRegistration,
} from '../src/helpers/registrationCancellation.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');

test('cancelled or CRM-rejected registrations are recognised; active ones are not', () => {
  assert.equal(CANCELLED_CARD_STATUS, 'cancelled');
  for (const r of [
    { status: 'cancelled', approvalStatus: 'rejected' },
    { status: 'cancelled', approvalStatus: 'pending_review' },
    { status: 'Cancelled' },
    { status: 'canceled' },
    { status: 'pending', approvalStatus: 'rejected' },
  ]) {
    assert.equal(isCancelledRegistration(r), true, JSON.stringify(r));
  }
  for (const r of [
    { status: 'pending', approvalStatus: 'pending_review' },
    { status: 'confirmed', approvalStatus: 'approved' },
    {},
    undefined,
  ]) {
    assert.equal(isCancelledRegistration(r), false, JSON.stringify(r));
  }
});

test('card status: cancellation is resolved before pending review; label is "Cancelled"', () => {
  const h = read('helpers/events.helper.js');
  const fn = h.slice(h.indexOf('export const resolveRegistrationCardStatus'));
  assert.ok(
    fn.indexOf('isCancelledRegistration(item)') < fn.indexOf("approval === 'pending_review'"),
  );
  assert.match(h, /case 'cancelled':\s*return 'Cancelled';/);
});

test('EventCard makes a cancelled registration prominent', () => {
  const c = read('components/events/EventCard.jsx');
  assert.match(c, /cancelled:\s*'bg-red-600 text-white border-red-600/);
  assert.match(c, /Registration cancelled/);
  assert.match(c, /isCancelled\s*\?\s*'Cancelled'/);
  assert.match(c, /isCancelled \? <CloseCircleFilled \/> : null/);
});
