import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';
import { Card } from '../ui/Card';
import { useSelector } from 'react-redux';
import { countries } from '../../constants/countries';

const PersonalInformation = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const { user } = useSelector(state => state.auth);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Surname"
          name="surname"
          required
          placeholder="Enter your surname"
          value={formData?.surname || user?.userLastName || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
        />
        <Input
          label="Forename"
          name="forename"
          required
          placeholder="Enter your forename"
          value={formData?.forename || user?.userFirstName || ''}
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
            { value: 'other', label: 'Other' },
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
        <Select
          label="Country of Primary Qualification"
          name="countryPrimaryQualification"
          value={formData?.countryPrimaryQualification || ''}
          onChange={handleInputChange}
          options={countries}
          isSearchable
          placeholder="Select country of primary qualification"
        />
      </div>
      <h3 className="text-lg font-semibold mb-4">Correspondence Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Eircode"
          name="eircode"
          value={formData?.eircode || ''}
          onChange={handleInputChange}
        />
        <Select
          label="Preferred address"
          name="preferredAddress"
          required
          showValidation={showValidation}
          value={formData?.preferredAddress}
          onChange={handleInputChange}
          options={[
            { value: 'home', label: 'Home' },
            { value: 'work', label: 'Work' },
          ]}
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
          value={formData?.country || 'IE'}
          onChange={handleInputChange}
          options={countries}
          isSearchable
          placeholder="Search for a country..."
        />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Mobile No
            </label>
            <Checkbox
              label={
                <span className="font-medium text-sm">
                  Consent to receive SMS Alerts
                </span>
              }
              name="smsConsent"
              checked={formData?.smsConsent}
              onChange={handleInputChange}
            />
          </div>
          <Input
            name="mobileNo"
            required
            placeholder="Enter your mobile number"
            value={formData?.mobileNo || user?.userMobilePhone || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Email
            </label>
            <Checkbox
              label={
                <span className="font-medium text-sm">
                  Consent to receive Email Alerts
                </span>
              }
              name="emailConsent"
              checked={formData?.emailConsent}
              onChange={handleInputChange}
            />
          </div>
          <Select
            name="preferredEmail"
            required
            showValidation={showValidation}
            value={formData?.preferredEmail}
            onChange={handleInputChange}
            options={[
              { value: 'work', label: 'Work' },
              { value: 'personal', label: 'Personal' },
            ]}
          />
          <div className="mt-2">
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
          </div>
        </div>
        {formData?.preferredEmail === 'work' && (
          <Input
            label="Work Email"
            name="workEmail"
            type="email"
            required
            placeholder="Enter your work email"
            value={formData?.workEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        )}
        {formData?.preferredEmail === 'personal' && (
          <Input
            label="Personal Email"
            name="personalEmail"
            type="email"
            required
            placeholder="Enter your personal email"
            value={formData?.personalEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        )}
      </div>
    </div>
  );
};

export default PersonalInformation;
