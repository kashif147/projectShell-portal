import issue_request from './issue_request';
import { ISSUE_TYPE } from '../helpers/issues.helper';

const PORTAL_ISSUES_BASE = '/api/issues';

const withIssueType = (data = {}) => ({
  ...data,
  issueType: ISSUE_TYPE.COMPLAINT,
});

export const createPortalIssue = (data, _files = []) => {
  const payload = withIssueType(data);

  return issue_request.post(PORTAL_ISSUES_BASE, payload);
};

export const fetchMyPortalIssues = () =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/mine`);

export const fetchPortalIssueById = id =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/${id}`);

export const fetchPortalIssueActivities = id =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/${id}/activities`);

export const createPortalIssueActivity = (id, data) =>
  issue_request.post(`${PORTAL_ISSUES_BASE}/${id}/activities`, data);

export const fetchPortalServiceProviders = () =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/service-providers`);

export const searchPortalMembers = query =>
  issue_request.get(`${PORTAL_ISSUES_BASE}/members/search`, {
    params: { q: query },
  });
