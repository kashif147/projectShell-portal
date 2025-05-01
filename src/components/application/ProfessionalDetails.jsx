import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';

const ProfessionalDetails = ({ formData, onFormDataChange, showValidation = false }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Work location"
        name="workLocation"
        required
        value={formData?.workLocation || ''}
        onChange={handleInputChange}
        showValidation={showValidation}
        placeholder="Enter work location"
      />
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