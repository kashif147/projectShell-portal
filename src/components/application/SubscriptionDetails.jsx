import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from 'antd';

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are you currently undertaking a nursing adaptation programme?
        </label>
        <Radio.Group
          name="nursingAdaptationProgramme"
          value={formData?.nursingAdaptationProgramme || ''}
          onChange={e =>
            onFormDataChange({
              ...formData,
              nursingAdaptationProgramme: e.target.value,
            })
          }>
          <Radio value="yes">Yes</Radio>
          <Radio value="no">No</Radio>
        </Radio.Group>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          disabled={formData?.nursingAdaptationProgramme !== 'yes'}
          label="NMBI No / An Board Altranais Number"
          name="nmbiNumber"
          value={formData?.nmbiNumber || ''}
          onChange={handleInputChange}
          placeholder="Enter your NMBI number"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please tick one of the following
          </label>
          <Radio.Group
            name="nurseType"
            disabled={formData?.nursingAdaptationProgramme !== 'yes'}
            value={formData?.nurseType || ''}
            onChange={handleNurseTypeChange}>
            {nurseTypeOptions.map(option => (
              <Radio
                key={option.value}
                value={option.value}
                className="block"
                disabled={formData?.nursingAdaptationProgramme !== 'yes'}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Please select the most appropriate option below"
          name="memberStatus"
          required
          value={formData?.memberStatus || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Select an option"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are you a member of another Irish Trade Union?{' '}
          <span className="text-red-500">*</span>
        </label>
        <Radio.Group
          name="otherIrishTradeUnion"
          value={formData?.otherIrishTradeUnion || ''}
          onChange={e =>
            onFormDataChange({
              ...formData,
              otherIrishTradeUnion: e.target.value,
            })
          }>
          <Radio value="yes">Yes</Radio>
          <Radio value="no">No</Radio>
        </Radio.Group>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are you or were you a member of another Irish trade Union salary or
          Income Protection Scheme? <span className="text-red-500">*</span>
        </label>
        <Radio.Group
          name="otherScheme"
          value={formData?.otherScheme || ''}
          onChange={e =>
            onFormDataChange({ ...formData, otherScheme: e.target.value })
          }>
          <Radio value="yes">Yes</Radio>
          <Radio value="no">No</Radio>
        </Radio.Group>
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
          ]}
        />
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
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Checkbox
          label={
            <span className="font-medium text-gray-700">
              INMO Income Protection Scheme
            </span>
          }
          name="incomeProtectionScheme"
          checked={formData?.incomeProtectionScheme || false}
          onChange={handleInputChange}
        />
        <Checkbox
          label={
            <span className="font-medium text-gray-700">INMO Rewards</span>
          }
          name="inmoRewards"
          checked={formData?.inmoRewards || false}
          onChange={handleInputChange}
        />
        <Checkbox
          label={
            <span className="font-medium text-gray-700">
              Value Added Services
            </span>
          }
          name="valueAddedServices"
          checked={formData?.valueAddedServices || false}
          onChange={handleInputChange}
        />
        <Checkbox
          label={
            <span className="font-medium text-gray-700">
              Terms & Conditions
            </span>
          }
          name="termsAndConditions"
          checked={formData?.termsAndConditions || false}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default SubscriptionDetails;
