import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const CorrespondenceDetails = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Preferred address (Home, Work)"
        name="preferredAddress"
        defaultValue="home"
        options={[
          { value: 'home', label: 'Home' },
          { value: 'work', label: 'Work' }
        ]}
      />
      <Input
        label="Eircode"
        name="eircode"
      />
      <Input
        label="Address line 1 (Building or House)"
        name="addressLine1"
        required
      />
      <Input
        label="Address line 2 (Street or Road)"
        name="addressLine2"
      />
      <Input
        label="Address line 3 (Area or Town)"
        name="addressLine3"
      />
      <Input
        label="Address line 4 (County, City or Postcode)"
        name="addressLine4"
        required
      />
      <Select
        label="Country"
        name="country"
        defaultValue="ireland"
        options={[
          { value: 'ireland', label: 'Ireland' },
          // Add more countries as needed
        ]}
      />
      <Select
        label="Preferred Email (Work, Personal)"
        name="preferredEmail"
        defaultValue="work"
        options={[
          { value: 'work', label: 'Work' },
          { value: 'personal', label: 'Personal' }
        ]}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        required
      />
      <Input
        label="Mobile No"
        name="mobileNo"
        required
      />
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Consent to receive SMS Alerts"
          name="smsConsent"
        />
        <Checkbox
          label="Consent to receive Email Alerts"
          name="emailConsent"
        />
      </div>
    </div>
  );
};

export default CorrespondenceDetails; 