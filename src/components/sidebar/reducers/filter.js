// Filter Reducer
import Constants from '../constants';
import * as Sentry from '@sentry/react';
import { Util } from '../../../helpers';

const filterResult = Util.getFilterByPath();

const FilterReducerDefaultState = {
  selected: filterResult.filter,
  options: [
    {
      id: 'search',
      name: 'جستجو',
      icon: 'info',
      path: '/search',
    },
    {
      id: 'mybox',
      name: 'همه‌ی فایل‌ها',
      icon: 'box',
      path: '/my-space',
    },
    {
      id: 'lastmod',
      name: 'فایل‌های اخیر',
      icon: 'time-circle',
      path: '/recent',
    },
    {
      id: 'shared',
      name: 'مشترک‌شده با من',
      icon: 'personal-folder',
      path: '/shared-with-me',
    },
    {
      id: 'favorite',
      name: 'نشان ‌شده‌ها',
      icon: 'star',
      path: '/bookmark',
    },
    {
      id: 'trash',
      name: 'سطل بازیافت',
      icon: 'trash',
      path: '/trash',
    },
  ],
  exception: false,
};

export default (state = FilterReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.CHANGE_FILTER)) {
      //TODO REMOVE id from all changefilter action
      const filterSelected = Util.getFilterByPath();
      return {
        ...state,
        body: action.body,
        selected: filterSelected.filter,
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
