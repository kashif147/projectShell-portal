import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from 'react';
import { toast } from 'react-toastify';
import PersonalInformation from '../components/application/PersonalInformation';
import ProfessionalDetails from '../components/application/ProfessionalDetails';
import SubscriptionDetails from '../components/application/SubscriptionDetails';
import ApplicationFormStepper from '../components/application/ApplicationFormStepper';
import { PaymentStatusModal } from '../components/modals';
import Button from '../components/common/Button';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createPersonalDetailRequest,
  createProfessionalDetailRequest,
  createSubscriptionDetailRequest,
  updatePersonalDetailRequest,
  updateProfessionalDetailRequest,
  updateSubscriptionDetailRequest,
} from '../api/application.api';
import { useApplication } from '../contexts/applicationContext';
import { useLookup } from '../contexts/lookupContext';
import Spinner from '../components/common/Spinner';
import { isUndergraduateStudentMembership } from '../helpers/subscriptionPricing.helper';
import {
  detailBelongsToApplication,
  isResumablePortalApplication,
  resolveApplicationFormStep,
} from '../helpers/applicationPayload.helper';
import {
  INITIAL_STATUS_MODAL,
  APPLICATION_FORM_STEPS,
  createInitialApplicationFormData,
  buildApplicationPersonalInfo,
  buildApplicationProfessionalDetails,
  buildApplicationSubscriptionDetails,
  buildPersonalDetailPayload,
  buildProfessionalDetailPayload,
  buildSubscriptionDetailPayload,
  resolveSubscriptionPaymentFields,
  validateApplicationStep,
  getMissingRequiredFields,
  buildPaymentSuccessModal,
} from '../helpers/applicationForm.helper';
import SubscriptionWrapper from '../components/modals/SubscriptionWrapper';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formTopRef = useRef(null);
  const hasRestoredInitialStep = useRef(false);
  const { user } = useSelector(state => state.auth);
  const {
    personalDetail,
    refreshPortalPersonalDetail,
    isFormInitializing,
    getProfessionalDetail,
    professionalDetail,
    subscriptionDetail,
    getSubscriptionDetail,
    setCurrentStep,
    currentStep,
    categoryData,
    getCategoryData,
    applicationStatus,
  } = useApplication();
  const { categoryLookups, paymentLooups, lookupsReady } = useLookup();

  const hasActiveApplication = useMemo(
    () => isResumablePortalApplication(personalDetail, applicationStatus),
    [personalDetail, applicationStatus],
  );
  const activeApplicationId = hasActiveApplication
    ? personalDetail?.applicationId
    : null;
  const activeProfessionalDetail = useMemo(
    () =>
      detailBelongsToApplication(professionalDetail, activeApplicationId)
        ? professionalDetail
        : null,
    [professionalDetail, activeApplicationId],
  );
  const activeSubscriptionDetail = useMemo(
    () =>
      detailBelongsToApplication(subscriptionDetail, activeApplicationId)
        ? subscriptionDetail
        : null,
    [subscriptionDetail, activeApplicationId],
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState(INITIAL_STATUS_MODAL);
  const [showValidation, setShowValidation] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formData, setFormData] = useState(() =>
    createInitialApplicationFormData(user),
  );

  const applicationId =
    activeApplicationId ?? personalDetail?.applicationId ?? null;

  const stopLoading = () => setIsNextLoading(false);

  const handleRequestError = (fallback = 'Something went wrong') => {
    toast.error(fallback);
    stopLoading();
  };

  useEffect(() => {
    if (!hasActiveApplication) {
      hasRestoredInitialStep.current = false;
    }
  }, [hasActiveApplication]);

  useLayoutEffect(() => {
    if (isFormInitializing || hasRestoredInitialStep.current) return;

    const nextStep =
      !hasActiveApplication || !activeApplicationId
        ? 1
        : resolveApplicationFormStep({
            activeSubscriptionDetail,
            activeProfessionalDetail,
            activeApplicationId,
          });

    setCurrentStep(nextStep);
    hasRestoredInitialStep.current = true;
  }, [
    isFormInitializing,
    hasActiveApplication,
    activeApplicationId,
    activeSubscriptionDetail,
    activeProfessionalDetail,
    setCurrentStep,
  ]);

  useEffect(() => {
    if (!hasActiveApplication) {
      if (isFormInitializing) return;
      setCurrentStep(1);
      setIsSubmitted(false);
      setFormData(prev => ({
        ...prev,
        professionalDetails: {},
        subscriptionDetails: {},
      }));
      return;
    }

    if (!activeApplicationId) return;

    setFormData(prev => ({
      ...prev,
      personalInfo: buildApplicationPersonalInfo(
        personalDetail,
        prev.personalInfo,
      ),
    }));
  }, [hasActiveApplication, activeApplicationId, personalDetail, isFormInitializing, setCurrentStep]);

  useEffect(() => {
    if (!activeProfessionalDetail?.applicationId) return;

    const membershipCategory =
      activeProfessionalDetail?.professionalDetails?.membershipCategory;

    setFormData(prev => ({
      ...prev,
      professionalDetails: buildApplicationProfessionalDetails(
        activeProfessionalDetail,
        prev.professionalDetails,
      ),
    }));

    if (membershipCategory) {
      getCategoryData(membershipCategory, categoryLookups);
    }
  }, [
    activeProfessionalDetail,
    activeProfessionalDetail?.professionalDetails?.membershipCategory,
    getCategoryData,
    categoryLookups,
  ]);

  useEffect(() => {
    if (!activeSubscriptionDetail?.applicationId) return;
    setIsSubmitted(true);
    setFormData(prev => ({
      ...prev,
      subscriptionDetails: buildApplicationSubscriptionDetails(
        activeSubscriptionDetail,
        prev.subscriptionDetails,
      ),
    }));
  }, [activeSubscriptionDetail]);

  useEffect(() => {
    if (!shouldShowModal) return;
    setIsModalVisible(true);
    setShouldShowModal(false);
  }, [shouldShowModal]);

  useEffect(() => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isFormInitializing) return;
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }, [currentStep, isFormInitializing]);

  const isPageReady = !isFormInitializing && lookupsReady;

  const resolveMembershipCategory = () =>
    activeProfessionalDetail?.professionalDetails?.membershipCategory ||
    formData.professionalDetails?.membershipCategory ||
    '';

  const shouldSkipSubscriptionPayment = () =>
    isUndergraduateStudentMembership(resolveMembershipCategory(), categoryData);

  const savePersonalDetail = data => {
    const payload = buildPersonalDetailPayload(data);
    const request = hasActiveApplication
      ? updatePersonalDetailRequest(activeApplicationId, payload)
      : createPersonalDetailRequest(payload);

    request
      .then(res => {
        if (res.status === 200) {
          hasRestoredInitialStep.current = true;
          setCurrentStep(2);
          if (!hasActiveApplication) {
            const createdPersonal = res?.data?.data ?? res?.data;
            refreshPortalPersonalDetail(
              createdPersonal?.applicationId ? createdPersonal : null,
            );
          }
        } else {
          toast.error(
            res.data.message ??
              (hasActiveApplication
                ? 'Unable to update personal detail'
                : 'Unable to add personal detail'),
          );
        }
        stopLoading();
      })
      .catch(() => handleRequestError());
  };

  const saveProfessionalDetail = data => {
    const payload = buildProfessionalDetailPayload(data);
    const isUpdate = Boolean(activeProfessionalDetail);
    const request = isUpdate
      ? updateProfessionalDetailRequest(activeApplicationId, payload)
      : createProfessionalDetailRequest(applicationId, payload);

    request
      .then(res => {
        if (res.status === 200) {
          getProfessionalDetail(isUpdate ? activeApplicationId : applicationId);
          setCurrentStep(3);
        } else {
          toast.error(
            res.data.message ??
              (isUpdate
                ? 'Unable to update professional detail'
                : 'Unable to add professional detail'),
          );
        }
        stopLoading();
      })
      .catch(() => handleRequestError());
  };

  const saveSubscriptionDetail = async data => {
    const isUpdate = Boolean(activeSubscriptionDetail);
    try {
      const paymentFields = resolveSubscriptionPaymentFields({
        data,
        skipPayment: shouldSkipSubscriptionPayment(),
        paymentLookups: paymentLooups,
      });
      const payload = buildSubscriptionDetailPayload({
        data,
        membershipCategory: resolveMembershipCategory(),
        paymentFields,
      });
      const res = isUpdate
        ? await updateSubscriptionDetailRequest(activeApplicationId, payload)
        : await createSubscriptionDetailRequest(applicationId, payload);

      if (res.status !== 200) {
        toast.error(
          res.data.message ??
            (isUpdate
              ? 'Unable to update subscription detail'
              : 'Unable to add subscription detail'),
        );
        stopLoading();
        return;
      }

      getSubscriptionDetail(isUpdate ? activeApplicationId : applicationId);

      if (shouldSkipSubscriptionPayment()) {
        setIsSubmitted(true);
        setStatusModal({
          open: true,
          status: 'success',
          title: isUpdate ? undefined : 'Application submitted',
          message: isUpdate
            ? 'Application updated successfully!'
            : 'Your application has been submitted successfully and is now pending review.',
        });
      } else {
        setShouldShowModal(true);
      }
      stopLoading();
    } catch (error) {
      console.error('Subscription save failed:', error);
      handleRequestError(
        isUpdate
          ? 'Failed to update subscription. Please try again.'
          : 'Failed to process subscription. Please try again.',
      );
    }
  };

  const stepValidationArgs = {
    currentStep,
    personalInfo: formData.personalInfo,
    professionalDetails: formData.professionalDetails,
    subscriptionDetails: formData.subscriptionDetails,
  };

  const handleNext = () => {
    setShowValidation(true);
    if (!validateApplicationStep(stepValidationArgs)) {
      const missing = getMissingRequiredFields(stepValidationArgs);
      toast.error(
        missing.length > 0
          ? `Please fill in the required fields: ${missing.join(', ')}`
          : 'Please complete all required fields.',
      );
      return;
    }

    setIsNextLoading(true);
    setShowValidation(false);

    if (currentStep === 1) savePersonalDetail(formData.personalInfo);
    if (currentStep === 2) saveProfessionalDetail(formData.professionalDetails);
    if (currentStep === 3) saveSubscriptionDetail(formData.subscriptionDetails);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = stepNumber => {
    if (stepNumber === currentStep) return;
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      return;
    }
    if (stepNumber === currentStep + 1) {
      handleNext();
      return;
    }
    if (stepNumber > currentStep + 1) {
      toast.warning('Please complete the current step before proceeding');
    }
  };

  const handleFormDataChange = (stepName, data) => {
    setFormData(prev => ({ ...prev, [stepName]: data }));
  };

  const handleSubscriptionSuccess = paymentData => {
    setIsModalVisible(false);
    setStatusModal(buildPaymentSuccessModal(paymentData));
    setIsSubmitted(true);
  };

  const handleSubscriptionFailure = errorMessage => {
    setIsModalVisible(false);
    setStatusModal({ open: true, status: 'error', message: errorMessage });
    setTimeout(() => {
      setStatusModal({ open: false, status: 'error', message: '' });
    }, 2500);
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <PersonalInformation
          formData={formData.personalInfo}
          onFormDataChange={data => handleFormDataChange('personalInfo', data)}
          showValidation={showValidation}
        />
      );
    }
    if (currentStep === 2) {
      return (
        <ProfessionalDetails
          formData={formData.professionalDetails}
          onFormDataChange={data =>
            handleFormDataChange('professionalDetails', data)
          }
          showValidation={showValidation}
        />
      );
    }
    if (currentStep === 3) {
      return (
        <SubscriptionDetails
          formData={formData.subscriptionDetails}
          onFormDataChange={data =>
            handleFormDataChange('subscriptionDetails', data)
          }
          showValidation={showValidation}
          categoryData={categoryData}
          membershipCategory={formData.professionalDetails?.membershipCategory}
          dateOfBirth={formData.personalInfo?.dateOfBirth}
          workLocation={formData.professionalDetails?.workLocation}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-4" ref={formTopRef}>
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      {isPageReady ? (
        <>
          <ApplicationFormStepper
            currentStep={currentStep}
            isSubmitted={isSubmitted}
            isNextLoading={isNextLoading}
            onStepClick={handleStepClick}
          />

          {renderStepContent()}

          <div className="flex justify-between sm:justify-end items-center gap-3 mt-6">
            {currentStep > 1 && (
              <Button
                onClick={handlePrevious}
                className="min-w-[120px] sm:min-w-[180px] flex-1 sm:flex-initial">
                <span className="hidden sm:inline">Previous: </span>
                {APPLICATION_FORM_STEPS[currentStep - 2]?.title || 'Previous'}
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleNext}
              loading={isNextLoading}
              className="min-w-[120px] sm:min-w-[180px] flex-1 sm:flex-initial">
              {currentStep === APPLICATION_FORM_STEPS.length ? (
                'Submit Application'
              ) : (
                <>
                  <span className="hidden sm:inline">Next: </span>
                  {APPLICATION_FORM_STEPS[currentStep]?.title || 'Next'}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <Spinner />
      )}

      <SubscriptionWrapper
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={handleSubscriptionSuccess}
        onFailure={handleSubscriptionFailure}
        formData={formData}
        membershipCategory={formData.professionalDetails.membershipCategory}
      />

      <PaymentStatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        subTitle={statusModal.message}
        onClose={() => setStatusModal(prev => ({ ...prev, open: false }))}
        onPrimary={() => {
          setStatusModal(prev => ({ ...prev, open: false }));
          navigate('/');
        }}
      />
    </div>
  );
};

export default ApplicationForm;
