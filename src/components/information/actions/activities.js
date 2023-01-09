import Constants from '../constants';

export const activityRequest = data => ({
  ...data,
  type: Constants.GET_ACTIVITIES_REQUEST.toString(),
});

export const activitySuccess = activityList => ({
  activityList,
  type: Constants.GET_ACTIVITIES_SUCCESS,
});

export const activityFailure = () => ({
  type: Constants.GET_ACTIVITIES_FAILURE,
});

// export const getComments = postId => ({
//   postId,
//   type: Constants.GET_COMMENTS.toString(),
// });

// export const getCommnetSuccess = comments => ({
//   comments,
//   type: Constants.GET_COMMENTS_SUCCESS.toString(),
// });

// export const sendComment = (postId, comment) => ({
//   postId,
//   comment,
//   type: Constants.SEND_COMMENT.toString(),
// });

// export const sendCommnetSuccess = comment => ({
//   comment,
//   type: Constants.SEND_COMMENT_SUCCESS.toString(),
// });

// export const likeComment = (commentID, liked) => ({
//   liked,
//   commentID,
//   type: Constants.LIKE_COMMENT.toString(),
// });

// export const likeCommnetSuccess = (commentID, liked) => ({
//   liked,
//   commentID,
//   type: Constants.LIKE_COMMENT_SUCCESS.toString(),
// });
