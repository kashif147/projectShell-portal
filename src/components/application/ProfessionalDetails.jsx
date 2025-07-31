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

const workLocations = [
  '24 Hour Care Services',
  '24 Hour Care Services (Mid-West)',
  '24 Hour Care Services (North West)',
  'ATU (LIMERICK)',
  'BLANCHARDSTOWN INSTITUTE OF TECHNOLOGY',
  'CAREDOC (CORK)',
  'DUBLIN INSTITUTE OF TECHNOLOGY',
  'GLENDALE NURSING HOME (TULLOW)',
  'HOME INSTEAD (WESTERN REGION)',
  'LETTERKENNY INSTITUTE OF TECHNOLOGY',
  'LIMERICK INSTITUTE OF TECHNOLOGY',
  'SLIGO INSTITUTE OF TECHNOLOGY',
  'ST JOSEPHS HOSPITAL- MOUNT DESERT',
  'TALLAGHT INSTITUTE OF TECHNOLOGY',
  'Atu (Letterkenny)',
  'Regional Centre Of Nursing & Midwifery Education',
  'Newtown School',
  'Tipperary Education & Training Board',
  'National University Ireland Galway',
  'South East Technological University (Setu)',
  'Tud (Tallaght)',
  'College Of Anaesthetists',
  'Tud (Blanchardstown)',
  'Gmit (Galway)',
  'Cork University College',
  'Mtu (Cork)',
  'Student',
  'St Columbas College (Dublin)',
  'Setu (Waterford)',
  'Nui Galway',
  'Roscrea College',
  'Dun Laoghaire Institute Of Art & Design',
  'Mtu (Kerry)',
  'Tus (Limerick)',
  'Dundalk Institute Of Technology (Dkit)',
  'Atu (Sligo)',
  'Tud (Bolton Street)',
  'Dublin City University',
  'National University Ireland Maynooth',
  'University College Dublin',
  'Limerick University',
  'Trinity College',
  'St Angelas College (Sligo)',
  'Royal College Of Surgeons',
  'Tus (Technological University Of The Shannon)',
  "Galway Mayo Institute Of Tech(C'Bar)",
];

