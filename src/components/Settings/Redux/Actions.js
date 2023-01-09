import Constants from './Constants';

export const fetchFtpCreateTokenRequest = onEnd => {
  return {
    onEnd,
    type: Constants.FTP_CREATE_TOKEN_REQUEST.toString(),
  };
};

export const fetchFtpRevokeTokenRequest = onEnd => ({
  onEnd,
  type: Constants.FTP_REVOKE_TOKEN_REQUEST.toString(),
});

export const getDevices = (offset, size, onEnd) => {
  return {
    offset,
    size,
    onEnd,
    type: Constants.GET_DEVICES.toString(),
  };
};

export const revokeDevice = (uid, onEnd) => {
  return {
    uid,
    onEnd,
    type: Constants.REVOKE_DEVICE.toString(),
  };
};

export const addMember = (userDetails, onEnd) => {
  return {
    onEnd,
    userDetails,
    type: Constants.ADD_MEMBER.toString(),
  };
};

export const removeMember = (identity, teamHash, onEnd) => {
  return {
    onEnd,
    identity,
    teamHash,
    type: Constants.REMOVE_MEMBER.toString(),
  };
};

export const getTeamMember = (teamHash, onEnd) => {
  return {
    onEnd,
    teamHash,
    type: Constants.GET_TEAM_MEMBERS.toString(),
  };
};
