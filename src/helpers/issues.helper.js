import dayjs from 'dayjs';
import { COMPLAINT_TYPE_OPTIONS } from '../constants/queriesCases';

export const COMPLAINT_TYPE = {
  MOM: 'MOM',
  MOSP: 'MOSP',
};

export const ISSUE_TYPE = {
  COMPLAINT: 'COMPLAINT',
  FTP: 'FTP',
  IR: 'IR',
  DP: 'DP',
};

export const COMPLAINT_TYPE_LOOKUP = 'Complaint Type';

const normalizeComplaintTypeKey = value =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

const getComplaintTypeLookupLabel = item =>
  String(
    item?.displayname ||
      item?.lookupname ||
      item?.DisplayName ||
      item?.name ||
      item?.code ||
      '',
  );

export const getComplaintTypeLookupValue = item =>
  item?.code || item?.lookupname || item?._id || item?.id || '';

export const filterComplaintTypeLookups = lookups =>
  (lookups || []).filter(
    item => item?.lookuptypeId?.lookuptype === COMPLAINT_TYPE_LOOKUP,
  );

export const mapComplaintTypeLookupOption = item => ({
  value: getComplaintTypeLookupValue(item),
  label: getComplaintTypeLookupLabel(item),
});

export const mapComplaintTypeLookupOptions = lookups =>
  filterComplaintTypeLookups(lookups)
    .map(mapComplaintTypeLookupOption)
    .filter(option => option.value);

const findComplaintTypeLookup = (value, complaintTypeLookups = []) =>
  complaintTypeLookups.find(item => getComplaintTypeLookupValue(item) === value);

export const isMemberOnMemberComplaintType = (value, complaintTypeLookups = []) => {
  if (normalizeComplaintTypeKey(value) === COMPLAINT_TYPE.MOM) return true;

  const lookup = findComplaintTypeLookup(value, complaintTypeLookups);
  const label = getComplaintTypeLookupLabel(lookup).toLowerCase();
  const code = normalizeComplaintTypeKey(lookup?.code || lookup?.lookupname);

  return code === COMPLAINT_TYPE.MOM || label.includes('member on member');
};

export const isMemberOnServiceProviderComplaintType = (
  value,
  complaintTypeLookups = [],
) => {
  if (normalizeComplaintTypeKey(value) === COMPLAINT_TYPE.MOSP) return true;

  const lookup = findComplaintTypeLookup(value, complaintTypeLookups);
  const label = getComplaintTypeLookupLabel(lookup).toLowerCase();
  const code = normalizeComplaintTypeKey(lookup?.code || lookup?.lookupname);

  return (
    code === COMPLAINT_TYPE.MOSP ||
    label.includes('member on service provider') ||
    label.includes('service provider')
  );
};

export const isIssueApiSuccess = response =>
  response?.status >= 200 && response?.status < 300;

export const getIssueApiErrorMessage = (response, fallback = 'Request failed') => {
  const data = response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.error === 'string') return data.error;
  if (response?.status) return `${fallback} (HTTP ${response.status})`;
  return fallback;
};

export const getComplaintTypeLabel = (value, options = COMPLAINT_TYPE_OPTIONS) => {
  const match = options.find(option => option.value === value);
  if (match?.label) return match.label;

  const fallback = COMPLAINT_TYPE_OPTIONS.find(option => option.value === value);
  return fallback?.label || value || 'Complaint';
};

export const mapIssueStatusLabel = status => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'ACTIVE') return 'Open';
  if (normalized === 'CLOSED') return 'Closed';
  if (normalized === 'IN_PROGRESS' || normalized === 'IN PROGRESS') {
    return 'In Progress';
  }
  return status || 'Open';
};

export const formatIssueDate = value => {
  if (!value) return '';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY') : String(value);
};

export const parseIssuesListResponse = response => {
  const payload = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(payload) ? payload : payload?.items || [];
};

export const parseMemberSearchResponse = response => {
  const payload = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(payload) ? payload : payload?.items || [];
};

export const parseServiceProvidersResponse = response => {
  const payload = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(payload) ? payload : payload?.items || [];
};

export const mapPortalMemberOption = member => {
  const id = member?.profileId || member?._id || member?.id;
  const name =
    member?.fullName ||
    [member?.forename, member?.surname].filter(Boolean).join(' ') ||
    member?.name ||
    'Member';
  const membershipNumber =
    member?.membershipNumber || member?.memberNumber || member?.memberNo || '';

  return {
    id,
    name,
    membershipNumber,
    label: membershipNumber ? `${name} (${membershipNumber})` : name,
  };
};

export const mapPortalServiceProviderOption = provider => {
  const id = provider?._id || provider?.id;
  const label = provider?.name || provider?.displayName || provider?.label || id;
  return { value: id, label };
};

export const mapPortalIssueToListItem = issue => {
  const id = issue?._id || issue?.id || issue?.issueNumber;
  return {
    id,
    subject: getComplaintTypeLabel(issue?.complaintType),
    date: formatIssueDate(issue?.dateReceived || issue?.createdAt),
    status: mapIssueStatusLabel(issue?.issueStatus),
    description: issue?.description || '',
    complaintType: issue?.complaintType,
    priority: issue?.priority || 'Medium',
    raw: issue,
  };
};

export const buildPortalComplaintPayload = ({
  description,
  dateReceived,
  complaintType,
  relatedMember,
  serviceProvider,
  complainantId,
  complaintTypeLookups = [],
}) => {
  const payload = {
    issueType: ISSUE_TYPE.COMPLAINT,
    description: String(description || '').trim(),
    dateReceived: dayjs(dateReceived).toISOString(),
    complaintType,
  };

  if (
    isMemberOnMemberComplaintType(complaintType, complaintTypeLookups) &&
    relatedMember
  ) {
    payload.relatedMember = String(relatedMember).trim();
  }

  if (
    isMemberOnMemberComplaintType(complaintType, complaintTypeLookups) &&
    complainantId
  ) {
    payload.complainantId = complainantId;
  }

  if (
    isMemberOnServiceProviderComplaintType(complaintType, complaintTypeLookups) &&
    serviceProvider
  ) {
    payload.serviceProvider = String(serviceProvider).trim();
  }

  return payload;
};
