import * as Sentry from '@sentry/react';
import { Constants } from './Constants';

const MainDefaultState: {
  exception: boolean;
  mode: boolean;
} = {
  exception: false,
  mode: true,
};

const MainReducer = (state = MainDefaultState, action: any) => {
  try {
    if (action.type === Constants.EXCEPTION_ERROR) {
      return {
        ...state,
        exception: true,
      };
    }
    if (action.type === Constants.THEME_MODE) {
      return {
        ...state,
        mode: action.mode,
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

export default MainReducer;
