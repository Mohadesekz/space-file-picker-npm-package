import Constants from '../constants';
import * as Sentry from '@sentry/react';

const HistoryReducerDefaultState = {
  histories: [],
  isLoading: false,
  hasError: false,
  exception: false,
};

export default (state = HistoryReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.GET_HISTORIES_REQUEST.toString())) {
      return {
        ...state,
        hasError: false,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GET_HISTORIES_SUCCESS)) {
      const histories = (action.response || []).sort((a, b) => {
        if (a.version > b.version) return 1;
        if (b.version > a.version) return -1;
        return 0;
      });
      return {
        ...state,
        histories,
        isLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GET_HISTORIES_FAILURE)) {
      return {
        ...state,
        histories: [],
        isLoading: false,
        hasError: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.RESTORE_FILE_REQUEST.toString())) {
      return {
        ...state,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.RESTORE_FILE_FAILURE.toString())) {
      return {
        ...state,
        isLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.UPDATE_HISTORIES.toString())) {
      return {
        ...state,
        histories: action.histories,
        isLoading: false,
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
