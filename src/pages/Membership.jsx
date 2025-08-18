import React, { useEffect, useState } from 'react';
import { Card, Divider, Space } from 'antd';
import { useApplication } from '../contexts/applicationContext';
import { updateProfessionalDetailRequest } from '../api/application.api';
import { toast } from 'react-toastify';
import Select from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Checkbox } from '../components/ui/Checkbox';
import Button from '../components/common/Button';

const membershipCategoryOptions = [
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
];

const Membership = () => {
  const { personalDetail, professionalDetail, getProfessionalDetail } =
    useApplication();
  const [form, setForm] = useState({
    membershipCategory: '',
    studyLocation: '',
    graduationDate: '',
    retiredDate: '',
    pensionNo: '',
    isRetired: false,
  });
  const existing = professionalDetail?.professionalDetails || {};

  useEffect(() => {
    setForm({
      membershipCategory: existing.membershipCategory || '',
      studyLocation: existing.studyLocation || '',
      graduationDate: existing.graduationDate || '',
      retiredDate: existing.retiredDate || '',
      pensionNo: existing.pensionNo || '',
      isRetired:
        existing.isRetired ||
        existing.membershipCategory === 'retired_associate',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalDetail]);

  const handleDateChange = (name, value) => {
    console.log('Date change:', name, value);
    setForm({ ...form, [name]: value });
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onSubmit = () => {
    if (!form.membershipCategory) {
      toast.error('Please select a membership category');
      return;
    }

    const payload = {
      professionalDetails: {
        membershipCategory: form.membershipCategory,
        studyLocation: form.studyLocation,
        graduationDate: form.graduationDate,
        retiredDate: form.retiredDate,
        pensionNo: form.pensionNo,
        isRetired: form.isRetired,
      },
    };

    // updateProfessionalDetailRequest(personalDetail?.ApplicationId, payload)
    //   .then(res => {
    //     if (res.status === 200) {
    //       toast.success('Membership category updated successfully');
    //       getProfessionalDetail();
    //     } else {
    //       toast.error(res.data?.message || 'Update failed');
    //     }
    //   })
    //   .catch(() => toast.error('Something went wrong'));
  };

  const getMembershipCategoryLabel = value => {
    const option = membershipCategoryOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'N/A';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Current Membership Category">
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Membership Category: </span>
            <span className="text-gray-800 font-medium">
              {getMembershipCategoryLabel(existing.membershipCategory)}
            </span>
          </div>
          {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Some category selections may require you to contact our Membership team.
            </p>
          </div> */}
        </div>
      </Card>

      <Card title="Update Membership Category">
        <div className="space-y-4">
          <Select
            label="Membership Category"
            name="membershipCategory"
            value={form.membershipCategory}
            onChange={handleInputChange}
            required
            tooltip="Please select the membership category most appropriate to yourselves. Some category selections will require you to contact our Membership team."
            placeholder="Select membership category"
            options={membershipCategoryOptions}
          />

          {/* Undergraduate Student Fields */}
          {form.membershipCategory === 'undergraduate_student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Study Location"
                name="studyLocation"
                value={form.studyLocation}
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
                value={form.graduationDate}
                onChange={handleInputChange}
                disableAgeValidation
              />
            </div>
          )}

          {/* Retired Associate Fields */}
          {form.membershipCategory === 'retired_associate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Retired Date"
                  name="retiredDate"
                  value={form.retiredDate}
                  onChange={handleInputChange}
                  disableAgeValidation
                />
                <Input
                  label="Pension No"
                  name="pensionNo"
                  value={form.pensionNo}
                  onChange={handleInputChange}
                  placeholder="Enter your pension number"
                />
              </div>
            </div>
          )}

          <Divider className="my-2" />

          <Space>
            <Button type="primary" onClick={onSubmit}>
              Update Membership Category
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Membership;
