import Constants from '../constants';
import SidebarConstants from '../../sidebar/constants';
import { Util } from '../../../helpers';
import lodashForeach from 'lodash/forEach';
import lodashFilter from 'lodash/filter';
import Manifest from '../../../manifest';
import * as Sentry from '@sentry/react';

const filesReducerDefaultState = {
  view: window.localStorage.getItem('viewSelection') || 'list', // enum(list, grid)
  data: {
    search: {},
    mybox: {},
    lastmod: {},
    shared: {},
    favorite: {},
    trash: {},
  },
  sortType: 'name',
  sortDesc: false,
  breadcrumb: [],
  hash: undefined,
  owner: {
    avatar: undefined,
    name: undefined,
    roles: [],
    username: undefined,
    ssoId: undefined,
  },
  publicFolderPassword: undefined,
  publicFolderId: undefined,
  publicFolderNeedPassword: false,
  publicFolderForbidden: false,
  selected: false,
  isLoading: {
    search: true,
    mybox: true,
    lastmod: true,
    shared: true,
    favorite: true,
    trash: true,
  },
  hasError: false,
  recentSelectedFile: undefined,
  size: {
    search: 0,
    mybox: 0,
    lastmod: 0,
    shared: 0,
    favorite: 0,
    trash: 0,
  },
  disable_set_password: false,
  playList: null,
  exception: false,
};

const unSelect = data => {
  Object.keys(data).forEach(key => {
    if (!Object.is(data[key].length, 0)) {
      lodashForeach(data[key], item => {
        if (item.isSelected) {
          Reflect.deleteProperty(item, 'isSelected');
        }
      });
    }
  });
};

const countSelect = data => {
  if (!data) return {};

  let count = lodashFilter(data, item => item.isSelected);
  return count.length;
};

