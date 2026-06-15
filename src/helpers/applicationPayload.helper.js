const coalesce = (...vals) => {
  for (let i = 0; i < vals.length; i += 1) {
    const v = vals[i];
    if (v !== null && v !== undefined) return v;
  }
  return undefined;
};

const wrapProfessionalDetail = raw => {
  if (!raw) return null;
  if (
    raw.professionalDetails != null &&
    typeof raw.professionalDetails === 'object'
  ) {
    return raw;
  }
  return { professionalDetails: raw };
};

const wrapSubscriptionDetail = raw => {
  if (!raw) return null;
  if (
    raw.subscriptionDetails != null &&
    typeof raw.subscriptionDetails === 'object'
  ) {
    return raw;
  }
  return { subscriptionDetails: raw };
};

const AGGREGATE_HANDLED = Symbol('aggregate_handled');

export const extractAggregatedUserDetailsResponse = res => {
  const body = res != null ? res.data : undefined;
  if (!body || typeof body !== 'object') return null;

  const payload = coalesce(
    body.data,
    body,
  );

  if (!payload?.personalDetails) return null;

  return payload;
};

export const normalizeAggregatedSubscriptionDetails = raw => {
  if (!raw || typeof raw !== 'object') return null;

  const subscriptionDetails = coalesce(
    raw.subscriptionDetails,
    raw._doc?.subscriptionDetails,
    raw.$__?.getters?.subscriptionDetails,
  );

  return {
    applicationId: coalesce(raw.applicationId, raw._doc?.applicationId),
    _id: coalesce(raw._id, raw._doc?._id),
    tenantId: coalesce(raw.tenantId, raw._doc?.tenantId),
    userId: coalesce(raw.userId, raw._doc?.userId),
    subscriptionDetails,
    meta: coalesce(raw.meta, raw._doc?.meta),
    _subscriptionService: raw._subscriptionService,
    isActive: coalesce(raw.isActive, raw._doc?.isActive),
    createdAt: coalesce(raw.createdAt, raw._doc?.createdAt),
    updatedAt: coalesce(raw.updatedAt, raw._doc?.updatedAt),
  };
};

export const resolveApplicationId = ({
  personalDetail,
  professionalDetail,
  subscriptionDetail,
} = {}) =>
  coalesce(
    personalDetail?.applicationId,
    professionalDetail?.applicationId,
    subscriptionDetail?.applicationId,
  );

export const isActiveApplicationPersonalDetail = personalDetail => {
  if (!personalDetail) return false;

  const isActive = coalesce(
    personalDetail?.meta?.isActive,
    personalDetail?.isActive,
  );

  return isActive !== false;
};

const RESUMABLE_PORTAL_APPLICATION_STATUSES = new Set([
  'rejected',
  'in-progress',
  'in progress',
]);

export const isResumablePortalApplication = (
  personalDetail,
  applicationStatus,
) => {
  if (!personalDetail?.applicationId) return false;

  const status = String(
    coalesce(personalDetail.applicationStatus, applicationStatus) || '',
  )
    .trim()
    .toLowerCase();

  if (RESUMABLE_PORTAL_APPLICATION_STATUSES.has(status)) {
    return true;
  }

  if (status === 'approved' || status === 'submitted') {
    return isActiveApplicationPersonalDetail(personalDetail);
  }

  if (!isActiveApplicationPersonalDetail(personalDetail)) {
    return true;
  }

  return true;
};

export const detailBelongsToApplication = (detail, applicationId) =>
  Boolean(
    applicationId &&
      detail?.applicationId &&
      String(detail.applicationId) === String(applicationId),
  );

export const normalizePortalPersonalDetail = (personalDetail, applicationStatus) => {
  if (!personalDetail) return null;
  if (isResumablePortalApplication(personalDetail, applicationStatus)) {
    return personalDetail;
  }

  const { applicationId: _staleApplicationId, ...rest } = personalDetail;
  return rest;
};

export const getApplicationCompletionPercentage = ({
  personalDetail,
  professionalDetail,
  subscriptionDetail,
  applicationStatus,
  isApplicationSubmitted = false,
} = {}) => {
  if (isApplicationSubmitted) {
    return 100;
  }

  const appId = isResumablePortalApplication(personalDetail, applicationStatus)
    ? personalDetail?.applicationId
    : null;

  if (!appId) {
    return 0;
  }

  let completionPercentage = 33;

  if (detailBelongsToApplication(professionalDetail, appId)) {
    completionPercentage = 67;
  }

  if (detailBelongsToApplication(subscriptionDetail, appId)) {
    completionPercentage = 90;
  }

  return completionPercentage;
};

export const resolveApplicationFormStep = ({
  activeSubscriptionDetail,
  activeProfessionalDetail,
  activeApplicationId,
} = {}) => {
  if (activeSubscriptionDetail?.applicationId) {
    return 3;
  }

  if (activeProfessionalDetail?.applicationId) {
    return 3;
  }

  if (activeApplicationId) {
    return 2;
  }

  return 1;
};

