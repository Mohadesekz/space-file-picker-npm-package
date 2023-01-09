import Constants from '../constants';

export const restoreTrashRequest = () => ({
  type: Constants.RESTORE_TRASH_REQUEST.toString(),
});
export const restoreAllTrashRequest = items => ({
  items,
  type: Constants.RESTORE_ALL_TRASH_REQUEST.toString(),
});
