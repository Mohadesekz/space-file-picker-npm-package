import Constants from '../constants';

export const shareRequest = (data, _type = 'file') => ({
  ...data,
  _type, //folder or file
  type: Constants.GET_SHARE_REQUEST.toString(),
});

export const shareRemoveRequest = (shareHash, fileHash, shareType, selfShare) => {
  return {
    selfShare,
    shareType,
    shareHash,
    fileHash,
    type: Constants.REMOVE_SHARE_REQUEST.toString(),
  };
};

export const shareRemoveAllRequest = () => ({
  type: Constants.REMOVE_ALL_SHARE_REQUEST.toString(),
});

export const updateShareInfoList = (shareList, updateList, shareHash) => {
  return {
    shareList,
    updateList, //true => update list with new list , false => remove currect hash from list
    shareHash,
    type: Constants.SHARE_INFO_UPDATE,
  };
};

export const shareInfoFailure = () => ({
  type: Constants.GET_SHARE_FAILURE,
});
