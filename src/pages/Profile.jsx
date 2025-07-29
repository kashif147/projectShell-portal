import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PersonalInformation from '../components/application/PersonalInformation';
import Button from '../components/common/Button';
import { useApplication } from '../contexts/applicationContext';
import { updatePersonalDetailRequest } from '../api/application.api';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const { personalDetail, getPersonalDetail } = useApplication()
  const [editMode, setEditMode] = useState(false);
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
        smsConsent: personalDetail?.contactInfo?.smsConsent ?? true,
        emailConsent: personalDetail?.contactInfo?.emailConsent ?? true,
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
  // useEffect(() => {
  //   const savedData = localStorage.getItem('applicationFormData');
  //   if (savedData) {
  //     const parsedData = JSON.parse(savedData);
  //     setPersonalInfo(parsedData.personalInfo);
  //   }
  // }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowValidation(false);
  };

  const handleSave = () => {
    const personalInfoData = {
      personalInfo: {
        title: personalInfo.title,
        surname: personalInfo.surname,
        forename: personalInfo.forename,
        gender: personalInfo.gender,
        dateOfBirth: personalInfo.dateOfBirth,
        countryPrimaryQualification: personalInfo.countryPrimaryQualification ?? '',
      },
      contactInfo: {
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
        consentSMS: personalInfo.smsConsent,
        consentEmail: personalInfo.emailConsent
      }
    }
    updatePersonalDetailRequest(personalInfoData)
      .then(res => {
        if (res.status === 200) {
          getPersonalDetail()
          toast.success('Personal Detail update successfully');
        } else {
          toast.error(res.data.message ?? 'Unable to update personal detail');
        }
      })
      .catch(() => toast.error('Something went wrong'));

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
            <p className="text-gray-500">{user?.role}</p>
            {/* {!editMode && (
              <Button
                type="primary"
                className="mt-4 w-full"
                onClick={handleEdit}>
                Edit Personal Information
              </Button>
            )} */}
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Personal Information">
          {/* // editMode ? ( */}
          <>
            <PersonalInformation
              formData={personalInfo}
              onFormDataChange={setPersonalInfo}
              showValidation={showValidation}
            />
            <div className="flex gap-2 mt-4">
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
              <Button type="default" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </>
          {/* // ) : (
          //   <Descriptions layout="vertical">
          //     <Descriptions.Item label="Full Name">
          //       {user?.userFirstName} {user?.userLastName}
          //     </Descriptions.Item>
          //     <Descriptions.Item label="Email">
          //       {user?.userEmail}
          //     </Descriptions.Item>
          //     <Descriptions.Item label="Mobile No">
          //       {user?.userMobilePhone}
          //     </Descriptions.Item>
          //     <Descriptions.Item label="Country">
          //       {user?.country || 'Ireland'}
          //     </Descriptions.Item>
          //     <Descriptions.Item label="Member Since">
          //       {user?.memberSince}
          //     </Descriptions.Item>
          //     <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
          //   </Descriptions>
          // ) */}
        </Card>
      </Col>
    </Row>
  );
};

export default Profile;
