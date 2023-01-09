import Constants from '../constants';

export const bookmarkRequest = () => ({
  type: Constants.BOOKMARK_REQUEST.toString(),
});

export const bookmarkSuccess = hashList => ({
  hashList,
  type: Constants.BOOKMARK_SUCCESS.toString(),
});
