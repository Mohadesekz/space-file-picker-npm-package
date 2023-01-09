import Constants from '../constants';

export const addToCopy = (items, action, onEnd) => ({
  items,
  action,
  onEnd,
  type: Constants.COPY_ADD_ITEMS,
});

export const copyFilesRequest = (hash, filter, onEnd) => ({
  hash,
  filter,
  onEnd,
  type: Constants.COPY_FILES_REQUEST.toString(),
});

export const copyFilesSuccess = () => ({
  type: Constants.COPY_FILES_SUCCESS,
});

export const bulkCopyFileSuccess = hash => ({
  hash,
  type: Constants.BULK_COPY_FILES_SUCCESS,
});

export const copyFilesFailure = () => ({
  type: Constants.COPY_FILES_FAILURE,
});
