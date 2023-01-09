import Constants from '../constants';

export const historyRequest = data => ({
  ...data,
  type: Constants.GET_HISTORIES_REQUEST.toString(),
});

export const historySuccess = response => ({
  response,
  type: Constants.GET_HISTORIES_SUCCESS,
});

export const historyFailure = () => ({
  type: Constants.GET_HISTORIES_FAILURE,
});

export const fileRestoreRequest = (hash, orginalHash) => ({
  orginalHash,
  hash,
  type: Constants.RESTORE_FILE_REQUEST.toString(),
});

export const fileRestoreFailure = hash => ({
  hash,
  type: Constants.RESTORE_FILE_FAILURE.toString(),
});
