import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const CorrespondenceDetails = ({ formData, onFormDataChange }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Preferred address"
        name="preferredAddress"
        defaultValue="home"
        value={formData?.preferredAddress || ''}
        onChange={handleInputChange}
        options={[
          { value: 'home', label: 'Home' },
          { value: 'work', label: 'Work' }
        ]}
      />
      <Input
        label="Eircode"
        name="eircode"
        value={formData?.eircode || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Address line 1 (Building or House)"
        name="addressLine1"
        required
        value={formData?.addressLine1 || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Address line 2 (Street or Road)"
        name="addressLine2"
        value={formData?.addressLine2 || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Address line 3 (Area or Town)"
        name="addressLine3"
        value={formData?.addressLine3 || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Address line 4 (County, City or Postcode)"
        name="addressLine4"
        required
        value={formData?.addressLine4 || ''}
        onChange={handleInputChange}
      />
      <Select
        label="Country"
        name="country"
        defaultValue="ireland"
        value={formData?.country || ''}
        onChange={handleInputChange}
        options={[
          { value: 'ireland', label: 'Ireland' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'usa', label: 'United States' },
          { value: 'canada', label: 'Canada' },
          { value: 'australia', label: 'Australia' },
          { value: 'newzealand', label: 'New Zealand' }
        ]}
      />
      <Select
        label="Preferred Email"
        name="preferredEmail"
        defaultValue="work"
        value={formData?.preferredEmail || ''}
        onChange={handleInputChange}
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
        value={formData?.email || ''}
        onChange={handleInputChange}
      />
      <Input
        label="Mobile No"
        name="mobileNo"
        required
        value={formData?.mobileNo || ''}
        onChange={handleInputChange}
      />
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Consent to receive SMS Alerts"
          name="smsConsent"
          checked={formData?.smsConsent || false}
          onChange={handleInputChange}
        />
        <Checkbox
          label="Consent to receive Email Alerts"
          name="emailConsent"
          checked={formData?.emailConsent || false}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default CorrespondenceDetails; 