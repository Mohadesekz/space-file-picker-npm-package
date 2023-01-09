import { channel } from 'redux-saga';
import { call, put, all, take, takeEvery, takeLatest, fork, select } from 'redux-saga/effects';
import Constants from './constants';
import {
  activitySuccess,
  activityFailure,
  historySuccess,
  historyFailure,
  fileRestoreFailure,
} from './actions';
import { removeShareSuccess, fetchFilesRequest } from '../files-list/actions';
import { activityRequest } from '../information/actions/index';
import { updateShareInfoList, shareInfoFailure } from './actions';
import { newFetch } from '../../helpers';
import { throw_exception } from '../Main/Actions';
import { Intent } from '@blueprintjs/core';
import Util from '../../helpers/util';
import { AppToaster } from '../toast';
import Manifest from '../../manifest';

const getHistoriesAlertChannel = channel();
const getActivitiesAlertChannel = channel();
const getShareAlertChannel = channel();
const restoreFileAlertChannel = channel();

function* getHistories(action) {
  try {
    const result = yield call(
      newFetch,
      `/files/${action.hash}/versions`,
      'GET',
      {},
      {},
      false,
      () => getHistoriesAlertChannel.put(action),
    );
    if (result.type !== 'ERROR') {
      yield put(historySuccess(result));
    } else {
      yield put(historyFailure());
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getFileActivities(action) {
  try {
    const result = yield call(
      newFetch,
      `/files/${action.hash}/activities`,
      'GET',
      {},
      {},
      false,
      () => getActivitiesAlertChannel.put(action),
    );
    if (result.type === 'ERROR') {
      yield put(activityFailure());
    } else {
      yield put(activitySuccess(result));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getShare(action) {
  try {
    const result = yield call(newFetch, `/files/${action.hash}/shares`, 'GET');
    if (result.type !== 'ERROR') {
      result.forEach(share => {
        share['selfShare'] = share.entity.hash === action.hash;
      });
      yield put(updateShareInfoList(result, true, null));
    } else {
      yield put(shareInfoFailure());
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* removeShare(action) {
  try {
    const result = yield call(newFetch, `/shares/${action.shareHash}`, 'DELETE');
    if (result.type !== 'ERROR') {
      yield put(updateShareInfoList([], false, action.shareHash));
      yield put(activityRequest({ hash: action.fileHash }));
      const privateSharesCount = (yield select(state => state.files.shares.shares) || []).filter(
        share => share.type === 'PRIVATE',
      ).length;
      const filter = yield select(state => state.sidebar.filter.selected);
      if (action.shareType === 'PRIVATE' && !action.selfShare && action.fileHash) {
        const data = yield select(state => state.files.list.data);
        yield put(
          fetchFilesRequest({
            endpoint: `folders/${action.fileHash}/children?size=${(data &&
              data[filter] &&
              Object.keys(data[filter]).length) ||
              Manifest.pageSize}&breadcrumb=true`,
            filter,
            isPublic: false,
          }),
        );
      } else if (privateSharesCount === 0 || action.shareType === 'PUBLIC') {
        yield put(removeShareSuccess(action.fileHash, filter, action.shareType, action.selfShare));
      }
    } else {
      yield put(updateShareInfoList([], false, null));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* removeAllShare(action) {
  try {
    const result = yield call(newFetch, `removeShare?shareHash=${action.hash}`, 'GET');
    yield put(updateShareInfoList(result.type ? result.type : result, false, action.hash));
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* restoreFile(action) {
  try {
    const result = yield call(newFetch, `/files/versions/${action.hash}`, 'PATCH');
    if (result.type !== 'ERROR') {
      const createdDate = `(${Util.fileDateTimeFa(result.created)})`;
      AppToaster.show(
        {
          message: `فایل شما به تاریخ ${createdDate || 'ناشناخته'} بازگردانی شد.`,
          icon: 'tick-circle',
          intent: Intent.SUCCESS,
        },
        'alert-restore-file',
      );
      yield call(getHistories, {
        type: action.type,
        hash: action.orginalHash,
      });
    } else {
      yield put(fileRestoreFailure(action.hash));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

// function* getFileComments(action) {
//   if (action.postId >= 0) {
//     if (action.postId === 0) {
//       const lastHash = yield select(state => state.files.selected.lastHash);
//       const postIdResult = yield call(
//         newFetch,
//         `getFilePostId?fileHash=${lastHash}`,
//         'GET',
//         {},
//         {},
//         false,
//       );

//       const selected = yield select(state => state.files.selected);
//       yield put(
//         updateSelect({ lastData: { ...selected.lastData, postId: postIdResult.data.result } }),
//       );
//     } else {
//       try {
//         const res = yield call(
//           coreFetch,
//           `commentList?postId=${action.postId}&size=20&firstId=0`,
//           'GET',
//           {},
//           {},
//           false,
//         );

//         if (res.status === 200) {
//           yield put(getCommnetSuccess(res.data.result, action.postId));
//         } else {
//           AppToaster.dismiss('alert-fetch-share');
//           AppToaster.show(
//             {
//               action: {
//                 onClick: () => getShareAlertChannel.put(action),
//                 text: 'تلاش مجدد',
//               },
//               message: 'خطایی در دریافت نظرات به وجود آمده !',
//               icon: 'warning-sign',
//               intent: Intent.DANGER,
//             },
//             'alert-fetch-share',
//           );
//         }
//       } catch (e) {
//         AppToaster.dismiss('alert-fetch-share');
//         AppToaster.show(
//           {
//             action: {
//               onClick: () => getShareAlertChannel.put(action),
//               text: 'تلاش مجدد',
//             },
//             message:
//               e &&
//               e.data &&
//               e.data.errorCode !== 999 &&
//               e.data.errorCode !== 21 &&
//               e.data.hasError &&
//               e.data.message
//                 ? e.data.message
//                 : 'خطایی در دریافت نظرات به وجود آمده !',
//             icon: 'warning-sign',
//             intent: Intent.DANGER,
//           },
//           'alert-fetch-share',
//         );
//       }
//     }
//   }
// }

// function* sendFileComment(action) {
//   if (action.postId) {
//     try {
//       const res = yield call(
//         coreFetch,
//         `comment?postId=${action.postId}&text=${action.comment}`,
//         'GET',
//         {},
//         {},
//         false,
//       );

//       const comment = {
//         confirmed: false,
//         id: res.data.result,
//         liked: false,
//         numOfComments: 0,
//         numOfLikes: 0,
//         text: action.comment,
//         timestamp: +new Date(),
//         user: {
//           id: 0,
//           name: window.localStorage.getItem('username'),
//           ssoId: 0,
//           ssoIssuerCode: 0,
//         },
//       };

//       yield put(sendCommnetSuccess(comment));
//     } catch (e) {
//       AppToaster.dismiss('alert-fetch-share');
//       AppToaster.show(
//         {
//           action: {
//             onClick: () => (action.comment === '' ? getShareAlertChannel.put(action) : {}),
//             text: '',
//           },
//           message:
//             action.comment === ''
//               ? 'لطفا نظر خود را وارد کنید !'
//               : 'خطایی درارسال نظر به وجود آمده !',
//           icon: 'warning-sign',
//           intent: Intent.DANGER,
//         },
//         'alert-fetch-share',
//       );
//     }
//   }
// }

// function* likeComment(action) {
//   try {
//     yield call(
//       coreFetch,
//       `likeComment?commentId=${action.commentID}&dislike=${action.liked}`,
//       'GET',
//       {},
//       {},
//       false,
//     );

//     yield put(likeCommnetSuccess(action.commentID, action.liked));
//   } catch (error) {}
// }

function* channelWatcher(chanName) {
  while (true) {
    const action = yield take(chanName);
    yield put(action);
  }
}

export default function* watchAll() {
  yield all([
    takeLatest(Constants.GET_ACTIVITIES_REQUEST.toString(), getFileActivities),
    takeLatest(Constants.GET_HISTORIES_REQUEST.toString(), getHistories),
    takeLatest(Constants.GET_SHARE_REQUEST.toString(), getShare),
    // takeLatest(Constants.GET_COMMENTS.toString(), getFileComments),
    // takeLatest(Constants.SEND_COMMENT.toString(), sendFileComment),
    takeEvery(Constants.REMOVE_SHARE_REQUEST.toString(), removeShare),
    takeEvery(Constants.REMOVE_ALL_SHARE_REQUEST.toString(), removeAllShare),
    takeEvery(Constants.RESTORE_FILE_REQUEST.toString(), restoreFile),
    // takeEvery(Constants.LIKE_COMMENT.toString(), likeComment),
  ]);
  yield fork(channelWatcher, getHistoriesAlertChannel);
  yield fork(channelWatcher, getActivitiesAlertChannel);
  yield fork(channelWatcher, getShareAlertChannel);
  yield fork(channelWatcher, restoreFileAlertChannel);
}
