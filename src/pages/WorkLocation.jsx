import React, { useEffect, useState } from 'react';
import { EnvironmentOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useApplication } from '../contexts/applicationContext';
import { useProfile } from '../contexts/profileContext';
import { useLookup } from '../contexts/lookupContext';
import { profileRequest, fetchTransferRequest } from '../api/profile.api';
import { toast } from 'react-toastify';
import Select from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import Button from '../components/common/Button';

const WorkLocation = () => {
  const { professionalDetail, getProfessionalDetail } = useApplication();
  const { profileByIdDetail, getProfileDetail } = useProfile();
  const { workLocationLookups } = useLookup();
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({ workLocation: '', otherWorkLocation: '', branch: '', region: '', reasonToChange: '' });
  const [transferRequest, setTransferRequest] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  // Prioritize profile data over application data
  const existing = profileByIdDetail?.professionalDetails || professionalDetail?.professionalDetails || {};

  useEffect(() => {
    getProfileDetail()
  }, []);

  useEffect(() => {
    setInitialLoading(true);
    fetchTransferRequest()
      .then(res => {
        if (res?.status === 200 && res?.data?.success && res?.data?.data?.length > 0) {
          const requests = res.data.data;
          // Find the most recent PENDING request, or the latest request if no PENDING exists
          const pendingRequest = requests.find(req => req.status === 'PENDING');
          const latestRequest = requests.sort((a, b) => 
            new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt)
          )[0];
          
          const activeRequest = pendingRequest || latestRequest;
          
          if (activeRequest) {
            setTransferRequest(activeRequest);
            setHasPendingRequest(activeRequest.status === 'PENDING');
            
            // Only populate form if there's a PENDING request
            if (activeRequest.status === 'PENDING') {
              setForm(prev => ({
                ...prev,
                workLocation: activeRequest.requestedWorkLocationName || '',
                branch: activeRequest.requestedBranchName || '',
                region: activeRequest.requestedRegionName || '',
                reasonToChange: activeRequest.reason || '',
              }));
            } else {
              // Clear form if no pending request
              setForm({
                workLocation: '',
                otherWorkLocation: '',
                branch: '',
                region: '',
                reasonToChange: '',
              });
            }
          } else {
            // No requests found, clear form
            setTransferRequest(null);
            setHasPendingRequest(false);
            setForm({
              workLocation: '',
              otherWorkLocation: '',
              branch: '',
              region: '',
              reasonToChange: '',
            });
          }
        } else {
          // No requests found, clear form
          setTransferRequest(null);
          setHasPendingRequest(false);
          setForm({
            workLocation: '',
            otherWorkLocation: '',
            branch: '',
            region: '',
            reasonToChange: '',
          });
        }
        setInitialLoading(false);
      })
      .catch(error => {
        console.error('Error fetching transfer requests:', error);
        // On error, clear form
        setTransferRequest(null);
        setHasPendingRequest(false);
        setForm({
          workLocation: '',
          otherWorkLocation: '',
          branch: '',
          region: '',
          reasonToChange: '',
        });
        setInitialLoading(false);
      });
  }, []);

  useEffect(() => {
    // Only set form from existing data if there's no transfer request data and no pending request
    if (!transferRequest && !hasPendingRequest) {
      // Keep form empty - don't populate with existing data
      // User should fill the form manually
      setForm({
        workLocation: '',
        otherWorkLocation: '',
        branch: '',
        region: '',
        reasonToChange: '',
      });
    }
  }, [professionalDetail, profileByIdDetail, transferRequest, hasPendingRequest]);

  const workLocationOptions = (workLocationLookups || []).map(item => {
    const name = item?.lookup?.DisplayName || item?.lookup?.lookupname || '';
    const id = item?.lookup?._id || item?.lookup?.id || '';
    return { value: name, label: name, id };
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

  const onChange = e => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'workLocation') {
      if (value === 'other') {
        updated.branch = '';
        updated.region = '';
      } else {
        const selected = (workLocationLookups || []).find(
          i => (i?.lookup?.DisplayName || i?.lookup?.lookupname) === value,
        );
        if (selected) {
          updated.branch = selected?.branch?.DisplayName || selected?.branch?.lookupname || '';
          updated.region = selected?.region?.DisplayName || selected?.region?.lookupname || '';
        }
      }
    }
    setForm(updated);
  };

  const onSubmit = () => {
    const currentWorkLocationItem = (workLocationLookups || []).find(
      item => (item?.lookup?.DisplayName || item?.lookup?.lookupname) === existing.workLocation
    );
    const currentWorkLocationId = currentWorkLocationItem?.lookup?._id || currentWorkLocationItem?.lookup?.id;

    let requestedWorkLocationId = null;
    if (form.workLocation && form.workLocation !== 'other') {
      const requestedWorkLocationItem = (workLocationLookups || []).find(
        item => (item?.lookup?.DisplayName || item?.lookup?.lookupname) === form.workLocation
      );
      requestedWorkLocationId = requestedWorkLocationItem?.lookup?._id || requestedWorkLocationItem?.lookup?.id;
    }

    if (!form.workLocation) {
      toast.error('Please select a work location');
      return;
    }

    if (form.workLocation === 'other') {
      toast.error('Please select a work location from the list. Transfer requests require a valid work location ID.');
      return;
    }

    if (!currentWorkLocationId) {
      toast.error('Current work location not found. Please contact support.');
      return;
    }

    if (!requestedWorkLocationId) {
      toast.error('Requested work location not found. Please select a valid work location.');
      return;
    }

    if (!form.reasonToChange || form.reasonToChange.trim() === '') {
      toast.error('Please provide a reason for changing your work location');
      return;
    }
setLoading(true);
    const transferPayload = {
      currentWorkLocationId,
      requestedWorkLocationId,
      reason: form.reasonToChange,
    };

    profileRequest(transferPayload)
      .then(res => {
        if (res?.status === 200 || res?.status === 201) {
          toast.success('Work location transfer request submitted successfully');
          // Refresh both profile and application data
          getProfileDetail?.();
          getProfessionalDetail?.();
          // Refresh transfer requests to get the new PENDING status
          fetchTransferRequest()
            .then(transferRes => {
              if (transferRes?.status === 200 && transferRes?.data?.success && transferRes?.data?.data?.length > 0) {
                const requests = transferRes.data.data;
                const pendingRequest = requests.find(req => req.status === 'PENDING');
                const latestRequest = requests.sort((a, b) => 
                  new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt)
                )[0];
                
                const activeRequest = pendingRequest || latestRequest;
                
                if (activeRequest) {
                  setTransferRequest(activeRequest);
                  setHasPendingRequest(activeRequest.status === 'PENDING');
                  
                  // Only populate form if there's a PENDING request
                  if (activeRequest.status === 'PENDING') {
                    setForm(prev => ({
                      ...prev,
                      workLocation: activeRequest.requestedWorkLocationName || '',
                      branch: activeRequest.requestedBranchName || '',
                      region: activeRequest.requestedRegionName || '',
                      reasonToChange: activeRequest.reason || '',
                    }));
                    setLoading(false);
                  } else {
                    // Clear form if no pending request
                    setForm({
                      workLocation: '',
                      otherWorkLocation: '',
                      branch: '',
                      region: '',
                      reasonToChange: '',
                    });
                    setLoading(false);
                  }
                } else {
                  // No requests found, clear form
                  setTransferRequest(null);
                  setHasPendingRequest(false);
                  setForm({
                    workLocation: '',
                    otherWorkLocation: '',
                    branch: '',
                    region: '',
                    reasonToChange: '',
                  });
                  setLoading(false);
                }
              }
            })
            .catch(error => {
              console.error('Error refreshing transfer requests:', error);
              setLoading(false);
            });
        } else {
          toast.error(res?.data?.message || 'Transfer request failed');
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Transfer request error:', error);
        toast.error(error?.response?.data?.message || 'Something went wrong');
        setLoading(false);
      });
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-100/50 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600 text-lg">
              <EnvironmentOutlined />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Work Location & Branch
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            View your registered primary health facility, branch assignment, and submit formal transfer requests.
          </p>
        </div>
      </div>

      {hasPendingRequest && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 text-base flex-shrink-0">
            <EditOutlined />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Transfer Request Under Review
            </h4>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              You have a pending transfer request to <strong>{form.workLocation || 'another facility'}</strong>. Further modifications are locked until processed by branch administration.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Current Work Location */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 sm:px-6 py-4 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircleOutlined className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins">Current Assignment</h3>
                <span className="text-[11px] font-semibold text-emerald-700">Active Workplace</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-6">
            {existing.workLocation ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Primary Facility
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    {existing.workLocation}
                  </p>
                </div>

                {existing.otherWorkLocation && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Other Location Details
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {existing.otherWorkLocation}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Branch
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                      {existing.branch || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Assigned Region
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                      {existing.region || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl text-slate-400">
                  <EnvironmentOutlined />
                </div>
                <p className="text-slate-500 text-sm font-medium">No work location currently assigned.</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Work Location */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_10px_25px_-5px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col justify-between">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-5 sm:px-6 py-4 border-b border-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                <EditOutlined className="text-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins">Request Transfer</h3>
                <span className="text-[11px] font-semibold text-teal-700">Change Work Location</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Select
                label="Target Work Location"
                name="workLocation"
                value={form.workLocation}
                onChange={onChange}
                required
                disabled={hasPendingRequest || initialLoading}
                tooltip="Select your primary work location. If your location is not listed, choose 'Other'."
                placeholder="Select work location"
                options={[
                  ...workLocationOptions,
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Other Work Location"
                name="otherWorkLocation"
                value={form.otherWorkLocation}
                onChange={onChange}
                disabled={form.workLocation !== 'other' || hasPendingRequest || initialLoading}
                required={form.workLocation === 'other'}
                placeholder="Enter your work location"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Select
                  label="Branch"
                  name="branch"
                  value={form.branch}
                  onChange={onChange}
                  disabled={form.workLocation !== 'other' || hasPendingRequest || initialLoading}
                  required={form.workLocation === 'other'}
                  placeholder="Select branch"
                  options={form.workLocation === 'other' ? branchOptions : form.branch ? [{ value: form.branch, label: form.branch }] : branchOptions}
                />
                <Select
                  label="Region"
                  name="region"
                  value={form.region}
                  onChange={onChange}
                  disabled={form.workLocation !== 'other' || hasPendingRequest || initialLoading}
                  required={form.workLocation === 'other'}
                  placeholder="Select region"
                  options={form.workLocation === 'other' ? regionOptions : form.region ? [{ value: form.region, label: form.region }] : regionOptions}
                />
              </div>

              <Input
                label="Reason for Transfer"
                name="reasonToChange"
                required
                value={form.reasonToChange}
                onChange={onChange}
                disabled={hasPendingRequest || initialLoading}
                multiline
                placeholder="Please explain why you are requesting this work location transfer..."
                rows={3}
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                loading={loading || initialLoading}
                type="primary"
                size="large"
                block
                onClick={onSubmit}
                disabled={hasPendingRequest || initialLoading}>
                Submit Transfer Request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkLocation;
