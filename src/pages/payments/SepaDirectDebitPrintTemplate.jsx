import React from 'react';
import dayjs from 'dayjs';
import logo from '../../assets/images/logo.png';

const formatDate = value => {
  if (!value) return ' ';
  return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : value;
};

/** Value sits above the underline (avoids text striking through the line in PDF capture). */
const FieldLine = ({ value, mono = false }) => (
  <div className="min-h-[24px] w-full">
    <div
      className={`pb-[5px] leading-[1.35] break-words ${mono ? 'font-mono text-[11px]' : ''}`}>
      {value || '\u00A0'}
    </div>
    <div className="border-b border-black" style={{ height: 0 }} />
  </div>
);

const LabelFieldRow = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-[140px_1fr] gap-x-2 items-start">
    <span className="pt-1 text-[10px] font-semibold leading-snug">{label}</span>
    <FieldLine value={value} mono={mono} />
  </div>
);

const PrintCheckbox = ({ checked, label }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      marginRight: '18px',
      verticalAlign: 'middle',
    }}>
    <span
      style={{
        display: 'inline-flex',
        width: '12px',
        height: '12px',
        boxSizing: 'border-box',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #000',
        backgroundColor: '#fff',
      }}
      aria-hidden="true">
      {checked ? (
        <svg
          viewBox="0 0 12 12"
          width="10"
          height="10"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' }}>
          <path d="M2.5 6.5 L5 9 L9.5 3.5" />
        </svg>
      ) : null}
    </span>
    <span style={{ fontSize: '11px', lineHeight: '12px' }}>{label}</span>
  </span>
);

const SepaDirectDebitPrintTemplate = ({
  formState,
  organizationDetails,
  uniqueMandateReference,
  totalAmount,
  currencySymbol,
}) => {
  const orgName = organizationDetails.name;

  const orgFields = [
    ["Creditor's Name", organizationDetails.name],
    ["Creditor's Identifier", organizationDetails.identifier],
    ["Creditor's Address", organizationDetails.address],
    ['City', organizationDetails.city],
    ['Post Code', organizationDetails.postCode],
    ['Country', organizationDetails.country],
  ];

  const memberFields = [
    ['Debtor\'s Name*', formState.memberName],
    ['Debtor\'s Address', formState.memberAddress],
    ['City', formState.memberCity],
    ['Post Code', formState.memberPostCode],
    ['Country', formState.memberCountry],
    ['Debtor\'s account number – IBAN*', formState.iban],
    ['Debtor\'s bank identifier code – BIC', formState.bic],
  ];

  return (
    <div className="w-[210mm] bg-white text-black text-[11px] leading-[1.35]">
      <div className="min-h-[297mm] px-[15mm] pt-[12mm] pb-[15mm]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-[18px] font-bold leading-tight max-w-[65%]">
            SEPA Direct Debit Mandate
          </h2>
          <div className="text-right">
            <img
              src={logo}
              alt={orgName}
              className="ml-auto mb-1 h-12 w-auto max-w-[200px] object-contain"
            />
            <p className="text-[10px] font-semibold">{orgName}</p>
          </div>
        </div>

        <div className="mb-3">
          <LabelFieldRow
            label="Unique Mandate Reference"
            value={uniqueMandateReference}
            mono
          />
          <p className="text-[9px] mt-1 italic pl-[148px]">
            Unique Mandate Reference (UMR) – to be completed by {orgName}
          </p>
        </div>

        <p className="mb-1">
          By signing this mandate form, you authorise (A) {orgName} to send
          instructions to your bank to debit your account and (B) your bank to
          debit your account in accordance with the instructions from {orgName}.
        </p>
        <p className="mb-1">
          As part of your rights, you are entitled to a refund from your bank
          under the terms and conditions of your agreement with your bank. A
          refund must be claimed within 8 weeks starting from the date on which
          your account was debited. Your rights are explained in a statement
          that you can obtain from your bank.
        </p>
        <p className="mb-2 font-semibold">Please complete all the fields marked *</p>

        <div className="pb-2 mb-2">
          <h3 className="font-bold text-[12px] mb-1">Organization Information</h3>
          <div className="grid grid-cols-[140px_1fr] gap-y-2.5 gap-x-2 items-start">
            {orgFields.map(([label, val]) => (
              <React.Fragment key={label}>
                <span className="pt-1 leading-snug">{label}</span>
                <FieldLine value={val} />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <div className="grid grid-cols-[140px_1fr] gap-x-2 items-start">
            <span className="pt-1.5 text-[10px] font-semibold leading-snug">
              Type of payment*
            </span>
            <div className="min-h-[24px] w-full pb-[5px] border-b border-black">
              <div
                className="flex flex-wrap items-center"
                style={{ minHeight: '14px', gap: '4px 18px' }}>
                <PrintCheckbox
                  checked={formState.paymentType === 'recurrent'}
                  label="Recurrent payment"
                />
                <PrintCheckbox
                  checked={formState.paymentType === 'one-off'}
                  label="One-off payment"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pb-2 mb-2">
          <h3 className="font-bold text-[12px] mb-2">Member Information</h3>
          <div className="grid grid-cols-[140px_1fr] gap-y-2.5 gap-x-2 items-start">
            {memberFields.map(([label, val]) => (
              <React.Fragment key={label}>
                <span className="pt-1 leading-snug">{label}</span>
                <FieldLine value={val} />
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-gray-200 border border-gray-400 p-3 mb-2">
          <p className="font-semibold mb-2">Signature &amp; Date*</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] mb-1">Signature</p>
              {formState.signature ? (
                <img
                  src={formState.signature}
                  alt="Member signature"
                  className="max-h-[60px] bg-white border border-gray-400"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="min-h-[44px]">
                  <div className="h-[40px]" />
                  <div className="border-b border-black" />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] mb-1">Second signature (if joint)</p>
              {formState.secondSignature ? (
                <img
                  src={formState.secondSignature}
                  alt="Second signature"
                  className="max-h-[60px] bg-white border border-gray-400"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="min-h-[44px]">
                  <div className="h-[40px]" />
                  <div className="border-b border-black" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 max-w-[200px]">
            <p className="text-[10px] mb-0.5">Date:</p>
            <FieldLine value={formatDate(formState.signatureDate)} />
          </div>
        </div>

        <p className="text-[9px] mb-1">
          Address of Member † (Mandatory when collecting from a non EEA SEPA
          country or territory)
        </p>
        <p className="text-[9px] mb-1">
          Where the account being debited is a joint account and more than 1
          person is needed to withdraw funds, then all parties must sign this
          form
        </p>
        <p className="text-center font-semibold mt-4 text-[11px]">
          Please return this mandate to the Organization
        </p>
      </div>
    </div>
  );
};

export default SepaDirectDebitPrintTemplate;
