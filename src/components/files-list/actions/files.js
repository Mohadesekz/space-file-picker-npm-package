import Constants from '../constants';
import { Util } from '../../../helpers';

export const changeView = view => ({
  view,
  type: Constants.CHANGE_VIEW,
});

export const updateList = data => ({
  ...data,
  type: Constants.UPDATE_LIST,
});

export const hideItem = (filter, hashes, hide) => ({
  hide,
  hashes,
  filter,
  type: Constants.HIDE_ITEM,
});

export const fetchFilesLoading = (filter, loading) => ({
  filter,
  loading,
  type: Constants.FETCH_FILES_LOADING,
});

export const fetchFilesRequest = data => ({
  ...data,
  type: Constants.FETCH_FILES_REQUEST.toString(),
});

export const fetchFileDetailRequest = (
  fileHash,
  isPublic,
  returnDetails = null,
  password = null,
) => ({
  fileHash,
  isPublic,
  password,
  returnDetails,
  type: Constants.FETCH_FILE_DETAIL_REQUEST.toString(),
});

export const fetchFilesFailure = (filter, error) => ({
  error,
  filter,
  type: Constants.FETCH_FILES_FAILURE,
});

export const addItemInList = (filter, fileItem) => {
  return {
    fileItem: {
      ...fileItem,
      created_: Util.fileDateTimeFa(fileItem.created),
      updated_: Util.fileDateTimeFa(fileItem.updated),
      size_: fileItem.size ? Util.bytesToSize(fileItem.size) : '_',
      type_: fileItem.type === 'application/vnd.podspace.folder' ? 'folder' : 'file',
    },
    filter,
    type: Constants.ADD_ITEM,
  };
};

export const changeFolder = (folder, recentSelectedFile = undefined) => ({
  folder,
  recentSelectedFile,
  type: Constants.CHANGE_FOLDER,
});

export const publicFolderPasswordRequired = () => ({
  type: Constants.HASH_REQUIRED_PASSWORD,
});
export const publicFolderForbidden = () => ({
  type: Constants.HASH_FORBIDDEN,
});

export const publicFolderPasswordSet = (publicFolderPassword, publicFolderId) => {
  return {
    publicFolderId,
    publicFolderPassword,
    type: Constants.ADD_PASSWORD,
  };
};

// export const likeAndDislike = (postId, like, hash, onEnd) => {
// return {
//   postId,
//   like,
//   hash,
//   type: Constants.LIKE_AND_DISLIKE.toString(),
//   onEnd,
// };
// };

export const shortLink = (link, hash, onEnd) => {
  return {
    link,
    hash,
    onEnd,
    type: Constants.SHORT_LINK.toString(),
  };
};

// export const successAfterLike = data => {
//   return {
//     data,
//     type: Constants.GET_AFTER_LIKE_SUCCESS.toString(),
//   };
// };

export const sortFiles = (endpoint, sortType, filter, desc) => {
  return {
    endpoint,
    sortType,
    filter,
    desc,
    type: Constants.SORT_FILES.toString(),
  };
};

export const resetSortFiles = () => {
  return {
    type: Constants.RESET_SORT_FILES.toString(),
  };
};

export const removeShareSuccess = (hash, filter, shareType, selfShare) => {
  return {
    hash,
    filter,
    shareType,
    selfShare,
    type: Constants.REMOVE_SHARE_SUCCESS,
  };
};

export const disableSetPassword = disable => {
  return {
    disable,
    type: Constants.DISABLE_SET_PASSWORD,
  };
};

// export const fetchFilesLikedFromCoreSuccess = (filter, likeList) => {
//   return {
//     filter,
//     likeList,
//     type: Constants.FETCH_FILES_LIKED_FROM_CORE_SUCCESS.toString(),
//   };
// };

export const playAudioList = (list, startHash, password) => {
  return {
    list,
    startHash,
    password,
    type: Constants.PLAY_AUDIO_LIST,
  };
};

export const AddToPlayerList = list => {
  return {
    list,
    type: Constants.ADD_TO_AUDIO_PLAY_LIST,
  };
};

export const closeAudioPlayer = () => {
  return {
    type: Constants.CLOSE_AUDIO_PLAYER,
  };
};

///////////////////////////////////////////////////////////////////////
export const fetchFilesSuccess = (filter, response, updateData = true) => {
  const accessLevel = getAcessLevel();
  const folderAccessLevel = response.entity?.accessLevel;
  return {
    filter,
    updateData,
    type: Constants.FETCH_FILES_SUCCESS,
    accessLevel: folderAccessLevel || accessLevel,
    response: {
      hash: (response.entity && response.entity.hash) || filter,
      owner: (response.entity && response.entity.owner) || {
        avatar: undefined,
        name: undefined,
        roles: [],
        username: undefined,
        ssoId: undefined,
      },
      data: getFilterList(
        filter,
        response.list,
        !!(response.breadcrumb && response.breadcrumb.length), //if ther is breadcrumb that mean we are in folder
        folderAccessLevel || accessLevel,
      ),
      breadcrumb: response.breadcrumb || [],
    },
  };
};

const getAcessLevel = () => {
  const pathname = window.location.pathname;
  switch (true) {
    case pathname.startsWith('/my-space'):
      return 'EDIT';
    case pathname.includes('/recent'):
      return 'EDIT';
    case pathname.includes('/bookmark'):
      return 'EDIT';
    case pathname.includes('/search'):
      return 'EDIT';
    default:
      return null;
  }
};

const getFilterList = (filter, resList, isInFolder, accessLevel) => {
  let list = [];
  if (
    filter === 'mybox' ||
    filter === 'favorite' ||
    filter === 'trash' ||
    filter === 'search' ||
    isInFolder
  ) {
    resList.forEach(res => {
      list = [
        ...list,
        {
          ...res,
          accessLevel,
          userCanTrash: res.userCanTrash,
          created_: Util.fileDateTimeFa(res.created),
          updated_: Util.fileDateTimeFa(res.updated),
          size_: res.size ? Util.bytesToSize(res.size) : '_',
          type_: res.type === 'application/vnd.podspace.folder' ? 'folder' : 'file',
        },
      ];
    });
  } else if (filter === 'lastmod') {
    resList.forEach(res => {
      list = [
        ...list,
        {
          ...res.entity,
          accessLevel: 'EDIT',
          created_: Util.fileDateTimeFa(res.created),
          updated_: Util.fileDateTimeFa(res.entity.updated),
          size_: res.entity && res.entity.size ? Util.bytesToSize(res.entity.size) : '_',
          type_: res.reference.toLowerCase(),
        },
      ];
    });
  } else if (filter === 'shared') {
    resList.forEach(res => {
      list = [
        ...list,
        {
          ...res.entity,
          accessLevel: res.level,
          created_: Util.fileDateTimeFa(res.created),
          updated_: Util.fileDateTimeFa(res.updated),
          size_: res.entity && res.entity.size ? Util.bytesToSize(res.entity.size) : '_',
          type_: res.entityType.toLowerCase(),
        },
      ];
    });
  }

  return list;
};
///////////////////////////////////////////////////////////////////////
