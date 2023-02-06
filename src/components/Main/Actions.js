import { Constants } from './Constants';

export const throw_exception = error => {
  return {
    error,
    type: Constants.EXCEPTION_ERROR,
  };
};

export const themeMode = mode => {
  return {
    mode,
    type: Constants.THEME_MODE,
  };
};

export const singleOrBatchPick = singleOrBatchPick => {
  return {
    singleOrBatchPick,
    type: Constants.SINGLE_OR_BATCH_PICK,
  };
};

export const canUpload = canUpload => {
  return {
    canUpload,
    type: Constants.CAN_UPLOAD,
  };
};
