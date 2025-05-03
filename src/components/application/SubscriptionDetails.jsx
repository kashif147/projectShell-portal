import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Radio } from 'antd';

const nurseTypeOptions = [
  { value: 'general', label: 'General Nurse' },
  { value: 'publicHealth', label: 'Public Health Nurse' },
  { value: 'mentalHealth', label: 'Mental health nurse' },
  { value: 'midwife', label: 'Midwife' },
  { value: 'sickChildren', label: "Sick Children's Nurse" },
  { value: 'intellectualDisability', label: 'Registered Nurse for Intellectual Disability' },
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Membership Category
            </label>
            <div className="group relative">
              <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="relative">
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  Please select the membership category most appropriate to
                  yourselves. Some category selections will require you to
                  contact our Membership team.
                </div>
              </div>
            </div>
          </div>
          <Select
            name="membershipCategory"
            required
            value={formData?.membershipCategory || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Select membership category"
            options={[
              { value: 'regular', label: 'Regular Membership' },
              { value: 'premium', label: 'Premium Membership' },
              { value: 'student', label: 'Student Membership' },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
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
          {formData?.paymentType === 'deduction' && (
            <Input
              label="Payroll No"
              name="payrollNo"
              required
              value={formData?.payrollNo || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Enter your payroll number"
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
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
            value={formData?.nurseType || ''}
            onChange={handleNurseTypeChange}
          >
            {nurseTypeOptions.map(option => (
              <Radio key={option.value} value={option.value} className="block">
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
            { value: 'rejoin', label: 'You were previously a member of the INMO, and are rejoining' },
            { value: 'careerBreak', label: 'You are returning from a career break' },
            { value: 'nursingAbroad', label: 'You are returning from nursing abroad' },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you a member of another Irish Trade Union? <span className="text-red-500">*</span>
          </label>
          <Radio.Group
            name="otherIrishTradeUnion"
            value={formData?.otherIrishTradeUnion || ''}
            onChange={e => onFormDataChange({ ...formData, otherIrishTradeUnion: e.target.value })}
          >
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Radio.Group>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you or were you a member of another Irish trade Union salary or Income Protection Scheme? <span className="text-red-500">*</span>
          </label>
          <Radio.Group
            name="otherScheme"
            value={formData?.otherScheme || ''}
            onChange={e => onFormDataChange({ ...formData, otherScheme: e.target.value })}
          >
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </Radio.Group>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
