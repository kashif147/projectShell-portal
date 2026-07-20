import { REJECTED_APPLICATION_REAPPLY_MESSAGE } from './paymentIntent.helper';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51SBAG4FTlZb0wcbr19eI8nC5u62DfuaUWRVS51VTERBocxSM9JSEs4ubrW57hYTCAHK9d6jrarrT4SAViKFMqKjT00TrEr3PNV';

export const INITIAL_STATUS_MODAL = {
  open: false,
  status: 'success',
  title: '',
  message: '',
};

export const STEP_BUTTON_TEXT = {
  1: 'Start Application',
  2: 'Resume Application',
  3: 'Application Completed',
};

export const COMPLETED_APPLICATION_STATUSES = new Set([
  'submitted',
  'processed', // formerly 'approved'
]);

export const APPLICATION_STATUS_SUBTITLE = {
  processed: 'Processed',
  submitted: 'In Review',
  'in-progress': 'In Progress',
  rejected: 'Start Application',
};

export const APPLICATION_STATUS_COLOR = {
  processed: 'green',
  submitted: 'blue',
  rejected: 'red',
};

const orPrev = (value, fallback, empty = '') => value || fallback || empty;
const coalescePrev = (value, fallback, empty = '') =>
  value ?? fallback ?? empty;

const toYesNo = (value, fallback = 'no') => (value ? 'yes' : fallback);

export const createInitialDashboardFormData = user => ({
  personalInfo: {
    forename: user?.userFirstName || '',
    surname: user?.userLastName || '',
    personalEmail: user?.userEmail || '',
    mobileNo: user?.userMobilePhone || '',
    country: 'Ireland',
    consent: false,
  },
  professionalDetails: {},
  subscriptionDetails: {},
});

export const buildDashboardPersonalInfo = (personalDetail, prev = {}, user) => {
  const personal = personalDetail?.personalInfo || {};
  const contact = personalDetail?.contactInfo || {};

  return {
    title: orPrev(personal.title, prev.title),
    surname: orPrev(personal.surname, prev.surname, user?.userLastName || ''),
    forename: orPrev(personal.forename, prev.forename, user?.userFirstName || ''),
    gender: orPrev(personal.gender, prev.gender),
    dateOfBirth: orPrev(personal.dateOfBirth, prev.dateOfBirth),
    countryPrimaryQualification: orPrev(
      personal.countryPrimaryQualification,
      prev.countryPrimaryQualification,
    ),
    personalEmail: orPrev(
      contact.personalEmail,
      prev.personalEmail,
      user?.userEmail || '',
    ),
    mobileNo: orPrev(
      contact.mobileNumber,
      prev.mobileNo,
      user?.userMobilePhone || '',
    ),
    consent: coalescePrev(contact.consent, prev.consent, false),
    addressLine1: orPrev(contact.buildingOrHouse, prev.addressLine1),
    addressLine2: orPrev(contact.streetOrRoad, prev.addressLine2),
    addressLine3: orPrev(contact.areaOrTown, prev.addressLine3),
    addressLine4: orPrev(contact.countyCityOrPostCode, prev.addressLine4),
    eircode: orPrev(contact.eircode, prev.eircode),
    preferredAddress: orPrev(contact.preferredAddress, prev.preferredAddress),
    preferredEmail: orPrev(contact.preferredEmail, prev.preferredEmail),
    homeWorkTelNo: orPrev(contact.telephoneNumber, prev.homeWorkTelNo),
    country: orPrev(contact.country, prev.country, 'Ireland'),
    workEmail: orPrev(contact.workEmail, prev.workEmail),
  };
};

