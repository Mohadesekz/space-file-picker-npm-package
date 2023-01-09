import Constants from '../constants';

export const renameRequest = data => ({
  ...data,
  type: Constants.RENAME_REQUEST.toString(),
});

export const renameFailure = data => ({
  ...data,
  type: Constants.RENAME_FAILURE,
});