// Mapping of work locations to their branches and regions
const workLocationDetails = {
  '24 Hour Care Services': { branch: 'Meath', region: 'Dublin North East' },
  '24 Hour Care Services (Mid-West)': {
    branch: 'Clare',
    region: 'Mid-West, West and North West',
  },
  '24 Hour Care Services (North West)': {
    branch: 'Sligo',
    region: 'Mid-West, West and North West',
  },
  'BLANCHARDSTOWN INSTITUTE OF TECHNOLOGY': {
    branch: 'Dublin Northern Branch',
    region: 'Dublin Mid Leinster',
  },
  'CAREDOC (CORK)': {
    branch: 'Cork Vol/Private Branch',
    region: 'South - South East',
  },
  'DUBLIN INSTITUTE OF TECHNOLOGY': {
    branch: 'Dublin South West Branch',
    region: 'Dublin Mid Leinster',
  },
  'GLENDALE NURSING HOME (TULLOW)': {
    branch: 'Carlow',
    region: 'South - South East',
  },
  'HOME INSTEAD (WESTERN REGION)': { branch: 'Roscommon', region: 'West' },
  'LETTERKENNY INSTITUTE OF TECHNOLOGY': {
    branch: 'Letterkenny',
    region: 'Letterkenny',
  },
  'LIMERICK INSTITUTE OF TECHNOLOGY': {
    branch: 'Limerick',
    region: 'Limerick',
  },
  'SLIGO INSTITUTE OF TECHNOLOGY': { branch: 'Sligo', region: 'Sligo' },
  'ST JOSEPHS HOSPITAL- MOUNT DESERT': {
    branch: 'Cork Vol/Private Branch',
    region: 'South - South East',
  },
  'TALLAGHT INSTITUTE OF TECHNOLOGY': {
    branch: 'Dublin South West Branch',
    region: 'Dublin Mid Leinster',
  },
  'Atu (Letterkenny)': { branch: 'Letterkenny', region: 'Letterkenny' },
  'Regional Centre Of Nursing & Midwifery Education': {
    branch: 'Offaly',
    region: 'Mid Leinster',
  },
  'Newtown School': { branch: 'Waterford', region: 'South - South East' },
  'Tipperary Education & Training Board': {
    branch: 'Tipperary-North-Mwhb',
    region: 'Mid-West, West and North West',
  },
  'National University Ireland Galway': {
    branch: 'Galway',
    region: 'Mid-West, West and North West',
  },
  'South East Technological University (Setu)': {
    branch: 'Carlow',
    region: 'South - South East',
  },
  'Tud (Tallaght)': {
    branch: 'Dublin South West Branch',
    region: 'Dublin Mid Leinster',
  },
  'College Of Anaesthetists': {
    branch: 'Dublin South West Branch',
    region: 'Dublin Mid Leinster',
  },
  'Tud (Blanchardstown)': {
    branch: 'Dublin Northern Branch',
    region: 'Dublin North East',
  },
  'Gmit (Galway)': {
    branch: 'Galway',
    region: 'Mid-West, West and North West',
  },
  'Cork University College': {
    branch: 'Cork Vol/Private Branch',
    region: 'South - South East',
  },
  'Mtu (Cork)': {
    branch: 'Cork Vol/Private Branch',
    region: 'South - South East',
  },
  Student: { branch: 'Student', region: 'Student' },
  'St Columbas College (Dublin)': {
    branch: 'Dublin East Coast Branch',
    region: 'Dublin Mid Leinster',
  },
  'Setu (Waterford)': { branch: 'Waterford', region: 'South - South East' },
  'Nui Galway': {
    branch: 'Galway City',
    region: 'Mid-West, West and North West',
  },
  'Roscrea College': {
    branch: 'Tipperary-North-Mwhb',
    region: 'Mid-West, West and North West',
  },
  'Dun Laoghaire Institute Of Art & Design': {
    branch: 'Dunlaoghaire',
    region: 'Dublin Mid Leinster',
  },
  'Mtu (Kerry)': { branch: 'Kerry', region: 'South - South East' },
  'Tus (Limerick)': {
    branch: 'Limerick',
    region: 'Mid-West, West and North West',
  },
  'Dundalk Institute Of Technology (Dkit)': {
    branch: 'Dundalk',
    region: 'Dublin North East',
  },
  'Atu (Sligo)': { branch: 'Sligo', region: 'Mid-West, West and North West' },
  'Tud (Bolton Street)': {
    branch: 'Dublin South West Branch',
    region: 'Dublin Mid Leinster',
  },
  'Dublin City University': {
    branch: 'Dublin Northern Branch',
    region: 'Dublin North East',
  },
  'National University Ireland Maynooth': {
    branch: 'Kildare/Naas',
    region: 'Dublin Mid Leinster',
  },
  'University College Dublin': {
    branch: 'Dublin East Coast Branch',
    region: 'Dublin Mid Leinster',
  },
  'Limerick University': { branch: 'Limerick', region: 'Limerick' },
  'Trinity College': {
    branch: 'Dublin East Coast Branch',
    region: 'Dublin Mid Leinster',
  },
  'St Angelas College (Sligo)': { branch: 'Sligo', region: 'Sligo' },
  'Royal College Of Surgeons': {
    branch: 'Dublin East Coast Branch',
    region: 'Dublin North East',
  },
  'Tus (Technological University Of The Shannon)': {
    branch: 'Athlone',
    region: 'Dublin North East',
  },
  "Galway Mayo Institute Of Tech(C'Bar)": {
    branch: 'Castlebar',
    region: 'Mid-West, West and North West',
  },
};

const allBranches = Array.from(
  new Set(Object.values(workLocationDetails).map(d => d.branch)),
);
const allRegions = Array.from(
  new Set(Object.values(workLocationDetails).map(d => d.region)),
);

const ProfessionalDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const { cityLookups } = useLookup();

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'workLocation' && workLocationDetails[value]) {
      newFormData.branch = workLocationDetails[value].branch;
      newFormData.region = workLocationDetails[value].region;
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
          options={[
            { value: 'general', label: 'General (all grades)' },
            { value: 'postgraduate_student', label: 'Postgraduate Student' },
            {
              value: 'short_term_relief',
              label: 'Short-term/ Relief (under 15 hrs/wk average)',
            },
            { value: 'private_nursing_home', label: 'Private nursing home' },
            {
              value: 'affiliate_non_practicing',
              label: 'Affiliate members (non-practicing)',
            },
            {
              value: 'lecturing',
              label: 'Lecturing (employed in universities and IT institutes)',
            },
            {
              value: 'associate',
              label: 'Associate (not currently employed as a nurse/midwife)',
            },
            { value: 'retired_associate', label: 'Retired Associate' },
            {
              value: 'undergraduate_student',
              label: 'Undergraduate Student',
            },
          ]}
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
          placeholder="Select work location"
          options={[
            ...workLocations.map(loc => ({ value: loc, label: loc })),
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
          options={allBranches.map(branch => ({
            value: branch,
            label: branch,
          }))}
          showValidation={showValidation}
        />
        <Select
          label="Region"
          name="region"
          value={formData?.region || ''}
          onChange={handleInputChange}
          placeholder="Select region"
          disabled={true}
          options={allRegions.map(region => ({ value: region, label: region }))}
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
