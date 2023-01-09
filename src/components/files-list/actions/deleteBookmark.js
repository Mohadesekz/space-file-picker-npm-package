import Constants from '../constants';

export const deleteBookmarkRequest = data => ({
  ...data,
  type: Constants.DELETE_BOOKMARK_REQUEST.toString(),
});

export const deleteBookmarkSuccess = hashList => ({
  hashList,
  type: Constants.DELETE_BOOKMARK_SUCCESS.toString(),
});
