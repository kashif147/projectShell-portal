import React, { useEffect, useState } from 'react';
import { IdcardOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import { updateProfessionalDetailRequest } from '../api/application.api';
import { toast } from 'react-toastify';
import Select from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import Button from '../components/common/Button';

const Membership = () => {
  const { personalDetail, professionalDetail, getProfessionalDetail } =
    useApplication();
  const { categoryLookups } = useLookup();
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

  const membershipCategoryOptions = (categoryLookups || []).map(item => {
    const id = item?._id || item?.id;
    const label =
      item?.name ||
      item?.DisplayName ||
      item?.label ||
      item?.productType?.name ||
      item?.code;
    return {
      value: String(id || ''),
      label: String(label || ''),
      rawItem: item,
    };
  });

  const getCurrentCategory = () => {
    if (!existing.membershipCategory) return null;
    return categoryLookups?.find(
      item => String(item?._id || item?.id) === String(existing.membershipCategory)
    );
  };

  const currentCategory = getCurrentCategory();

  const isCategoryCode = (code) => {
    const selected = categoryLookups?.find(
      item => String(item?._id || item?.id) === String(form.membershipCategory)
    );
    return selected?.code === code;
  };

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

  const formatPrice = (price, currency = 'EUR') => {
    if (!price) return 'N/A';
    const priceInEuros = price / 100;
    const currencySymbol = currency.toUpperCase() === 'EUR' ? '€' : currency.toUpperCase();
    return `${currencySymbol}${priceInEuros.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <IdcardOutlined className="text-3xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membership Category</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and update your membership category
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Membership Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircleOutlined className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current Membership</h3>
            </div>
          </div>

          <div className="p-6">
            {currentCategory ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Category Name
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {currentCategory.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentCategory.description || 'No description available'}
                  </p>
                </div>

                {currentCategory.code && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Category Code
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {currentCategory.code}
                    </p>
                  </div>
                )}

                {currentCategory.currentPricing && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Annual Fee</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatPrice(
                          currentCategory.currentPricing.price,
                          currentCategory.currentPricing.currency
                        )}
                      </p>
                      {currentCategory.currentPricing.effectiveFrom && (
                        <p className="text-xs text-gray-600 mt-2">
                          Valid: {new Date(currentCategory.currentPricing.effectiveFrom).toLocaleDateString('en-GB')}
                          {currentCategory.currentPricing.effectiveTo && 
                            ` - ${new Date(currentCategory.currentPricing.effectiveTo).toLocaleDateString('en-GB')}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IdcardOutlined className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">No membership category assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Membership Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <EditOutlined className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Update Category</h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <Select
              label="Membership Category"
              name="membershipCategory"
              value={form.membershipCategory}
              onChange={handleInputChange}
              required
              tooltip="Please select the membership category most appropriate to yourselves."
              placeholder="Select membership category"
              options={membershipCategoryOptions}
            />

            {/* Undergraduate Student Fields */}
            {isCategoryCode('MEM-UG') && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Student Information</h4>
                <div className="grid grid-cols-1 gap-4">
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
              </div>
            )}

            {/* Retired Associate Fields */}
            {isCategoryCode('MEM-RET') && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
                <h4 className="text-sm font-semibold text-gray-900">Retirement Information</h4>
                <div className="grid grid-cols-1 gap-4">
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

            <div className="pt-4">
              <Button 
                type="primary" 
                onClick={onSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600 h-11 text-base font-medium shadow-sm">
                Update Membership Category
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Some category selections may require you to contact our Membership team for verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
