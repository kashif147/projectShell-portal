import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import { InfoCircleOutlined } from '@ant-design/icons';

const ProfessionalDetails = ({ formData, onFormDataChange, showValidation = false }) => {
  const [showOtherLocation, setShowOtherLocation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'workLocation' && value === 'other') {
      setShowOtherLocation(true);
    } else if (name === 'workLocation') {
      setShowOtherLocation(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Work location</label>
          <div className="group relative">
            <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Select your primary work location. If your location is not listed, choose 'Other' and specify it below.
            </div>
          </div>
        </div>
        <Select
          name="workLocation"
          required
          value={formData?.workLocation || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Select work location"
          options={[
            { value: 'dublin', label: 'Dublin' },
            { value: 'cork', label: 'Cork' },
            { value: 'galway', label: 'Galway' },
            { value: 'limerick', label: 'Limerick' },
            { value: 'waterford', label: 'Waterford' },
            { value: 'other', label: 'Other' }
          ]}
        />
        {showOtherLocation && (
          <div className="mt-2">
            <Input
              label="Work Location"
              name="otherWorkLocation"
              required
              value={formData?.otherWorkLocation || ''}
              onChange={handleInputChange}
              showValidation={showValidation}
              placeholder="Enter your work location"
            />
          </div>
        )}
      </div>
      <Select
        label="Grade"
        name="grade"
        required
        value={formData?.grade || ''}
        onChange={handleInputChange}
        showValidation={showValidation}
        placeholder="Select grade"
        options={[
          { value: 'junior', label: 'Junior' },
          { value: 'senior', label: 'Senior' },
          { value: 'lead', label: 'Lead' },
          { value: 'manager', label: 'Manager' }
        ]}
      />
      <Select
        label="Section"
        name="section"
        value={formData?.section || ''}
        onChange={handleInputChange}
        placeholder="Select section"
        options={[
          { value: 'section1', label: 'Section 1' },
          { value: 'section2', label: 'Section 2' },
          { value: 'section3', label: 'Section 3' }
        ]}
      />
      <Select
        label="Branch"
        name="branch"
        value={formData?.branch || ''}
        onChange={handleInputChange}
        placeholder="Select branch"
        options={[
          { value: 'branch1', label: 'Branch 1' },
          { value: 'branch2', label: 'Branch 2' },
          { value: 'branch3', label: 'Branch 3' }
        ]}
      />
      <Select
        label="Region"
        name="region"
        value={formData?.region || ''}
        onChange={handleInputChange}
        placeholder="Select region"
        options={[
          { value: 'region1', label: 'Region 1' },
          { value: 'region2', label: 'Region 2' },
          { value: 'region3', label: 'Region 3' }
        ]}
      />
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Is Retired"
          name="isRetired"
          checked={formData?.isRetired || false}
          onChange={handleInputChange}
        />
        {formData?.isRetired && (
          <div className="flex flex-col gap-2">
            <DatePicker
              label="Retired Date"
              name="retiredDate"
              value={formData?.retiredDate || ''}
              onChange={handleInputChange}
              disableAgeValidation
            />
            <Input
              label="Pension No"
              name="pensionNo"
              value={formData?.pensionNo || ''}
              onChange={handleInputChange}
            />
          </div>
        )}
      </div>
      <Select
        label="Study Location"
        name="studyLocation"
        value={formData?.studyLocation || ''}
        onChange={handleInputChange}
        placeholder="Select study location"
        options={[
          { value: 'location1', label: 'Location 1' },
          { value: 'location2', label: 'Location 2' },
          { value: 'location3', label: 'Location 3' }
        ]}
      />
      <DatePicker
        label="Graduation Date"
        name="graduationDate"
        value={formData?.graduationDate || ''}
        onChange={handleInputChange}
        disableAgeValidation
      />
    </div>
  );
};

export default ProfessionalDetails; 