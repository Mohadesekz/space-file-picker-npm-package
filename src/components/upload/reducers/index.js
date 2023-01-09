// Upload Reducer
import Constants from '../constants';
import * as Sentry from '@sentry/react';

const uploadReducerDefaultState = {
  isOpen: false,
  itemsQueue: [],
  uploadInProgressCount: 0,
  exception: false,
};
const removeDuplicates = (fileList, file) => {
  // console.log(
  //   'test' +
  //     fileList.findIndex(
  //       x => x.name == file.name && x.uploadTime == file.uploadTime,
  //       // (x.uploadTime && file.uploadTime ? x.uploadTime == file.uploadTime : false),
  //     ),
  // );
  // console.log('final ' + fileList.findIndex(x => x.name == file.name));

  //Do This is you want to create new row for the replace
  const index = fileList.findIndex(x => x.name === file.name && x.uploadTime === file.uploadTime);
  //Do This is you want to replace the actual one in list
  // const index = fileList.findIndex(x => x.name == file.name);

  let sortQueue = [...fileList];
  if (index === -1) {
    sortQueue.push(file);
  }
  if (index > -1) {
    sortQueue[index] = file;
  }
  return sortQueue;
};
export default (state = uploadReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, Constants.START_UPLOAD.toString())) {
      return Object.assign({}, state, {
        isOpen: true,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_REQUEST.toString()) && state.isOpen) {
      const itemsQueue = removeDuplicates(state.itemsQueue, action.payload);
      return Object.assign({}, state, {
        itemsQueue: itemsQueue,
        uploadInProgressCount:
          action.payload &&
          action.payload.folderHash &&
          action.payload.folderHash !== 'NOT_CONFIRMED'
            ? itemsQueue.filter(item => item.progress !== 1 && item.folderHash !== 'NOT_CONFIRMED')
                .length
            : state.uploadInProgressCount,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_PROGRESS)) {
      let foundIndexFile = state.itemsQueue.findIndex(file => Object.is(file, action.file));
      if (foundIndexFile !== -1) {
        let newState = state;
        newState.itemsQueue[foundIndexFile].progress = action.payload;
        return Object.assign({}, newState, {
          random: Math.random(),
        });
      }
    }

    if (Object.is(action.type, Constants.UPLOAD_SUCCESS.toString())) {
      let foundIndexFile = state.itemsQueue.findIndex(file => Object.is(file, action.file));
      let newState = state;
      if (newState.itemsQueue[foundIndexFile]) {
        newState.itemsQueue[foundIndexFile].uploadState = 'SUCCESS';
      }
      newState.uploadInProgressCount =
        newState.uploadInProgressCount - 1 < 0 ? 0 : newState.uploadInProgressCount - 1;
      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_FAILURE)) {
      let foundIndexFile = state.itemsQueue.findIndex(file => Object.is(file, action.file));
      let newState = state;
      if (newState.itemsQueue[foundIndexFile]) {
        newState.itemsQueue[foundIndexFile].uploadState = 'ERROR';
      }
      if (newState.itemsQueue[foundIndexFile].shouldDelete) {
        newState.itemsQueue = newState.itemsQueue.filter(
          (item, itemIndex) => itemIndex !== foundIndexFile,
        );
      }

      newState.uploadInProgressCount =
        newState.uploadInProgressCount - 1 < 0 ? 0 : newState.uploadInProgressCount - 1;

      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }
    if (Object.is(action.type, Constants.UPLOAD_FAILURE_NO_RETRY)) {
      let foundIndexFile = state.itemsQueue.findIndex(file => Object.is(file, action.file));
      let newState = state;
      if (newState.itemsQueue[foundIndexFile]) {
        newState.itemsQueue[foundIndexFile].uploadState = 'ERROR_NO_RETRY';
      }
      if (newState.itemsQueue[foundIndexFile].shouldDelete) {
        newState.itemsQueue = newState.itemsQueue.filter(
          (item, itemIndex) => itemIndex !== foundIndexFile,
        );
      }

      newState.uploadInProgressCount =
        newState.uploadInProgressCount - 1 < 0 ? 0 : newState.uploadInProgressCount - 1;

      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_CANCEL)) {
      const targetFile = state.itemsQueue.find(file => Object.is(file, action.payload));
      const newState = state;
      newState.itemsQueue = [...state.itemsQueue.filter(file => !Object.is(file, action.payload))];

      setTimeout(() => targetFile && targetFile.onCancel && targetFile.onCancel());

      if (targetFile && !targetFile.cancelUpload) {
        newState.uploadInProgressCount =
          newState.uploadInProgressCount - 1 < 0 ? 0 : newState.uploadInProgressCount - 1;
      }
      newState.isOpen = newState.itemsQueue.length > 0;
      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_PAUSE)) {
      const targetIndex = state.itemsQueue.findIndex(file => Object.is(file, action.payload));
      const newState = state;

      if (newState.itemsQueue[targetIndex]) {
        newState.itemsQueue[targetIndex].uploadState = 'PAUSE';
      }
      newState.itemsQueue[targetIndex].onPause &&
        setTimeout(() => newState.itemsQueue[targetIndex].onPause());

      newState.uploadInProgressCount =
        newState.uploadInProgressCount - 1 < 0 ? 0 : newState.uploadInProgressCount - 1;

      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPLOAD_RESUME)) {
      const targetIndex = state.itemsQueue.findIndex(file => Object.is(file, action.payload));
      const newState = state;
      if (newState.itemsQueue[targetIndex]) {
        newState.itemsQueue[targetIndex].uploadState = 'START';
      }
      newState.itemsQueue[targetIndex].onResume &&
        setTimeout(() => newState.itemsQueue[targetIndex].onResume());

      newState.uploadInProgressCount += 1;

      return Object.assign({}, newState, {
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.CLOSE.toString())) {
      state.itemsQueue.forEach(item => {
        if (item.success || item.error) {
          state.itemsQueue = state.itemsQueue.filter(i => Object.is(item, i));
        } else if (item.onCancel) {
          item.shouldDelete = true;
          setTimeout(() => item.onCancel());
        }
      });
      return {
        isOpen: false,
        itemsQueue: [],
        uploadInProgressCount: 0,
        random: Math.random(),
      };
    }

    ////////////////////////////////////////////////////////////////////////
    if (Object.is(action.type, Constants.SET_UPLOAD_ACTIONS)) {
      let foundIndexFile = state.itemsQueue.findIndex(file => Object.is(file, action.file));
      let newState = state;
      if (newState.itemsQueue[foundIndexFile] && action.onCancel) {
        newState.itemsQueue[foundIndexFile].onCancel = action.onCancel;
      }

      if (newState.itemsQueue[foundIndexFile] && action.onPause) {
        newState.itemsQueue[foundIndexFile].onPause = action.onPause;
      }

      if (newState.itemsQueue[foundIndexFile] && action.onResume) {
        newState.itemsQueue[foundIndexFile].onResume = action.onResume;
      }
      return Object.assign({}, newState, {
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
