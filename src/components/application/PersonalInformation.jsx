import React, { useRef, useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';
import { countries } from '../../constants/countries';
import { Spin } from 'antd';
import { useLookup } from '../../contexts/lookupContext';
import {
  useJsApiLoader,
  StandaloneSearchBox,
} from '@react-google-maps/api';

const libraries = ['places', 'maps'];

const PersonalInformation = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { genderLookups, titleLookups } = useLookup();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o',
    libraries: libraries,
  });

  console.log('isLoaded=========>', isLoaded);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();
    console.log('places=========>', places);
    if (places && places.length > 0) {
      const place = places[0];
      const address = place.formatted_address;
      const addressParts = address.split(', ').map(part => part.trim());
      const addressLine1 = addressParts[0] || ''; 
      const addressLine2 = addressParts[1] || ''; 
      const addressLine3 = addressParts[2] || ''; 
      const addressLine4 = addressParts[3] || ''; 

      onFormDataChange({
        ...formData,
        addressLine1,
        addressLine2,
        addressLine3,
        addressLine4,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Title"
          name="title"
          required
          placeholder="Enter your title"
          onChange={handleInputChange}
          showValidation={showValidation}
          value={formData?.title || ''}
          options={titleLookups?.map(item => ({
            value: item.lookupname,
            label: item.lookupname,
          }))}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Surname"
          name="surname"
          required
          placeholder="Enter your surname"
          value={formData?.surname || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
        />
        <Input
          label="Forename"
          name="forename"
          required
          placeholder="Enter your forename"
          value={formData?.forename || ''}
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
          options={genderLookups?.map(item => ({
            value: item.lookupname,
            label: item.lookupname,
          }))}
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
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eircode
          </label>
          {isLoaded && (
            <StandaloneSearchBox
              onLoad={ref => (inputRef.current = ref)}
              onPlacesChanged={handlePlacesChanged}>
              <input
                type="text"
                placeholder="Enter Eircode (e.g., D01X4X0)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </StandaloneSearchBox>
          )}
          {/* <Input
            label="Eircode"
            name="eircode"
            value={formData?.eircode || ''}
            onChange={handleEircodeChange}
            placeholder="Enter Eircode (e.g., D01X4X0)"
            maxLength={7}
          /> */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spin size="small" />
            </div>
          )}
        </div>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            value={formData?.mobileNo || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        </div>
        <Input
          label="Home / Work Tel Number"
          name="homeWorkTelNo"
          placeholder="Enter your mobile number"
          value={formData?.homeWorkTelNo || ''}
          onChange={handleInputChange}
        />
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
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Personal Email"
          name="personalEmail"
          type="email"
          required={formData?.preferredEmail === 'personal'}
          placeholder="Enter your personal email"
          value={formData?.personalEmail || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
        />
        <Input
          label="Work Email"
          name="workEmail"
          type="email"
          required={formData?.preferredEmail === 'work'}
          placeholder="Enter your work email"
          value={formData?.workEmail || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
        />
      </div>
    </div>
  );
};

export default PersonalInformation;
