// Activity Reducer
import Constants from '../constants';
import * as Sentry from '@sentry/react';

const ShareReducerDefaultState = {
  shares: [],
  isLoading: false,
  hasError: false,
  exception: false,
};

export default (state = ShareReducerDefaultState, action) => {
  try {
    if (
      Object.is(action.type, Constants.GET_SHARE_REQUEST.toString()) ||
      Object.is(action.type, Constants.REMOVE_SHARE_REQUEST.toString()) ||
      Object.is(action.type, Constants.REMOVE_ALL_SHARE_REQUEST.toString())
    ) {
      return {
        ...state,
        hasError: false,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.SHARE_INFO_UPDATE)) {
      const publicShareIndex = action.shareList.findIndex(share => share.type === 'PUBLIC');
      if (publicShareIndex !== -1) {
        const secondIndex = action.shareList.findIndex(
          (share, index) => index !== publicShareIndex && share.type === 'PUBLIC',
        );
        if (secondIndex !== -1) {
          action.shareList = [...action.shareList.filter((share, index) => index !== secondIndex)];
        }
      }

      const shares = action.updateList
        ? action.shareList || []
        : state.shares.filter(item => item.hash !== action.shareHash);
      return {
        ...state,
        shares,
        isLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GET_SHARE_FAILURE)) {
      return {
        ...state,
        shares: [],
        isLoading: false,
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
