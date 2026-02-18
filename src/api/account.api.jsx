import acount_request from './acount_request';

export const getAccountStatementRequest = memberId => {
  return acount_request.get(`/api/reports/member/${memberId}/statement`);
};

export const getAccountNetBalanceRequest = memberId => {
  return acount_request.get(`/api/reports/member/${memberId}/net-balance`);
};
