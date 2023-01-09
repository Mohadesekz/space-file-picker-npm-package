import Constants from '../constants';

export const shareRequest = (data, onEnd) => ({
  ...data,
  onEnd,
  type: Constants.SHARE_REQUEST.toString(),
});

export const shareSuccess = (listItems, filter) => {
  return {
    listItems,
    filter,
    type: Constants.SHARE_SUCCESS,
  };
};

export const sharePasswordRequest = (password, hash, orginalType, onEnd) => {
  return {
    onEnd,
    password,
    hash,
    orginalType,
    type: Constants.SHARE_PASSWORD_REQUEST.toString(),
  };
};
