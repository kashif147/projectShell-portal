import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import { TreeSelect } from '../ui/TreeSelect';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Card } from '../ui/Card';

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

    if (name === 'workLocation' && value === 'other') {
      setShowOtherLocation(true);
    } else if (name === 'workLocation') {
      setShowOtherLocation(false);
    }

    if (name === 'grade' && value === 'other') {
      setShowOtherGrade(true);
    } else if (name === 'grade') {
      setShowOtherGrade(false);
    }
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
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Work location
            </label>
            <div className="group relative">
              <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 max-w-[90vw] w-auto min-w-[180px] break-words text-center p-1.5 md:p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                md:left-auto md:right-0 md:top-auto md:bottom-full md:mb-2 md:mt-0 md:translate-x-0 md:text-left md:max-w-xs"
              >
                <div className="relative">
                  <div className="hidden md:block absolute -bottom-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  <div className="block md:hidden absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  Select your primary work location. If your location is not
                  listed, choose 'Other' and specify it below.
                </div>
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
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="mt-2">
            <Input
              label="Work Location"
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
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Grade
            </label>
            <div className="group relative">
              <InfoCircleOutlined className="text-gray-400 hover:text-gray-600 cursor-help" />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 max-w-[90vw] w-auto min-w-[180px] break-words text-center p-1.5 md:p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10
                md:left-auto md:right-0 md:top-auto md:bottom-full md:mb-2 md:mt-0 md:translate-x-0 md:text-left md:max-w-xs"
              >
                <div className="relative">
                  <div className="hidden md:block absolute -bottom-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  <div className="block md:hidden absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  Select your current grade. If your grade is not listed, choose
                  'Other' and specify it below.
                </div>
              </div>
            </div>
          </div>
          <Select
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
              label="Grade"
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

        <TreeSelect
          label="Section"
          name="section"
          treeData={treeData}
          value={formData?.section || []}
          onChange={handleSectionChange}
          multiple={true}
          maxTagCount={2}
          maxTagPlaceholder={omittedValues => `+ ${omittedValues.length} more`}
          placeholder="Select sections"
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
          name="graduationDate"
          value={formData?.graduationDate || ''}
          onChange={handleInputChange}
          disableAgeValidation
        />
      </div>
      <Card className="p-4 bg-gray-50">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              label={
                <span className="font-medium text-gray-700">Is Retired</span>
              }
              name="isRetired"
              checked={formData?.isRetired || false}
              onChange={handleInputChange}
            />
          </div>

          {formData?.isRetired && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
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
                placeholder="Enter your pension number"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfessionalDetails;
