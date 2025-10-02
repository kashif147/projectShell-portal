import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import { useLookup } from '../../contexts/lookupContext';
import Radio from '../ui/Radio';

const nurseTypeOptions = [
  { value: 'general', label: 'General Nurse' },
  { value: 'publicHealth', label: 'Public Health Nurse' },
  { value: 'mentalHealth', label: 'Mental health nurse' },
  { value: 'midwife', label: 'Midwife' },
  { value: 'sickChildren', label: "Sick Children's Nurse" },
  {
    value: 'intellectualDisability',
    label: 'Registered Nurse for Intellectual Disability',
  },
];

// Dynamic lists will be built from API data

const ProfessionalDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const { workLocationLookups, fetchWorkLocationLookups, categoryLookups, fetchCategoryLookups } = useLookup();

  React.useEffect(() => {
    if (!workLocationLookups || workLocationLookups.length === 0) {
      fetchWorkLocationLookups?.();
    }
    if (!categoryLookups || categoryLookups.length === 0) {
      fetchCategoryLookups?.();
    }
  }, []);

  const workLocationOptions = (workLocationLookups || []).map(item => {
    const name = item?.lookup?.DisplayName || item?.lookup?.lookupname || '';
    return { value: name, label: name };
  });

  const membershipCategoryOptions = (categoryLookups || []).map(item => {
    const value = item?.id || item?._id || item?.code || item?.value || item?.name || item?.productType?.name;
    const label = item?.name || item?.DisplayName || item?.label || item?.productType?.name || value;
    return { value: String(value || ''), label: String(label || '') };
  });

  const branchOptions = Array.from(
    new Set(
      (workLocationLookups || []).map(
        i => i?.branch?.DisplayName || i?.branch?.lookupname,
      ),
    ),
  )
    .filter(Boolean)
    .map(name => ({ value: name, label: name }));

  const regionOptions = Array.from(
    new Set(
      (workLocationLookups || []).map(
        i => i?.region?.DisplayName || i?.region?.lookupname,
      ),
    ),
  )
    .filter(Boolean)
    .map(name => ({ value: name, label: name }));

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'workLocation') {
      const selected = (workLocationLookups || []).find(
        i => (i?.lookup?.DisplayName || i?.lookup?.lookupname) === value,
      );
      if (selected) {
        newFormData.branch =
          selected?.branch?.DisplayName || selected?.branch?.lookupname || '';
        newFormData.region =
          selected?.region?.DisplayName || selected?.region?.lookupname || '';
      }
    }

    onFormDataChange(newFormData);
  };

  const handleNurseTypeChange = e => {
    onFormDataChange({
      ...formData,
      nurseType: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Membership Category"
          tooltip="Please select the membership category most appropriate to yourselves. Some category selections will require you to contact our Membership team."
          name="membershipCategory"
          required
          value={formData?.membershipCategory || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Select membership category"
          options={membershipCategoryOptions}
        />
      </div>
      {formData?.membershipCategory === 'undergraduate_student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Study Location"
            name="studyLocation"
            disabled={formData?.membershipCategory !== 'undergraduate_student'}
            value={formData?.studyLocation || ''}
            onChange={handleInputChange}
            placeholder="Select study location"
            options={[
              { value: 'location1', label: 'Location 1' },
              { value: 'location2', label: 'Location 2' },
              { value: 'location3', label: 'Location 3' },
            ]}
          />
          <DatePicker
            label="Graduation Date"
            disabled={formData?.membershipCategory !== 'undergraduate_student'}
            name="graduationDate"
            value={formData?.graduationDate || ''}
            onChange={handleInputChange}
            disableAgeValidation
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Work Location"
          tooltip="Select your primary work location. If your location is not listed, choose 'Other' and specify it below."
          name="workLocation"
          required={formData?.membershipCategory !== 'undergraduate_student'}
          value={formData?.workLocation || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          labelExtra={''}
          placeholder="Select work location"
          options={[
            ...workLocationOptions,
            { value: 'other', label: 'other' },
          ]}
        />
        <Input
          label="Other Work Location"
          name="otherWorkLocation"
          required={formData?.workLocation === 'other'}
          disabled={formData?.workLocation !== 'other'}
          value={formData?.otherWorkLocation || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your work other location"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Branch"
          name="branch"
          value={formData?.branch || ''}
          onChange={handleInputChange}
          placeholder="Select branch"
          disabled={true}
          options={branchOptions}
          showValidation={showValidation}
        />
        <Select
          label="Region"
          name="region"
          value={formData?.region || ''}
          onChange={handleInputChange}
          placeholder="Select region"
          disabled={true}
          options={regionOptions}
          showValidation={showValidation}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Radio
          label="Are you currently undertaking a nursing adaptation programme?"
          name="nursingAdaptationProgramme"
          value={formData?.nursingAdaptationProgramme || 'no'}
          onChange={e =>
            onFormDataChange({
              ...formData,
              nursingAdaptationProgramme: e.target.value,
            })
          }
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />
        <Input
          disabled={formData?.nursingAdaptationProgramme !== 'yes'}
          required={formData?.nursingAdaptationProgramme === 'yes'}
          label="NMBI No / An Board Altranais Number"
          name="nmbiNumber"
          value={formData?.nmbiNumber || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your NMBI number"
        />
      </div>
      <Radio
        label="Please tick one of the following"
        name="nurseType"
        required={formData?.nursingAdaptationProgramme === 'yes'}
        disabled={formData?.nursingAdaptationProgramme !== 'yes'}
        value={formData?.nurseType || ''}
        onChange={handleNurseTypeChange}
        showValidation={showValidation}
        options={nurseTypeOptions}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Grade"
          tooltip="Select your current grade. If your grade is not listed, choose 'Other' and specify it below."
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
            { value: 'manager', label: 'Manager' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Other Grade"
          name="otherGrade"
          required={formData?.grade === 'other'}
          disabled={formData?.grade !== 'other'}
          value={formData?.otherGrade || ''}
          onChange={handleInputChange}
          showValidation={showValidation}
          placeholder="Enter your other grade"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Retired Date
            </label>
            <Checkbox
              label={<span className="font-medium text-gray-700">Retired</span>}
              name="isRetired"
              checked={
                formData?.isRetired ||
                formData?.membershipCategory === 'retired_associate'
              }
              onChange={handleInputChange}
            />
          </div>
          <DatePicker
            disabled={
              formData?.isRetired ||
              formData?.membershipCategory !== 'retired_associate'
            }
            name="retiredDate"
            value={formData?.retiredDate || ''}
            onChange={handleInputChange}
            disableAgeValidation
          />
        </div>
        <Input
          label="Pension No"
          name="pensionNo"
          disabled={
            formData?.isRetired ||
            formData?.membershipCategory !== 'retired_associate'
          }
          value={formData?.pensionNo || ''}
          onChange={handleInputChange}
          placeholder="Enter your pension number"
        />
      </div>
    </div>
  );
};

export default ProfessionalDetails;
