import Constants from '../constants';
import { ITeam } from './../../../Interfaces/Teams.interface';
import * as Sentry from '@sentry/react';

const TeamDefaultState: {
  teams: ITeam[];
  exception: boolean;
} = {
  teams: [],
  exception: false,
};

const TeamReducer = (state = TeamDefaultState, action: any) => {
  try {
    if (action.type === Constants.RECEIVE_TEAMS.toString()) {
      return {
        ...state,
        teams: action.teams,
      };
    }
  } catch (error) {
    Sentry.captureException(error);
    return {
      ...state,
      exception: true,
    };
  }

  return state;
};

export default TeamReducer;
