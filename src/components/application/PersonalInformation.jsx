import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DatePicker } from '../ui/DatePicker';
import { useSelector } from 'react-redux';
import { countries } from '../../constants/countries';
import { Spin } from 'antd';
import { useLookup } from '../../contexts/lookupContext';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

// Dummy Eircode data for demonstration
const eircodeData = {
  D01X4X0: {
    addressLine1: "1 O'Connell Street",
    addressLine2: 'North City',
    addressLine3: 'Dublin 1',
    addressLine4: 'Dublin',
  },
  D02X4X0: {
    addressLine1: '2 Grafton Street',
    addressLine2: 'South City',
    addressLine3: 'Dublin 2',
    addressLine4: 'Dublin',
  },
  D03X4X0: {
    addressLine1: '3 Parnell Street',
    addressLine2: 'North Inner City',
    addressLine3: 'Dublin 3',
    addressLine4: 'Dublin',
  },
  D04X4X0: {
    addressLine1: '4 Ballsbridge',
    addressLine2: 'South Dublin',
    addressLine3: 'Dublin 4',
    addressLine4: 'Dublin',
  },
  D05X4X0: {
    addressLine1: '5 Coolock',
    addressLine2: 'North Dublin',
    addressLine3: 'Dublin 5',
    addressLine4: 'Dublin',
  },
};

const libraries = ['places'];

const PersonalInformation = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const { genderLookups } = useLookup();
  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleEircodeChange = async e => {
    const eircode = e.target.value.toUpperCase();
    handleInputChange(e);

    if (eircode.length === 7 && autocomplete) {
      setLoading(true);
      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({
          address: eircode,
          componentRestrictions: {
            country: 'IE'
          }
        });

        if (result.results[0]) {
          const addressComponents = result.results[0].address_components;
          const formattedAddress = result.results[0].formatted_address.split(',');
          
          // Extract address components
          const streetNumber = addressComponents.find(component => 
            component.types.includes('street_number'))?.long_name || '';
          const route = addressComponents.find(component => 
            component.types.includes('route'))?.long_name || '';
          const locality = addressComponents.find(component => 
            component.types.includes('locality'))?.long_name || '';
          const administrativeArea = addressComponents.find(component => 
            component.types.includes('administrative_area_level_1'))?.long_name || '';

          onFormDataChange({
            ...formData,
            eircode,
            addressLine1: streetNumber ? `${streetNumber} ${route}` : route,
            addressLine2: locality,
            addressLine3: administrativeArea,
            addressLine4: formattedAddress[formattedAddress.length - 1].trim(),
          });
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const addressComponents = place.address_components;
        const formattedAddress = place.formatted_address.split(',');
        
        // Extract address components
        const streetNumber = addressComponents.find(component => 
          component.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(component => 
          component.types.includes('route'))?.long_name || '';
        const locality = addressComponents.find(component => 
          component.types.includes('locality'))?.long_name || '';
        const administrativeArea = addressComponents.find(component => 
          component.types.includes('administrative_area_level_1'))?.long_name || '';

        onFormDataChange({
          ...formData,
          eircode: place.formatted_address.match(/[A-Z0-9]{3}\s[A-Z0-9]{4}/)?.[0] || '',
          addressLine1: streetNumber ? `${streetNumber} ${route}` : route,
          addressLine2: locality,
          addressLine3: administrativeArea,
          addressLine4: formattedAddress[formattedAddress.length - 1].trim(),
        });
      }
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
          options={[
            { value: 'Mr', label: 'Mr' },
            { value: 'Mrs', label: 'Mrs' },
            { value: 'Ms', label: 'Ms' },
            { value: 'Miss', label: 'Miss' },
          ]}
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
          {isLoaded ? (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              restrictions={{ country: 'ie' }}
            >
              <Input
                label="Eircode"
                name="eircode"
                value={formData?.eircode || ''}
                onChange={handleEircodeChange}
                placeholder="Enter Eircode or address"
                maxLength={7}
              />
            </Autocomplete>
          ) : (
            <Input
              label="Eircode"
              name="eircode"
              value={formData?.eircode || ''}
              onChange={handleEircodeChange}
              placeholder="Enter Eircode (e.g., D01X4X0)"
              maxLength={7}
            />
          )}
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
