import React, { useEffect, useState } from 'react';
import { IdcardOutlined, CheckCircleOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
  };

  const formatPrice = (price, currency = 'EUR') => {
    if (!price) return 'N/A';
    const priceInEuros = price / 100;
    const currencySymbol = currency.toUpperCase() === 'EUR' ? '€' : currency.toUpperCase();
    return `${currencySymbol}${priceInEuros.toFixed(2)}`;
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-100/50 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-lg">
              <IdcardOutlined />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Membership Category
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Review your active membership designation, privileges, and request a category modification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Current Membership Category */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 sm:px-6 py-4 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircleOutlined className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins">Current Category</h3>
                <span className="text-[11px] font-semibold text-emerald-700">Active Membership</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-6">
            {currentCategory ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Assigned Tier
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {currentCategory.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {currentCategory.description || 'Standard membership tier.'}
                  </p>
                </div>

                {currentCategory.code && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category Code
                    </p>
                    <p className="text-sm font-bold text-slate-800 font-mono">
                      {currentCategory.code}
                    </p>
                  </div>
                )}

                {currentCategory.currentPricing && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                        Annual Subscription
                      </p>
                      <p className="text-3xl font-extrabold text-blue-900">
                        {formatPrice(
                          currentCategory.currentPricing.price,
                          currentCategory.currentPricing.currency
                        )}
                      </p>
                      {currentCategory.currentPricing.effectiveFrom && (
                        <p className="text-[11px] text-blue-600/80 mt-1 font-medium">
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
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl text-slate-400">
                  <IdcardOutlined />
                </div>
                <p className="text-slate-500 text-sm font-medium">No membership category assigned yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Membership Category */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 sm:px-6 py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                <EditOutlined className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins">Request Category Change</h3>
                <span className="text-[11px] font-semibold text-blue-700">Update Membership Tier</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Select
                label="New Membership Category"
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
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">Student Information</h4>
                  <div className="space-y-3">
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
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Retirement Information</h4>
                  <div className="space-y-3">
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
            </div>

            <div className="pt-2 space-y-3">
              <Button 
                type="primary"
                size="large"
                block
                onClick={onSubmit}>
                Submit Category Change
              </Button>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <InfoCircleOutlined className="text-blue-600 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Some category upgrades or concessions require verification from our member services department before activation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
