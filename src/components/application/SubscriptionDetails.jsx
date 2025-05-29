import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';

const nurseTypeOptions = [
  { value: 'general', label: 'General Nurse' },
  { value: 'publicHealth', label: 'Public Health Nurse' },
  { value: 'mentalHealth', label: 'Mental health nurse' },
  { value: 'midwife', label: 'Midwife' },
  { value: 'sickChildren', label: "Sick Children's Nurse" },
  {
    value: 'intellectualDisability',
    label: 'Registered Nurse for Intellectual Disability',
  },
];

const SubscriptionDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNurseTypeChange = e => {
    onFormDataChange({
      ...formData,
      nurseType: e.target.value,
    });
  };

  console.log('formData', formData.nursingAdaptationProgramme);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Payment Type"
          name="paymentType"
          required
          value={formData?.paymentType || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Select payment type"
          options={[
            { value: 'deduction', label: 'Deduction at Source' },
            { value: 'creditCard', label: 'Credit Card' },
          ]}
        />
        <Input
          label="Payroll No"
          name="payrollNo"
          required={formData?.paymentType === 'deduction'}
          disabled={formData?.paymentType !== 'deduction'}
          value={formData?.payrollNo || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your payroll number"
        />
      </div>
      <Radio
        label="Are you currently undertaking a nursing adaptation programme?"
        name="nursingAdaptationProgramme"
        value={formData?.nursingAdaptationProgramme || 'no'}
        onChange={e =>
          onFormDataChange({
            ...formData,
            nursingAdaptationProgramme: e.target.value,
          })
        }
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          disabled={formData?.nursingAdaptationProgramme !== 'yes'}
          required={formData?.nursingAdaptationProgramme === 'yes'}
          label="NMBI No / An Board Altranais Number"
          name="nmbiNumber"
          value={formData?.nmbiNumber || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your NMBI number"
        />
      </div>
      <Radio
        label="Please tick one of the following"
        name="nurseType"
        required={formData?.nursingAdaptationProgramme === 'yes'}
        disabled={formData?.nursingAdaptationProgramme !== 'yes'}
        value={formData?.nurseType || ''}
        onChange={handleNurseTypeChange}
        showValidation={showValidation}
        options={nurseTypeOptions}
      />
      <div>
        <Radio
          label="Please select the most appropriate option below"
          name="memberStatus"
          value={formData?.memberStatus || ''}
          onChange={e =>
            onFormDataChange({
              ...formData,
              memberStatus: e.target.value,
            })
          }
          options={[
            { value: 'new', label: 'You are a new member' },
            { value: 'graduate', label: 'You are newly graduated' },
            {
              value: 'rejoin',
              label:
                'You were previously a member of the INMO, and are rejoining',
            },
            {
              value: 'careerBreak',
              label: 'You are returning from a career break',
            },
            {
              value: 'nursingAbroad',
              label: 'You are returning from nursing abroad',
            },
          ]}
        />
      </div>
      <div>
        <Radio
          label="if you are a member of another Trade Union. If yes, which Union?"
          name="otherIrishTradeUnion"
          required
          value={formData?.otherIrishTradeUnion || ''}
          onChange={e =>
            onFormDataChange({
              ...formData,
              otherIrishTradeUnion: e.target.value,
            })
          }
          showValidation={showValidation}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />
      </div>
      <div>
        <Radio
          label="Are you or were you a member of another Irish trade Union salary or Income Protection Scheme?"
          name="otherScheme"
          required
          value={formData?.otherScheme || ''}
          onChange={e =>
            onFormDataChange({
              ...formData,
              otherScheme: e.target.value,
            })
          }
          showValidation={showValidation}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Recurited By"
          name="recuritedBy"
          value={formData?.recuritedBy || ''}
          onChange={handleInputChange}
          placeholder="Enter the name of the person who recruited you"
        />
        <Input
          label="Recurited By (Membership No)"
          name="recuritedByMembershipNo"
          value={formData?.recuritedByMembershipNo || ''}
          onChange={handleInputChange}
          placeholder="Enter the membership number of the recruiter"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Primary Section"
          name="primarySection"
          value={formData?.primarySection || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Select primary section"
          options={[
            { value: 'section1', label: 'Section 1' },
            { value: 'section2', label: 'Section 2' },
            { value: 'section3', label: 'Section 3' },
            { value: 'section4', label: 'Section 4' },
            { value: 'section5', label: 'Section 5' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Other Primary Section"
          name="otherPrimarySection"
          required={formData?.primarySection === 'other'}
          disabled={formData?.primarySection !== 'other'}
          value={formData?.otherPrimarySection || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your other primary section"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Secondary Section"
          name="secondarySection"
          value={formData?.secondarySection || ''}
          onChange={handleInputChange}
          placeholder="Select secondary section"
          options={[
            { value: 'section1', label: 'Section 1' },
            { value: 'section2', label: 'Section 2' },
            { value: 'section3', label: 'Section 3' },
            { value: 'section4', label: 'Section 4' },
            { value: 'section5', label: 'Section 5' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Other Secondary Section"
          name="otherSecondarySection"
          required={formData?.secondarySection === 'other'}
          disabled={formData?.secondarySection !== 'other'}
          value={formData?.otherSecondarySection || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your other secondary section"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start">
          <div className="mt-1">
            <Checkbox
              label={
                <span className="font-medium text-gray-700 text-sm leading-tight block pl-2">
                  Tick here to join INMO Income Protection Scheme
                </span>
              }
              name="incomeProtectionScheme"
              checked={formData?.incomeProtectionScheme || false}
              onChange={handleInputChange}
              disabled={
                formData?.memberStatus !== 'new' &&
                formData?.memberStatus !== 'graduate'
              }
              required={
                formData?.memberStatus === 'new' ||
                formData?.memberStatus === 'graduate'
              }
            />
          </div>
        </div>
        <div className="flex items-start">
          <div className="mt-1">
            <Checkbox
              label={
                <span className="font-medium text-gray-700 text-sm leading-tight block pl-2">
                  Tick here to join Rewards for INMO members
                </span>
              }
              name="inmoRewards"
              checked={formData?.inmoRewards || false}
              onChange={handleInputChange}
              disabled={
                formData?.memberStatus !== 'new' &&
                formData?.memberStatus !== 'graduate'
              }
              required={
                formData?.memberStatus === 'new' ||
                formData?.memberStatus === 'graduate'
              }
            />
          </div>
        </div>
        <div className="flex items-start">
          <div className="mt-1">
            <Checkbox
              label={
                <span className="font-medium text-gray-700 text-sm leading-tight block pl-2">
                  Tick here to allow our partners to contact you about Value
                  added Services by Email and SMS
                </span>
              }
              name="valueAddedServices"
              checked={formData?.valueAddedServices || false}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex items-start">
          <div className="mt-1">
            <Checkbox
              label={
                <span className="font-medium text-gray-700 text-sm leading-tight block pl-2">
                  I have read and agree to the INMO{' '}
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800">
                    Data Protection Statement
                  </a>
                  , the INMO{' '}
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800">
                    Privacy Statement
                  </a>{' '}
                  and the INMO{' '}
                  <a
                    href="#"
                    className="text-blue-600 underline hover:text-blue-800">
                    Conditions of Membership
                  </a>
                  {!formData?.termsAndConditions && (
                    <span className="ml-1 text-xs text-red-600">
                      (Required)
                    </span>
                  )}
                </span>
              }
              name="termsAndConditions"
              checked={formData?.termsAndConditions || false}
              onChange={handleInputChange}
              required
              showValidation={showValidation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
