import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PersonalInformation from '../components/application/PersonalInformation';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { useProfile } from '../contexts/profileContext';
import { updatePersonalDetailRequest } from '../api/application.api';
import { updateProfileRequest } from '../api/profile.api';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';
import { isDataFormat } from '../helpers/date.helper';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const { personalDetail, getPersonalDetail } = useApplication();
  const { profileByIdDetail, getProfileByIdDetail, profileDetail } = useProfile();
  const [loading, setLoading] = React.useState(false);
  const [personalInfo, setPersonalInfo] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!personalDetail && !profileByIdDetail) return;

    const profilePersonalInfo = profileByIdDetail?.personalInfo || {};
    const profileContactInfo = profileByIdDetail?.contactInfo || {};
    const profilePreferences = profileByIdDetail?.preferences || {};

    const appPersonalInfo = personalDetail?.personalInfo || {};
    const appContactInfo = personalDetail?.contactInfo || {};

    setPersonalInfo({
      // Personal info - prefer profile, fallback to application
      title: profilePersonalInfo.title ?? appPersonalInfo.title ?? '',
      surname: profilePersonalInfo.surname ?? appPersonalInfo.surname ?? '',
      forename: profilePersonalInfo.forename ?? appPersonalInfo.forename ?? '',
      gender: profilePersonalInfo.gender ?? appPersonalInfo.gender ?? '',
      dateOfBirth:
        profilePersonalInfo.dateOfBirth ??
        appPersonalInfo.dateOfBirth ??
        '',
      countryPrimaryQualification:
        profilePersonalInfo.countryPrimaryQualification ??
        appPersonalInfo.countryPrimaryQualification ??
        '',

      // Contact info - prefer profile, fallback to application
      personalEmail:
        profileContactInfo.personalEmail ??
        appContactInfo.personalEmail ??
        '',
      mobileNo:
        profileContactInfo.mobileNumber ??
        appContactInfo.mobileNumber ??
        '',
      consent:
        profilePreferences.consent ??
        appContactInfo.consent ??
        false,
      addressLine1:
        profileContactInfo.buildingOrHouse ??
        appContactInfo.buildingOrHouse ??
        '',
      addressLine2:
        profileContactInfo.streetOrRoad ??
        appContactInfo.streetOrRoad ??
        '',
      addressLine3:
        profileContactInfo.areaOrTown ??
        appContactInfo.areaOrTown ??
        '',
      addressLine4:
        profileContactInfo.countyCityOrPostCode ??
        appContactInfo.countyCityOrPostCode ??
        '',
      eircode:
        profileContactInfo.eircode ??
        appContactInfo.eircode ??
        '',
      preferredAddress:
        profileContactInfo.preferredAddress ??
        appContactInfo.preferredAddress ??
        '',
      preferredEmail:
        profileContactInfo.preferredEmail ??
        appContactInfo.preferredEmail ??
        '',
      homeWorkTelNo:
        profileContactInfo.telephoneNumber ??
        appContactInfo.telephoneNumber ??
        '',
      country:
        profileContactInfo.country ??
        appContactInfo.country ??
        '',
      workEmail:
        profileContactInfo.workEmail ??
        appContactInfo.workEmail ??
        '',
    });
  }, [personalDetail, profileByIdDetail]);

  const handleCancel = () => {
    setShowValidation(false);
  };

  const updatePersonalDetail = () => {
    setLoading(true);

    const personalInfoData = {};

    const personalFields = {
      title: personalInfo.title,
      surname: personalInfo.surname,
      forename: personalInfo.forename,
      gender: personalInfo.gender,
      dateOfBirth:
        personalInfo.dateOfBirth && isDataFormat(personalInfo.dateOfBirth),
      countryPrimaryQualification:
        personalInfo.countryPrimaryQualification ?? '',
    };

    personalInfoData.personalInfo = {};
    Object.entries(personalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfoData.personalInfo[key] = value;
      }
    });

    const contactFields = {
      preferredAddress: personalInfo.preferredAddress,
      eircode: personalInfo.eircode ?? '',
      buildingOrHouse: personalInfo.addressLine1,
      streetOrRoad: personalInfo.addressLine2 ?? '',
      areaOrTown: personalInfo.addressLine3 ?? '',
      countyCityOrPostCode: personalInfo.addressLine4,
      country: personalInfo.country ?? '',
      mobileNumber: personalInfo.mobileNo,
      telephoneNumber: personalInfo.homeWorkTelNo ?? '',
      preferredEmail: personalInfo.preferredEmail,
      personalEmail: personalInfo.personalEmail ?? '',
      workEmail: personalInfo.workEmail ?? '',
      consent: personalInfo.consent,
    };

    personalInfoData.contactInfo = {};
    Object.entries(contactFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        personalInfoData.contactInfo[key] = value;
      }
    });

    // Build payload for profile update API (preferences.consent)
    const profileContactFields = {
      preferredAddress: personalInfo.preferredAddress,
      buildingOrHouse: personalInfo.addressLine1,
      streetOrRoad: personalInfo.addressLine2 ?? '',
      areaOrTown: personalInfo.addressLine3 ?? '',
      eircode: personalInfo.eircode ?? '',
      countyCityOrPostCode: personalInfo.addressLine4,
      country: personalInfo.country ?? '',
      mobileNumber: personalInfo.mobileNo,
      telephoneNumber: personalInfo.homeWorkTelNo ?? '',
      preferredEmail: personalInfo.preferredEmail,
      personalEmail: personalInfo.personalEmail ?? '',
      workEmail: personalInfo.workEmail ?? '',
    };

    const profilePayload = {
      personalInfo: personalInfoData.personalInfo,
      contactInfo: {},
      preferences: {
        consent: !!personalInfo.consent,
      },
    };

    Object.entries(profileContactFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        profilePayload.contactInfo[key] = value;
      }
    });

    const requests = [];

    if (personalDetail?.ApplicationId) {
      requests.push(
        updatePersonalDetailRequest(personalDetail.ApplicationId, personalInfoData),
      );
    }

    if (profileByIdDetail) {
      requests.push(updateProfileRequest(profilePayload));
    }

    if (!requests.length) {
      setLoading(false);
      toast.error('No application or profile found to update');
      return;
    }

    Promise.all(requests)
      .then(responses => {
        const allOk = responses.every(res => res.status === 200);

        if (allOk) {
          if (personalDetail?.ApplicationId) {
            getPersonalDetail();
          }
          if (profileDetail?.profileId) {
            getProfileByIdDetail(profileDetail?.profileId);
          }
          toast.success('Personal Detail update successfully');
        } else {
          const firstError = responses.find(r => r.status !== 200);
          toast.error(
            firstError?.data?.message ?? 'Unable to update personal detail',
          );
        }
      })
      .catch(() => {
        toast.error('Something went wrong');
      })
      .finally(() => {
        setLoading(false);
      });
  };


  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <div className="text-center">
            <Avatar size={120} src={user?.avatar} icon={<UserOutlined />} />
            <h2 className="mt-4 text-xl font-bold">
              {user?.userFirstName || ''} {user?.userLastName || ''}
            </h2>
            <p className="text-gray-500">{profileDetail?.profileId ?'Member' : 'Non Member'}</p>
          </div>
        </Card>
      </Col>
      {loading ? <Spinner /> : (
        <Col xs={24} md={16}>
            <PersonalInformation
              formData={personalInfo}
              onFormDataChange={setPersonalInfo}
              showValidation={showValidation}
            />
            <div className="flex gap-2 mt-4">
              <Button type="primary" onClick={updatePersonalDetail}>
                Save
              </Button>
              <Button type="default" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
        </Col>
      )}
    </Row>
  );
};

export default Profile;
