import Constants from '../constants';

export const changeFilter = (id, body) => ({
  id,
  body,
  type: Constants.CHANGE_FILTER,
});
