import React from 'react';
import {
  STUDENT_INSTITUTION_MAX,
  STUDENT_PROVISIONAL_COPY,
} from '../../helpers/studentClaim';

// P5 STUDENT policy: shown when a Student ticket is selected by someone who is not a verified
// undergraduate-student member. The organiser verifies the declared institution before the
// registration is approved and the card is captured.
const StudentClaimField = ({ value, onChange, error, showError }) => (
  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
    <label
      htmlFor="student-claim-institution"
      className="block text-sm font-semibold text-slate-900">
      College or university <span className="text-red-600">*</span>
    </label>
    <p className="mt-1 text-xs text-slate-600">{STUDENT_PROVISIONAL_COPY}</p>
    <input
      id="student-claim-institution"
      type="text"
      value={value}
      maxLength={STUDENT_INSTITUTION_MAX}
      onChange={e => onChange?.(e.target.value)}
      aria-invalid={showError && Boolean(error)}
      aria-describedby={showError && error ? 'student-claim-institution-error' : undefined}
      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
    />
    {showError && error ? (
      <p id="student-claim-institution-error" className="mt-1 text-xs text-red-600">
        {error}
      </p>
    ) : null}
  </div>
);

export default StudentClaimField;
