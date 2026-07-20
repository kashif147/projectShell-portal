import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { useLookup } from '../../contexts/lookupContext';
import { findWorkLocationLookupItem } from '../../helpers/subscriptionPricing.helper';
import { resolveBranchRegionFromStudyLocation } from '../../helpers/lookupHierarchy.helper';
import MembershipCategoryConfirmationModal from '../modals/MembershipCategoryConfirmationModal';

const nurseTypeOptions = [
  { value: 'generalNursing', label: 'General Nurse' },
  { value: 'publicHealthNurse', label: 'Public Health Nurse' },
  { value: 'mentalHealth', label: 'Mental health nurse' },
  { value: 'midwife', label: 'Midwife' },
  { value: 'sickChildrenNurse', label: "Sick Children's Nurse" },
  {
    value: 'intellectualDisability',
    label: 'Registered Nurse for Intellectual Disability',
  },
];

/** Same resolution order as membership dropdown value — keep in sync with API labels. */
const getCategoryLookupLabel = item =>
  String(
    item?.name ||
      item?.DisplayName ||
      item?.label ||
      item?.productType?.name ||
      item?.code ||
      '',
  );

/** Internal type keys → exact dropdown labels (aligned with Receipt / Resources). */
export const CATEGORY_DISPLAY_NAME_BY_TYPE = {
  undergraduate_student: 'Undergraduate Student',
  retired_associate: 'Retired Associate',
  postgraduate_student: 'Postgraduate Student',
  general: 'General (all grades)',
  private_nursing_home: 'Private nursing home',
  short_term_relief: 'Short-term/Relief (under 12 hrs/wk average)',
  associate: 'Associate (not currently employed as a nurse/midwife)',
  affiliate: 'Affiliate members (non-practicing)',
  lecturing: 'Lecturing (employed in universities and IT institutes)',
};

const REDUCED_RATE_CATEGORY_TYPES = [
  'affiliate',
  'associate',
  'short_term_relief',
];

const isReducedRateMembershipCategory = categoryLabel => {
  if (!categoryLabel) return false;

  const label = String(categoryLabel).toLowerCase();

  if (
    REDUCED_RATE_CATEGORY_TYPES.some(
      type => CATEGORY_DISPLAY_NAME_BY_TYPE[type] === categoryLabel,
    )
  ) {
    return true;
  }

  if (
    (label.includes('short-term') || label.includes('short term')) &&
    label.includes('relief')
  ) {
    return true;
  }

  if (label.includes('affiliate') && label.includes('non-practicing')) {
    return true;
  }

  if (
    label.includes('associate') &&
    label.includes('not currently employed')
  ) {
    return true;
  }

  return false;
};

const isUndergraduateStudentCategory = membershipCategory =>
  membershipCategory === CATEGORY_DISPLAY_NAME_BY_TYPE.undergraduate_student;

const getBranchRegionFromLookupItem = item => ({
  branch: item?.branch?.DisplayName || item?.branch?.lookupname || '',
  region: item?.region?.DisplayName || item?.region?.lookupname || '',
});

const getUndergraduateBranchRegion = (
  { workLocation, studyLocation },
  workLocationLookups,
  studyLocationOptions,
  rawLookups,
) => {
  if (workLocation === 'other') {
    return { branch: '', region: '' };
  }

  if (workLocation) {
    return getBranchRegionFromLookupItem(
      findWorkLocationLookupItem(workLocation, workLocationLookups),
    );
  }

  if (studyLocation) {
    return resolveBranchRegionFromStudyLocation(
      studyLocation,
      studyLocationOptions,
      rawLookups,
      workLocationLookups,
    );
  }

  return { branch: '', region: '' };
};

const applyUndergraduateBranchRegion = (
  draft,
  workLocationLookups,
  studyLocationOptions,
  rawLookups,
) => {
  if (!isUndergraduateStudentCategory(draft.membershipCategory)) {
    return draft;
  }

  return {
    ...draft,
    ...getUndergraduateBranchRegion(
      draft,
      workLocationLookups,
      studyLocationOptions,
      rawLookups,
    ),
  };
};

