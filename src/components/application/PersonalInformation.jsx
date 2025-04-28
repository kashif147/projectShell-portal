import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';

const PersonalInformation = ({ formData, onFormDataChange }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Forename"
        name="forename"
        required
        value={formData?.forename || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Surname"
        name="surname"
        required
        value={formData?.surname || ''}
        onChange={handleInputChange}
      />
      <Select
        label="Gender"
        name="gender"
        required
        value={formData?.gender || ''}
        onChange={handleInputChange}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ]}
      />
      <DatePicker
        label="Date of Birth"
        name="dateOfBirth"
        required
        value={formData?.dateOfBirth || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Country Primary Qualification"
        name="countryPrimaryQualification"
        value={formData?.countryPrimaryQualification || ''}
        onChange={handleInputChange}
      />
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Deceased"
          name="deceased"
        />
        {/* Deceased Date will be shown conditionally */}
        <DatePicker
          label="Deceased Date"
          name="deceasedDate"
          className="mt-2"
        />
      </div>
      <Select
        label="Marital Status"
        name="maritalStatus"
        value={formData?.maritalStatus || ''}
        onChange={handleInputChange}
        options={[
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' }
        ]}
      />
      <Input
        label="Partner Details"
        name="partnerDetails"
        value={formData?.partnerDetails || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Children Details"
        name="childrenDetails"
        value={formData?.childrenDetails || ''}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default PersonalInformation; 