import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import { TreeSelect } from '../ui/TreeSelect';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const ProfessionalDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const [showOtherLocation, setShowOtherLocation] = useState(false);
  const [showOtherGrade, setShowOtherGrade] = useState(false);

  const treeData = [
    {
      title: 'Section 1',
      value: 'section1',
      children: [
        {
          title: 'Subsection 1.1',
          value: 'section1.1',
        },
        {
          title: 'Subsection 1.2',
          value: 'section1.2',
        },
      ],
    },
    {
      title: 'Section 2',
      value: 'section2',
      children: [
        {
          title: 'Subsection 2.1',
          value: 'section2.1',
        },
        {
          title: 'Subsection 2.2',
          value: 'section2.2',
        },
      ],
    },
    {
      title: 'Section 3',
      value: 'section3',
      children: [
        {
          title: 'Subsection 3.1',
          value: 'section3.1',
        },
        {
          title: 'Subsection 3.2',
          value: 'section3.2',
        },
      ],
    },
  ];

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    onFormDataChange({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSectionChange = value => {
    // Ensure only 2 selections are allowed
    if (value.length <= 2) {
      onFormDataChange({
        ...formData,
        section: value,
      });
    }
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
            { value: 'short_term_relief', label: 'Short-term/ Relief (under 15 hrs/wk average)' },
            { value: 'private_nursing_home', label: 'Private nursing home' },
            { value: 'affiliate_non_practicing', label: 'Affiliate members (non-practicing)' },
            { value: 'lecturing', label: 'Lecturing (employed in universities and IT institutes)' },
            { value: 'associate', label: 'Associate (not currently employed as a nurse/midwife)' },
            { value: 'retired_associate', label: 'Retired Associate' },
            { value: 'undergraduate_student', label: 'Undergraduate Student' },
          ]}
        />
        <div className="relative">
          <Select
            label="Work Location"
            tooltip="Select your primary work location. If your location is not listed, choose 'Other' and specify it below."
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
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="mt-2">
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
        </div>
        <div className="relative">
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
          <div className="mt-2">
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
        </div>

        {/* <TreeSelect
          label="Section"
          name="section"
          treeData={treeData}
          value={formData?.section || []}
          onChange={handleSectionChange}
          multiple={true}
          maxTagCount={2}
          maxTagPlaceholder={omittedValues => `+ ${omittedValues.length} more`}
          placeholder="Select sections"
        /> */}
        <Select
          label="Branch"
          name="branch"
          value={formData?.branch || ''}
          onChange={handleInputChange}
          placeholder="Select branch"
          options={[
            { value: 'branch1', label: 'Branch 1' },
            { value: 'branch2', label: 'Branch 2' },
            { value: 'branch3', label: 'Branch 3' },
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
            { value: 'region3', label: 'Region 3' },
          ]}
        />
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
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Retired Date
            </label>
            <Checkbox
              label={
                <span className="font-medium text-gray-700">Retired</span>
              }
              name="isRetired"
              checked={formData?.isRetired || formData?.membershipCategory === 'retired_associate'}
              onChange={handleInputChange}
            />
          </div>
          <DatePicker
            disabled={formData?.isRetired || formData?.membershipCategory !== 'retired_associate'}
            name="retiredDate"
            value={formData?.retiredDate || ''}
            onChange={handleInputChange}
            disableAgeValidation
          />
        </div>
        <Input
          label="Pension No"
          name="pensionNo"
          disabled={formData?.isRetired || formData?.membershipCategory !== 'retired_associate'}
          value={formData?.pensionNo || ''}
          onChange={handleInputChange}
          placeholder="Enter your pension number"
        />
      </div>
    </div>
  );
};

export default ProfessionalDetails;
