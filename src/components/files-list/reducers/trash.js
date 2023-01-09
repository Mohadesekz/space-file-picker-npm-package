import Constants from '../constants';
import * as Sentry from '@sentry/react';

const trashReducerDefaultState = {
  items: [],
  isEmpty: true,
  hasError: false,
  exception: false,
};

export default (state = trashReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.TRASH_ADD_ITEMS)) {
      return {
        ...state,
        items: action.items,
        isEmpty: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.TRASH_FILES_SUCCESS)) {
      return {
        ...trashReducerDefaultState,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.TRASH_FILES_FAILURE)) {
      return {
        ...state,
        items: [],
        isEmpty: true,
        hasError: true,
        random: Math.random(),
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
