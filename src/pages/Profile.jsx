import React, { useEffect, useMemo, useState } from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PersonalInformation from '../components/application/PersonalInformation';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { useProfile } from '../contexts/profileContext';
import { useMemberRole } from '../hooks/useMemberRole';
import {
  createPersonalDetailRequest,
  updatePersonalDetailRequest,
} from '../api/application.api';
import { updateProfileRequest } from '../api/profile.api';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';
import { isDataFormat } from '../helpers/date.helper';
import { canAccessProfile, isProfileReadOnly } from '../helpers/role.helper';
import { isActiveApplicationPersonalDetail } from '../helpers/applicationPayload.helper';
import { normalizeMobileToE164 } from '../helpers/phone.helper';

const pickField = (primary, fallback, empty = '') =>
  primary ?? fallback ?? empty;

const getUserHandleDefaults = user => ({
  forename: user?.userFirstName || user?.firstName || '',
  surname: user?.userLastName || user?.lastName || '',
  personalEmail: user?.userEmail || user?.email || '',
  mobileNo: normalizeMobileToE164(
    user?.userMobilePhone || user?.mobilePhone || '',
  ),
});

const buildPersonalInfoState = ({
  isMember,
  personalDetail,
  profileByIdDetail,
  user,
}) => {
  const profilePersonalInfo = profileByIdDetail?.personalInfo || {};
  const profileContactInfo = profileByIdDetail?.contactInfo || {};
  const profilePreferences = profileByIdDetail?.preferences || {};

  const appPersonalInfo = personalDetail?.personalInfo || {};
  const appContactInfo = personalDetail?.contactInfo || {};
  const userDefaults = getUserHandleDefaults(user);

  // Same as application step 1: prefer GET API data, else auth user handle
  const personal = (profileValue, appValue, userValue = '') =>
    isMember
      ? pickField(profileValue, pickField(appValue, userValue))
      : pickField(appValue, pickField(profileValue, userValue));

  const contact = (profileValue, appValue, userValue = '') =>
    isMember
      ? pickField(profileValue, pickField(appValue, userValue))
      : pickField(appValue, pickField(profileValue, userValue));

  return {
    title: personal(profilePersonalInfo.title, appPersonalInfo.title),
    surname: personal(
      profilePersonalInfo.surname,
      appPersonalInfo.surname,
      userDefaults.surname,
    ),
    forename: personal(
      profilePersonalInfo.forename,
      appPersonalInfo.forename,
      userDefaults.forename,
    ),
    gender: personal(profilePersonalInfo.gender, appPersonalInfo.gender),
    dateOfBirth: personal(
      profilePersonalInfo.dateOfBirth,
      appPersonalInfo.dateOfBirth,
    ),
    countryPrimaryQualification: personal(
      profilePersonalInfo.countryPrimaryQualification,
      appPersonalInfo.countryPrimaryQualification,
    ),
    personalEmail: contact(
      profileContactInfo.personalEmail,
      appContactInfo.personalEmail,
      userDefaults.personalEmail,
    ),
    mobileNo: contact(
      profileContactInfo.mobileNumber,
      appContactInfo.mobileNumber,
      userDefaults.mobileNo,
    ),
    consent: isMember
      ? pickField(profilePreferences.consent, appContactInfo.consent, false)
      : pickField(appContactInfo.consent, profilePreferences.consent, false),
    addressLine1: contact(
      profileContactInfo.buildingOrHouse,
      appContactInfo.buildingOrHouse,
    ),
    addressLine2: contact(
      profileContactInfo.streetOrRoad,
      appContactInfo.streetOrRoad,
    ),
    addressLine3: contact(
      profileContactInfo.areaOrTown,
      appContactInfo.areaOrTown,
    ),
    addressLine4: contact(
      profileContactInfo.countyCityOrPostCode,
      appContactInfo.countyCityOrPostCode,
    ),
    eircode: contact(profileContactInfo.eircode, appContactInfo.eircode),
    preferredAddress: contact(
      profileContactInfo.preferredAddress,
      appContactInfo.preferredAddress,
    ),
    preferredEmail: contact(
      profileContactInfo.preferredEmail,
      appContactInfo.preferredEmail,
    ),
    homeWorkTelNo: contact(
      profileContactInfo.telephoneNumber,
      appContactInfo.telephoneNumber,
    ),
    country: contact(profileContactInfo.country, appContactInfo.country),
    workEmail: contact(profileContactInfo.workEmail, appContactInfo.workEmail),
  };
};

