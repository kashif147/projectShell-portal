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
  const { workLocationLookups, fetchWorkLocationLookups } = useLookup();
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ workLocation: '', otherWorkLocation: '', branch: '', region: '', reasonToChange: '' });
  const [transferRequest, setTransferRequest] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  // Prioritize profile data over application data
  const existing = profileByIdDetail?.professionalDetails || professionalDetail?.professionalDetails || {};

  useEffect(() => {
    if (!workLocationLookups || workLocationLookups.length === 0) {
      fetchWorkLocationLookups?.();
    }
  }, []);

  useEffect(() => {
    getProfileDetail()
  }, []);

  useEffect(() => {
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
            
            // Populate form with requested location data
            setForm(prev => ({
              ...prev,
              workLocation: activeRequest.requestedWorkLocationName || '',
              branch: activeRequest.requestedBranchName || '',
              region: activeRequest.requestedRegionName || '',
              reasonToChange: activeRequest.reason || '',
            }));
          }
        }
      })
      .catch(error => {
        console.error('Error fetching transfer requests:', error);
      });
  }, []);

  useEffect(() => {
    // Only set form from existing data if there's no transfer request data
    if (!transferRequest) {
      setForm({
        workLocation: existing.workLocation || '',
        otherWorkLocation: existing.otherWorkLocation || '',
        branch: existing.branch || '',
        region: existing.region || '',
        reasonToChange: existing.reasonToChange || '',
      });
    }
  }, [professionalDetail, profileByIdDetail, transferRequest]);

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
                  
                  setForm(prev => ({
                    ...prev,
                    workLocation: activeRequest.requestedWorkLocationName || '',
                    branch: activeRequest.requestedBranchName || '',
                    region: activeRequest.requestedRegionName || '',
                    reasonToChange: activeRequest.reason || '',
                  }));
                }
              }
            })
            .catch(error => {
              console.error('Error refreshing transfer requests:', error);
            });
        } else {
          toast.error(res?.data?.message || 'Transfer request failed');
        }
      })
      .catch(error => {
        console.error('Transfer request error:', error);
        toast.error(error?.response?.data?.message || 'Something went wrong');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <EnvironmentOutlined className="text-3xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Location</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and update your work location details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Work Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircleOutlined className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Current Location</h3>
            </div>
          </div>

          <div className="p-6">
            {existing.workLocation ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Work Location
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {existing.workLocation}
                  </p>
                </div>

                {existing.otherWorkLocation && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Other Work Location
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {existing.otherWorkLocation}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Branch
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {existing.branch || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Region
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {existing.region || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <EnvironmentOutlined className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">No work location assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Update Work Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <EditOutlined className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Update Location</h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <Select
              label="Work Location"
              name="workLocation"
              value={form.workLocation}
              onChange={onChange}
              required
              disabled={hasPendingRequest}
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
              disabled={form.workLocation !== 'other' || hasPendingRequest}
              required={form.workLocation === 'other'}
              placeholder="Enter your work location"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Branch"
                name="branch"
                value={form.branch}
                onChange={onChange}
                disabled={form.workLocation !== 'other' || hasPendingRequest}
                required={form.workLocation === 'other'}
                placeholder="Select branch"
                options={form.workLocation === 'other' ? branchOptions : form.branch ? [{ value: form.branch, label: form.branch }] : branchOptions}
              />
              <Select
                label="Region"
                name="region"
                value={form.region}
                onChange={onChange}
                disabled={form.workLocation !== 'other' || hasPendingRequest}
                required={form.workLocation === 'other'}
                placeholder="Select region"
                options={form.workLocation === 'other' ? regionOptions : form.region ? [{ value: form.region, label: form.region }] : regionOptions}
              />
            </div>

            <Input
              label="Reason to Change"
              name="reasonToChange"
              required
              value={form.reasonToChange}
              onChange={onChange}
              disabled={hasPendingRequest}
              multiline
              placeholder="Please provide a reason for changing your work location"
              rows={4}
            />

            <div className="pt-4">
              <Button
                type="primary"
                onClick={onSubmit}
                disabled={hasPendingRequest}
                className="w-full bg-teal-600 hover:bg-teal-700 border-teal-600 h-11 text-base font-medium shadow-sm">
                Update Work Location
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Selecting a work location will automatically populate the branch and region fields.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkLocation;