export const buildDashboardProfessionalDetails = (
  professionalDetail,
  prev = {},
) => {
  const details = professionalDetail?.professionalDetails || {};

  return {
    membershipCategory: orPrev(details.membershipCategory, prev.membershipCategory),
    workLocation: orPrev(details.workLocation, prev.workLocation),
    otherWorkLocation: coalescePrev(
      details.otherWorkLocation,
      prev.otherWorkLocation,
    ),
    grade: orPrev(details.grade, prev.grade),
    otherGrade: coalescePrev(details.otherGrade, prev.otherGrade),
    nmbiNumber: coalescePrev(details.nmbiNumber, prev.nmbiNumber),
    nurseType: coalescePrev(details.nurseType, prev.nurseType),
    nursingAdaptationProgramme: details.nursingAdaptationProgramme
      ? 'yes'
      : prev.nursingAdaptationProgramme || 'no',
    region: coalescePrev(details.region, prev.region),
    branch: coalescePrev(details.branch, prev.branch),
    pensionNo: coalescePrev(details.pensionNo, prev.pensionNo),
    isRetired: coalescePrev(details.isRetired, prev.isRetired, false),
    retiredDate: coalescePrev(details.retiredDate, prev.retiredDate),
    studyLocation: coalescePrev(details.studyLocation, prev.studyLocation),
    graduationDate: coalescePrev(details.graduationDate, prev.graduationDate),
  };
};

export const buildDashboardSubscriptionDetails = (
  subscriptionDetail,
  prev = {},
) => {
  const details = subscriptionDetail?.subscriptionDetails || {};

  return {
    paymentType: orPrev(details.paymentType, prev.paymentType),
    payrollNo: coalescePrev(details.payrollNo, prev.payrollNo),
    memberStatus: coalescePrev(details.membershipStatus, prev.memberStatus),
    otherIrishTradeUnion: toYesNo(
      details.otherIrishTradeUnion,
      prev.otherIrishTradeUnion || 'no',
    ),
    otherScheme: toYesNo(details.otherScheme, prev.otherScheme || 'no'),
    recuritedBy: coalescePrev(details.recuritedBy, prev.recuritedBy),
    recuritedByMembershipNo: coalescePrev(
      details.recuritedByMembershipNo,
      prev.recuritedByMembershipNo,
    ),
    primarySection: orPrev(details.primarySection, prev.primarySection),
    otherPrimarySection: coalescePrev(
      details.otherPrimarySection,
      prev.otherPrimarySection,
    ),
    secondarySection: orPrev(details.secondarySection, prev.secondarySection),
    otherSecondarySection: coalescePrev(
      details.otherSecondarySection,
      prev.otherSecondarySection,
    ),
    incomeProtectionScheme: coalescePrev(
      details.incomeProtectionScheme,
      prev.incomeProtectionScheme,
      false,
    ),
    inmoRewards: coalescePrev(details.inmoRewards, prev.inmoRewards, false),
    valueAddedServices: coalescePrev(
      details.valueAddedServices,
      prev.valueAddedServices,
      false,
    ),
    termsAndConditions: coalescePrev(
      details.termsAndConditions,
      prev.termsAndConditions,
      false,
    ),
    membershipCategory: orPrev(
      details.membershipCategory,
      prev.membershipCategory,
    ),
    dateJoined: orPrev(details.dateJoined, prev.dateJoined),
    paymentFrequency: orPrev(details.paymentFrequency, prev.paymentFrequency),
  };
};

export const resolvePersonalDetailActive = personalDetail =>
  personalDetail?.meta?.isActive ?? personalDetail?.isActive ?? true;

export const isCompletedApplicationStatus = status =>
  COMPLETED_APPLICATION_STATUSES.has(status);

export const buildApplicationStatusState = ({
  status,
  isActive,
}) => {
  const active = Boolean(isActive);
  return {
    applicationStatus: status,
    isApplicationActive: active,
    isApplicationSubmitted: active && isCompletedApplicationStatus(status),
  };
};

