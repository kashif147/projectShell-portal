import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import { SubscriptionModal } from '../components/modals';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); // Replace with your Stripe publishable key

const Application = () => {
  const { user } = useSelector(state => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      forename: user?.userFirstName || '',
      surname: user?.userLastName || '',
      personalEmail: user?.userEmail || '',
      mobileNo: user?.userMobilePhone || '',
      country: 'Ireland',
      smsConsent: true,
      emailConsent: true,
    },
    professionalDetails: {},
    subscriptionDetails: {},
  });
  const [showValidation, setShowValidation] = useState(false);

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Professional Details' },
    { number: 3, title: 'Subscription Details' },
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
      [stepName]: data,
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        const {
          forename,
          surname,
          gender,
          dateOfBirth,
          personalEmail,
          mobileNo,
          addressLine1,
          addressLine4,
        } = formData.personalInfo || {};
        if (
          !forename ||
          !surname ||
          !gender ||
          !dateOfBirth ||
          !personalEmail ||
          !mobileNo ||
          !addressLine1 ||
          !addressLine4
        ) {
          return false;
        }
        break;
      case 2:
        const { workLocation, grade, membershipCategory } =
          formData.professionalDetails || {};
        if (!grade || !workLocation || !membershipCategory) {
          return false;
        }
        break;
      case 3:
        const {
          paymentType,
          incomeProtectionScheme,
          inmoRewards,
          termsAndConditions,
          otherIrishTradeUnion,
          otherScheme,
          memberStatus,
          nursingAdaptationProgramme,
          nurseType,
          nmbiNumber
        } = formData.subscriptionDetails || {};
        if (!paymentType) return false;
        
        if (paymentType === 'deduction' && !formData.subscriptionDetails?.payrollNo) return false;

        if (nursingAdaptationProgramme === 'yes') {
          if (!nurseType || !nmbiNumber) return false;
        }

        if (!memberStatus) return false;

        if (!otherIrishTradeUnion || !otherScheme) return false;

        if (!termsAndConditions) return false;

        if (memberStatus === 'new' || memberStatus === 'graduate') {
          if (!incomeProtectionScheme || !inmoRewards) return false;
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
      setIsSubmitted(true);
      setIsModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleSubscriptionSuccess = () => {
    setIsModalVisible(false);
    // Redirect to dashboard or show success message
    window.location.href = '/';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInformation
            formData={formData.personalInfo}
            onFormDataChange={data =>
              handleFormDataChange('personalInfo', data)
            }
            showValidation={showValidation}
          />
        );
      case 2:
        return (
          <ProfessionalDetails
            formData={formData.professionalDetails}
            onFormDataChange={data =>
              handleFormDataChange('professionalDetails', data)
            }
            showValidation={showValidation}
          />
        );
      case 3:
        return (
          <SubscriptionDetails
            formData={formData.subscriptionDetails}
            onFormDataChange={data =>
              handleFormDataChange('subscriptionDetails', data)
            }
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-0">
        {steps.map(step => (
          <div key={step.number} className="flex items-center w-full sm:w-auto">
            <div className="flex items-center w-full sm:w-auto">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  isSubmitted && step.number === 3
                    ? 'bg-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-blue-500 text-white'
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }
              `}>
                {isSubmitted && step.number === 3 ? '✓' : currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="ml-2">
                <p
                  className={`text-sm whitespace-nowrap ${
                    isSubmitted && step.number === 3
                      ? 'text-green-500 font-semibold'
                      : currentStep === step.number
                      ? 'text-blue-500 font-semibold'
                      : 'text-gray-500'
                  }`}>
                  {step.title}
                </p>
              </div>
            </div>
            {step.number < steps.length && (
              <div
                className={`
                hidden sm:block flex-grow mx-2 h-1 min-w-[16px]
                ${(isSubmitted && step.number === 2) || currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
              `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-4">{renderStepContent()}</Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}>
          Previous
        </Button>
        <Button
          type="primary"
          onClick={currentStep === steps.length ? handleSubmit : handleNext}>
          {currentStep === steps.length ? 'Submit' : 'Next'}
        </Button>
      </div>

      {/* Subscription Modal with Stripe Integration */}
      <Elements stripe={stripePromise}>
        <SubscriptionModal
          isVisible={isModalVisible}
          onClose={handleModalClose}
          onSuccess={handleSubscriptionSuccess}
          membershipCategory={formData.professionalDetails.membershipCategory}
        />
      </Elements>
    </div>
  );
};

export default Application;
