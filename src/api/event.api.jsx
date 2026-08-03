import event_request from './event_request';

export const fetchEventsRequest = (params) => {
  return event_request.get('/api/events', { params });
};

export const fetchEventByIdRequest = (id) => {
  return event_request.get(`/api/events/${id}`);
};

export const createEventRegistrationRequest = (data) => {
  return event_request.post('/api/registrations', data);
};

export const fetchMyRegistrationsRequest = (profileId) => {
  return event_request.get(`/api/registrations/profile/${profileId}`);
};

export const cancelRegistrationRequest = (id) => {
  return event_request.put(`/api/registrations/${id}/cancel`, {});
};
