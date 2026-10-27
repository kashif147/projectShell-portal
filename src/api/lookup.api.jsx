import request from './request';

export const fetchAllLookupRequest = () => {
  return request.get('/api/lookup');
};

export const fetchLookupById = id => {
  return request.get(`/api/lookup/${id}`);
};

// Phase A / A13: by the lookup type's stable code (e.g. WORKLOC), for the session's tenant.
export const fetchLookupHierarchyByTypeCode = typeCode => {
  return request.get(`/api/lookup/by-type-code/${encodeURIComponent(typeCode)}/hierarchy`);
};

export const fetchAllCountry = () => {
  return request.get(`/api/countries`);
};