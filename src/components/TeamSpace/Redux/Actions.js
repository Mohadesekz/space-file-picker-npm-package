import Constants from './Constants';

export const createTeam = (teamDetails, onEnd) => {
  return {
    onEnd,
    type: Constants.CREATE_TEAM.toString(),
    teamDetails,
  };
};
