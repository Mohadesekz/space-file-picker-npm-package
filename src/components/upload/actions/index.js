import Constants from '../constants';

export const uploadStart = () => ({
  type: Constants.START_UPLOAD.toString(),
});

export const uploadRequest = file => ({
  type: Constants.UPLOAD_REQUEST.toString(),
  payload: file,
});

export const uploadProgress = (file, progress) => ({
  type: Constants.UPLOAD_PROGRESS,
  payload: progress,
  file,
});

export const uploadSuccess = file => ({
  type: Constants.UPLOAD_SUCCESS.toString(),
  file,
});

export const uploadFailure = file => ({
  type: Constants.UPLOAD_FAILURE,
  file,
});

export const uploadFailureNoRetry = file => ({
  type: Constants.UPLOAD_FAILURE_NO_RETRY,
  file,
});

export const uploadCancel = file => ({
  type: Constants.UPLOAD_CANCEL,
  payload: file,
});

export const uploadPause = file => ({
  type: Constants.UPLOAD_PAUSE,
  payload: file,
});

export const uploadResume = file => ({
  type: Constants.UPLOAD_RESUME,
  payload: file,
});

export const cancelAll = {
  type: Constants.CANCEL_ALL.toString(),
};

export const closeBox = {
  type: Constants.CLOSE.toString(),
};
////////////////////////////////////////////////////////////////////

export const setUploadActions = (file, onCancel, onPause, onResume) => {
  return {
    onCancel,
    onPause,
    onResume,
    file,
    type: Constants.SET_UPLOAD_ACTIONS,
  };
};
