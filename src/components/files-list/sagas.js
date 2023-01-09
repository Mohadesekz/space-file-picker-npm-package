import { channel } from 'redux-saga';
import { call, put, select, all, take, takeEvery, takeLatest, fork } from 'redux-saga/effects';
import { Intent } from '@blueprintjs/core';
import Constants from './constants';
import { AppToaster } from '../toast';
import { coreFetch, newFetch } from '../../helpers';
import { updateShareInfoList } from '../information/actions/index';
import { Util } from '../../helpers';
import {
  fetchFilesLoading,
  fetchFilesSuccess,
  fetchFilesFailure,
  renameFailure,
  copyFilesSuccess,
  bulkCopyFileSuccess,
  copyFilesFailure,
  hideItem,
  recentSuccess,
  bookmarkSuccess,
  shareSuccess,
  deleteBookmarkSuccess,
  // successAfterLike,
  // successAfterLikeRecents,
  recentFailure,
  publicFolderPasswordRequired,
  publicFolderForbidden,
  disableSetPassword,
  // fetchFilesLikedFromCoreSuccess,
  // fetchRecentFilesLikedFromCore,
  // fetchRecentFilesLikedFromCoreSuccess,
  changeFolder,
  selectItem,
  unSelectItem,
  unSelectAll,
} from './actions';
import { fetchSpaceRequest } from '../sidebar/actions';
import { throw_exception } from '../Main/Actions';
import Manifest from '../../manifest';
import { urlEncode } from '@sentry/utils';

const retryActionChannel = channel();

