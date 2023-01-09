import Constants from '../constants';

export const changeAdvancedSearch = searchCr => ({
  searchCr,
  type: Constants.CHANGE_SEARCH,
});

export const getMe = onEnd => ({
  onEnd,
  type: Constants.GET_ME.toString(),
});

export const getTeams = onEnd => {
  return {
    onEnd,
    type: Constants.GET_TEAMS.toString(),
  };
};

export const receiveTeams = teams => {
  return {
    teams,
    type: Constants.RECEIVE_TEAMS.toString(),
  };
};
