import { call, put, take, all, takeEvery, takeLatest, select, fork } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import Constants from './constants';
import { refreshToken } from '../../helpers/refreshToken';
import {
  setUploadActions,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  // uploadFailureNoRetry,
  closeBox,
} from './actions';
import { addItemInList } from '../files-list/actions';
import { newFetch } from '../../helpers';
import { resumableUploader } from '../../helpers';
import { Uploader } from '../../helpers';
import { AppToaster } from '../toast';
import { Intent } from '@blueprintjs/core';
import { fetchSpaceRequest } from '../sidebar/actions';

const retryActionChannel = channel();
function* uploadFile(action) {
  if (action.payload.folderHash !== 'NOT_CONFIRMED') {
    let channel;
    const isFileSmall = action.payload.size <= 1024 * 1024;
    if (isFileSmall) {
      channel = yield call(Uploader, action.payload);
    } else {
      channel = yield call(resumableUploader, action.payload);
    }
    while (true) {
      const {
        progress = 0,
        error,
        success,
        onPause,
        onResume,
        onCancel,
        res,
        uploadKey,
      } = yield take(channel);
      if (error === 401) {
        yield refreshToken();
        retryActionChannel.put(action);
        return;
      } else if (error) {
        yield put(uploadFailure(action.payload));
        // AppToaster.dismiss('alert-fetch-plan');
        AppToaster.show(
          {
            message: ` خطا در آپلود فایل ${action.payload.name} ،لطفا مجدد تلاش کنید `,
            timeout: 5000,
            icon: 'warning-sign',
            intent: Intent.DANGER,
          },
          `alert-fetch-plan + ${action.payload.name}`,
        );
        // return;
      }

      // else if (error === 500) {
      //   yield put(uploadFailureNoRetry(action.payload));
      //   AppToaster.show(
      //     {
      //       message: ` مشکلی در آپلود فایل ${action.payload.name} .بوجود آمد `,
      //       timeout: 5000,
      //       icon: 'warning-sign',
      //       intent: Intent.DANGER,
      //     },
      //     `alert-fetch-plan + ${action.payload.name}`,
      //   );
      // }

      if (success) {
        const filter = yield select(state => state.sidebar.filter.selected);
        const folderHash = yield select(state => state.files.list.hash);
        if (!action.payload.replace && isFileSmall) {
          const req = JSON.parse(res);
          const result = req.result;
          const {
            attributes,
            created,
            extension,
            hash,
            name,
            owner,
            parentHash,
            size,
            thumbnail,
            type,
            updated,
            uploader,
            version,
          } = result;
          const item = {
            attributes,
            created,
            extension,
            hash,
            name,
            owner,
            parentHash,
            size,
            thumbnail,
            type,
            updated,
            uploader,
            version,
          };
          if (parentHash === result.parentHash) {
            //if we are in currect folder
            const accessLevel = yield select(state => state.files.list.accessLevel);
            yield put(
              addItemInList(filter, {
                ...item,
                accessLevel,
              }),
            );
          }

          yield put(fetchSpaceRequest);
          yield put(uploadSuccess(action.payload));
        } else if (action.payload && !action.payload.replace) {
          const filter = yield select(state => state.sidebar.filter.selected);
          const result = yield call(
            newFetch,
            `/files/uploaded_file_info/${uploadKey}`,
            'GET',
            {},
            {},
            false,
          );
          if (result && result.type !== 'ERROR') {
            if (folderHash === result.parentHash) {
              //if we are in currect folder
              const accessLevel = yield select(state => state.files.list.accessLevel);
              yield put(
                addItemInList(filter, {
                  ...result,
                  accessLevel,
                }),
              );
            }
          }
          yield put(fetchSpaceRequest);
          yield put(uploadSuccess(res));
        } else if (isFileSmall) {
          console.log("i'm a small repalce file");
          yield put(fetchSpaceRequest);
          yield put(uploadSuccess(action.payload));
        } else if (!isFileSmall) {
          console.log("i'm a big repalce file");
          yield put(fetchSpaceRequest);
          yield put(uploadSuccess(res));
        }

        return;
      }
      if (onCancel && onPause && onResume) {
        yield put(setUploadActions(action.payload, onCancel, onPause, onResume));
      }
      yield put(uploadProgress(action.payload, progress));
    }
  }
}

function* cancelAllUploads(action) {
  yield put(closeBox);
}

function* channelWatcher(chanName) {
  while (true) {
    const action = yield take(chanName);
    yield put(action);
  }
}

export default function* watchAll() {
  yield all([
    takeEvery(Constants.UPLOAD_REQUEST.toString(), uploadFile),
    takeLatest(Constants.CANCEL_ALL.toString(), cancelAllUploads),
  ]);
  yield fork(channelWatcher, retryActionChannel);
}
