import React from 'react';
import dayjs from 'dayjs';

const SalaryDeductionPrintTemplate = ({ formState, monthlyDeductionAmount }) => {
  const formatDate = value => {
    if (!value) return ' ';
    return dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : value;
  };

  return (
    <div className="w-[210mm] bg-white text-black">
      <div className="min-h-[297mm] px-[20mm] pt-[22mm] pb-[18mm]">
        <h2 className="text-center text-[24px] leading-tight font-semibold mt-1">
          Authorisation to Deduct
        </h2>
        <h3 className="text-center text-[24px] leading-tight font-semibold mb-7">
          INMO Membership Fee From Pay
        </h3>

        <div className="space-y-4 text-[14px] leading-[1.28]">
          <div>
            <div className="flex items-end gap-1.5">
              <span className="font-semibold whitespace-nowrap">NAME:</span>
              <span className="flex-1 border-b border-black min-h-[18px]">
                {formState.name || ' '}
              </span>
            </div>
            <div className="text-center text-[11px] mt-0.5">(Block Capitals Please)</div>
          </div>

          <div className="flex items-end gap-1.5">
            <span className="font-semibold whitespace-nowrap">EMPLOYED AT:</span>
            <span className="flex-1 border-b border-black min-h-[18px]">
              {formState.employedAt || ' '}
            </span>
          </div>

          <p className="text-[11px] leading-[1.28] pt-1">
            Authorise the deduction from my pay, until further notice, the sum of
            EUR {monthlyDeductionAmount} per month in respect of the Irish Nurses
            and Midwives Organisation (INMO) financial year January - December, to be
            deducted on each pay day and paid to the Organisation on my behalf. I
            also agree that if the subscription be varied, the deduction shall be
            varied accordingly. If there is an inadvertent shortfall in the amount
            deducted at source in respect of an annual fee, I agree to pay the
            balance directly to the Organisation.
          </p>

          <div className="grid grid-cols-[135px_1fr] gap-y-3.5 items-end pt-2">
            <span className="whitespace-nowrap">MEMBERSHIP NO:</span>
            <span className="border-b border-black min-h-[18px]">{formState.inmoNo || ' '}</span>

            <div className="leading-tight">
              <div>PAYROLL /STAFF NO:</div>
              <div className="text-[11px]">(available on pay slip)</div>
            </div>
            <span className="border-b border-black min-h-[18px]">
              {formState.payrollStaffNo || ' '}
            </span>

            <span className="whitespace-nowrap">COMMENCING:</span>
            <span className="border-b border-black min-h-[18px]">
              {formatDate(formState.commencing)}
            </span>

            <span className="whitespace-nowrap">SIGNATURE:</span>
            <span className="border-b border-black min-h-[18px]">
              {formState.signature ? 'Signed' : ' '}
            </span>

            <span className="whitespace-nowrap">DATE:</span>
            <span className="border-b border-black min-h-[18px]">{formatDate(formState.date)}</span>
          </div>

          <div className="pt-5">
            <p className="text-[11px] font-semibold leading-tight">
              IMPORTANT: When completed and signed, the member should upload or return
              this form directly to the:
            </p>
            <div className="mt-3 pl-[135px] text-[11px] leading-tight font-semibold">
              <p>Irish Nurses & MidwivesOrganisation</p>
              <p>The Whitworth Building</p>
              <p>North Brunswick Street</p>
              <p>Dublin 7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryDeductionPrintTemplate;
