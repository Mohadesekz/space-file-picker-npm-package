import Constants from '../constants';
import { Util } from '../../../helpers';
import lodashSize from 'lodash/size';
import * as Sentry from '@sentry/react';

export const RecentReducerDefaultState = {
  recents: {},
  isLoading: false,
  hasError: false,
  size: 0,
  exception: false,
};

export default (state = RecentReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.GETRECENT_REQUEST.toString())) {
      return {
        ...state,
        hasError: false,
        isLoading: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.GETRECENT_SUCCESS)) {
      let result;
      if (action.response && action.response.list) {
        result = Util.recentsMapKeyIdToHashFile(action.response.list);
      }
      const size = lodashSize(result);

      return {
        ...state,
        recents: result,
        isLoading: false,
        random: Math.random(),
        size,
      };
    }

    // if (Object.is(action.type, Constants.GETRECENT_AFTER_LIKE_SUCCESS.toString())) {
    //   let { recents } = state;
    //   const { lastHash, action: fileLikeData } = action.data;
    //   if (
    //     recents[lastHash] &&
    //     recents[lastHash].reference !== 'FOLDER' &&
    //     (recents[lastHash] || recents[lastHash].entity.postId === fileLikeData.postId)
    //   ) {
    //     recents[lastHash].entity['like'] = !fileLikeData.like;
    //   }

    //   return Object.assign({}, state, {
    //     recents,
    //     isLoading: false,
    //     random: Math.random(),
    //   });
    // }

    if (Object.is(action.type, Constants.GETRECENT_FAILURE)) {
      return {
        ...state,
        isLoading: false,
        hasError: true,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.BOOKMARK_SUCCESS.toString())) {
      let { recents } = state;
      action.hashList.forEach(itemHahs => {
        if (recents[itemHahs]) {
          recents[itemHahs].entity.isBookmarked = true;
        }
      });
      return Object.assign({}, state, {
        recents,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.DELETE_BOOKMARK_SUCCESS.toString())) {
      let { recents } = state;
      action.hashList.forEach(hashList => {
        if (recents[hashList]) {
          recents[hashList].entity.isBookmarked = false;
        }
      });
      return Object.assign({}, state, {
        recents,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.REMOVE_PUBLIC_HASH)) {
      let recents = state.recents;
      const fileOrFolder = recents[action.hash] ? recents[action.hash] : null;

      if (fileOrFolder) {
        if (action.itemType === 'PUBLIC') {
          if (fileOrFolder.file && fileOrFolder.file.public) fileOrFolder.file.public = false;
          else if (fileOrFolder.folder && fileOrFolder.folder.public)
            fileOrFolder.folder.public = false;
        } else if (action.itemType === 'PRIVATE') {
          if (fileOrFolder.file && fileOrFolder.file.share) fileOrFolder.file.share = false;
          else if (fileOrFolder.folder && fileOrFolder.folder.shared)
            fileOrFolder.folder.shared = false;
        }
      }

      return {
        ...state,
        recents,
        random: Math.random(),
      };
    }

    // if (Object.is(action.type, Constants.FETCH_RECENT_FILES_LIKED_FROM_CORE_SUCCESS.toString())) {
    // const stateDataRecents = state.recents;
    // const { files, likeFiles } = action.data;
    // files.data.result.forEach((item, index) => {
    //   if (item.file !== undefined) {
    //     likeFiles.data.result.forEach((it, ix) => {
    //       if (item.file.postId === it.postId) {
    //         const hashFile = files.data.result[index].file['hash'];
    //         stateDataRecents[hashFile].file['like'] = it.liked;
    //       }
    //     });
    //   }
    // });
    // return Object.assign({}, state, {
    //   stateDataRecents,
    //   random: Math.random(),
    // });
    // }

    if (Object.is(action.type, Constants.SHARE_SUCCESS)) {
      const { recents } = state;
      const { listItems } = action;
      listItems.forEach(item => {
        if (recents[item.entity.hash]) {
          if (item.type === 'PUBLIC') {
            recents[item.entity.hash].entity.isPublic = true;
          } else if (item.type === 'PRIVATE') {
            recents[item.entity.hash].entity.isShared = true;
          }
        }
      });

      return Object.assign({}, state, {
        recents,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.REMOVE_SHARE_SUCCESS) && action.filter === 'mybox') {
      const { recents } = state;
      if (recents[action.hash]) {
        if (action.shareType === 'PUBLIC') {
          recents[action.hash].entity.isPublic = false;
        } else if (action.shareType === 'PRIVATE') {
          recents[action.hash].entity.isShared = false;
        }
      }
      return Object.assign({}, state, {
        recents,
        random: Math.random(),
      });
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
