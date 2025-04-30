import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';

const Application = () => {
  const { user } = useSelector(state => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      forename: user?.userFirstName || '',
      surname: user?.userLastName || '',
      email: user?.userEmail || '',
      mobileNo: user?.userMobilePhone || '',
      preferredAddress: 'home',
      country: 'ireland',
      preferredEmail: 'work',
      smsConsent: false,
      emailConsent: false
    },
    professionalDetails: {},
    subscriptionDetails: {}
  });
  const [showValidation, setShowValidation] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Professional Details' },
    { number: 3, title: 'Subscription Details' }
  ];

  const handleNext = () => {
    setShowValidation(true);
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setShowValidation(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormDataChange = (stepName, data) => {
    setFormData(prev => ({
      ...prev,
      [stepName]: data
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        const { forename, surname, gender, dateOfBirth, email, mobileNo, addressLine1, addressLine4 } = formData.personalInfo || {};
        if (!forename || !surname || !gender || !dateOfBirth || !email || !mobileNo || !addressLine1 || !addressLine4) {
          return false;
        }
        break;
      case 2:
        const { station, workLocation, rank, duty } = formData.professionalDetails || {};
        if (!station || !workLocation || !rank || !duty) {
          return false;
        }
        break;
      case 3:
        const { membershipType, paymentFrequency, cardNumber, cardHolderName, expiryDate, cvv } = formData.subscriptionDetails || {};
        if (!membershipType || !paymentFrequency || !cardNumber || !cardHolderName || !expiryDate || !cvv) {
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = () => {
    setShowValidation(true);
    if (validateCurrentStep()) {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      alert('Application submitted successfully!');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInformation
            formData={formData.personalInfo}
            onFormDataChange={(data) => handleFormDataChange('personalInfo', data)}
            showValidation={showValidation}
          />
        );
      case 2:
        return (
          <ProfessionalDetails
            formData={formData.professionalDetails}
            onFormDataChange={(data) => handleFormDataChange('professionalDetails', data)}
            showValidation={showValidation}
          />
        );
      case 3:
        return (
          <SubscriptionDetails
            formData={formData.subscriptionDetails}
            onFormDataChange={(data) => handleFormDataChange('subscriptionDetails', data)}
            showValidation={showValidation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      
      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${currentStep === step.number ? 'bg-blue-500 text-white' : 
                currentStep > step.number ? 'bg-green-500 text-white' : 'bg-gray-200'}
            `}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm ${currentStep === step.number ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
            {step.number < steps.length && (
              <div className={`w-full sm:w-16 h-1 mx-2 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-4">
        {renderStepContent()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={currentStep === steps.length ? handleSubmit : handleNext}
        >
          {currentStep === steps.length ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default Application; 