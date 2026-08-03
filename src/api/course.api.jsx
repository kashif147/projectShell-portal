import event_request from './event_request';

export const fetchCoursesRequest = (params) => {
  return event_request.get('/api/courses', { params });
};

export const fetchCourseByIdRequest = (id) => {
  return event_request.get(`/api/courses/${id}`);
};

export const createCourseRegistrationRequest = (data) => {
  return event_request.post('/api/registrations', data);
};
