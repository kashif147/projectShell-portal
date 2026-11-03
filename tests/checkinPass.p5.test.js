// node --test. P5 attendance: check-in pass helpers (portal).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canShowCheckin, checkinErrorMessage, checkinSessions } from '../src/helpers/checkinPass.helper.js';

test('a pass is offered only for an approved event booking', () => {
  assert.equal(canShowCheckin({ registrationId: 'r1', approvalStatus: 'approved', kind: 'event' }), true);
  assert.equal(canShowCheckin({ registrationId: 'r1', approvalStatus: 'pending_review', kind: 'event' }), false);
  assert.equal(canShowCheckin({ registrationId: 'r1', approvalStatus: 'approved', kind: 'course' }), false);
  assert.equal(canShowCheckin({ approvalStatus: 'approved' }), false);
});

test('sessions come from the API payload; online flag only when explicitly virtual', () => {
  const s = checkinSessions({ apiSessions: [{ _id: 'a', label: 'Day 1', isVirtual: true }, { _id: 'b' }, { _id: 'c', isDeleted: true }, null] });
  assert.deepEqual(s, [
    { id: 'a', label: 'Day 1', isVirtual: true },
    { id: 'b', label: 'Session', isVirtual: false },
  ]);
});

test('server error codes become member-facing text (in-person self -> show the pass)', () => {
  const res = (code, extra = {}) => ({ status: 409, data: { error: { code, ...extra } } });
  assert.match(checkinErrorMessage(res('ATTENDANCE_SELF_NOT_ALLOWED_IN_PERSON')), /show your check-in pass to the organiser/);
  assert.match(checkinErrorMessage(res('ATTENDANCE_CLOSED')), /closed/);
  assert.match(checkinErrorMessage(res('ATTENDANCE_NOT_OPEN', { opensAt: '2030-01-14T09:30:00.000Z' })), /It opens at /);
  assert.match(checkinErrorMessage(res('ATTENDANCE_WINDOW_UNAVAILABLE')), /not available/);
  assert.match(checkinErrorMessage(undefined), /try again/);
});
