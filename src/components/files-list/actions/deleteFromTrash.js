import Constants from '../constants';

export const deleteTrashRequest = items => ({
  filter: 'trash',
  items,
  type: Constants.DELETE_TRASH_REQUEST.toString(),
});
export const emptyTrashRequest = () => ({
  type: Constants.EMPTY_TRASH_REQUEST.toString(),
});
