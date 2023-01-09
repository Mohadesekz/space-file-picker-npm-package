import Constants from '../constants';

export const selectItem = (details, filter, explicit) => ({
  filter,
  details,
  explicit,
  type: Constants.SELECT_ITEM,
});

export const selectAllItems = (filter, fileList) => ({
  filter,
  fileList,
  type: Constants.SELECT_ALL_ITEMS,
});

export const unSelectItem = (filter, details) => ({
  filter,
  details,
  type: Constants.UNSELECT_ITEM,
});

export const unSelectAll = () => ({
  type: Constants.UNSELECT_ALL,
});

export const updateSelect = data => ({
  data,
  type: Constants.UPDATE_SELECT,
});
