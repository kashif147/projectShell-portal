import issue_request from './issue_request';
import { ISSUE_TYPE } from '../helpers/issues.helper';

const PORTAL_ISSUES_BASE = '/api/issues/portal';

const withIssueType = (data = {}) => ({
  ...data,
  issueType: ISSUE_TYPE.COMPLAINT,
});

export const createPortalIssue = data => {
  const payload = withIssueType(data);

  return issue_request.post(PORTAL_ISSUES_BASE, payload);
};

export const uploadIssueAttachments = (issueId, files = []) => {
  const formData = new FormData();
  files.forEach(file => {
    const uploadFile = file?.originFileObj || file;
    if (uploadFile) {
      formData.append('file', uploadFile);
    }
  });

  return issue_request.post(
    `${PORTAL_ISSUES_BASE}/${issueId}/activities`,
    formData,
  );
};

export const fetchMyPortalIssues = () =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/mine`);

export const fetchPortalIssueById = id =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/${id}`);

export const fetchPortalIssueActivities = id =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/${id}/activities`);

export const createPortalIssueActivity = (id, { body = '', file } = {}) => {
  const trimmedBody = String(body || '').trim();

  if (file) {
    const formData = new FormData();
    if (trimmedBody) {
      formData.append('body', trimmedBody);
    }
    formData.append('file', file.originFileObj || file);
    return issue_request.post(
      `${PORTAL_ISSUES_BASE}/${id}/activities`,
      formData,
    );
  }

  return issue_request.post(`${PORTAL_ISSUES_BASE}/${id}/activities`, {
    body: trimmedBody,
  });
};

export const downloadPortalIssueActivityAttachment = (
  issueId,
  activityId,
  attachmentIndex,
) =>
  issue_request.get(
    `${PORTAL_ISSUES_BASE}/${issueId}/activities/${activityId}/attachments/${attachmentIndex}/download`,
  );

export const updatePortalIssueActivity = (issueId, activityId, { body = '' } = {}) =>
  issue_request.put(`${PORTAL_ISSUES_BASE}/${issueId}/activities/${activityId}`, {
    body: String(body || '').trim(),
  });

export const deletePortalIssueActivity = (issueId, activityId) =>
  issue_request.delete(`${PORTAL_ISSUES_BASE}/${issueId}/activities/${activityId}`);

export const deletePortalIssueActivityAttachment = (
  issueId,
  activityId,
  attachmentIndex,
) =>
  issue_request.delete(
    `${PORTAL_ISSUES_BASE}/${issueId}/activities/${activityId}/attachments/${attachmentIndex}`,
  );

export const fetchPortalServiceProviders = () =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/service-providers`);

export const searchPortalMembers = query =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/members/search`, {
    params: { q: query },
  });