const ProfessionalDetails = ({
  formData,
  onFormDataChange,
  showValidation = false,
}) => {
  const {
    workLocationLookups,
    categoryLookups,
    gradeLookups,
    studyLocationLookups,
    disciplineLookups,
    lookups,
  } = useLookup();

  const [categoryConfirmOpen, setCategoryConfirmOpen] = useState(false);
  const [pendingMembershipCategory, setPendingMembershipCategory] =
    useState('');

  const workLocationOptions = (workLocationLookups || []).map(item => {
    const name = item?.lookup?.DisplayName || item?.lookup?.lookupname || '';
    return { value: name, label: name };
  });

  const membershipCategoryOptions = (categoryLookups || []).map(item => {
    const label = getCategoryLookupLabel(item);
    return {
      value: label,
      label,
      rawItem: item, // Keep reference to original item
    };
  });

  const gradeOptions = [
    ...(gradeLookups || [])
      .map(item => {
        const name = item?.DisplayName || item?.lookupname || '';
        return { value: name, label: name };
      })
      .filter(option => option.value), // Filter out empty values
    { value: 'other', label: 'Other' }, // Add "Other" option at the end
  ];

  const rawLookups = useMemo(() => {
    if (lookups?.length) {
      return lookups;
    }
    return studyLocationLookups || [];
  }, [lookups, studyLocationLookups]);

  const studyLocationOptions = useMemo(
    () =>
      (studyLocationLookups || [])
        .map(item => {
          const name = item?.DisplayName || item?.lookupname || '';
          return { value: name, label: name, key: item?._id || item?.id };
        })
        .filter(option => option.value),
    [studyLocationLookups],
  );

  const disciplineOptions = [
    ...(disciplineLookups || [])
      .map(item => {
        const name = item?.DisplayName || item?.lookupname || '';
        return { value: name, label: name };
      })
      .filter(option => option.value),
    { value: 'other', label: 'Other' },
  ];

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

  const applyMembershipCategory = categoryValue => {
    const nextFormData = applyUndergraduateBranchRegion(
      {
        ...formData,
        membershipCategory: categoryValue,
      },
      workLocationLookups,
      studyLocationOptions,
      rawLookups,
    );
    onFormDataChange(nextFormData);
  };

  const handleMembershipCategoryChange = value => {
    if (!value) {
      applyMembershipCategory('');
      return;
    }

    if (isReducedRateMembershipCategory(value)) {
      setPendingMembershipCategory(value);
      setCategoryConfirmOpen(true);
      return;
    }

    applyMembershipCategory(value);
  };

  const handleConfirmMembershipCategory = () => {
    applyMembershipCategory(pendingMembershipCategory);
    setCategoryConfirmOpen(false);
    setPendingMembershipCategory('');
  };

  const handleCancelMembershipCategory = () => {
    setCategoryConfirmOpen(false);
    setPendingMembershipCategory('');
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;

    if (name === 'membershipCategory') {
      handleMembershipCategoryChange(value);
      return;
    }

    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    if (name === 'workLocation') {
      if (value === 'other') {
        newFormData.branch = '';
        newFormData.region = '';
      } else if (value) {
        const selected = findWorkLocationLookupItem(value, workLocationLookups);
        Object.assign(newFormData, getBranchRegionFromLookupItem(selected));
      } else if (isUndergraduateStudentCategory(newFormData.membershipCategory)) {
        Object.assign(
          newFormData,
          getUndergraduateBranchRegion(
            newFormData,
            workLocationLookups,
            studyLocationOptions,
            rawLookups,
          ),
        );
      } else {
        newFormData.branch = '';
        newFormData.region = '';
      }
    }

    if (name === 'studyLocation') {
      const hasWorkLocation =
        newFormData.workLocation && newFormData.workLocation !== 'other';

      if (
        isUndergraduateStudentCategory(newFormData.membershipCategory) &&
        !hasWorkLocation
      ) {
        Object.assign(
          newFormData,
          getUndergraduateBranchRegion(
            newFormData,
            workLocationLookups,
            studyLocationOptions,
            rawLookups,
          ),
        );
      }
    }

    onFormDataChange(newFormData);
  };

  useEffect(() => {
    if (!isUndergraduateStudentCategory(formData?.membershipCategory)) {
      return;
    }

    const hasWorkLocation =
      formData?.workLocation && formData.workLocation !== 'other';
    if (hasWorkLocation || !formData?.studyLocation) {
      return;
    }

    const { branch, region } = getUndergraduateBranchRegion(
      formData,
      workLocationLookups,
      studyLocationOptions,
      rawLookups,
    );

    if (branch === formData.branch && region === formData.region) {
      return;
    }

    onFormDataChange({
      ...formData,
      branch,
      region,
    });
  }, [
    formData?.membershipCategory,
    formData?.studyLocation,
    formData?.workLocation,
    formData?.branch,
    formData?.region,
    rawLookups,
    studyLocationOptions,
    workLocationLookups,
  ]);

  const handleNurseTypeChange = e => {
    onFormDataChange({
      ...formData,
      nurseType: e.target.value,
    });
  };
  // Helper: internal type key vs dropdown display label (aligned with Receipt / Resources).
  const isCategoryType = categoryType => {
    if (!formData?.membershipCategory) return false;

    const selectedCategory = (categoryLookups || []).find(
      item => getCategoryLookupLabel(item) === String(formData.membershipCategory),
    );

    if (!selectedCategory) return false;

    const selectedDisplayName = getCategoryLookupLabel(selectedCategory);

    const targetName = CATEGORY_DISPLAY_NAME_BY_TYPE[categoryType];
    return targetName ? selectedDisplayName === targetName : false;
  };

  return (
    <div className="space-y-6">
      <MembershipCategoryConfirmationModal
        open={categoryConfirmOpen}
        onCancel={handleCancelMembershipCategory}
        onConfirm={handleConfirmMembershipCategory}
      />

      {/* Membership Category Section */}
      <div className="section-card">
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Membership Category
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select the membership category most appropriate for you.
            </p>
          </div>
        </div>

        {/* Membership Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        {/* Student Information - Conditionally shown */}
        {isCategoryType('undergraduate_student') && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Student Information
            </h3>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Discipline"
                name="discipline"
                required
                value={formData?.discipline || ''}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Select your discipline"
                options={disciplineOptions}
              />
              <Select
                label="Study Location"
                name="studyLocation"
                required
                value={formData?.studyLocation || ''}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Select study location"
                options={studyLocationOptions}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
                label="Start Date"
                name="startDate"
                value={formData?.startDate || ''}
                onChange={handleInputChange}
                showValidation={showValidation}
                disableAgeValidation
              />
              <DatePicker
                label="Graduation Date"
                name="graduationDate"
                required
                value={formData?.graduationDate || ''}
                onChange={handleInputChange}
                disableAgeValidation
              />
            </div>
          </div>
        )}

        {/* Retired Associate Information - Conditionally shown */}
        {isCategoryType('retired_associate') && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Retirement Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Retired Date"
                name="retirementDate"
                value={formData?.retirementDate || ''}
                onChange={handleInputChange}
                disableAgeValidation
                placeholder="DD/MM/YYYY"
              />
              <Input
                label="Pension No"
                name="pensionNo"
                required
                value={formData?.pensionNo || ''}
                onChange={handleInputChange}
                showValidation={showValidation}
                placeholder="Enter your pension number"
              />
            </div>
          </div>
        )}
      </div>

      {/* Work Details Section */}
      <div className="section-card">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isCategoryType('undergraduate_student')
                ? 'Work Location / Placement Details'
                : 'Work Details'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Provide your work location and professional grade.
            </p>
          </div>
        </div>

        {/* Work Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Work Location"
            tooltip="Select your primary work location. If your location is not listed, choose 'Other' and specify it below."
            name="workLocation"
            required={!isCategoryType('undergraduate_student')}
            value={formData?.workLocation || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Select work location"
            options={[
              ...workLocationOptions,
              { value: 'other', label: 'Other' },
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

        {/* Branch and Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        {/* Grade */}
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
            options={gradeOptions}
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
      </div>

      {/* Nursing Adaptation Programme Section */}
      <div className="section-card">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Nursing Programme
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Details about your nursing adaptation programme.
            </p>
          </div>
        </div>

        {/* Nursing Adaptation Programme */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="option-box">
            <Radio
              label="Are you currently undertaking a nursing adaptation programme?"
              name="nursingAdaptationProgramme"
              value={formData?.nursingAdaptationProgramme || ''}
              onChange={e => {
                const updatedData = {
                  ...formData,
                  nursingAdaptationProgramme: e.target.value,
                };
                if (e.target.value === 'no') {
                  updatedData.nurseType = '';
                }
                onFormDataChange(updatedData);
              }}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <Input
            disabled={
              !formData?.nursingAdaptationProgramme ||
              !['yes', 'no'].includes(formData.nursingAdaptationProgramme)
            }
            required={
              formData?.nursingAdaptationProgramme === 'no' &&
              !isCategoryType('undergraduate_student')
            }
            label={ 'NMBI No / An Board Altranais Number'}
            name="nmbiNumber"
            value={formData?.nmbiNumber || ''}
            onChange={handleInputChange}
            showValidation={showValidation}
            placeholder="Enter your NMBI number"
          />
        </div>

        {/* Nurse Type */}
        <div className="option-box mt-6">
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
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetails;
