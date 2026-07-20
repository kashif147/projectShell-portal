import { normalizeMobileToE164 } from './phone.helper';
import { calculateAgeFromDateOfBirth, isDataFormat } from './date.helper';
import {
  getPaymentFrequencyCategory,
  isSalaryDeductionPaymentType,
  getUndergraduateSubscriptionPaymentDetails,
} from './subscriptionPricing.helper';
import { APPLICATION_PAYMENT_AUTHORISED_MESSAGE } from './paymentIntent.helper';

export { STRIPE_PUBLISHABLE_KEY, INITIAL_STATUS_MODAL } from './dashboard.helper';

export const APPLICATION_FORM_STEPS = [
  { number: 1, title: 'Personal Information', shortTitle: 'Personal' },
  { number: 2, title: 'Professional Details', shortTitle: 'Professional' },
  { number: 3, title: 'Subscription Details', shortTitle: 'Subscription' },
];

const UNDERGRADUATE_STUDENT_LABEL = 'Undergraduate Student';
const RETIRED_ASSOCIATE_LABEL = 'Retired Associate';

const orPrev = (value, fallback, empty = '') => value || fallback || empty;
const coalescePrev = (value, fallback, empty = '') =>
  value ?? fallback ?? empty;

export const assignDefinedFields = (target, fields) => {
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      target[key] = value;
    }
  });
  return target;
};

export const pickDefinedObject = fields =>
  assignDefinedFields({}, fields);

export const createInitialApplicationFormData = user => ({
  personalInfo: {
    forename: user?.userFirstName || user?.firstName || '',
    surname: user?.userLastName || user?.lastName || '',
    personalEmail: user?.userEmail || user?.email || '',
    mobileNo: normalizeMobileToE164(
      user?.userMobilePhone || user?.mobilePhone || '',
    ),
    country: 'Ireland',
    consent: true,
  },
  professionalDetails: {},
  subscriptionDetails: {},
});

