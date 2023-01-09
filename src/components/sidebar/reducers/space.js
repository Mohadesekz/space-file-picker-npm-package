// Space Reducer
import Constants from '../constants';
import * as Sentry from '@sentry/react';

const SpaceReducerDefaultState = {
  total: undefined,
  inUse: undefined,
  inUsePercentage: 0,
  isLoading: true,
  isPlanLoading: true,
  plans: [],
  hasError: undefined,
  hasPlanError: false,
  exception: false,
};

export default (state = SpaceReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.FETCH_SPACE_REQUEST.toString())) {
      return {
        ...state,
        hasError: undefined,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.FETCH_SPACE_SUCCESS)) {
      return {
        ...state,
        ...action.response,
        isLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.FETCH_SPACE_FAILURE)) {
      return {
        ...state,
        hasError: action.error,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.FETCH_PLAN_REQUEST.toString())) {
      return {
        ...state,
        hasPlanError: false,
        isPlanLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.FETCH_PLAN_SUCCESS)) {
      return {
        ...state,
        plans: action.plans,
        isPlanLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.FETCH_PLAN_FAILURE)) {
      return {
        ...state,
        hasPlanError: true,
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
