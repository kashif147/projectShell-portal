import React, { useEffect, useState } from 'react';
import { Card, Divider, Space } from 'antd';
import { useApplication } from '../contexts/applicationContext';
import { updateProfessionalDetailRequest } from '../api/application.api';
import { toast } from 'react-toastify';
import Select from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import Button from '../components/common/Button';

// Reuse the same work location options and mapping logic as ProfessionalDetails
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

const WorkLocation = () => {
  const { personalDetail, professionalDetail, getProfessionalDetail } = useApplication();
  const [form, setForm] = useState({ workLocation: '', otherWorkLocation: '', branch: '', region: '' });
  const existing = professionalDetail?.professionalDetails || {};

  useEffect(() => {
    setForm({
      workLocation: existing.workLocation || '',
      otherWorkLocation: existing.otherWorkLocation || '',
      branch: existing.branch || '',
      region: existing.region || '',
    });
  }, [professionalDetail]);

  const onChange = e => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'workLocation') {
      if (value === 'other') {
        updated.branch = '';
        updated.region = '';
      } else if (workLocationDetails[value]) {
        updated.branch = workLocationDetails[value].branch;
        updated.region = workLocationDetails[value].region;
      }
    }
    setForm(updated);
  };

  const onSubmit = () => {
    const payload = { professionalDetails: {} };
    if (form.workLocation) payload.professionalDetails.workLocation = form.workLocation;
    if (form.otherWorkLocation) payload.professionalDetails.otherWorkLocation = form.otherWorkLocation;
    if (form.branch) payload.professionalDetails.branch = form.branch;
    if (form.region) payload.professionalDetails.region = form.region;

    // updateProfessionalDetailRequest(personalDetail?.ApplicationId, payload)
    //   .then(res => {
    //     if (res.status === 200) {
    //       toast.success('Work location updated');
    //       getProfessionalDetail();
    //     } else {
    //       toast.error(res.data?.message || 'Update failed');
    //     }
    //   })
    //   .catch(() => toast.error('Something went wrong'));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Current Details">
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500">Work Location: </span>
            <span className="text-gray-800">{existing.workLocation || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Other Work Location: </span>
            <span className="text-gray-800">{existing.otherWorkLocation || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Branch: </span>
            <span className="text-gray-800">{existing.branch || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Region: </span>
            <span className="text-gray-800">{existing.region || 'N/A'}</span>
          </div>
        </div>
      </Card>

      <Card title="Update Work Location">
        <div className="space-y-4">
          <Select
            label="Work Location"
            name="workLocation"
            value={form.workLocation}
            onChange={onChange}
            required
            options={[...workLocations.map(loc => ({ value: loc, label: loc })), { value: 'other', label: 'other' }]}
          />
          <Input
            label="Other Work Location"
            name="otherWorkLocation"
            value={form.otherWorkLocation}
            onChange={onChange}
            disabled={form.workLocation !== 'other'}
            placeholder="Enter your other work location"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Branch" 
              name="branch" 
              value={form.branch} 
              onChange={onChange} 
              disabled={form.workLocation !== 'other'}
              required={form.workLocation === 'other'}
              options={form.workLocation === 'other' ? 
                Array.from(new Set(Object.values(workLocationDetails).map(d => d.branch))).map(branch => ({ value: branch, label: branch })) : 
                form.workLocation && workLocationDetails[form.workLocation] ? 
                [{ value: workLocationDetails[form.workLocation].branch, label: workLocationDetails[form.workLocation].branch }] : 
                []
              }
            />
            <Select 
              label="Region" 
              name="region" 
              value={form.region} 
              onChange={onChange} 
              disabled={form.workLocation !== 'other'}
              required={form.workLocation === 'other'}
              options={form.workLocation === 'other' ? 
                Array.from(new Set(Object.values(workLocationDetails).map(d => d.region))).map(region => ({ value: region, label: region })) : 
                form.workLocation && workLocationDetails[form.workLocation] ? 
                [{ value: workLocationDetails[form.workLocation].region, label: workLocationDetails[form.workLocation].region }] : 
                []
              }
            />
          </div>
          <Divider className="my-2" />
          <Space>
            <Button type="primary" onClick={onSubmit}>Update</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default WorkLocation;