export const isAggregateResponseHandled = value => value === AGGREGATE_HANDLED;

export const markAggregateResponseHandled = () => AGGREGATE_HANDLED;

export const extractApplicationsFromMeResponse = res => {
  const body = res != null ? res.data : undefined;
  const inner = coalesce(
    body != null && body.data != null ? body.data.data : undefined,
    body != null ? body.data : undefined,
    body,
  );
  const list = coalesce(
    inner != null ? inner.applications : undefined,
    body != null && body.data != null ? body.data.applications : undefined,
    body != null && body.data != null && body.data.data != null
      ? body.data.data.applications
      : undefined,
    body != null ? body.applications : undefined,
    Array.isArray(inner) ? inner : null,
  );
  return Array.isArray(list) ? list : [];
};

export const normalizeApplicationDetailResponse = (res, listRow = {}) => {
  const root = coalesce(
    res != null && res.data != null ? res.data.data : undefined,
    res != null ? res.data : undefined,
    res,
  );
  const payload =
    root &&
    typeof root === 'object' &&
    root.data &&
    root.personalDetail == null &&
    root.personalDetails == null
      ? root.data
      : root;

  let personalDetail = coalesce(
    payload != null ? payload.personalDetail : undefined,
    payload != null ? payload.personalDetails : undefined,
    null,
  );
  const professionalDetail = wrapProfessionalDetail(
    coalesce(
      payload != null ? payload.professionalDetail : undefined,
      payload != null ? payload.professionalDetails : undefined,
      null,
    ),
  );
  const subscriptionDetail = wrapSubscriptionDetail(
    coalesce(
      payload != null ? payload.subscriptionDetail : undefined,
      payload != null ? payload.subscriptionDetails : undefined,
      null,
    ),
  );

  if (
    personalDetail &&
    listRow.applicationStatus != null &&
    personalDetail.applicationStatus == null
  ) {
    personalDetail = {
      ...personalDetail,
      applicationStatus: listRow.applicationStatus,
    };
  }

  if (
    subscriptionDetail &&
    subscriptionDetail.subscriptionDetails &&
    listRow.membershipCategory != null &&
    subscriptionDetail.subscriptionDetails.membershipCategory == null
  ) {
    subscriptionDetail.subscriptionDetails = {
      ...subscriptionDetail.subscriptionDetails,
      membershipCategory: listRow.membershipCategory,
    };
  }

  const applicationIdRaw = coalesce(
    listRow.applicationId,
    payload != null ? payload.applicationId : undefined,
    personalDetail != null ? personalDetail.applicationId : undefined,
  );
  const submissionDateRaw = coalesce(
    listRow.submissionDate,
    payload != null ? payload.submissionDate : undefined,
    personalDetail != null ? personalDetail.submissionDate : undefined,
  );

  const out = {
    applicationId:
      applicationIdRaw !== undefined && applicationIdRaw !== null
        ? applicationIdRaw
        : null,
    submissionDate:
      submissionDateRaw !== undefined && submissionDateRaw !== null
        ? submissionDateRaw
        : null,
    personalDetail,
    professionalDetail,
    subscriptionDetail,
  };

  const hasAny =
    (personalDetail && Object.keys(personalDetail).length > 0) ||
    (professionalDetail && Object.keys(professionalDetail).length > 0) ||
    (subscriptionDetail && Object.keys(subscriptionDetail).length > 0);

  return hasAny ? out : null;
};

export const applicationDetailHasSections = app =>
  Boolean(
    app &&
      app.personalDetail &&
      app.professionalDetail &&
      app.subscriptionDetail,
  );

/**
 * Bundle from portal context for ApplicationDetail navigation (pre-list API shape).
 */
export const buildApplicationBundleFromContext = ({
  personalDetail,
  professionalDetail,
  subscriptionDetail,
}) => {
  const applicationId =
    personalDetail != null && personalDetail.applicationId != null
      ? personalDetail.applicationId
      : null;
  const submissionDateRaw = coalesce(
    personalDetail != null ? personalDetail.submissionDate : undefined,
    personalDetail != null && personalDetail.personalInfo != null
      ? personalDetail.personalInfo.submissionDate
      : undefined,
    subscriptionDetail != null &&
      subscriptionDetail.subscriptionDetails != null
      ? subscriptionDetail.subscriptionDetails.submissionDate
      : undefined,
  );

  return {
    applicationId,
    submissionDate:
      submissionDateRaw !== undefined && submissionDateRaw !== null
        ? submissionDateRaw
        : null,
    personalDetail: personalDetail || null,
    professionalDetail: professionalDetail || null,
    subscriptionDetail: subscriptionDetail || null,
  };
};
