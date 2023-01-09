import Constants from '../constants';

export const folderRequest = (data, onEnd) => ({
  ...data,
  onEnd,
  type: Constants.NEW_FOLDER_REQUEST.toString(),
});
