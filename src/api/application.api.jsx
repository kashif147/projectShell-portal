import application_request from './application_request';

export const fetchPersonalDetail = () => {
  return application_request.get('/personal-details/me');
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

export const fetchProfessionalDetail = () => {
  return application_request.get('/professional-details');
};

export const createProfessionalDetailRequest = data => {
  return application_request.post('/professional-details', data);
};

export const updateProfessionalDetailRequest = data => {
  return application_request.put('/professional-details', data);
};

export const deleteProfessionalDetailRequest = () => {
  return application_request.put('/professional-details');
};

export const fetchSubscriptionDetail = () => {
  return application_request.get('/subscriptions');
};

export const createSubscriptionDetailRequest = data => {
  return application_request.post('/subscriptions', data);
};

export const updateSubscriptionDetailRequest = data => {
  return application_request.put('/subscriptions', data);
};

export const deleteSubscriptionDetailRequest = () => {
  return application_request.put('/subscriptions');
};