const assignDefinedFields = (target, fields) => {
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      target[key] = value;
    }
  });
  return target;
};

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { isMember } = useMemberRole();
  const {
    personalDetail,
    getPersonalDetail,
    applicationStatus,
  } = useApplication();
  const { profileByIdDetail, getProfileByIdDetail, profileDetail } =
    useProfile();
  const [loading, setLoading] = React.useState(false);
  const [personalInfo, setPersonalInfo] = useState(() =>
    buildPersonalInfoState({
      isMember,
      personalDetail: null,
      profileByIdDetail: null,
      user,
    }),
  );
  const [showValidation, setShowValidation] = useState(false);

  const profileAccessArgs = useMemo(
    () => ({
      isMember,
      applicationStatus:
        applicationStatus ?? personalDetail?.applicationStatus,
      isActive: personalDetail
        ? isActiveApplicationPersonalDetail(personalDetail)
        : undefined,
    }),
    [isMember, applicationStatus, personalDetail],
  );

  const showProfile = useMemo(
    () => canAccessProfile(profileAccessArgs),
    [profileAccessArgs],
  );

  const isReadOnly = useMemo(
    () => isProfileReadOnly(profileAccessArgs),
    [profileAccessArgs],
  );

  useEffect(() => {
    if (!showProfile) {
      navigate('/');
    }
  }, [showProfile, navigate]);

  useEffect(() => {
    getPersonalDetail?.();
  }, [getPersonalDetail]);

  useEffect(() => {
    if (isMember && profileDetail?.profileId) {
      getProfileByIdDetail(profileDetail.profileId);
    }
  }, [isMember, profileDetail?.profileId, getProfileByIdDetail]);

  useEffect(() => {
    setPersonalInfo(
      buildPersonalInfoState({
        isMember,
        personalDetail,
        profileByIdDetail,
        user,
      }),
    );
  }, [isMember, personalDetail, profileByIdDetail, user]);

  const handleCancel = () => {
    setShowValidation(false);
    setPersonalInfo(
      buildPersonalInfoState({
        isMember,
        personalDetail,
        profileByIdDetail,
        user,
      }),
    );
  };

  const buildPortalPayload = () => {
    const personalInfoData = {
      personalInfo: {},
      contactInfo: {},
    };

    assignDefinedFields(personalInfoData.personalInfo, {
      title: personalInfo.title,
      surname: personalInfo.surname,
      forename: personalInfo.forename,
      gender: personalInfo.gender,
      dateOfBirth:
        personalInfo.dateOfBirth && isDataFormat(personalInfo.dateOfBirth),
      countryPrimaryQualification:
        personalInfo.countryPrimaryQualification ?? '',
    });

    assignDefinedFields(personalInfoData.contactInfo, {
      preferredAddress: personalInfo.preferredAddress,
      eircode: personalInfo.eircode ?? '',
      buildingOrHouse: personalInfo.addressLine1,
      streetOrRoad: personalInfo.addressLine2 ?? '',
      areaOrTown: personalInfo.addressLine3 ?? '',
      countyCityOrPostCode: personalInfo.addressLine4,
      country: personalInfo.country ?? '',
      mobileNumber: normalizeMobileToE164(personalInfo.mobileNo),
      telephoneNumber: personalInfo.homeWorkTelNo ?? '',
      preferredEmail: personalInfo.preferredEmail,
      personalEmail: personalInfo.personalEmail ?? '',
      workEmail: personalInfo.workEmail ?? '',
      consent: personalInfo.consent,
    });

    return personalInfoData;
  };

  const buildProfilePayload = () => {
    const profilePayload = {
      personalInfo: {},
      contactInfo: {},
      preferences: {
        consent: !!personalInfo.consent,
      },
    };

    assignDefinedFields(profilePayload.personalInfo, {
      title: personalInfo.title,
      surname: personalInfo.surname,
      forename: personalInfo.forename,
      gender: personalInfo.gender,
      dateOfBirth:
        personalInfo.dateOfBirth && isDataFormat(personalInfo.dateOfBirth),
      countryPrimaryQualification:
        personalInfo.countryPrimaryQualification ?? '',
    });

    assignDefinedFields(profilePayload.contactInfo, {
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
    });

    return profilePayload;
  };

  const updatePersonalDetail = () => {
    if (isReadOnly) {
      return;
    }

    setLoading(true);

    if (isMember) {
      if (!profileByIdDetail && !profileDetail?.profileId) {
        setLoading(false);
        toast.error('No profile found to update');
        return;
      }

      updateProfileRequest(buildProfilePayload())
        .then(res => {
          if (res.status === 200) {
            if (profileDetail?.profileId) {
              getProfileByIdDetail(profileDetail.profileId);
            }
            toast.success('Personal Detail update successfully');
          } else {
            toast.error(
              res?.data?.message ?? 'Unable to update personal detail',
            );
          }
        })
        .catch(() => {
          toast.error('Something went wrong');
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    const portalPayload = buildPortalPayload();
    const applicationId = personalDetail?.applicationId;

    const portalRequest = applicationId
      ? updatePersonalDetailRequest(applicationId, portalPayload)
      : createPersonalDetailRequest(portalPayload);

    portalRequest
      .then(res => {
        if (res.status === 200) {
          getPersonalDetail();
          toast.success(
            applicationId
              ? 'Personal Detail update successfully'
              : 'Personal Detail created successfully',
          );
        } else {
          toast.error(
            res?.data?.message ?? 'Unable to save personal detail',
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

  if (!showProfile) {
    return null;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <div className="text-center">
            <Avatar size={120} src={user?.avatar} icon={<UserOutlined />} />
            <h2 className="mt-4 text-xl font-bold">
              {user?.userFirstName || user?.firstName || ''}{' '}
              {user?.userLastName || user?.lastName || ''}
            </h2>
            <p className="text-gray-500">
              {isMember ? 'Member' : 'Non Member'}
            </p>
          </div>
        </Card>
      </Col>
      {loading ? (
        <Spinner />
      ) : (
        <Col xs={24} md={16}>
          <PersonalInformation
            formData={personalInfo}
            onFormDataChange={setPersonalInfo}
            showValidation={showValidation}
          />
          <div className="flex gap-2 mt-4">
            <Button
              type="primary"
              onClick={updatePersonalDetail}
              disabled={isReadOnly}>
              Save
            </Button>
            <Button type="default" onClick={handleCancel} disabled={isReadOnly}>
              Cancel
            </Button>
          </div>
        </Col>
      )}
    </Row>
  );
};

export default Profile;