export default (state = filesReducerDefaultState, action) => {
  try {
    if (Object.is(action.type, SidebarConstants.CHANGE_FILTER)) {
      let newData = state.data;
      let breadcrumb = [];
      unSelect(newData);

      return Object.assign({}, state, {
        breadcrumb,
        hasError: false,
        data: newData,
        hash: undefined,
        selected: false,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.CHANGE_VIEW)) {
      window.localStorage.setItem('viewSelection', action.view);
      return Object.assign({}, state, {
        view: action.view,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.ADD_ITEM)) {
      const newData = { ...state.data };
      newData[action.filter][action.fileItem.hash] = action.fileItem;
      const size = state.size;
      size[action.filter] += 1;
      return Object.assign({}, state, {
        data: newData,
        size,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.HIDE_ITEM)) {
      action.filter = action.filter === undefined ? 'trash' : action.filter;
      const data = state.data;

      action.hashes.forEach(hash => {
        if (data[action.filter][hash]) {
          data[action.filter][hash].hidden = action.hide;
        }
      });
      const selectedCount = Object.values(data[action.filter]).filter(item => item.isSelected)
        .length;
      return Object.assign({}, state, {
        data,
        selected: selectedCount > 0,
        selectedCount,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.COPY_ADD_ITEMS)) {
      const data = state.data;
      const itemsSelected = action.items;

      if (action.action === 'cut') {
        lodashForeach(Object.keys(data), items => {
          lodashForeach(itemsSelected, item => {
            if (data[items][item.hash]) {
              data[items][item.hash].isCut = true;
            }
          });
        });
      }

      return Object.assign({}, state, {
        data,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UPDATE_LIST)) {
      const hashIndex = Array.prototype.findIndex.call(state.breadcrumb, element => {
        return Object.is(element.hash, action.hash) || action.hash.startsWith(element.hash);
      });

      let breadcrumb;
      if (hashIndex === -1) {
        breadcrumb = Array.prototype.concat.call(state.breadcrumb, {
          hash: action.hash,
          name: action.name,
        });
      } else {
        breadcrumb = Array.prototype.slice.call(state.breadcrumb, 0, hashIndex + 1);
      }

      let newIsLoading = state.isLoading;
      newIsLoading[action.filter] = false;

      let newData = state.data;
      newData[action.filter] = action.data;
      unSelect(newData);

      return Object.assign({}, state, {
        breadcrumb,
        selected: false,
        data: newData,
        hash: action.hash,
        hasError: false,
        isLoading: newIsLoading,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.FETCH_FILES_LOADING)) {
      let newIsLoading = state.isLoading;
      newIsLoading[action.filter] = action.loading;
      return Object.assign({}, state, {
        hash: undefined,
        hasError: false,
        isLoading: newIsLoading,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.FETCH_FILES_SUCCESS)) {
      let newIsLoading = state.isLoading;
      newIsLoading[action.filter] = false;

      let newData = state.data;
      let sizeData = state.size;
      if (Object.keys(newData[action.filter]).length > 0 && action.updateData) {
        const getNewData = Util.mapKeyIdToHashFile(action.response.data);
        Object.assign(newData[action.filter], getNewData);
      } else {
        newData[action.filter] = Util.mapKeyIdToHashFile(action.response.data);
        unSelect(newData);
      }

      sizeData[action.filter] = Object.keys(newData[action.filter]).length;
      return Object.assign({}, state, {
        breadcrumb: action.response.breadcrumb || [],
        hash: action.response.hash,
        owner: action.response.owner,
        accessLevel: action.accessLevel,
        data: newData,
        body:
          Object.keys(newData[action.filter]).length >= Manifest.pageSize
            ? { start: Object.keys(newData[action.filter]).length }
            : null,
        hasNewData: action.response.data.length === Manifest.pageSize,
        isLoading: newIsLoading,
        size: sizeData,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.FETCH_FILES_FAILURE)) {
      const isLoading = state.isLoading;
      isLoading[action.filter] = false;

      return Object.assign({}, state, {
        hasError: true,
        isLoading,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.SELECT_ITEM)) {
      let newData = state.data;
      let selectedCount = 0;
      const filterSelected = Util.getFilterByPath();
      if (!action.explicit) {
        unSelect(newData);
      } else {
        selectedCount = countSelect(newData[filterSelected.filter]) || 0;
      }

      //TODO : we should remove filter in selectItem action
      if (newData[filterSelected.filter][action.details.hash]) {
        newData[filterSelected.filter][action.details.hash].isSelected = true;
        selectedCount++;
      }

      return Object.assign({}, state, {
        hasError: false,
        data: newData,
        selected: selectedCount > 0,
        selectedCount,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UNSELECT_ITEM)) {
      let newData = state.data;
      let selectedCount = 0;
      if (action.details) {
        newData[action.filter][action.details.hash].isSelected = false;
        selectedCount = countSelect(newData[action.filter]) || 0;
      } else {
        unSelect(newData);
      }

      return Object.assign({}, state, {
        hasError: false,
        data: newData,
        selected: selectedCount > 0,
        selectedCount,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.UNSELECT_ALL)) {
      let newData = state.data;
      unSelect(newData);

      return Object.assign({}, state, {
        hasError: false,
        data: newData,
        selected: false,
        selectedCount: 0,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.CHANGE_FOLDER)) {
      sessionStorage.setItem('back_url', window.location.pathname);
      return Object.assign({}, state, {
        body: null,
        folder: action.folder,
        recentSelectedFile: action.recentSelectedFile,
        data: {
          search: {},
          mybox: {},
          lastmod: {},
          shared: {},
          favorite: {},
          trash: {},
        },
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.RENAME_REQUEST.toString())) {
      const newName = action.newName.split('.');
      const extension = newName.length > 1 ? newName.splice(newName.length - 1)[0] : '';
      const name = newName.join('.');
      const data = state.data;

      Object.keys(state.data).forEach(key => {
        const item = data[key][action.hash];

        if (item)
          data[key][action.hash] = {
            ...item,
            name: item.type_ === 'folder' ? (extension ? name + '.' + extension : name) : name,
            extension,
          };
      });

      return Object.assign({}, state, {
        data,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.RENAME_FAILURE)) {
      const newName = action.name.split('.');
      const extension = newName.length > 1 ? newName.splice(newName.length - 1)[0] : '';
      const name = newName.join('.');
      const data = state.data;

      Object.keys(state.data).forEach(key => {
        const item = data[key][action.hash];
        if (item)
          data[key][action.hash] = {
            ...item,
            name: item.type_ === 'folder' ? name + extension : name,
            extension,
          };
      });

      return Object.assign({}, state, {
        data,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.HASH_REQUIRED_PASSWORD)) {
      return Object.assign({}, state, {
        hash: action.folderHash,
        publicFolderNeedPassword: true,
        publicFolderPassword: action.passwordHash,
        isLoading: {
          search: false,
          mybox: false,
          lastmod: false,
          shared: false,
          favorite: false,
          trash: false,
        },
        random: Math.random(),
      });
    }
    if (Object.is(action.type, Constants.HASH_FORBIDDEN)) {
      return Object.assign({}, state, {
        hash: action.folderHash,
        publicFolderNeedPassword: false,
        publicFolderPassword: action.passwordHash,
        publicFolderForbidden: true,
        isLoading: {
          search: false,
          mybox: false,
          lastmod: false,
          shared: false,
          favorite: false,
          trash: false,
        },
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.REMOVE_PUBLIC_HASH)) {
      let data = state.data;
      if (action.itemType === 'PUBLIC') {
        Object.keys(data).forEach(key => {
          if (data[key][action.hash]) data[key][action.hash].public = false;
        });
      } else if (action.itemType === 'PRIVATE') {
        Object.keys(data).forEach(key => {
          if (data[key][action.hash]) {
            if (data[key][action.hash].type_ === 'folder') data[key][action.hash].shared = false;
            else if (data[key][action.hash].type_ === 'file') data[key][action.hash].share = false;
          }
        });
      }

      return Object.assign({}, state, {
        ...state,
        data,
        random: Math.random(),
      });
    }

    // if (Object.is(action.type, Constants.GET_AFTER_LIKE_SUCCESS.toString())) {
    //   let newData = state.data;
    //   const { action: fileLikeData } = action.data;
    //   const lastHash = action.lastHash || (action.data.action && action.data.action.hash);
    //   lodashForeach(newData, (filter, index) => {
    //     if (
    //       newData[index][lastHash] &&
    //       newData[index][lastHash].type_ !== 'folder' &&
    //       newData[index][lastHash].postId === fileLikeData.postId
    //     ) {
    //       newData[index][lastHash]['like'] = !fileLikeData.like;
    //     }
    //   });

    //   return Object.assign({}, state, {
    //     data: newData,
    //     random: Math.random(),
    //   });
    // }

    // if (Object.is(action.type, Constants.FETCH_FILES_LIKED_FROM_CORE_SUCCESS.toString())) {
    //   let newData = state.data;
    //   const { filter, likeList } = action;

    //   Object.keys(newData[filter]).forEach(hash => {
    //     const like = likeList.find(like => like.postId === newData[filter][hash].postId);
    //     if (like) {
    //       newData[filter][hash]['like'] = like.liked;
    //     }
    //   });

    //   return Object.assign({}, state, {
    //     data: newData,
    //     random: Math.random(),
    //   });
    // }

    if (Object.is(action.type, Constants.BOOKMARK_SUCCESS.toString())) {
      let { mybox } = state.data;
      action.hashList.forEach(hash => {
        if (mybox[hash]) mybox[hash].isBookmarked = true;
      });

      return Object.assign({}, state, {
        data: {
          ...state.data,
          mybox,
        },
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.DELETE_BOOKMARK_SUCCESS.toString())) {
      let { mybox, favorite } = state.data;

      action.hashList.forEach(itemHash => {
        if (mybox[itemHash]) mybox[itemHash].isBookmarked = false;
        if (favorite[itemHash]) Reflect.deleteProperty(favorite, itemHash);
      });

      return Object.assign({}, state, {
        data: {
          ...state.data,
          mybox,
          favorite,
        },
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.SHARE_SUCCESS)) {
      const data = state.data;
      const { listItems } = action;
      listItems.forEach(item => {
        if (data[action.filter][item.entity.hash] && item.type === 'PUBLIC') {
          data[action.filter][item.entity.hash].isPublic = true;
        } else if (data[action.filter][item.entity.hash] && item.type === 'PRIVATE') {
          data[action.filter][item.entity.hash].isShared = true;
        }
      });
      return { ...state, data, random: Math.random() };
    }

    if (Object.is(action.type, Constants.REMOVE_SHARE_SUCCESS)) {
      const data = { ...state.data };
      const filterData = data && data[action.filter];
      if (action.selfShare && action.shareType === 'PRIVATE' && filterData) {
        filterData[action.hash].isShared = false;
      } else if (!action.selfShare && action.shareType === 'PUBLIC' && filterData) {
        Object.keys(filterData).forEach(key => {
          filterData[key].isPublic = false;
        });
      } else if (action.shareType === 'PUBLIC' && filterData) {
        filterData[action.hash].isPublic = false;
      }
      return {
        ...state,
        data,
        random: Math.random(),
      };
    }

    if (Object.is(action.type, Constants.ADD_PASSWORD)) {
      return Object.assign({}, state, {
        publicFolderId: action.publicFolderId,
        publicFolderPassword: action.publicFolderPassword,
        publicFolderNeedPassword: action.publicFolderNeedPassword,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.DISABLE_SET_PASSWORD)) {
      return Object.assign({}, state, {
        disable_set_password: action.disable,
        random: Math.random(),
      });
    }

    if (Object.is(action.type, Constants.SORT_FILES.toString())) {
      return Object.assign({}, state, {
        sortDesc: action.desc,
        sortType: action.sortType,
      });
    }

    if (Object.is(action.type, Constants.RESET_SORT_FILES.toString())) {
      return Object.assign({}, state, {
        sortDesc: false,
        sortType: 'name',
      });
    }

    if (Object.is(action.type, Constants.SELECT_ALL_ITEMS)) {
      const data = { ...state.data };
      const fileList = { ...data[action.filter] };
      Object.keys(fileList).forEach(key => {
        fileList[key]['isSelected'] = true;
      });
      data[action.filter] = fileList;
      return {
        ...state,
        data: {
          ...data,
        },
        selectedCount: Object.keys(fileList).length,
      };
    }

    if (Object.is(action.type, Constants.PLAY_AUDIO_LIST)) {
      return {
        ...state,
        playList: {
          list: action.list,
          startHash: action.startHash,
          password: action.password,
          type: 'AUDIO',
        },
      };
    }

    if (Object.is(action.type, Constants.ADD_TO_AUDIO_PLAY_LIST) && state.playList) {
      return {
        ...state,
        playList: {
          ...state.playList,
          list: [...state.playList.list, ...action.list],
        },
      };
    }

    if (Object.is(action.type, Constants.CLOSE_AUDIO_PLAYER)) {
      return {
        ...state,
        playList: null,
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
