/**
 * Check if user has MEMBER role from decoded token (userDetail)
 * @param {object} userDetail - Decoded JWT payload (auth.userDetail)
 * @returns {boolean}
 */
export const hasMemberRole = userDetail => {
  if (!userDetail) return false;

  const roles = userDetail?.roles;
  if (!Array.isArray(roles)) return false;

  return roles.some(role => {
    if (typeof role === 'string') {
      return role === 'MEMBER';
    }

    return role?.code === 'MEMBER' || role?.name === 'MEMBER';
  });
};

/**
 * Active portal profile with an assigned membership number.
 * @param {object} profileDetail
 * @returns {boolean}
 */
export const isActivePortalMember = profileDetail => {
  if (!profileDetail?.membershipNumber) return false;
  return profileDetail.isActive !== false;
};
