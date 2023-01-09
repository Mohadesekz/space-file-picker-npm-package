import Constants from '../constants';

export const recentRequest = data => ({
  ...data,
  type: Constants.GETRECENT_REQUEST.toString(),
});

export const recentSuccess = response => {
  return {
    response,
    type: Constants.GETRECENT_SUCCESS,
  };
};

export const recentFailure = () => ({
  type: Constants.GETRECENT_FAILURE,
});

// export const likeAndDislikeRecents = (postId, like, hash) => {
//   return {
//     postId,
//     like,
//     hash,
//     type: Constants.GETRECENT_FILE_LIKE.toString(),
//   };
// };

// export const successAfterLikeRecents = data => {
//   return {
//     data,
//     type: Constants.GETRECENT_AFTER_LIKE_SUCCESS.toString(),
//   };
// };

// export const fetchRecentFilesLikedFromCore = data => {
//   return {
//     data,
//     type: Constants.FETCH_RECENT_FILES_LIKED_FROM_CORE.toString(),
//   };
// };

// export const fetchRecentFilesLikedFromCoreSuccess = data => {
//   return {
//     data,
//     type: Constants.FETCH_RECENT_FILES_LIKED_FROM_CORE_SUCCESS.toString(),
//   };
// };
