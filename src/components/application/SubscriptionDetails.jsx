import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { InfoCircleOutlined } from '@ant-design/icons';


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
                  Please select the membership category most appropriate to yourselves. Some category selections will require you to contact our Membership team.
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
      </div>
      {formData?.paymentType === 'deduction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Payroll No"
            name="payrollNo"
            required
            value={formData?.payrollNo || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Enter your payroll number"
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
