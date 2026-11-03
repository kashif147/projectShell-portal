// P5 STUDENT policy - portal side: Group Student is never offered (CRM-only), a non-member Student ticket
// needs an institution declaration (2-200 chars) sent as studentClaim.institution, the 400/403/503 server
// codes get specific messages, and the member-facing claim status is shown on my registrations.
// node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STUDENT_INSTITUTION_MAX,
  buildStudentClaim,
  isStudentClaimRequired,
  normalizeStudentInstitution,
  registrationErrorMessage,
  studentClaimStatusLabel,
  studentOptionRequiresInstitution,
  validateStudentInstitution,
} from '../src/helpers/studentClaim.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = rel => fs.readFileSync(path.join(SRC, rel), 'utf8');

test('institution: whitespace collapsed; 2..200 chars accepted, outside rejected', () => {
  assert.equal(normalizeStudentInstitution('  Example \n University  '), 'Example University');
  assert.equal(validateStudentInstitution('').ok, false);
  assert.equal(validateStudentInstitution('   ').ok, false);
  assert.equal(validateStudentInstitution('A').ok, false);
  assert.deepEqual(validateStudentInstitution('UL'), { ok: true, value: 'UL', error: null });
  assert.equal(validateStudentInstitution('x'.repeat(STUDENT_INSTITUTION_MAX)).ok, true);
  assert.equal(validateStudentInstitution('x'.repeat(STUDENT_INSTITUTION_MAX + 1)).ok, false);
  assert.equal(validateStudentInstitution(undefined).ok, false);
});

test('only a verified undergraduate-student member is exempt from the declaration', () => {
  assert.equal(studentOptionRequiresInstitution({ isMember: false, isUndergraduate: false }), true);
  assert.equal(studentOptionRequiresInstitution({ isMember: false, isUndergraduate: true }), true);
  assert.equal(studentOptionRequiresInstitution({ isMember: true, isUndergraduate: false }), true);
  assert.equal(studentOptionRequiresInstitution({ isMember: true, isUndergraduate: true }), false);
});

test('claim required only when a Student option needing it has quantity > 0', () => {
  const student = { id: 'student', tierType: 'STUDENT', requiresInstitution: true };
  const exempt = { id: 'student', tierType: 'STUDENT', requiresInstitution: false };
  const other = { id: 'non-member', tierType: 'NON_MEMBER' };
  assert.equal(isStudentClaimRequired([student, other], { student: 0, 'non-member': 1 }), false);
  assert.equal(isStudentClaimRequired([student, other], { student: 2 }), true); // no seat limit
  assert.equal(isStudentClaimRequired([exempt], { student: 1 }), false);
  assert.equal(isStudentClaimRequired([], {}), false);
});

test('studentClaim field: only with a STUDENT line item and a valid institution', () => {
  assert.deepEqual(
    buildStudentClaim({ lineItems: [{ tierKey: 'STUDENT', quantity: 1 }], institution: ' Example  University ' }),
    { institution: 'Example University' },
  );
  assert.equal(buildStudentClaim({ lineItems: [{ tierKey: 'NON_MEMBER', quantity: 1 }], institution: 'UL' }), null);
  assert.equal(buildStudentClaim({ lineItems: [{ tierKey: 'STUDENT', quantity: 0 }], institution: 'UL' }), null);
  assert.equal(buildStudentClaim({ lineItems: [{ tierKey: 'STUDENT', quantity: 1 }], institution: '' }), null);
  assert.equal(buildStudentClaim({}), null);
});

test('server codes map to specific messages; unknown codes keep the server message', () => {
  const res = (status, code, message) => ({ status, data: { success: false, error: { code, message } } });
  assert.match(registrationErrorMessage(res(400, 'STUDENT_CLAIM_REQUIRED')), /college or university/);
  assert.match(registrationErrorMessage(res(403, 'GROUP_STUDENT_CRM_ONLY')), /arranged by the organiser/);
  assert.match(registrationErrorMessage(res(503, 'MEMBERSHIP_LOOKUP_FAILED')), /try again/);
  assert.match(registrationErrorMessage({ status: 503, data: { code: 'MEMBERSHIP_LOOKUP_FAILED' } }), /try again/);
  assert.equal(registrationErrorMessage(res(400, 'OTHER', 'Server says no')), 'Server says no');
  assert.equal(registrationErrorMessage(undefined), 'Unable to create registration.');
});

test('member-facing claim status label from { source, institution, verification: { status } }', () => {
  const claim = status => ({ source: 'declared_claim', institution: 'UL', verification: { status } });
  assert.match(studentClaimStatusLabel(claim('pending')), /awaiting verification/);
  assert.match(studentClaimStatusLabel(claim('verified')), /verified/);
  assert.match(studentClaimStatusLabel(claim('rejected')), /registration rejected/);
  assert.equal(studentClaimStatusLabel({ source: 'verified_membership', verification: { status: 'verified' } }), null);
  assert.equal(studentClaimStatusLabel(null), null);
});

test('events.helper: no Group Student option, Student option carries requiresInstitution, payload sends studentClaim', () => {
  const helper = read('helpers/events.helper.js');
  assert.doesNotMatch(helper, /id:\s*'group-student'/);
  assert.match(helper, /requiresInstitution:\s*studentOptionRequiresInstitution\(/);
  assert.match(helper, /payload\.studentClaim = claim;/);
  assert.match(helper, /studentClaimStatus:\s*studentClaimStatusLabel\(item\.studentEligibility\)/);
});

test('registration pages require the institution before payment and forward it; payment page maps codes', () => {
  for (const page of ['pages/EventRegistration.jsx', 'pages/CourseRegistration.jsx']) {
    const src = read(page);
    assert.match(src, /<StudentClaimField/, page);
    assert.match(src, /if \(studentClaimRequired && !studentClaimCheck\.ok\)/, page);
    assert.match(src, /studentClaim: studentClaimRequired \? \{ institution: studentClaimCheck\.value \} : null/, page);
  }
  const payment = read('pages/RegistrationPayment.jsx');
  assert.match(payment, /studentClaim: paymentPayload\.studentClaim/);
  assert.match(payment, /throw new Error\(registrationErrorMessage\(res\)\)/);
  assert.match(read('components/dashboard/EventDetailModal.jsx'), /event\.studentClaimStatus/);
});
