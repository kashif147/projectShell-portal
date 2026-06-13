import { useSelector } from 'react-redux';
import { useProfile } from '../contexts/profileContext';
import { hasMemberRole, isActivePortalMember } from '../helpers/role.helper';

/**
 * Member status from JWT roles and portal profile membership.
 * @returns {{ isMember: boolean, userDetail: object }}
 */
export const useMemberRole = () => {
  const userDetail = useSelector(state => state.auth.userDetail);
  const user = useSelector(state => state.auth.user);
  const { profileDetail } = useProfile();

  const isMember =
    hasMemberRole(userDetail) ||
    hasMemberRole(user) ||
    isActivePortalMember(profileDetail);

  return { isMember, userDetail };
};
