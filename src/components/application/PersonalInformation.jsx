import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';
import { Card } from '../ui/Card';
import { useSelector } from 'react-redux';

const PersonalInformation = ({ formData, onFormDataChange, showValidation = false }) => {
  const { user } = useSelector(state => state.auth);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Forename"
            name="forename"
            required
            placeholder="Enter your forename"
            value={formData?.forename || user?.userFirstName || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Surname"
            name="surname"
            required
            placeholder="Enter your surname"
            value={formData?.surname || user?.userLastName || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Select
            label="Gender"
            name="gender"
            required
            value={formData?.gender || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
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
            max={new Date().toISOString().split('T')[0]}
            showValidation={showValidation}
          />
          <Input
            label="Country Primary Qualification"
            name="countryPrimaryQualification"
            value={formData?.countryPrimaryQualification || ''}
            onChange={handleInputChange}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Correspondence Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Preferred address"
            name="preferredAddress"
            value={formData?.preferredAddress || 'home'}
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
            showValidation={showValidation}
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
            showValidation={showValidation}
          />
          <Select
            label="Country"
            name="country"
            value={formData?.country || 'ireland'}
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
            value={formData?.preferredEmail || 'work'}
            onChange={handleInputChange}
            options={[
              { value: 'work', label: 'Work' },
              { value: 'personal', label: 'Personal' }
            ]}
          />
          <Checkbox
            label={<span className="font-medium">Consent to receive SMS Alerts</span>}
            name="smsConsent"
            checked={formData?.smsConsent || false}
            onChange={handleInputChange}
          />
          <Checkbox
            label={<span className="font-medium">Consent to receive Email Alerts</span>}
            name="emailConsent"
            checked={formData?.emailConsent || false}
            onChange={handleInputChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            value={formData?.email || user?.userEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Mobile No"
            name="mobileNo"
            required
            placeholder="Enter your mobile number"
            value={formData?.mobileNo || user?.userMobilePhone || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        </div>
      </Card>
    </div>
  );
};

export default PersonalInformation; 