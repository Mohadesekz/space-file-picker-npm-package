// Activity Reducer
import Constants from '../constants';
import * as Sentry from '@sentry/react';

const ActivityReducerDefaultState = {
  activities: [],
  isLoading: false,
  hasError: false,
  comments: [],
  exception: false,
};

export default (state = ActivityReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.GET_ACTIVITIES_REQUEST.toString())) {
      return {
        ...state,
        hasError: false,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GET_ACTIVITIES_SUCCESS)) {
      return {
        ...state,
        activities: action.activityList,
        isLoading: false,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GET_ACTIVITIES_FAILURE)) {
      return {
        ...state,
        activities: [],
        isLoading: false,
        hasError: true,
        random: Math.random(),
      };
    }

    // if (Object.is(action.type, Constants.GET_COMMENTS.toString())) {
    //   return {
    //     ...state,
    //     isLoading: true,
    //     random: Math.random(),
    //   };
    // }

    // if (Object.is(action.type, Constants.GET_COMMENTS_SUCCESS.toString())) {
    //   return {
    //     ...state,
    //     comments: action.comments,
    //     isLoading: false,
    //     random: Math.random(),
    //   };
    // }

    // if (Object.is(action.type, Constants.SEND_COMMENT_SUCCESS.toString())) {
    //   return {
    //     ...state,
    //     comments: [...state.comments, action.comment],
    //     isLoading: false,
    //     random: Math.random(),
    //   };
    // }
    // if (Object.is(action.type, Constants.LIKE_COMMENT_SUCCESS.toString())) {
    //   let { comments } = state;
    //   comments.forEach(item => {
    //     if (item.id === action.commentID) {
    //       item.liked = action.liked;
    //     }
    //   });
    //   return {
    //     ...state,
    //     comments: comments,
    //     isLoading: false,
    //     random: Math.random(),
    //   };
    // }
  } catch (error) {
    Sentry.captureException(error);
    return {
      ...state,
      exception: true,
    };
  }

  return state;
};