export const parseApplicationConfirmationResponse = (response, fallbackActive) => {
  const status =
    response?.data?.data?.applicationStatus ||
    response?.data?.applicationStatus;
  const isActive =
    response?.data?.data?.meta?.isActive ??
    response?.data?.meta?.isActive ??
    fallbackActive;

  return buildApplicationStatusState({ status, isActive });
};

export const resolveApplicationStep = ({
  applicationId,
  professionalId,
  subscriptionId,
}) => {
  if (!applicationId) return 1;
  if (!professionalId) return 2;
  if (!subscriptionId) return 3;
  return 3;
};

export const isLatestSubscriptionResigned = subscriptions => {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return false;
  }

  const [latest] = [...subscriptions].sort((a, b) => {
    const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

  return (
    String(latest?.subscriptionStatus || '').toLowerCase() === 'resigned'
  );
};

export const getApplicationButtonText = ({
  isApplicationActive,
  applicationStatus,
  isApplicationSubmitted,
  currentStep,
}) => {
  if (!isApplicationActive) return 'Start Application';
  if (applicationStatus === 'rejected') return 'Re-apply';
  if (isApplicationSubmitted) return 'Application Submitted';
  return STEP_BUTTON_TEXT[currentStep] || 'Continue';
};

export const getApplicationQuickActionState = ({
  isApplicationActive,
  applicationStatus,
  loading,
  applicationLoader,
  isApplicationSubmitted,
  currentStep,
}) => {
  const subtitle = !isApplicationActive
    ? 'Start Application'
    : APPLICATION_STATUS_SUBTITLE[applicationStatus] ||
      getApplicationButtonText({
        isApplicationActive,
        applicationStatus,
        isApplicationSubmitted,
        currentStep,
      });

  const disabled =
    loading ||
    applicationLoader ||
    applicationStatus === null ||
    (isApplicationActive && isCompletedApplicationStatus(applicationStatus));

  const colorScheme = !isApplicationActive
    ? 'blue'
    : APPLICATION_STATUS_COLOR[applicationStatus] || 'blue';

  return { subtitle, disabled, colorScheme };
};

export const formatCentsCurrency = (valueInCents, currencyCode = 'EUR') => {
  const currency = (currencyCode || 'EUR').toUpperCase();

  if (!valueInCents || valueInCents === 0) {
    return currency === 'EUR' ? '€0.00' : `${currency}0.00`;
  }

  const amountInEuros = valueInCents / 100;
  const currencySymbol = currency === 'EUR' ? '€' : currency;
  return `${currencySymbol}${amountInEuros.toFixed(2)}`;
};

export const getProfileCompletionCopy = ({
  isApplicationSubmitted,
  applicationStatus,
}) => ({
  message: isApplicationSubmitted
    ? 'Your profile is complete! Well done.'
    : applicationStatus === 'rejected'
      ? REJECTED_APPLICATION_REAPPLY_MESSAGE
      : 'Complete your profile to get the most out of your membership.',
  buttonLabel: isApplicationSubmitted
    ? 'View Profile'
    : applicationStatus === 'rejected'
      ? 'Re-apply'
      : 'Complete Profile',
});

export const shouldOpenPaymentModal = ({
  isMember,
  currentStep,
  categoryCode,
}) =>
  (isMember || currentStep === 3) && categoryCode !== 'undergraduate_student';

export const isPayDisabled = ({
  isMember,
  accountNetBalanceLoading,
  netBalance,
}) =>
  !isMember ||
  accountNetBalanceLoading ||
  (typeof netBalance === 'number' && netBalance <= 0);

export const getUpcomingEvents = (events, limit = 3) =>
  (events || [])
    .filter(event => event?.type?.toLowerCase() === 'upcoming')
    .slice(0, limit);

export const buildPaymentSuccessModal = paymentData => {
  const outcome = paymentData?.paymentOutcome;
  return {
    open: true,
    status: 'success',
    title: outcome?.title || 'Payment successful',
    message:
      outcome?.message || 'Your payment has been completed successfully.',
  };
};