function* bulkRequest(action, operations, sagaMethod) {
  try {
    operations = operations.map(operation => ({
      ...operation,
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('access_token'),
      },
    }));

    const result = yield call(
      newFetch,
      'batch',
      'POST',
      { operations },
      {},
      false,
      () => retryActionChannel.put(action),
      null,
      true,
      null,
      sagaMethod,
    );

    if (result.type !== 'ERROR') {
      const listItems = yield select(state =>
        action.type === 'COPY_FILES_REQUEST' ? state.files.copy.items : state.files.selected.data,
      );

      let errorMessage = '';
      let failedHashes = [];

      for (let resultItem of result) {
        const detail = listItems.find(item => item.hash === resultItem.payload);
        if (resultItem.status !== 200) {
          failedHashes = [...failedHashes, resultItem.payload];
          try {
            const bodyObject = JSON.parse(resultItem.body);
            const message = bodyObject.message;
            errorMessage += `${detail.name} : ${message}_`;
          } catch (error) {
            throw error;
          }
        } else if (action.type === 'COPY_FILES_REQUEST') {
          yield put(bulkCopyFileSuccess(resultItem.payload)); // remove hash from copy state
        } else {
          // } else if(action.type !== "RESTORE_ALL_TRASH_REQUEST" || action.type!== 'RESTORE_TRASH_REQUEST'){

          yield put(unSelectItem(action.filter, detail));
        }
      }

      if (failedHashes.length > 0) {
        AppToaster.dismiss('alert-fetch-space');
        AppToaster.show(
          {
            action: {
              onClick: () =>
                AppToaster.show(
                  {
                    message: errorMessage,
                    // timeout: '0',
                    icon: 'danger-sign',
                    intent: Intent.DANGER,
                  },
                  'test',
                ),
              text: 'نمایش جزییات',
            },
            message: `${failedHashes.length} مورد با خطا مواجه شد.`,
            // timeout: '0',
            icon: 'danger-sign',
            intent: Intent.DANGER,
          },
          'alert-fetch-space',
        );
      }

      return failedHashes.length > 0 ? failedHashes : 'OK';
    } else {
      return result;
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* deleteBookmark(action) {
  try {
    const selected = yield select(state => state.files.selected);
    const filter = yield select(state => state.sidebar.filter.selected);
    const itemHashes = [...selected.hash];

    let result;
    if (itemHashes.length > 1) {
      // bulk remove bookmark from multi files
      let operations = [];
      itemHashes.forEach(hash => {
        operations = [
          ...operations,
          {
            url: `/bookmarks?hash=${hash}`,
            method: 'DELETE',
            params: {},
            silent: false,
            payload: hash,
          },
        ];
      });
      const bulkResult = yield call(bulkRequest, { ...action, filter }, operations);
      if (bulkResult.type === 'ERROR' || (Array.isArray(bulkResult) && bulkResult.length > 0)) {
        result = 'ERROR';
      } else {
        result = 'OK';
      }
    } else {
      //remove bookmark from one file
      result = yield call(
        newFetch,
        `bookmarks?hash=${itemHashes[0]}`,
        'DELETE',
        {},
        {},
        false,
        () => retryActionChannel.put(action),
      );
    }

    if (result.type !== 'ERROR') {
      yield put(deleteBookmarkSuccess(itemHashes));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* addBookmark(action) {
  try {
    const selected = yield select(state => state.files.selected);
    const filter = yield select(state => state.sidebar.filter.selected);

    let itemHashes = [...selected.hash];
    let result;
    if (itemHashes.length > 1) {
      // bulk request , bookmark multi files
      let operations = [];
      itemHashes.forEach(hash => {
        operations = [
          ...operations,
          {
            url: `/bookmarks?hash=${hash}`,
            method: 'POST',
            params: {},
            silent: false,
            payload: hash,
          },
        ];
      });
      const bulkResult = yield call(bulkRequest, { ...action, filter }, operations);
      if (bulkResult.type === 'ERROR' || (Array.isArray(bulkResult) && bulkResult.length > 0)) {
        result = 'ERROR';
      } else {
        result = 'OK';
      }
    } else {
      //bookmark one file
      result = yield call(newFetch, `bookmarks?hash=${itemHashes[0]}`, 'POST', {}, {}, false, () =>
        retryActionChannel.put(action),
      );
    }

    if (result.type !== 'ERROR') {
      yield put(bookmarkSuccess(itemHashes));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* fetchFiles(action) {
  let response;
  const list = yield select(state => state.files.list);
  const { publicFolderPassword, publicFolderId, sortType, sortDesc, body } = list;
  let inputAction = { ...action };

  try {
    if (inputAction.filter === 'lastmod') {
      inputAction.endpoint += `&desc=false`;
    } else if (inputAction.filter === 'search' && window.location.search) {
      inputAction.endpoint += window.location.search + '&size=' + Manifest.pageSize;
    } else {
      inputAction.endpoint += `&order=${sortType.toUpperCase()}&desc=${sortDesc}`;
    }

    if (publicFolderPassword && publicFolderId) {
      inputAction.endpoint =
        inputAction.endpoint + '&password=' + encodeURIComponent(publicFolderPassword);
    }

    if (action.type === Constants.SORT_FILES.toString()) {
      const size = list.size[action.filter];
      inputAction.endpoint.replace('?size=' + Manifest.pageSize, `?size=${size}`);
    } else if (body && body.start) {
      inputAction.endpoint = inputAction.endpoint + '&start=' + body.start;
    }
    yield put(fetchFilesLoading(inputAction.filter, true));
    response = yield call(
      newFetch,
      inputAction.endpoint,
      'GET',
      {},
      {},
      inputAction.isPublic,
      () => retryActionChannel.put(action),
      {},
    );
    let response2 = JSON.parse(JSON.stringify(response));
    if (response2.list && Array.isArray(response2.list)) {
      response2.list.forEach(object => {
        delete object['postId'];
        // console.log(object['postId']);
      });
    }
    if (response.type === 'ERROR') {
      yield put(fetchFilesFailure(inputAction.filter));
    } else if (response.type === 'PASSWORD_REQUIRED') {
      yield put(publicFolderPasswordRequired());
    } else if (response.type === 'Forbidden') {
      yield put(publicFolderForbidden());
    } else {
      yield put(
        fetchFilesSuccess(
          inputAction.filter,
          response2,
          action.type !== Constants.SORT_FILES.toString(),
        ),
      );
    }
  } catch (error) {
    yield put(throw_exception(error));
  }

  // const isAuthenticated = window.localStorage.getItem('isAuthenticated');
  // if (isAuthenticated && response.type !== 'PASSWORD_REQUIRED') {
  // const likeFiles = yield call(fetchFilesLikedCore, inputAction, response, publicFolderId);
  //   yield put(fetchFilesLikedFromCoreSuccess(inputAction.filter, likeFiles.data.result));
  // }
}

// function fetchFilesLikedCore(inputAction, response, publicFolderId) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!publicFolderId) {
//         let filesPostID = [];
//         switch (true) {
//           case inputAction.filter === 'lastmod':
//             response.list.forEach(item => {
//               if (item.reference !== 'FOLDER' && item.entity && item.entity.postId) {
//                 filesPostID = [...filesPostID, item.entity.postId.toString()];
//               }
//             });
//             break;
//           default:
//             //trash,favorite,mybox
//             response.list.forEach(item => {
//               if (
//                 item.type !== 'application/vnd.podspace.folder' &&
//                 item.entityType !== 'FOLDER' &&
//                 item.postId
//               ) {
//                 filesPostID.push(item.postId.toString());
//               }
//             });
//             break;
//         }
//         let urlPostIDParameters = '';
//         if (filesPostID.length > 0) {
//           filesPostID.forEach((item, index) => {
//             index === 0
//               ? (urlPostIDParameters += 'postId=' + item)
//               : (urlPostIDParameters += '&postId=' + item);
//           });
//           try {
//             const likeFiles = await coreFetch(
//               `getUserPostInfos?${urlPostIDParameters}`,
//               'GET',
//               {},
//               {},
//               false,
//             );
//             resolve(likeFiles);
//           } catch (e) {
//             reject();
//           }
//         }
//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

function* fetchFileDetail(action) {
  let result;
  try {
    result = yield call(
      newFetch,
      `/files/${action.fileHash}/detail${action.password ? '?password=' + action.password : ''}`,
      'GET',
      {},
      { Authorization: 'Bearer ' + window.localStorage.getItem('access_token') },
      action.isPublic,
      () => {},
      null,
      !action.isPublic,
    );
    if (result.type === 'ERROR') {
      //TODO: handle not found file
      window.location.replace('/404');
    }
  } catch (error) {
    yield put(throw_exception(error));
  }

  if (result.type !== 'ERROR' && result.type !== 'PASSWORD_REQUIRED' && action.returnDetails) {
    const isAuthenticated = window.localStorage.getItem('isAuthenticated');
    const accessLevel = yield select(state => state.files.list.accessLevel);
    // if (result.postId && isAuthenticated) {
    //   const likeResult = yield call(
    //     coreFetch,
    //     `getUserPostInfos?postId=${result.postId}`,
    //     'GET',
    //     {},
    //     {},
    //     false,
    //   );
    //   result['like'] =
    //     likeResult &&
    //     likeResult.data &&
    //     likeResult.data.result &&
    //     likeResult.data.result[0] &&
    //     likeResult.data.result[0].liked;
    // }
    result['type_'] = result.type === 'application/vnd.podspace.folder' ? 'folder' : 'file';
    result['userCanTrash'] = result.owner.username === result.uploader.username;
    result['accessLevel'] = accessLevel;
    result['created_'] = Util.fileDateTimeFa(result.created);
    result['updated_'] = Util.fileDateTimeFa(result.updated);
    result['size_'] = result.size ? Util.bytesToSize(result.size) : '_';
    yield put(selectItem(result, 'mybox'));
    action.returnDetails(result);
  } else if (result.type === 'PASSWORD_REQUIRED') {
    action.returnDetails(result.type);
  }
}

function* newFolder(action) {
  try {
    const result = yield call(
      newFetch,
      `folders?name=${action.name}&parentHash=${action.parentHash}`,
      'POST',
      {},
      {},
      false,
      undefined,
      undefined,
      true,
    );
    if (result.type === 'ERROR') return;
    yield put(fetchSpaceRequest);
    if (typeof action.onEnd === 'function') action.onEnd(); // reload page
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* copyFiles(action) {
  try {
    const copyState = yield select(state => state.files.copy);
    const hashList = copyState.items.map(i => i.hash);
    let result;
    if (hashList.length > 1) {
      // bulk request
      let operations = [];
      hashList.forEach((hash, index) => {
        const endpoint = `/files/${hash}/${
          copyState.type === 'cut' ? 'move' : 'copy'
        }?destFolderHash=${action.hash}`;
        operations = [
          ...operations,
          {
            url: endpoint,
            method: 'PUT',
            params: {},
            silent: false,
            payload: hash,
          },
        ];
      });
      const bulkResult = yield call(
        bulkRequest,
        action,
        operations,
        copyState.type === 'cut' ? 'MOVE' : 'COPY',
      );
      if (bulkResult.type === 'ERROR') {
        result = 'ERROR';
      } else if (Array.isArray(bulkResult) && bulkResult.length > 0) {
        result = 'ERROR';
      } else {
        result = 'OK';
      }
    } else {
      const endpoint = `/files/${hashList[0]}/${
        copyState.type === 'cut' ? 'move' : 'copy'
      }?destFolderHash=${action.hash}`;
      result = yield call(
        newFetch,
        endpoint,
        'PUT',
        {},
        {},
        false,
        () => retryActionChannel.put(action),
        null,
        true,
        null,
        copyState.type === 'cut' ? 'MOVE' : 'COPY',
      );
    }

    if (result && result.type !== 'ERROR') {
      if (hashList.length === 1) yield put(copyFilesSuccess(hashList[0]));
      yield put(fetchSpaceRequest);
      if (typeof action.onEnd === 'function') action.onEnd(); // reload page
    } else {
      yield put(copyFilesFailure());
      if (typeof action.onEnd === 'function') action.onEnd();
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* trashFiles(action) {
  try {
    const selected = yield select(state => state.files.selected);
    const itemShared = [...selected.data.filter(item => item.share)];
    let itemHashes = [...selected.hash];
    let message = '';
    if (itemShared.length > 0 && !action.confirm) {
      if (itemShared.length > 1) {
        message = `${itemShared.length}   فایل دارای لینک اشتراک می باشند آیا تمایل به حذف این فایل ها را دارید؟`;
      } else {
        message = `${itemShared.length}   فایل دارای لینک اشتراک می باشد آیا تمایل به حذف این فایل را دارید؟`;
      }
      action.confirm = true;

      AppToaster.dismiss('alert-fetch-trash');
      AppToaster.show(
        {
          action: {
            onClick: () => retryActionChannel.put(action),
            text: 'تایید',
          },
          message: message,
          icon: 'warning-sign',
          intent: Intent.WARNING,
        },
        'alert-fetch-trash',
      );
    } else {
      let result;
      yield put(hideItem(action.filter, itemHashes, true));
      if (itemHashes.length > 1) {
        // bulk request , remove multi files
        let operations = [];
        itemHashes.forEach((hash, index) => {
          operations = [
            ...operations,
            {
              url: `/files/${hash}`,
              method: 'DELETE',
              params: {},
              silent: false,
              payload: hash,
            },
          ];
        });
        const bulkResult = yield call(bulkRequest, action, operations, 'TRASH');
        if (bulkResult.type === 'ERROR') {
          result = 'ERROR';
        } else if (Array.isArray(bulkResult) && bulkResult.length > 0) {
          result = 'ERROR';
          itemHashes = bulkResult;
        } else {
          result = 'OK';
        }
      } else {
        //remove one file
        const removeResult = yield call(
          newFetch,
          `/files/${itemHashes[0]}`,
          'DELETE',
          {},
          {},
          false,
          () => retryActionChannel.put(action),
          null,
          true,
          null,
          'TRASH',
        );
        if (removeResult.type === 'ERROR') {
          result = 'ERROR';
        } else {
          result = removeResult;
        }
      }
      if (result && result !== 'ERROR') {
        //check if all files were hidden we should refresh page
        const filter = action.filter;
        const files = yield select(state => state.files.list.data[filter]);
        if (!Object.entries(files).find(file => !file?.[1]?.hidden)) {
          yield call(resetFolder, action.filter, action.hash);
        } else {
          //To Do
          // we should get next files when some files removed from list
          // const state = yield select(state => state);
          // debugger;
          // console.log();
        }
        yield put(unSelectAll());
        yield put(fetchSpaceRequest);
      } else {
        yield put(hideItem(action.filter, itemHashes, false));
      }
      if (typeof action.onEnd === 'function') action.onEnd();
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* deleteFromTrash(action) {
  try {
    const selected = yield select(state => state.files.selected);
    let trashHashes = [...selected.hash];

    yield put(hideItem('trash', trashHashes, true));
    let result;
    if (trashHashes.length > 1) {
      //remove multi files from trash
      let operations = [];
      trashHashes.forEach(hash => {
        operations = [
          ...operations,
          {
            url: `/trashes/${hash}`,
            method: 'DELETE',
            params: {},
            silent: false,
            payload: hash,
          },
        ];
      });
      const bulkResult = yield call(bulkRequest, action, operations, 'WIPE');
      if (bulkResult.type === 'ERROR') {
        result = 'ERROR';
      } else if (Array.isArray(bulkResult) && bulkResult.length > 0) {
        result = 'ERROR';
        trashHashes = bulkResult;
      } else {
        result = 'OK';
      }
    } else {
      //remove one files from trash
      const removeResult = yield call(
        newFetch,
        `/trashes/${trashHashes[0]}`,
        'DELETE',
        null,
        {},
        false,
        () => retryActionChannel.put(action),
        null,
        true,
        null,
        'WIPE',
      );
      if (removeResult.type === 'ERROR') {
        result = 'ERROR';
      }
    }
    if (result !== 'ERROR') {
      const trashCount = yield select(state => Object.keys(state.files.list.data.trash).length);
      yield put(fetchSpaceRequest);
      if (trashCount === trashHashes.length) {
        yield put(changeFolder('trash'));
        yield put(fetchFilesLoading('trash', true));
        yield put(fetchFilesSuccess('trash', { list: [], count: 0, page: 1 }));
      } else {
        yield put(unSelectAll());
      }
    } else {
      yield put(hideItem('trash', trashHashes, false));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* emptyTrash(action) {
  try {
    const trashHashes = yield select(state => Object.keys(state.files.list.data.trash));
    yield put(hideItem('trash', trashHashes, true));

    const result = yield call(
      newFetch,
      '/trashes',
      'DELETE',
      {},
      {},
      false,
      () => retryActionChannel.put(action),
      null,
      true,
      null,
      'WIPE',
    );

    if (result.type !== 'ERROR') {
      yield put(fetchSpaceRequest);
      yield call(resetFolder, 'trash');
    } else {
      yield put(hideItem('trash', trashHashes, false));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* restoreFromTrash(action) {
  try {
    const selected = yield select(state => state.files.selected);
    const filter = yield select(state => state.sidebar.filter.selected);

    let hashes = [...selected.hash];

    yield put(hideItem(action.filter, hashes, true));
    let result;
    if (hashes.length > 1) {
      // bulk request remove multi files
      let operations = [];
      hashes.forEach((hash, index) => {
        operations = [
          ...operations,
          {
            url: `/trashes/${hash}/restore`,
            method: 'PUT',
            params: {},
            silent: false,
            payload: hash,
          },
        ];
      });
      const bulkResult = yield call(bulkRequest, { ...action, filter }, operations, 'RESTORE');

      if (bulkResult.type === 'ERROR') {
        result = 'ERROR';
      } else if (Array.isArray(bulkResult) && bulkResult.length > 0) {
        result = 'ERROR';
        hashes = [...bulkResult];
      } else {
        result = 'OK';
      }
    } else {
      const removeResult = yield call(
        newFetch,
        `/trashes/${hashes[0]}/restore`,
        'PUT',
        {},
        {},
        false,
        () => retryActionChannel.put(action),
        null,
        true,
        null,
        'RESTORE',
      );
      if (removeResult.type === 'ERROR') {
        result = 'ERROR';
      }
    }

    if (result !== 'ERROR') {
      yield put(fetchSpaceRequest);
      yield put(unSelectAll());
    } else {
      yield put(hideItem(action.filter, hashes, false));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* restoreAllFromTrash(action) {
  try {
    let result = yield call(
      newFetch,
      `/trashes/restore`,
      'POST',
      {},
      {},
      false,
      () => retryActionChannel.put(action),
      null,
      true,
      null,
      'RESTORE',
    );

    if (result.type !== 'ERROR') {
      yield put(fetchSpaceRequest);
      yield call(resetFolder, 'trash');
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* renameItem(action) {
  try {
    const newName = action.newName;
    const formData = new FormData();
    formData.append('newName', newName);

    const result = yield call(
      newFetch,
      `/files/${action.hash}/rename`,
      'PUT',
      formData,
      {},
      false,
      () => retryActionChannel.put(action),
    );

    if (result.type === 'ERROR') {
      yield put(renameFailure(action));
      if (typeof action.onEnd === 'function') action.onEnd();
    } else if (action.undo) {
      AppToaster.dismiss('alert-fetch-rename');
      AppToaster.show(
        {
          action: {
            onClick: () =>
              retryActionChannel.put({
                ...action,
                name: action.newName,
                newName: action.name,
                undo: false,
              }),
            text: 'برگردون',
          },
          message: 'نام با موفقیت تغییر کرد !',
          icon: 'tick-circle',
          intent: Intent.SUCCESS,
        },
        'alert-fetch-rename',
      );
    }
    if (typeof action.onEnd === 'function' && window.location.pathname === '/my-space')
      action.onEnd();
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* shareItem(action) {
  try {
    yield put(disableSetPassword(true));
    let endpoint;
    if (action.isPublic) {
      endpoint = `/files/${action.hash}/public?expiration=${action.expiration}`;
    } else {
      endpoint = `/files/${action.hash}/share?expiration=${action.expiration}&level=${
        action.level
      }&persons=${action.persons}&type=${action.isPublic ? 'PUBLIC' : 'PRIVATE'}`;
    }
    let shareResult = yield call(newFetch, endpoint, 'POST', {}, {}, false, () =>
      retryActionChannel.put(action),
    );
    if (shareResult.type !== 'ERROR' && shareResult.type !== 'PASSWORD_REQUIRED') {
      const filter = yield select(state => state.sidebar.filter.selected);
      shareResult =
        shareResult.status === 409
          ? [shareResult.type]
          : Array.isArray(shareResult)
          ? [...shareResult]
          : [shareResult];
      let shareList = yield select(state => [...state.files.shares.shares]);
      yield put(shareSuccess(shareResult, filter));
      shareResult.forEach(item => {
        item['selfShare'] = item.entity.hash === action.hash;
        const index = shareList.findIndex(x => x.hash === item.hash);
        if (index !== -1) {
          shareResult[index] = item;
        } else {
          shareList = [...shareList, item];
        }
      });

      yield put(updateShareInfoList(shareList, true, null)); // update share list in sidebar file info
      if (typeof action.onEnd === 'function') {
        action.onEnd(
          action.isPublic
            ? action.itemType === 'folder'
              ? window.location.origin + '/public/folders/' + action.hash
              : window.location.origin + '/file/' + action.hash
            : undefined,
        );
      }
    } else if (typeof action.onEnd === 'function') {
      action.onEnd(null);
    }

    yield put(disableSetPassword(false));
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getRecent(action) {
  try {
    const result = yield call(newFetch, 'activities?size=5&desc=true', 'GET', {}, {}, false, () =>
      retryActionChannel.put(action),
    );
    if (result.type === 'ERROR') {
      yield put(recentFailure());
    } else {
      yield put(recentSuccess(result));
      // yield put(fetchRecentFilesLikedFromCore({ result }));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* fetchRecentFilesLikedCore(action) {
  // const { result } = action.data;
  // let filesPostID = [];
  // if (result.status === 200) {
  //   result.data.result.forEach(item => {
  //     if (item.reference === 'FILE' && item.file.postId !== 0) {
  //       filesPostID = [...filesPostID, item.file.postId.toString()];
  //     }
  //   });
  //   let urlPostIDParameters = '';
  //   if (filesPostID.length > 0) {
  //     filesPostID.forEach((item, index) => {
  //       index === 0
  //         ? (urlPostIDParameters += 'postId=' + item)
  //         : (urlPostIDParameters += '&postId=' + item);
  //     });
  //     try {
  //       const likeFiles = yield call(
  //         coreFetch,
  //         `getUserPostInfos?${urlPostIDParameters}`,
  //         'GET',
  //         {},
  //         {},
  //         false,
  //       );
  //       yield put(fetchRecentFilesLikedFromCoreSuccess({ files: result, likeFiles }));
  //     } catch (e) {}
  //   }
  // }
}

function* sharePasswordRequest(action) {
  try {
    let formData = new FormData();
    formData.append('password', action.password);
    const result = yield call(
      newFetch,
      `/files/${action.hash}/shares/password`,
      'PUT',
      formData,
      {},
      false,
      () => retryActionChannel.put(action),
    );
    // let formData = new FormData();
    // formData.append('password', action.password);
    // const result = yield call(
    //   newFetch,
    //   `/files/${action.hash}/shares/password`,
    //   'PUT',
    //   formData,
    //   {},
    //   false,
    //   () => retryActionChannel.put(action),
    // );
    if (result.type !== 'ERROR') {
      const message = 'پسورد لینک به اشتراک گذاشته شده با موفقیت تغییر کرد !';
      AppToaster.dismiss('alert-recent');
      AppToaster.show(
        {
          message,
          icon: 'tick-circle',
          intent: Intent.SUCCESS,
        },
        'alert-fetch-share',
      );
    }
    action.onEnd();
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* likesOrDislikes(action) {
  // try {
  //   if (action.postId) {
  //     try {
  //       const lastHash = yield select(state => state.files.selected.lastHash);
  //       action.like = action.like === undefined ? false : action.like;
  //       if (action.postId >= 0) {
  //         if (action.postId === 0) {
  //           const postIdResult = yield call(
  //             newFetch,
  //             `getFilePostId?fileHash=${lastHash}`,
  //             'GET',
  //             {},
  //             {},
  //             false,
  //           );
  //           action.postId = postIdResult.data.result;
  //         }
  //         const res = yield call(
  //           coreFetch,
  //           `like?postId=${action.postId}&dislike=${action.like}`,
  //           'GET',
  //           {},
  //           {},
  //           false,
  //         );
  //         if (res.status === 200 && !action.onEnd) {
  //           yield put(successAfterLike({ action, lastHash }));
  //           yield put(successAfterLikeRecents({ action, lastHash }));
  //         } else if (typeof action.onEnd === 'function') {
  //           action.onEnd();
  //         }
  //       }
  //     } catch (e) {
  //       AppToaster.dismiss('alert-recent');
  //       AppToaster.show(
  //         {
  //           action: {
  //             onClick: () => retryActionChannel.put(action),
  //             text: 'تلاش مجدد',
  //           },
  //           message:
  //             e && e.data && e.data.errorCode !== 21 && e.data.hasError && e.data.message
  //               ? e.data.message
  //               : 'در حال حاضر امکان عملیات مورد نظر وجود ندارد!',
  //           icon: 'warning-sign',
  //           intent: Intent.DANGER,
  //         },
  //         'alert-recent',
  //       );
  //       yield put(recentFailure(e));
  //     }
  //   } else {
  //     AppToaster.dismiss('alert-recent');
  //     AppToaster.show(
  //       {
  //         message: 'در حال حاضر امکان عملیات مورد نظر وجود ندارد.',
  //         icon: 'warning-sign',
  //         intent: Intent.DANGER,
  //       },
  //       'alert-recent',
  //     );
  //   }
  // } catch (error) {
  //   yield put(throw_exception(error));
  // }
}

function* tinyUrl(action) {
  try {
    const formData = new FormData();
    formData.append('urlOrContent', action.link);
    formData.append('shortenObjectKind', 'link');
    formData.append('isURL', true);

    const res = yield call(
      coreFetch,
      `tiny/add`,
      'POST',
      formData,
      {},
      false,
      Manifest.coreApi + 'srv/tinylink/',
    );

    const link = Manifest.tilinUrl + res.data.result.hash;

    action.onEnd(link, true);
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* resetFolder(filter, folderHash) {
  try {
    const breadCrumb = yield select(state => state.files.list.breadcrumb);
    const owner = yield select(state => state.files.list.owner);
    // const owner = yield select(state => state.files.list.breadcrumb);
    //like a fake request
    yield put(changeFolder(folderHash || filter));
    yield put(fetchFilesLoading(filter, true));
    yield put(
      fetchFilesSuccess(filter, {
        entity: {
          hash: folderHash,
          owner: owner,
          data: [],
        },
        breadcrumb: breadCrumb,
        list: [],
        count: 0,
        page: 1,
      }),
    );
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* channelWatcher(chanName) {
  while (true) {
    const action = yield take(chanName);
    yield put(action);
  }
}

export default function* watchAll() {
  yield all([
    takeEvery(Constants.DELETE_BOOKMARK_REQUEST.toString(), deleteBookmark),
    takeEvery(Constants.BOOKMARK_REQUEST.toString(), addBookmark),
    takeLatest(Constants.FETCH_FILES_REQUEST.toString(), fetchFiles),
    takeLatest(Constants.FETCH_FILE_DETAIL_REQUEST.toString(), fetchFileDetail),
    takeEvery(Constants.TRASH_FILES_REQUEST.toString(), trashFiles),
    takeEvery(Constants.DELETE_TRASH_REQUEST.toString(), deleteFromTrash),
    takeEvery(Constants.EMPTY_TRASH_REQUEST.toString(), emptyTrash),
    takeEvery(Constants.NEW_FOLDER_REQUEST.toString(), newFolder),
    takeEvery(Constants.RESTORE_TRASH_REQUEST.toString(), restoreFromTrash),
    takeEvery(Constants.RESTORE_ALL_TRASH_REQUEST.toString(), restoreAllFromTrash),
    takeEvery(Constants.COPY_FILES_REQUEST.toString(), copyFiles),
    takeEvery(Constants.RENAME_REQUEST.toString(), renameItem),
    takeEvery(Constants.SHARE_REQUEST.toString(), shareItem),
    takeLatest(Constants.SHARE_PASSWORD_REQUEST.toString(), sharePasswordRequest),
    takeLatest(Constants.GETRECENT_REQUEST.toString(), getRecent),
    takeEvery(Constants.LIKE_AND_DISLIKE.toString(), likesOrDislikes),
    takeEvery(Constants.GETRECENT_FILE_LIKE.toString(), likesOrDislikes),
    takeLatest(Constants.SHORT_LINK.toString(), tinyUrl),
    takeEvery(Constants.SORT_FILES.toString(), fetchFiles),
    takeEvery(Constants.FETCH_RECENT_FILES_LIKED_FROM_CORE.toString(), fetchRecentFilesLikedCore),
  ]);
  yield fork(channelWatcher, retryActionChannel);
}
