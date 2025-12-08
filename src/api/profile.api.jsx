import profile_request from './profile_request';  

export const profileRequest = data => {
  return profile_request.post('/api/transfer-request', data);
};

export const fetchProfileRequest = () =>{
  return profile_request.get('/api/profile/my-profile')
}

export const fetchProfileByIdRequest = (id) =>{
  return profile_request.get(`/api/profile/${id}`)
}