export const buildApplicationPersonalInfo = (personalDetail, prev = {}) => {
  const personal = personalDetail?.personalInfo || {};
  const contact = personalDetail?.contactInfo || {};

  return {
    title: orPrev(personal.title, prev.title),
    surname: orPrev(personal.surname, prev.surname),
    forename: orPrev(personal.forename, prev.forename),
    gender: orPrev(personal.gender, prev.gender),
    dateOfBirth: orPrev(personal.dateOfBirth, prev.dateOfBirth),
    countryPrimaryQualification: orPrev(
      personal.countryPrimaryQualification,
      prev.countryPrimaryQualification,
    ),
    personalEmail: orPrev(contact.personalEmail, prev.personalEmail),
    mobileNo:
      normalizeMobileToE164(
        contact.mobileNumber || prev.mobileNo || '',
      ) ||
      prev.mobileNo ||
      '',
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

const toAdaptationYesNo = (value, fallback = '') => {
  if (value === false) return 'no';
  if (value === true || value === 'yes') return 'yes';
  return fallback || '';
};

export const buildApplicationProfessionalDetails = (
  professionalDetail,
  prev = {},
) => {
  const details = professionalDetail?.professionalDetails || {};
  const programme = details.nursingAdaptationProgramme;

  return {
    membershipCategory: orPrev(
      details.membershipCategory,
      prev.membershipCategory,
    ),
    workLocation: orPrev(details.workLocation, prev.workLocation),
    otherWorkLocation: coalescePrev(
      details.otherWorkLocation,
      prev.otherWorkLocation,
    ),
    grade: orPrev(details.grade, prev.grade),
    otherGrade: coalescePrev(details.otherGrade, prev.otherGrade),
    nursingAdaptationProgramme: toAdaptationYesNo(
      programme,
      prev.nursingAdaptationProgramme,
    ),
    nmbiNumber: coalescePrev(details.nmbiNumber, prev.nmbiNumber),
    nurseType:
      programme === false || programme === 'no'
        ? ''
        : coalescePrev(details.nurseType, prev.nurseType),
    region: coalescePrev(details.region, prev.region),
    branch: coalescePrev(details.branch, prev.branch),
    pensionNo: coalescePrev(details.pensionNo, prev.pensionNo),
    isRetired: coalescePrev(details.isRetired, prev.isRetired, false),
    retirementDate: coalescePrev(details.retirementDate, prev.retirementDate),
    studyLocation: coalescePrev(details.studyLocation, prev.studyLocation),
    startDate: coalescePrev(details.startDate, prev.startDate),
    graduationDate: coalescePrev(details.graduationDate, prev.graduationDate),
    discipline: coalescePrev(details.discipline, prev.discipline),
  };
};

const toYesNo = (value, fallback = 'no') => (value ? 'yes' : fallback);

const toJoinYouthForum = (value, fallback = '') => {
  if (value) return 'yes';
  if (value === false) return 'no';
  return fallback || '';
};

export const buildApplicationSubscriptionDetails = (
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
    otherIrishTradeUnionName: coalescePrev(
      details.otherIrishTradeUnionName,
      prev.otherIrishTradeUnionName,
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
    exclusiveDiscountsAndOffers: coalescePrev(
      details.exclusiveDiscountsAndOffers,
      prev.exclusiveDiscountsAndOffers,
      false,
    ),
    previousMembershipNumber: coalescePrev(
      details.previousMembershipNumber,
      prev.previousMembershipNumber,
    ),
    joinYouthForum: toJoinYouthForum(
      details.joinYouthForum,
      prev.joinYouthForum,
    ),
    youthForum: coalescePrev(details.youthForum, prev.youthForum),
  };
};

export const buildPersonalDetailPayload = data => ({
  personalInfo: pickDefinedObject({
    title: data.title,
    surname: data.surname,
    forename: data.forename,
    gender: data.gender,
    dateOfBirth: isDataFormat(data.dateOfBirth),
    countryPrimaryQualification: data.countryPrimaryQualification,
  }),
  contactInfo: pickDefinedObject({
    preferredAddress: data.preferredAddress,
    eircode: data.eircode,
    buildingOrHouse: data.addressLine1,
    streetOrRoad: data.addressLine2,
    areaOrTown: data.addressLine3,
    countyCityOrPostCode: data.addressLine4,
    country: data.country,
    mobileNumber: normalizeMobileToE164(data.mobileNo),
    telephoneNumber: data.homeWorkTelNo,
    preferredEmail: data.preferredEmail,
    personalEmail: data.personalEmail,
    workEmail: data.workEmail,
    consent: data.consent,
  }),
});

export const buildProfessionalDetailPayload = data => ({
  professionalDetails: pickDefinedObject({
    membershipCategory: data.membershipCategory,
    workLocation: data.workLocation,
    otherWorkLocation: data.otherWorkLocation,
    grade: data.grade,
    otherGrade: data.otherGrade,
    nmbiNumber: data.nmbiNumber,
    nurseType: data.nurseType,
    nursingAdaptationProgramme: data?.nursingAdaptationProgramme === 'yes',
    region: data.region,
    branch: data.branch,
    pensionNo: data.pensionNo,
    retirementDate: data.retirementDate && isDataFormat(data.retirementDate),
    studyLocation: data.studyLocation,
    startDate: data.startDate && isDataFormat(data.startDate),
    graduationDate: data.graduationDate && isDataFormat(data.graduationDate),
    discipline: data.discipline,
  }),
});

export const resolveSubscriptionPaymentFields = ({
  data,
  skipPayment,
  paymentLookups,
}) => {
  if (!skipPayment) {
    return {
      paymentType: data?.paymentType,
      paymentFrequency: data?.paymentFrequency,
    };
  }

  const undergraduatePayment =
    getUndergraduateSubscriptionPaymentDetails(paymentLookups);

  return {
    paymentType: undergraduatePayment.paymentType,
    paymentFrequency: undergraduatePayment.paymentFrequency,
  };
};

export const buildSubscriptionDetailPayload = ({
  data,
  membershipCategory,
  paymentFields,
}) => ({
  subscriptionDetails: pickDefinedObject({
    paymentType: paymentFields.paymentType,
    payrollNo: data?.payrollNo,
    membershipStatus: data?.memberStatus,
    otherIrishTradeUnion: data?.otherIrishTradeUnion === 'yes',
    otherIrishTradeUnionName: data?.otherIrishTradeUnionName,
    otherScheme: data?.otherScheme === 'yes',
    previousMembershipNumber: data?.previousMembershipNumber,
    joinYouthForum: data?.joinYouthForum === 'yes',
    youthForum: data?.youthForum,
    recuritedBy: data?.recuritedBy,
    recuritedByMembershipNo: data?.recuritedByMembershipNo,
    primarySection: data?.primarySection,
    otherPrimarySection: data?.otherPrimarySection,
    secondarySection: data?.secondarySection,
    otherSecondarySection: data?.otherSecondarySection,
    incomeProtectionScheme: data?.incomeProtectionScheme === true,
    inmoRewards: data?.inmoRewards === true,
    valueAddedServices: data?.valueAddedServices === true,
    termsAndConditions: data?.termsAndConditions === true,
    exclusiveDiscountsAndOffers: data?.exclusiveDiscountsAndOffers === true,
    paymentFrequency: paymentFields.paymentFrequency,
    membershipCategory,
  }),
});

export const validateApplicationStep = ({
  currentStep,
  personalInfo = {},
  professionalDetails = {},
  subscriptionDetails = {},
}) => {
  if (currentStep === 1) {
    const {
      title,
      forename,
      surname,
      gender,
      dateOfBirth,
      personalEmail,
      workEmail,
      mobileNo,
      addressLine1,
      addressLine4,
      preferredAddress,
      preferredEmail,
      countryPrimaryQualification,
    } = personalInfo;

    if (!preferredEmail) return false;

    const emailMissing =
      preferredEmail === 'personal'
        ? !personalEmail
        : preferredEmail === 'work'
          ? !workEmail
          : true;

    return Boolean(
      title &&
        forename &&
        surname &&
        gender &&
        dateOfBirth &&
        !emailMissing &&
        mobileNo &&
        addressLine1 &&
        addressLine4 &&
        preferredAddress &&
        countryPrimaryQualification,
    );
  }

  if (currentStep === 2) {
    const {
      workLocation,
      grade,
      membershipCategory,
      nursingAdaptationProgramme,
      nurseType,
      nmbiNumber,
      discipline,
      studyLocation,
      graduationDate,
      pensionNo,
    } = professionalDetails;

    const isUndergraduateStudent =
      membershipCategory === UNDERGRADUATE_STUDENT_LABEL;

    if (!grade || !membershipCategory) return false;
    if (!isUndergraduateStudent && !workLocation) return false;
    if (isUndergraduateStudent) {
      if (!discipline || !studyLocation || !graduationDate) return false;
    }
    if (
      membershipCategory === RETIRED_ASSOCIATE_LABEL &&
      !String(pensionNo || '').trim()
    ) {
      return false;
    }
    if (nursingAdaptationProgramme === 'yes' && !nurseType) return false;
    if (
      nursingAdaptationProgramme === 'no' &&
      !isUndergraduateStudent &&
      !String(nmbiNumber || '').trim()
    ) {
      return false;
    }
    return true;
  }

  if (currentStep === 3) {
    const {
      paymentType,
      termsAndConditions,
      otherIrishTradeUnion,
      otherScheme,
      memberStatus,
    } = subscriptionDetails;

    if (!paymentType) return false;
    if (
      isSalaryDeductionPaymentType(paymentType) &&
      !subscriptionDetails?.payrollNo
    ) {
      return false;
    }
    if (
      getPaymentFrequencyCategory(paymentType) &&
      !subscriptionDetails?.paymentFrequency
    ) {
      return false;
    }
    if (!memberStatus) return false;
    if (memberStatus === 'new' || memberStatus === 'graduate') {
      if (!otherIrishTradeUnion || !otherScheme) return false;
      if (
        otherIrishTradeUnion === 'yes' &&
        !String(subscriptionDetails?.otherIrishTradeUnionName || '').trim()
      ) {
        return false;
      }
    }

    const memberAge = calculateAgeFromDateOfBirth(personalInfo?.dateOfBirth);
    if (memberAge !== null && memberAge < 35) {
      if (!subscriptionDetails?.joinYouthForum) return false;
      if (
        subscriptionDetails?.joinYouthForum === 'yes' &&
        !subscriptionDetails?.youthForum
      ) {
        return false;
      }
    }

    return Boolean(termsAndConditions);
  }

  return true;
};

export const getMissingRequiredFields = ({
  currentStep,
  personalInfo = {},
  professionalDetails = {},
  subscriptionDetails = {},
}) => {
  const missing = [];

  if (currentStep === 1) {
    const {
      title,
      forename,
      surname,
      gender,
      dateOfBirth,
      personalEmail,
      workEmail,
      mobileNo,
      addressLine1,
      addressLine4,
      preferredAddress,
      preferredEmail,
      countryPrimaryQualification,
    } = personalInfo;

    if (!preferredEmail) missing.push('Preferred email');
    if (!title) missing.push('Title');
    if (!forename) missing.push('Forename');
    if (!surname) missing.push('Surname');
    if (!gender) missing.push('Gender');
    if (!dateOfBirth) missing.push('Date of Birth');
    if (preferredEmail === 'personal' && !personalEmail) {
      missing.push('Personal email');
    }
    if (preferredEmail === 'work' && !workEmail) missing.push('Work email');
    if (
      preferredEmail &&
      preferredEmail !== 'personal' &&
      preferredEmail !== 'work' &&
      !personalEmail &&
      !workEmail
    ) {
      missing.push('Preferred email');
    }
    if (!mobileNo) missing.push('Mobile number');
    if (!addressLine1) missing.push('Address Line 1');
    if (!addressLine4) missing.push('Address Line 4');
    if (!preferredAddress) missing.push('Preferred address');
    if (!countryPrimaryQualification) {
      missing.push('Country of primary qualification');
    }
  }

  if (currentStep === 2) {
    const {
      workLocation,
      grade,
      membershipCategory,
      nursingAdaptationProgramme,
      nurseType,
      nmbiNumber,
      discipline,
      studyLocation,
      startDate,
      pensionNo,
    } = professionalDetails;

    const isUndergraduateStudent =
      membershipCategory === UNDERGRADUATE_STUDENT_LABEL;

    if (!membershipCategory) missing.push('Membership category');
    if (!isUndergraduateStudent && !workLocation) {
      missing.push('Work location');
    }
    if (!grade) missing.push('Grade');
    if (isUndergraduateStudent) {
      if (!discipline) missing.push('Discipline');
      if (!studyLocation) missing.push('Study location');
      if (!startDate) missing.push('Start date');
    }
    if (
      membershipCategory === RETIRED_ASSOCIATE_LABEL &&
      !String(pensionNo || '').trim()
    ) {
      missing.push('Pension number');
    }
    if (nursingAdaptationProgramme === 'yes' && !nurseType) {
      missing.push('Nurse type');
    }
    if (
      nursingAdaptationProgramme === 'no' &&
      !isUndergraduateStudent &&
      !String(nmbiNumber || '').trim()
    ) {
      missing.push('NMBI number');
    }
  }

  if (currentStep === 3) {
    const sub = subscriptionDetails;
    if (!sub.paymentType) missing.push('Payment type');
    if (isSalaryDeductionPaymentType(sub.paymentType) && !sub.payrollNo) {
      missing.push('Payroll number');
    }
    if (
      getPaymentFrequencyCategory(sub.paymentType) &&
      !sub.paymentFrequency
    ) {
      missing.push('Payment frequency');
    }
    if (!sub.memberStatus) missing.push('Member status');
    if (sub.memberStatus === 'new' || sub.memberStatus === 'graduate') {
      if (!sub.otherIrishTradeUnion) missing.push('Other Irish trade union');
      if (!sub.otherScheme) missing.push('Other scheme');
      if (
        sub.otherIrishTradeUnion === 'yes' &&
        !String(sub.otherIrishTradeUnionName || '').trim()
      ) {
        missing.push('Other Irish trade union name');
      }
    }
    const memberAge = calculateAgeFromDateOfBirth(personalInfo?.dateOfBirth);
    if (memberAge !== null && memberAge < 35) {
      if (!sub.joinYouthForum) missing.push('Youth Forum preference');
      if (sub.joinYouthForum === 'yes' && !sub.youthForum) {
        missing.push('Youth Forum selection');
      }
    }
    if (!sub.termsAndConditions) missing.push('Terms and conditions');
  }

  return missing;
};

export const buildPaymentSuccessModal = paymentData => {
  const outcome = paymentData?.paymentOutcome;
  return {
    open: true,
    status: 'success',
    title: outcome?.title || 'Payment authorised',
    message: outcome?.message || APPLICATION_PAYMENT_AUTHORISED_MESSAGE,
  };
};
