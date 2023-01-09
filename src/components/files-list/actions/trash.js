import Constants from '../constants';

export const trashFilesRequest = (filter, hash, onEnd) => ({
  hash,
  filter,
  onEnd,
  type: Constants.TRASH_FILES_REQUEST.toString(),
});
