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
      <Select
        label="Station"
        name="station"
        required
        value={formData?.station || ''}
        onChange={handleInputChange}
        showValidation={showValidation}
        placeholder="Select station"
        options={[
          { value: 'station1', label: 'Station 1' },
          { value: 'station2', label: 'Station 2' },
          { value: 'station3', label: 'Station 3' }
        ]}
      />
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
        label="Rank/Grade"
        name="rank"
        required
        value={formData?.rank || ''}
        onChange={handleInputChange}
        showValidation={showValidation}
        placeholder="Select rank/grade"
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
        label="Duty"
        name="duty"
        required
        value={formData?.duty || ''}
        onChange={handleInputChange}
        showValidation={showValidation}
        placeholder="Select duty"
        options={[
          { value: 'duty1', label: 'Duty 1' },
          { value: 'duty2', label: 'Duty 2' },
          { value: 'duty3', label: 'Duty 3' }
        ]}
      />
      <Select
        label="District"
        name="district"
        value={formData?.district || ''}
        onChange={handleInputChange}
        placeholder="Select district"
        options={[
          { value: 'district1', label: 'District 1' },
          { value: 'district2', label: 'District 2' },
          { value: 'district3', label: 'District 3' }
        ]}
      />
      <Select
        label="Division"
        name="division"
        value={formData?.division || ''}
        onChange={handleInputChange}
        placeholder="Select division"
        options={[
          { value: 'division1', label: 'Division 1' },
          { value: 'division2', label: 'Division 2' },
          { value: 'division3', label: 'Division 3' }
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
      <Input
        label="Templemore"
        name="templemore"
        value={formData?.templemore || ''}
        onChange={handleInputChange}
        placeholder="Enter templemore"
      />
      <Input
        label="Class"
        name="class"
        value={formData?.class || ''}
        onChange={handleInputChange}
        placeholder="Enter class"
      />
      <DatePicker
        label="Attested Date"
        name="attestedDate"
        value={formData?.attestedDate || ''}
        onChange={handleInputChange}
        disableAgeValidation
      />
      <DatePicker
        label="Graduation Date"
        name="graduationDate"
        value={formData?.graduationDate || ''}
        onChange={handleInputChange}
        disableAgeValidation
      />
      <Input
        label="Notes"
        name="notes"
        multiline
        className="col-span-2"
        value={formData?.notes || ''}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default ProfessionalDetails; 