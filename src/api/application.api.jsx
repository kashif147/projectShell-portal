import application_request from './application_request';

export const fetchPersonalDetail = () => {
  return application_request.get('/personal-details');
};

export const createPersonalDetailRequest = data => {
  return application_request.post('/personal-details', data);
};

export const updatePersonalDetailRequest = data => {
  return application_request.put('/personal-details', data);
};

export const deletePersonalDetailRequest = () => {
  return application_request.put('/personal-details');
};

export const fetchProfessionalDetail = id => {
  return application_request.get(`/professional-details/${id}`);
};

export const createProfessionalDetailRequest = (id, data) => {
  return application_request.post(`/professional-details/${id}`, data);
};

export const updateProfessionalDetailRequest = data => {
  return application_request.put('/professional-details', data);
};

export const deleteProfessionalDetailRequest = () => {
  return application_request.put('/professional-details');
};

export const fetchSubscriptionDetail = id => {
  return application_request.get(`/subscription-details/${id}`);
};

export const createSubscriptionDetailRequest = (id, data) => {
  return application_request.post(`/subscription-details/${id}`, data);
};

export const updateSubscriptionDetailRequest = data => {
  return application_request.put('/subscription-details', data);
};

export const deleteSubscriptionDetailRequest = () => {
  return application_request.put('/subscription-details');
};