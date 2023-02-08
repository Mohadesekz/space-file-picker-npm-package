import * as Sentry from '@sentry/react';
import { Constants } from './Constants';

const MainDefaultState: {
  exception: boolean;
  mode: boolean;
  singleOrBatch: boolean;
  canUpload: boolean;
  isFolderAllowed: boolean;
} = {
  exception: false,
  mode: true,

  // True means batch pick and False means single pick
  singleOrBatch: true,
  canUpload: true,
  isFolderAllowed: true,
};

const MainReducer = (state = MainDefaultState, action: any) => {
  try {
    if (action.type === Constants.EXCEPTION_ERROR) {
      return {
        ...state,
        exception: true,
      };
    }
    if (action.type === Constants.THEME_MODE) {
      return {
        ...state,
        mode: action.mode,
      };
    }
    if (action.type === Constants.SINGLE_OR_BATCH_PICK) {
      return {
        ...state,
        singleOrBatch: action.singleOrBatchPick,
      };
    }
    if (action.type === Constants.CAN_UPLOAD) {
      return {
        ...state,
        canUpload: action.canUpload,
      };
    }
    if (action.type === Constants.IS_FOLDER_ALLOWED) {
      return {
        ...state,
        isFolderAllowed: action.isFolderAllowed,
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

export default MainReducer;
