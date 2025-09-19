import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PersonalInformation from '../components/application/PersonalInformation';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { updatePersonalDetailRequest } from '../api/application.api';
import Spinner from '../components/common/Spinner';
import { isDataFormat } from '../helpers/date.helper';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const { personalDetail, getPersonalDetail } = useApplication()
  const [loading, setLoading] = React.useState(false);
  const [personalInfo, setPersonalInfo] = useState({});
  const [showValidation, setShowValidation] = useState(false);


  useEffect(() => {
    if (personalDetail) {
      setPersonalInfo({
        title: personalDetail?.personalInfo?.title || '',
        surname: personalDetail?.personalInfo?.surname || '',
        forename: personalDetail?.personalInfo?.forename || '',
        gender: personalDetail?.personalInfo?.gender || '',
        dateOfBirth: personalDetail?.personalInfo?.dateOfBirth || '',
        countryPrimaryQualification: personalDetail?.personalInfo?.countryPrimaryQualification || '',
        personalEmail: personalDetail?.contactInfo?.personalEmail || '',
        mobileNo: personalDetail?.contactInfo?.mobileNumber || '',
        consent: personalDetail?.contactInfo?.consent ?? true,
        addressLine1: personalDetail?.contactInfo?.buildingOrHouse || '',
        addressLine2: personalDetail?.contactInfo?.streetOrRoad || '',
        addressLine3: personalDetail?.contactInfo?.areaOrTown || '',
        addressLine4: personalDetail?.contactInfo?.countyCityOrPostCode || '',
        eircode: personalDetail?.contactInfo?.eircode || '',
        preferredAddress: personalDetail?.contactInfo?.preferredAddress || '',
        preferredEmail: personalDetail?.contactInfo?.preferredEmail || '',
        homeWorkTelNo: personalDetail?.contactInfo?.telephoneNumber || '',
        country: personalDetail?.contactInfo?.country || '',
      });
    }
  }, [personalDetail])

  const handleCancel = () => {
    setShowValidation(false);
  };

  const updatePersonalDetail = () => {
    setLoading(true)
    const personalInfoData = {};

    const personalFields = {
      title: personalInfo.title,
      surname: personalInfo.surname,
      forename: personalInfo.forename,
      gender: personalInfo.gender,
      dateOfBirth: personalInfo.dateOfBirth && isDataFormat(personalInfo.dateOfBirth),
      countryPrimaryQualification: personalInfo.countryPrimaryQualification ?? '',
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

    updatePersonalDetailRequest(personalDetail?.ApplicationId, personalInfoData)
      .then(res => {
        if (res.status === 200) {
          getPersonalDetail();
          setLoading(false)
          toast.success('Personal Detail update successfully');
        } else {
          setLoading(false)
          toast.error(res.data.message ?? 'Unable to update personal detail');
        }
      })
      .catch(() => {
        setLoading(false)
        toast.error('Something went wrong')
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
            <p className="text-gray-500">{user?.role ?? 'Non Member'}</p>
          </div>
        </Card>
      </Col>
      {loading ? <Spinner /> : (
        <Col xs={24} md={16}>
          <Card title="Personal Information">
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
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default Profile;
