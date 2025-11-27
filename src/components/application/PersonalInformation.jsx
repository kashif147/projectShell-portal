import React, { useRef } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { DatePicker } from '../ui/DatePicker';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../assets/theme/phoneInput.css';
// Dynamic countries from lookup context will replace static constants
import { useLookup } from '../../contexts/lookupContext';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';

const libraries = ['places', 'maps'];

const PersonalInformation = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchValue, setSearchValue] = React.useState('');
  const { genderLookups, titleLookups, countryLookups, fetchCountryLookups } =
    useLookup();

  React.useEffect(() => {
    if (!countryLookups || countryLookups.length === 0) {
      fetchCountryLookups?.();
    }
  }, []);

  // Set default value to Ireland if countryPrimaryQualification is empty
  React.useEffect(() => {
    if (!formData?.countryPrimaryQualification && countryLookups && countryLookups.length > 0) {
      const irelandCountry = countryLookups.find(c => 
        c?.code === 'IE' || 
        c?.name === 'Ireland' || 
        c?.displayname === 'Ireland'
      );
      if (irelandCountry) {
        onFormDataChange({
          ...formData,
          countryPrimaryQualification: irelandCountry.displayname,
        });
      }
    }
  }, [countryLookups]);

  // Set default value to Ireland for address country field if empty
  React.useEffect(() => {
    if (!formData?.country && countryLookups && countryLookups.length > 0) {
      const irelandCountry = countryLookups.find(c => 
        c?.code === 'IE' || 
        c?.name === 'Ireland' || 
        c?.displayname === 'Ireland'
      );
      if (irelandCountry) {
        onFormDataChange({
          ...formData,
          country: irelandCountry.displayname,
        });
      }
    }
  }, [countryLookups]);

  const countryOptions = (countryLookups || []).map(c => ({
    value: c?.displayname,
    label: c?.displayname || c?.name || c?.code,
  }));

  const getCountryDisplayName = codeOrName => {
    if (!codeOrName || !countryLookups) return codeOrName;

    const byDisplayName = countryLookups.find(
      c => c?.displayname === codeOrName,
    );
    if (byDisplayName) return codeOrName;

    const byCode = countryLookups.find(c => c?.code === codeOrName);
    if (byCode) return byCode.displayname;

    const byName = countryLookups.find(c => c?.name === codeOrName);
    if (byName) return byName.displayname;

    return codeOrName;
  };
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

  // Handle phone number change for PhoneInput component
  const handleMobileNumberChange = value => {
    onFormDataChange({
      ...formData,
      mobileNo: value || '',
    });
  };

  // Handle numeric-only input fields
  const handleNumericInputChange = e => {
    const { name, value } = e.target;
    // Allow only numbers, spaces, hyphens, and plus signs
    const numericValue = value.replace(/[^0-9\s\-+]/g, '');
    onFormDataChange({
      ...formData,
      [name]: numericValue,
    });
  };

  // Function to clear all address fields and search input
  const handleClearAddress = () => {
    setSearchValue(''); // Clear the search input
    if (searchInputRef.current) {
      searchInputRef.current.value = ''; // Clear the actual input element
    }
    onFormDataChange({
      ...formData,
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      addressLine4: '',
      eircode: '',
      country: '',
    });
  };

  const handlePlacesChanged = () => {
    const places = inputRef.current.getPlaces();

    if (places && places.length > 0) {
      const place = places[0];
      const placeId = place.place_id;

      // Update search value with the formatted address
      if (place.formatted_address) {
        setSearchValue(place.formatted_address);
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div'),
      );

      const request = {
        placeId: placeId,
        fields: ['address_components', 'name', 'formatted_address'],
      };

      service.getDetails(request, (details, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          details
        ) {
          const components = details.address_components;
          console.log('components=========>', components);

          const getComponent = type =>
            components.find(c => c.types.includes(type))?.long_name || '';

          const getComponentShortName = type =>
            components.find(c => c.types.includes(type))?.short_name || '';

          const streetNumber = getComponent('street_number');
          const route = getComponent('route');
          const neighborhood = getComponent('neighborhood') || '';
          const sublocality = getComponent('sublocality') || '';
          const town =
            getComponent('locality') || getComponent('postal_town') || '';
          const county = getComponent('administrative_area_level_1') || '';
          const postalCode = getComponent('postal_code');
          const countryLongName = getComponent('country');
          const countryShortName = getComponentShortName('country');

          const addressLine1 = `${streetNumber} ${route}`.trim();
          const addressLine2 = neighborhood || sublocality; // Use neighborhood first, fallback to sublocality
          const addressLine3 = town;
          const addressLine4 = `${county}`.trim();
          const eircode = `${postalCode}`.trim();

          // Find the country displayname from countryLookups based on the country name or code
          let countryDisplayName = formData?.country || 'Ireland'; // Default to Ireland if not found
          if (countryLongName || countryShortName) {
            console.log(
              'Country from API - Long Name:',
              countryLongName,
              'Short Name:',
              countryShortName,
            );
            const matchedCountry = countryLookups?.find(
              c =>
                c?.code === countryLongName ||
                c?.code === countryShortName ||
                c?.name === countryLongName ||
                c?.displayname === countryLongName,
            );
            if (matchedCountry) {
              countryDisplayName = matchedCountry.displayname;
              console.log('Matched country:', matchedCountry);
            } else {
              console.log('No matching country found in lookup');
            }
          }

          onFormDataChange({
            ...formData,
            addressLine1,
            addressLine2,
            addressLine3,
            addressLine4,
            eircode,
            country: countryDisplayName,
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Please provide your details as they appear on your official
              documents.
            </p>
          </div>
        </div>

        {/* First row: Title, Forename(s), Surname */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Title"
            name="title"
            required
            placeholder="Select..."
            onChange={handleInputChange}
            showValidation={showValidation}
            value={formData?.title || ''}
            options={titleLookups?.map(item => ({
              value: item.lookupname,
              label: item.lookupname,
            }))}
          />
          <Input
            label="Forename(s)"
            name="forename"
            required
            placeholder="Enter your forename(s)"
            value={formData?.forename || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Surname"
            name="surname"
            required
            placeholder="Enter your surname"
            value={formData?.surname || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        </div>

        {/* Second row: Gender, Date of Birth, Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Gender"
            name="gender"
            required
            placeholder="Select gender"
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
            placeholder="mm/dd/yyyy"
            value={formData?.dateOfBirth || ''}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            showValidation={showValidation}
          />
          <Select
            label="Country of Primary Qualification"
            name="countryPrimaryQualification"
            placeholder="Select country"
            value={getCountryDisplayName(formData?.countryPrimaryQualification) || 'Ireland'}
            onChange={handleInputChange}
            options={countryOptions}
            isSearchable
            required
            showValidation={showValidation}
          />
        </div>
      </div>

      {/* Correspondence Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Correspondence Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Let us know the best way to send you mail.
            </p>
          </div>
        </div>

        {/* Consent and Preferred Address Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Consent Checkbox */}
          <div className="mb-4 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <Checkbox
              label={
                <div>
                  <span className="font-semibold text-gray-900">
                    I consent to receive Correspondence
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Please un-tick this box if you would not like to receive
                    correspondence from us to this address.
                  </p>
                </div>
              }
              name="consent"
              checked={formData?.consent}
              onChange={handleInputChange}
            />
          </div>

          {/* Preferred Address Radio */}
          <div className="mb-4 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <Radio
              label="Preferred address"
              name="preferredAddress"
              value={formData?.preferredAddress || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              options={[
                { value: 'home', label: 'Home' },
                { value: 'work', label: 'Work' },
              ]}
            />
          </div>
        </div>

        {/* Find your address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Find your address
                </span>
              </label>
            </div>

            {isLoaded && (
              <div className="relative">
                <StandaloneSearchBox
                  onLoad={ref => (inputRef.current = ref)}
                  onPlacesChanged={handlePlacesChanged}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Start typing your address or Eircode..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </StandaloneSearchBox>
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearAddress}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none z-10"
                    title="Clear address">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="mt-2 text-right">
              <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 hover:underline font-medium">
                Or enter manually
              </span>
            </div>
          </div>
        </div>

        {/* Address Fields - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Address line 1 (Building or House)"
            name="addressLine1"
            required
            placeholder="Enter building or house"
            value={formData?.addressLine1 || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Address line 2 (Street or Road)"
            name="addressLine2"
            placeholder="Enter street or road"
            value={formData?.addressLine2 || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Town/City"
            name="addressLine3"
            placeholder="Enter town/city"
            value={formData?.addressLine3 || ''}
            onChange={handleInputChange}
          />
          <Input
            label="County/State"
            name="addressLine4"
            required
            placeholder="Enter county/state"
            value={formData?.addressLine4 || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Eircode/Postcode"
            name="eircode"
            placeholder="Enter eircode/postcode"
            value={formData?.eircode || ''}
            onChange={handleInputChange}
          />
          <Select
            label="Country"
            name="country"
            placeholder="Select country"
            value={getCountryDisplayName(formData?.country) || 'Ireland'}
            onChange={handleInputChange}
            options={countryOptions}
            isSearchable
          />
        </div>
      </div>

      {/* Contact Details Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Contact Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Provide your phone numbers and email addresses.
            </p>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mobile Number with Country Code */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
              {showValidation && !formData?.mobileNo && (
                <span className="ml-1 text-xs text-red-500">(Required)</span>
              )}
            </label>
            <PhoneInput
              defaultCountry="IE"
              value={formData?.mobileNo || ''}
              onChange={handleMobileNumberChange}
              className={`phone-input-custom ${
                showValidation && !formData?.mobileNo
                  ? 'border-red-500 bg-red-50'
                  : 'border-blue-500'
              }`}
              placeholder="85 123 4567"
            />
          </div>

          {/* Home/Work Number */}
          <Input
            label="Home / Work Tel Number (Optional)"
            name="homeWorkTelNo"
            type="tel"
            placeholder="Enter telephone number"
            value={formData?.homeWorkTelNo || ''}
            onChange={handleNumericInputChange}
          />
        </div>

        {/* Preferred Email Radio */}
        <div className="mb-4 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <Radio
            label="Preferred Email"
            name="preferredEmail"
            required
            value={formData?.preferredEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            options={[
              { value: 'personal', label: 'Personal' },
              { value: 'work', label: 'Work' },
            ]}
          />
        </div>

        {/* Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Personal Email"
            name="personalEmail"
            type="email"
            required={formData?.preferredEmail === 'personal'}
            placeholder="you@example.com"
            value={formData?.personalEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
          <Input
            label="Work Email (Optional)"
            name="workEmail"
            type="email"
            required={formData?.preferredEmail === 'work'}
            placeholder="you@example.com"
            value={formData?.workEmail || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
