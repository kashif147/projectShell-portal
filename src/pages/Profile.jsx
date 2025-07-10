import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PersonalInformation from '../components/application/PersonalInformation';
import Button from '../components/common/Button';

const mapUserToPersonalInfo = user => ({
  forename: user?.userFirstName || '',
  surname: user?.userLastName || '',
  personalEmail: user?.userEmail || '',
  mobileNo: user?.userMobilePhone || '',
  country: user?.country || 'Ireland',
  smsConsent: user?.smsConsent ?? true,
  emailConsent: user?.emailConsent ?? true,
});

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(mapUserToPersonalInfo(user));
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('applicationFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setPersonalInfo(parsedData.personalInfo);
    }
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowValidation(false);
  };

  const handleSave = () => {
    if (
      !personalInfo.forename ||
      !personalInfo.surname ||
      !personalInfo.personalEmail
    ) {
      setShowValidation(true);
      return;
    }
    setEditMode(false);
    setShowValidation(false);
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
            {!editMode && (
              <Button
                type="primary"
                className="mt-4 w-full"
                onClick={handleEdit}>
                Edit Personal Information
              </Button>
            )}
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Personal Information">
          {editMode ? (
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
          ) : (
            <Descriptions layout="vertical">
              <Descriptions.Item label="Full Name">
                {user?.userFirstName} {user?.userLastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user?.userEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile No">
                {user?.userMobilePhone}
              </Descriptions.Item>
              <Descriptions.Item label="Country">
                {user?.country || 'Ireland'}
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {user?.memberSince}
              </Descriptions.Item>
              <Descriptions.Item label="Role">{user?.role}</Descriptions.Item>
            </Descriptions>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default Profile;
