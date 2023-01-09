import Constants from '../constants';
import * as Sentry from '@sentry/react';

const copyReducerDefaultState = {
  type: '', // enum(copy | cut)
  items: [],
  isEmpty: true,
  hasError: false,
  exception: false,
};

export default (state = copyReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.COPY_ADD_ITEMS)) {
      return {
        ...state,
        type: action.action,
        items: action.items,
        isEmpty: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.COPY_FILES_REQUEST.toString())) {
      return {
        ...state,
        hasError: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.COPY_FILES_SUCCESS)) {
      return {
        ...copyReducerDefaultState,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.CANCEL_COPY_FILES)) {
      return {
        ...state,
        items: [],
        isEmpty: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.BULK_COPY_FILES_SUCCESS)) {
      const items = [...state.items.filter(item => item.hash !== action.hash)];
      return {
        ...state,
        items,
        isEmpty: items.length === 0,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.COPY_FILES_FAILURE)) {
      return {
        ...state,
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
