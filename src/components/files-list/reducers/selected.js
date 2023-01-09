import Constants from '../constants';
import SidebarConstants from '../../sidebar/constants';
import * as Sentry from '@sentry/react';

const selectedReducerDefaultState = {
  data: [],
  lastData: {},
  hash: [],
  lastHash: null,
  empty: true,
  exception: false,
};

export default (state = selectedReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.SELECT_ITEM)) {
      return {
        ...state,
        hash: !action.explicit
          ? action.details.hash
            ? [action.details.hash]
            : []
          : state.hash.concat(action.details.hash),
        lastHash: action.details.hash || null,
        empty: action.details.hash ? false : true,
        data: !action.explicit
          ? action.details.hash
            ? [action.details]
            : []
          : state.data.concat(action.details),
        lastData: action.details,
        random: Math.random(),
      };
    }

    if (
      Object.is(action.type, Constants.UNSELECT_ITEM) ||
      Object.is(action.type, SidebarConstants.CHANGE_FILTER)
    ) {
      const data =
        action.type !== SidebarConstants.CHANGE_FILTER && action.details
          ? state.data.filter(item => item.hash.indexOf(action.details.hash) < 0)
          : [];
      return {
        ...state,
        empty: data.length === 0,
        data: data,
        lastData: data.lastItem || {},
        hash: data.map(item => item.hash),
        lastHash: (data.lastItem || {}).hash,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.UNSELECT_ALL)) {
      return Object.assign({}, state, {
        ...state,
        data: [],
        lastData: {},
        hash: [],
        lastHash: null,
        empty: true,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPDATE_SELECT)) {
      return Object.assign({}, state, {
        ...action.data,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.SELECT_ALL_ITEMS)) {
      let data = [];
      let hash = [];
      const { fileList } = action;
      Object.keys(fileList).forEach(key => {
        data = [...data, fileList[key]];
        hash = [...hash, fileList[key].hash];
      });
      return {
        ...state,
        hash,
        lastHash: data[0].hash || null,
        empty: false,
        data,
        lastData: data[0],
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
