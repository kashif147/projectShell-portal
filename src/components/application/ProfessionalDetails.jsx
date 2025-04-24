import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';

const ProfessionalDetails = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Station"
        name="station"
        required
      />
      <Input
        label="Work location"
        name="workLocation"
        required
      />
      <Input
        label="Work location address"
        name="workLocationAddress"
        readOnly
      />
      <Input
        label="Work location phone"
        name="workLocationPhone"
        readOnly
      />
      <Select
        label="Rank/Grade"
        name="rank"
        required
      />
      <Select
        label="Section"
        name="section"
      />
      <Select
        label="Duty"
        name="duty"
        required
      />
      <Select
        label="District"
        name="district"
      />
      <Select
        label="Division"
        name="division"
      />
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Is Retired"
          name="isRetired"
        />
        <DatePicker
          label="Retired Date"
          name="retiredDate"
          className="mt-2"
        />
      </div>
      <Input
        label="Pension No"
        name="pensionNo"
      />
      <Select
        label="Study Location"
        name="studyLocation"
      />
      <Input
        label="Templemore"
        name="templemore"
      />
      <Input
        label="Class"
        name="class"
      />
      <DatePicker
        label="Attested Date"
        name="attestedDate"
      />
      <DatePicker
        label="Graduation Date"
        name="graduationDate"
      />
      <Input
        label="Notes"
        name="notes"
        multiline
        className="col-span-2"
      />
    </div>
  );
};

export default ProfessionalDetails; 