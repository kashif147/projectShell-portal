import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';

const PersonalInformation = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Forename"
        name="forename"
        required
      />
      <Select
        label="Gender"
        name="gender"
        required
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
      />
      <Input
        label="Country Primary Qualification"
        name="countryPrimaryQualification"
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
      <Input
        label="Marital Status"
        name="maritalStatus"
      />
      <Input
        label="Partner Details"
        name="partnerDetails"
      />
      <Input
        label="Children Details"
        name="childrenDetails"
      />
    </div>
  );
};

export default PersonalInformation; 