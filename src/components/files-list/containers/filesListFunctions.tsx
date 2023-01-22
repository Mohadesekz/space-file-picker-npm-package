import React, { Component } from 'react';
import PropTypes from 'prop-types';
import lodashFilter from 'lodash/filter';
import lodashSize from 'lodash/size';
import { ContextMenu, Menu, MenuItem, Intent } from '@blueprintjs/core';
import { shareRequest as getShareList, updateShareInfoList } from '../../information/actions';
import { changeFilter } from './../../sidebar/actions';
import passwordSVG from '../../../assets/icons/password.svg';
import { FormGroup, InputGroup, Button } from '@blueprintjs/core';
import { Util } from '../../../helpers';
import Manifest from '../../../manifest';

import {
  fetchFilesRequest,
  trashFilesRequest,
  selectItem,
  unSelectItem,
  unSelectAll,
  renameRequest,
  addToCopy,
  copyFilesRequest,
  deleteTrashRequest,
  restoreTrashRequest,
  restoreAllTrashRequest,
  recentRequest,
  changeFolder,
  folderRequest,
  shareRequest,
  bookmarkRequest,
  deleteBookmarkRequest,
  sharePasswordRequest,
  // likeAndDislike,
  shortLink,
  fetchFileDetailRequest,
  publicFolderPasswordSet,
  emptyTrashRequest,
  selectAllItems,
  playAudioList,
} from '../actions';

import { shareRemoveRequest } from '../../information/actions';
import { AddToPlayerList } from '../actions/files';

export const mapStateToProps = (state: any) => ({
  ...state.files.list,
  copy: state.files.copy,
  recents: state.files.recents,
  trash: state.files.trash,
  filter: state.sidebar.filter,
  itemInfo: state.files.selected,
  shares: state.files.shares,
  publicFolderNeedPassword: state.files.list.publicFolderNeedPassword,
  publicFolderForbidden: state.files.list.publicFolderForbidden,
});

export const mapDispatchToProps = (dispatch: any) => ({
  fetchFileDetail(fileHash: string, isPublic: boolean) {
    dispatch(fetchFileDetailRequest(fileHash, isPublic));
  },

  fetchFilter(endpoint: string, filter: string, isPublic: boolean, folderHash: string) {
    dispatch(fetchFilesRequest({ endpoint, filter, isPublic, folderHash }));
  },

  onOpenFolder(filter: string, hash: string, isPublic: boolean, item = null) {
    dispatch(unSelectAll());
    dispatch(changeFolder(hash, item || undefined));
    dispatch(changeFilter(filter, { folderHash: hash }));
  },

  onTrash(filter: string, hash: string, onEnd: any) {
    dispatch(trashFilesRequest(filter, hash, onEnd));
  },

  onCopy(items: any, type: any, onEnd: any) {
    dispatch(addToCopy(items, type));
    if (typeof onEnd === 'function') {
      onEnd();
    }
  },

  onPaste(hash: any, filter: any, onEnd: any) {
    dispatch(copyFilesRequest(hash, filter, onEnd));
  },

  onChangeName(parentHash: string, data: any, onEnd: any) {
    dispatch(renameRequest({ ...data, parentHash, onEnd }));
  },

  // onLikeAndDislike(postId: number, like: boolean, hash: string) {
  //   dispatch(likeAndDislike(postId, like, hash));
  // },

  onShare(data: any, onEnd: any) {
    dispatch(shareRequest(data, onEnd));
  },

  onGetShareList(data: any, onEnd: any) {
    dispatch(getShareList(data, onEnd));
  },

  onUpdateShareInfoList(shareList: any[], updateList: boolean, shareHash: string) {
    dispatch(updateShareInfoList(shareList, updateList, shareHash));
  },

  onChangePassword(password: string, hash: string, orginalType: string, onEnd: any) {
    dispatch(sharePasswordRequest(password, hash, orginalType, onEnd));
  },

  onCreateFolder(parentHash: string, onEnd: any) {
    return (name: string) => {
      dispatch(folderRequest({ name, parentHash }, onEnd));
    };
  },

  onSelectItem(detail: any, filter: string, explicit: boolean) {
    dispatch(selectItem(detail, filter, explicit));
  },

  onSelectAllItems(filter: string, data: any) {
    return () => {
      dispatch(selectAllItems(filter, data));
    };
  },

  onUnSelectItem(filter: string) {
    return (details: any) => {
      dispatch(unSelectItem(filter, details));
    };
  },

  onUnSelectAll() {
    dispatch(unSelectAll());
  },

  onToggleItem(filter: string) {
    return (details: any) => {
      if (details.isSelected) dispatch(unSelectItem(filter, details));
      else dispatch(selectItem(details, filter, true));
    };
  },

  onLoadMore(endpoint: string, filter: string, folderHash: string, isPublic: boolean) {
    dispatch(fetchFilesRequest({ endpoint, filter, isPublic, folderHash }));
  },

  onBookmark() {
    dispatch(bookmarkRequest());
  },

  onDelBookmark(items = [], onEnd: any) {
    dispatch(deleteBookmarkRequest({ items, onEnd }));
  },

  onPlayAudioList(list: any[], startHash: string, password: string) {
    dispatch(playAudioList(list, startHash, password));
  },

  onAddToPlayList(list: any[]) {
    dispatch(AddToPlayerList(list));
  },

  changeFolder(folder: string, item = undefined) {
    dispatch(unSelectAll());
    dispatch(changeFolder(folder, item));
  },

  onDeleteFromTrash(items = []) {
    dispatch(deleteTrashRequest(items));
  },

  onEmptyTrash() {
    dispatch(emptyTrashRequest());
  },

  onRestoreFromTrash() {
    dispatch(restoreTrashRequest());
  },

  onRestoreAllFromTrash() {
    dispatch(restoreAllTrashRequest());
  },

  onGetRecents() {
    dispatch(recentRequest());
  },

  onChangeFilter(id: number, body: any) {
    dispatch(unSelectAll());
    dispatch(changeFilter(id, body));
  },

  onShortlink(link: string, hash: string, onEnd: any) {
    dispatch(shortLink(link, hash, onEnd));
  },

  onPublicFolderPasswordSet(hash: string, publicFolderPassword: string) {
    dispatch(publicFolderPasswordSet(hash, publicFolderPassword));
  },

  onSetPassword(publicFolderPassword: string, publicFolderId: number) {
    dispatch(publicFolderPasswordSet(publicFolderPassword, publicFolderId));
  },
  OnRemoveShare(
    shareHash: string,
    fileHash: string,
    shareType: 'PRIVATE' | 'PUBLIC',
    selfShare: boolean,
  ) {
    dispatch(shareRemoveRequest(shareHash, fileHash, shareType, selfShare));
  },
});

class FilesListFunctions extends Component<any, any> {
  mobileAndTabletCheck = Util.mobileAndTabletCheck();
  password: string | null = null;
  filesRef = React.createRef();
  renameRef = React.createRef();
  newFolderRef = React.createRef();
  body = this.props.filter.body;
  timeout: ReturnType<typeof setTimeout> | null = null;

  static propTypes = {
    filter: PropTypes.shape({
      selected: PropTypes.string.isRequired,
      options: PropTypes.array.isRequired,
    }).isRequired,

    itemInfo: PropTypes.shape({
      empty: PropTypes.bool.isRequired,
      data: PropTypes.array.isRequired,
      hash: PropTypes.array.isRequired,
    }).isRequired,

    trash: PropTypes.shape({
      items: PropTypes.array.isRequired,
      hasError: PropTypes.bool.isRequired,
      isEmpty: PropTypes.bool.isRequired,
    }).isRequired,

    copy: PropTypes.shape({
      items: PropTypes.array.isRequired,
      hasError: PropTypes.bool.isRequired,
      isEmpty: PropTypes.bool.isRequired,
    }).isRequired,

    recents: PropTypes.shape({
      recents: PropTypes.object,
      hasError: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
    }).isRequired,

    view: PropTypes.oneOf(['list', 'grid']).isRequired,
    hash: PropTypes.string,
    hasError: PropTypes.bool,
    data: PropTypes.object.isRequired,
    breadcrumb: PropTypes.array.isRequired,
    fetchFilter: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    selectedCount: PropTypes.number,
    onOpenFolder: PropTypes.func.isRequired,
    onSelectItem: PropTypes.func.isRequired,
    onUnSelectItem: PropTypes.func.isRequired,
    onToggleItem: PropTypes.func.isRequired,
    isLoading: PropTypes.object.isRequired,
    onTrash: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onChangeName: PropTypes.func.isRequired,
    uploadBox: PropTypes.object,
    trashDisableError: PropTypes.func,
    onBookmark: PropTypes.func.isRequired,
    onDelBookmark: PropTypes.func.isRequired,
    onDeleteFromTrash: PropTypes.func.isRequired,
    onRestoreFromTrash: PropTypes.func.isRequired,
    infoSidebarToggle: PropTypes.func,
    infoSidebarStatus: PropTypes.bool,
    public: PropTypes.bool,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      isConfirmOpen: false,
      confirmText: '',
      confirmFunc: void 0,
      disableContext: false,
      shareItem: null,
      imageSlider: {
        open: false,
        startIndex: -1,
        images: [],
        password: null,
      },
      VideoPlayer: {
        open: false,
        startIndex: -1,
        list: [],
        password: null,
      },
      pdfReader: {
        open: false,
        data: null,
      },
      publicFolderPassword: null,
      downloadDetails: null,
      showRecents: true,
    };

    if (this.props.public && this.props.publicFolderPasswordProp) {
      this.props.onSetPassword(this.props.publicFolderPasswordProp, this.props.publicFolderId);
    }
    const folderHash = this.props.match.params.folderHash;
    const endPoint = this.whatsEndpoint(this.props.filter.selected, folderHash);
    if (endPoint) {
      this.props.fetchFilter(
        endPoint,
        this.props.filter.selected,
        this.props.public,
        this.props.hash,
      );
      if (
        this.props.filter.selected === 'mybox' &&
        !this.props.public &&
        !folderHash &&
        localStorage.getItem('show-recents') !== 'false'
      ) {
        this.getRecentActivities();
      }
    }
  }

  getRecentActivities = () => {
    if (!this.mobileAndTabletCheck) {
      this.props.onGetRecents();
    }
  };

  componentDidMount() {
    this.setState({
      showRecents: localStorage.getItem('show-recents') === 'false' ? false : true,
    });
  }
  componentDidUpdate(prevProps: any) {
    const strBody = this.props.filter.body ? JSON.stringify(this.props.filter.body) : '';
    if (
      !Object.is(prevProps.filter.selected, this.props.filter.selected) ||
      !Object.is(JSON.stringify(prevProps.filter.body) || null, strBody || null) ||
      (!Object.is(prevProps.match.url, this.props.match.url) &&
        (this.props.match.url === '/my-space' ||
          this.props.match.url === '/recent' ||
          this.props.match.url === '/shared-with-me' ||
          this.props.match.url === '/bookmark' ||
          this.props.match.url === '/trash'))
    ) {
      const folderHashRoot =
        this.props.location.state && this.props.location.state.rootHashFolder
          ? this.props.location.state.rootHashFolder
          : null;

      if (folderHashRoot) {
        this.props.onChangeFilter('mybox');
        this.props.changeFolder(folderHashRoot);
      } else {
        this.props.changeFolder();
      }

      const folderHash = this.props.match.params.folderHash;
      this.body = this.props.filter.body;

      const endPoint = this.whatsEndpoint(this.props.filter.selected, folderHash);
      if (endPoint) {
        this.props.fetchFilter(
          endPoint,
          this.props.filter.selected,
          this.props.public,
          this.props.match.params.folderHash,
        );
      }
      if (
        this.props.filter.selected === 'mybox' &&
        !this.props.public &&
        this.state.showRecents === true
      ) {
        this.getRecentActivities();
      }
    }

    if (!Object.is(prevProps.match.params.folderHash, this.props.match.params.folderHash)) {
      this.onChangeFolderRoute();
    }
  }

  onChangeFolderRoute = () => {
    const isPublic = this.props.public;
    const folderHash = this.props.match.params.folderHash;
    const filterSelected = this.props.filter.selected;
    const recentSelectedFile = isPublic
      ? null
      : this.props.location.state && this.props.location.state.recentSelectedFile
      ? this.props.location.state.recentSelectedFile
      : null;
    this.props.onOpenFolder(filterSelected, folderHash, isPublic, recentSelectedFile);
  };

  whatsEndpoint(filter: string, hasFolderHash: string) {
    const pathName = (window.location.pathname || '').replace('/', '');
    switch (true) {
      case (filter === 'mybox' && pathName === 'my-space') || !!hasFolderHash:
        return `/folders/${hasFolderHash ? hasFolderHash : 'ROOT'}/children?size=${
          Manifest.pageSize
        }${this.props.public || !hasFolderHash ? '' : '&breadcrumb=true'}`;
      case filter === 'search' && pathName === 'search':
        return '/files/search';
      case filter === 'lastmod' && pathName === 'recent':
        return `activities?size=${Manifest.pageSize}`;
      case filter === 'shared' && pathName === 'shared-with-me':
        return `shares?size=${Manifest.pageSize}`;
      case filter === 'favorite' && pathName === 'bookmark':
        return `bookmarks?size=${Manifest.pageSize}`;
      case filter === 'trash' && pathName === 'trash':
        return `trashes?size=${Manifest.pageSize}`;
      default:
        //this case happen when app is on another route and user reload the page
        this.changeRoute(pathName);
    }
  }
  changeRoute = (path: string) => {
    switch (path) {
      case 'search':
        this.props.onChangeFilter('search');
        break;
      case 'recent':
        this.props.onChangeFilter('lastmod');
        break;
      case 'shared-with-me':
        this.props.onChangeFilter('shared');
        break;
      case 'bookmark':
        this.props.onChangeFilter('favorite');
        break;
      case 'trash':
        this.props.onChangeFilter('trash');
        break;
      default:
        this.props.onChangeFilter('mybox');
    }
  };

  whatsEndpointDetails(filter: string) {
    return this.props.filter.options.find((element: any) => {
      return Object.is(filter, element.id);
    });
  }

  onInfoSidebar = () => {
    if (!this.props.infoSidebarStatus) {
      this.props.infoSidebarToggle();
    }
  };

  showPublicContextMenu = (e: any, item: any) => {
    e.preventDefault();
    if (this.props.isLoading[this.props.filter.selected] || this.state.imageSlider.open) {
      return;
    }
    const itemName = item.type_ === 'folder' ? 'پوشه' : 'فایل';
    const fileType = Util.getFileType(item.extension);
    const filter = Util.getFilterByPath();
    let items = lodashFilter(this.props.data[filter.filter], itemC => itemC.isSelected);
    if (!items) {
      items = [];
    }

    ContextMenu.show(
      <Menu>
        {fileType === 'IMAGE' && (
          <MenuItem icon="media" onClick={() => this.handleImageSlider(item)} text="پیش ‌نمایش" />
        )}

        {fileType === 'AUDIO' && (
          <>
            {this.props.playList && (
              <MenuItem
                icon="add"
                onClick={() => this.handlePlayerMusic(item, true)}
                text="افزودن به لیست پخش"
              />
            )}
            <MenuItem icon="volume-up" onClick={() => this.handlePlayerMusic(item)} text="پخش" />
          </>
        )}

        {fileType === 'VIDEO' && (
          <MenuItem icon="play" onClick={() => this.handleVideoPlayer(item)} text="پخش" />
        )}

        {fileType === 'PDF' && (
          <MenuItem icon="document-open" onClick={() => this.handlePdfReader(item)} text="نمایش" />
        )}

        {item.type_ === 'folder' && (
          <MenuItem
            icon="folder-open"
            onClick={() => {
              this.props.history.push(`${item.hash}`);
            }}
            text="باز کردن پوشه"
          />
        )}

        {/* {item.type_ === 'file' && (
          <MenuItem
            icon="cloud-download"
            onClick={() => this.setState({ downloadDetails: item })}
            text={`دانلود ${itemName}`}
          />
        )} */}

        {item && (
          <MenuItem
            icon="cloud-download"
            onClick={() => this.setState({ downloadDetails: items })}
            text={`دانلود ${itemName}`}
          />
        )}
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => {}, // onContextMenuClose
    );
  };

  showContextMenu = (e: any) => {
    e.preventDefault();
    const filterSelected = Util.getFilterByPath();
    if (this.props.isLoading[filterSelected.filter] || this.state.imageSlider.open) {
      return;
    }

    let items = lodashFilter(this.props.data[filterSelected.filter], item => item.isSelected);

    if (!items) {
      items = [];
    }

    const itemsLength = lodashSize(items);
    let items_type =
      items.filter(item => item.type_ === 'folder').length > 0
        ? items.filter(item => item.type_ === 'file').length > 0
          ? 'folder_item'
          : 'folder'
        : 'file';
    // const itemName = (items_type === 'folder' ? 'پوشه' : 'فایل') + (itemsLength > 1 ? ' ها' : '');
    const itemName = itemsLength > 1 ? 'دسته‌ای' : items_type === 'folder' ? 'پوشه' : 'فایل';
    const shouldPasteOnSelectedFolder =
      items_type === 'folder' && itemsLength === 1 && filterSelected.filter !== 'trash';

    const item = items && items[0];
    const fileType = Util.getFileType((item && item.extension) || '');

    ContextMenu.show(
      <Menu>
        {fileType === 'IMAGE' && itemsLength === 1 && (
          <MenuItem icon="media" onClick={() => this.handleImageSlider(item)} text="پیش‌ نمایش" />
        )}

        {fileType === 'AUDIO' && itemsLength === 1 && (
          <>
            {this.props.playList && (
              <MenuItem
                icon="add"
                onClick={() => this.handlePlayerMusic(item, true)}
                text="افزودن به لیست پخش"
              />
            )}
            <MenuItem icon="volume-up" onClick={() => this.handlePlayerMusic(item)} text="پخش" />
          </>
        )}

        {fileType === 'VIDEO' && itemsLength === 1 && (
          <MenuItem icon="play" onClick={() => this.handleVideoPlayer(item)} text="پخش" />
        )}

        {fileType === 'PDF' && itemsLength === 1 && (
          <MenuItem icon="document-open" onClick={() => this.handlePdfReader(item)} text="نمایش" />
        )}

        {shouldPasteOnSelectedFolder && (
          <MenuItem
            icon="folder-open"
            onClick={() => {
              this.props.history.push(`${filterSelected.path}/folders/${item.hash}`);
            }}
            text="باز کردن پوشه"
          />
        )}

        {item &&
          !this.props.infoSidebarStatus &&
          (!this.props.selectedCount || this.props.selectedCount < 2) && (
            <MenuItem icon="info-sign" onClick={this.onInfoSidebar} text={`اطلاعات`} />
          )}

        {!Object.is(filterSelected.filter, 'trash') ? (
          <React.Fragment>
            {/* {item && item.type_ === 'file' && (
              <MenuItem
                icon="cloud-download"
                disabled={itemsLength > 1}
                onClick={() => this.setState({ downloadDetails: item })}
                text={`دانلود ${itemName}`}
              />
            )} */}
            {item && (
              <MenuItem
                icon="cloud-download"
                className="disabled-button"
                disabled={itemsLength > 100}
                onClick={() => this.setState({ downloadDetails: items })}
                text={`دانلود ${itemName}`}
                data-title={itemsLength > 100 && 'تعداد فایل‌ها بیشتر از حد مجاز است'}
              />
            )}

            {/* {item &&
              !item.isBookmarked &&
              (!item.owner || localStorage.getItem('username') === item.owner?.username) &&
              (filterSelected.filter === 'favorite' || filterSelected.filter === 'mybox') && (
                <MenuItem
                  icon="star"
                  onClick={() => this.props.onBookmark()}
                  text={`نشانه‌گذاری`}
                />
              )} */}

            {/* {item &&
              item.isBookmarked &&
              (!item.owner || localStorage.getItem('username') === item.owner?.username) &&
              (filterSelected.filter === 'favorite' || filterSelected.filter === 'mybox') && (
                <MenuItem
                  icon="star-empty"
                  onClick={() =>
                    this.props.onDelBookmark(
                      items.filter(item => item.isBookmarked),
                      this.onRefresh,
                    )
                  }
                  text={`حذف نشانه‌گذاری`}
                />
              )} */}

            {/* {item && (
              <MenuItem
                icon="edit"
                disabled={!(item.accessLevel && item.accessLevel === 'EDIT') || itemsLength > 1}
                onClick={() => {
                  const onEnd = () => this.setState({ disableContext: false });
                  this.setState({ disableContext: true }, () => {
                    (this.renameRef as any).current.handleOpen(
                      item.hash,
                      item.name,
                      item.extension,
                      item.type_,
                      onEnd,
                    );
                  });
                }}
                text={`تغییر نام`}
              />
            )} */}

            {/* <Menu.Divider /> */}

            {/* {!this.props.copy.isEmpty && shouldPasteOnSelectedFolder && (
              <MenuItem
                icon="document-open"
                onClick={() =>
                  this.props.onPaste(
                    shouldPasteOnSelectedFolder ? item.hash : this.props.hash,
                    filterSelected.filter,
                    this.onRefresh,
                  )
                }
                text={`چسباندن ${this.props.copy.items.length} فایل در ${
                  shouldPasteOnSelectedFolder ? item.name : 'اینجا'
                }`}
                label={`Paste ` + this.props.copy.items.length.toString()}
              />
            )} */}

            {/* {item && (
              <MenuItem
                icon="duplicate"
                onClick={() => this.props.onCopy(items, 'copy', this.props.onUnSelectAll)}
                text={`کپی ${itemsLength} فایل`}
                label="Copy"
                disabled={
                  items.filter(item => !(item.accessLevel && item.accessLevel === 'EDIT')).length >
                  0
                }
              />
            )} */}

            {/* {item && (
              <MenuItem
                icon="move"
                onClick={() => this.props.onCopy(items, 'cut', this.props.onUnSelectAll)}
                text={`جابجایی ${itemsLength} فایل`}
                label="Move"
                disabled={
                  items.filter(item => !(item.accessLevel && item.accessLevel === 'EDIT')).length >
                  0
                }
              />
            )} */}

            {/* {item && (
              <MenuItem
                icon="share"
                onClick={() => {
                  this.props.onUpdateShareInfoList([], true, null);
                  this.setState({ disableContext: true, shareItem: item });
                  this.props.onGetShareList(item, item.type_);
                }}
                text={`اشتراک گذاری`}
                label="Share"
                disabled={!(item.accessLevel && item.accessLevel === 'EDIT') || itemsLength > 1}
              />
            )} */}

            {/* {item.type_ !== 'folder'
              ? item && (
                  <MenuItem
                    icon={
                      item.like ? (
                        <svg
                          id="regular"
                          width="17px"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#5c7080"
                          style={{ marginLeft: 7 }}
                        >
                          <path d="m24 12c0-1.95-1.598-3.536-3.563-3.536h-4.875v-3.428c0-1.95-1.598-3.536-3.562-3.536h-2.109c-1.502 0-1.518 1.463-1.455 2.8.024.521.052 1.106.015 1.72-1.074 1.888-1.748 3.074-2.167 3.837h-5.534c-.414 0-.75.336-.75.75v11.143c0 .414.336.75.75.75h19.958c.296 0 .564-.174.686-.445 2.832-6.37 2.658-6.281 2.606-10.055zm-18.375 9h-4.125v-9.643h4.124c0 .002.001.005.001.008zm14.596 0h-13.096v-9.528c.154-.3.715-1.347 2.714-4.858.201-.352.114-1.972.095-2.385-.02-.424-.046-.985.004-1.229h2.062c1.138 0 2.062.913 2.062 2.036v4.179c0 .414.336.75.75.75h5.625c1.138 0 2.063.913 2.063 2.043.047 3.486.222 3.358-2.279 8.992z" />
                        </svg>
                      ) : (
                        <svg
                          id="Bold"
                          width="16px"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#5c7080"
                          style={{ marginLeft: 7 }}
                        >
                          <path d="m23.934 15.304c.044-.096.066-.199.066-.304v-3c0-1.654-1.346-3-3-3h-6v-4.5c0-1.655-1.346-3-3-3h-2.25c-.414 0-.75.336-.75.75v3.55l-2.901 5.078c-.066.114-.099.241-.099.372v10.5c0 .414.336.75.75.75h12.038c1.185 0 2.262-.701 2.74-1.782z" />
                          <path d="m.75 22.5h3.75v-12h-3.75c-.414 0-.75.336-.75.75v10.5c0 .414.336.75.75.75z" />
                        </svg>
                      )
                    }
                    disabled={itemsLength > 1}
                    onClick={() => {
                      this.props.onLikeAndDislike(item.postId, item.like, item.hash);
                    }}
                    text={item.like ? 'نپسندیدن' : 'پسندیدن'}
                    label={`${item.like ? 'Dislike' : 'Like'}`}
                  />
                )
              : null} */}

            {/* {item && <Menu.Divider />} */}

            {/* {item && (
              <MenuItem
                icon="trash"
                onClick={() => {
                  return this.props.onTrash(
                    filterSelected.filter,
                    this.props.hash,
                    this.state.showRecents === true ? this.props.onGetRecents : () => {},
                  );
                }}
                text="انتقال به سطل بازیافت"
                disabled={
                  !!items.filter(item => !(item.accessLevel && item.accessLevel === 'EDIT')).length
                }
              />
            )} */}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Menu.Divider title="سطل بازیافت" />
            {/* 
            {item && (
              <MenuItem
                icon="delete"
                intent={Intent.DANGER}
                text="حذف برای همیشه"
                onClick={() =>
                  this.setState({
                    disableContext: true,
                    isConfirmOpen: true,
                    confirmFunc: () => this.props.onDeleteFromTrash(items),
                    confirmText: `از حذف فایل "${
                      items.length > 1 ? 'ها' : item.name
                    }" برای همیشه اطمینان دارید ؟`,
                  })
                }
              />
            )} */}

            {/* {item && (
              <MenuItem
                icon="document-share"
                text="بازگردانی"
                label="Restore"
                onClick={() =>
                  this.setState({
                    disableContext: true,
                    isConfirmOpen: true,
                    confirmFunc: () => this.props.onRestoreFromTrash(),
                    confirmText: `از بازگردانی فایل ${
                      items.length > 1 ? 'ها' : item.name
                    } اطمینان دارید ؟`,
                  })
                }
              />
            )} */}

            {/* {items.length < 2 && [
              <Menu.Divider title="مدیریت سطل بازیافت" key={0} />,
              <MenuItem
                text="حذف همه"
                intent={Intent.DANGER}
                key={1}
                onClick={() =>
                  this.setState({
                    disableContext: true,
                    isConfirmOpen: true,
                    confirmFunc: () => this.props.onEmptyTrash(),
                    confirmText: `سطل بازیافت خالی خواهد شد آیا مطمئن هستید؟`,
                  })
                }
              />,
              <MenuItem
                text="بازگردانی همه"
                label="Restore All"
                key={2}
                onClick={() =>
                  this.setState({
                    disableContext: true,
                    isConfirmOpen: true,
                    confirmFunc: () => this.props.onRestoreAllFromTrash(),
                    confirmText: `تمامی اطلاعات در سطل بازیافت به حافظه باز خواهد گشت آیا مطمئن هستید؟`,
                  })
                }
              />,
            ]} */}
          </React.Fragment>
        )}
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => {}, // onContextMenuClose
    );
  };

  onRefresh = () => {
    const folderHash = this.props.match.params.folderHash;
    this.props.changeFolder(folderHash);
    this.props.fetchFilter(
      this.whatsEndpoint(this.props.filter.selected, folderHash),
      this.props.filter.selected,
      this.props.public,
      this.props.match.params.folderHash,
    );

    if (
      this.props.filter.selected === 'mybox' &&
      !this.props.public &&
      this.state.showRecents === true
    ) {
      this.getRecentActivities();
    }

    this.props.onUnSelectAll();
  };

  onLoadMore = () => {
    const folderHash = this.props.match.params.folderHash;

    this.props.onLoadMore(
      this.whatsEndpoint(this.props.filter.selected, folderHash),
      this.props.filter.selected,
      this.props.folder,
      this.props.public,
    );
  };

  onChangeName = (data: any) => {
    this.props.onChangeName(
      this.props.hash + (this.body ? JSON.stringify(this.body) : ''),
      { ...data, undo: true },
      this.state.showRecents === true ? this.getRecentActivities : () => {},
    );
  };

  onOpenFolder = (hash: string) => {
    if (this.props.filter.selected !== 'trash')
      this.props.onOpenFolder(this.props.filter.selected, hash, this.props.public);
  };

  getFileDetail = (hash: string) => {
    this.props.fetchFileDetail(hash);
  };

  recentContextMenu = (item: any) => {
    return (e: any) => {
      this.props.onSelectItem(item, this.props.filter.selected, false);
      e.preventDefault();
      if (this.props.isLoading[this.props.filter.selected] || this.state.imageSlider.open) {
        return;
      }
      const itemName = item.type_ === 'folder' ? 'پوشه' : 'فایل';
      const shouldPasteOnSelectedFolder =
        item.type_ === 'folder' && this.props.filter.selected !== 'trash';
      const username = localStorage.getItem('username');
      const fileType = Util.getFileType(item.extension);

      ContextMenu.show(
        <Menu>
          <React.Fragment>
            {fileType === 'IMAGE' && (
              <MenuItem
                icon="media"
                onClick={() => this.handleImageSlider(item)}
                text="پیش‌نمایش"
              />
            )}

            {fileType === 'AUDIO' && (
              <>
                {this.props.playList && (
                  <MenuItem
                    icon="add"
                    onClick={() => this.handlePlayerMusic(item, true)}
                    text="افزودن به لیست پخش"
                  />
                )}
                <MenuItem
                  icon="volume-up"
                  onClick={() => this.handlePlayerMusic(item, false)}
                  text="پخش"
                />
              </>
            )}

            {fileType === 'VIDEO' && (
              <MenuItem icon="play" onClick={() => this.handleVideoPlayer(item)} text="پخش" />
            )}

            {fileType === 'PDF' && (
              <MenuItem
                icon="document-open"
                onClick={() => this.handlePdfReader(item)}
                text="نمایش"
              />
            )}

            {item && !this.props.infoSidebarStatus && (
              <MenuItem icon="info-sign" onClick={this.onInfoSidebar} text={`اطلاعات`} />
            )}

            <MenuItem
              icon="folder-shared-open"
              onClick={() => {
                if (item.uploader && item.uploader.username === username) {
                  const folderHash = item.parentHash;
                  this.props.history.push(`/my-space/folders/${folderHash}`, {
                    recentSelectedFile: item.hash,
                  });
                } else {
                  this.props.onChangeFilter('shared');
                }
              }}
              text="رفتن به پوشه"
            />

            {item && (
              <MenuItem
                icon="cloud-download"
                disabled={item.length > 100}
                onClick={() => this.setState({ downloadDetails: item })}
                text={`دانلود ${itemName}`}
              />
            )}
            {item &&
              !item.isBookmarked &&
              (!item.owner || localStorage.getItem('username') === item.owner?.username) &&
              (this.props.filter.selected === 'favorite' ||
                this.props.filter.selected === 'mybox') && (
                <MenuItem
                  icon="star"
                  onClick={() => this.props.onBookmark([item], this.onRefresh)}
                  text={`نشانه‌گذاری`}
                />
              )}
            {item &&
              item.isBookmarked &&
              (!item.owner || localStorage.getItem('username') === item.owner?.username) &&
              (this.props.filter.selected === 'favorite' ||
                this.props.filter.selected === 'mybox') && (
                <MenuItem
                  icon="star-empty"
                  onClick={() => this.props.onDelBookmark([item], this.onRefresh)}
                  text={`حذف نشانه‌گذاری`}
                />
              )}
            {item && (
              <MenuItem
                icon="edit"
                onClick={() => {
                  const onEnd = () => this.setState({ disableContext: false });
                  this.setState({ disableContext: true }, () => {
                    (this.renameRef as any).current.handleOpen(
                      item.hash,
                      item.name,
                      item.extension,
                      item.type_,
                      onEnd,
                    );
                  });
                }}
                text={`تغییر نام`}
              />
            )}
            <Menu.Divider />
            {!this.props.copy.isEmpty &&
              (this.props.filter.selected === 'mybox' || shouldPasteOnSelectedFolder) &&
              this.props.filter.selected !== 'shared' && (
                <MenuItem
                  icon="document-open"
                  onClick={() =>
                    this.props.onPaste(
                      shouldPasteOnSelectedFolder ? item.hash : this.props.hash,
                      this.props.filter.selected,
                      this.onRefresh,
                    )
                  }
                  text={`کپی ${this.props.copy.items.length} فایل در ${
                    shouldPasteOnSelectedFolder ? item.name : 'اینجا'
                  }`}
                  label={`Paste ` + this.props.copy.items.length.toString()}
                />
              )}
            {item && (
              <MenuItem
                icon="duplicate"
                onClick={() => this.props.onCopy([item], 'copy', this.props.onUnSelectAll)}
                text={`کپی فایل`}
                label="Copy"
              />
            )}
            {item && (
              <MenuItem
                icon="move"
                onClick={() => this.props.onCopy([item], 'cut', this.props.onUnSelectAll)}
                text={`جابجایی فایل`}
                label="Move"
                disabled={!(item.accessLevel && item.accessLevel === 'EDIT')}
              />
            )}
            {item && (
              <MenuItem
                icon="share"
                onClick={() => {
                  this.setState({ disableContext: true, shareItem: item });
                }}
                text={`اشتراک گذاری`}
                label="Share"
              />
            )}
            {/* {item && item.type_ !== 'folder' && (
              <MenuItem
                icon={
                  item.like ? (
                    <svg
                      id="regular"
                      width="17px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#5c7080"
                      style={{ marginLeft: 7 }}
                    >
                      <path d="m24 12c0-1.95-1.598-3.536-3.563-3.536h-4.875v-3.428c0-1.95-1.598-3.536-3.562-3.536h-2.109c-1.502 0-1.518 1.463-1.455 2.8.024.521.052 1.106.015 1.72-1.074 1.888-1.748 3.074-2.167 3.837h-5.534c-.414 0-.75.336-.75.75v11.143c0 .414.336.75.75.75h19.958c.296 0 .564-.174.686-.445 2.832-6.37 2.658-6.281 2.606-10.055zm-18.375 9h-4.125v-9.643h4.124c0 .002.001.005.001.008zm14.596 0h-13.096v-9.528c.154-.3.715-1.347 2.714-4.858.201-.352.114-1.972.095-2.385-.02-.424-.046-.985.004-1.229h2.062c1.138 0 2.062.913 2.062 2.036v4.179c0 .414.336.75.75.75h5.625c1.138 0 2.063.913 2.063 2.043.047 3.486.222 3.358-2.279 8.992z" />
                    </svg>
                  ) : (
                    <svg
                      id="Bold"
                      width="16px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#5c7080"
                      style={{ marginLeft: 7 }}
                    >
                      <path d="m23.934 15.304c.044-.096.066-.199.066-.304v-3c0-1.654-1.346-3-3-3h-6v-4.5c0-1.655-1.346-3-3-3h-2.25c-.414 0-.75.336-.75.75v3.55l-2.901 5.078c-.066.114-.099.241-.099.372v10.5c0 .414.336.75.75.75h12.038c1.185 0 2.262-.701 2.74-1.782z" />
                      <path d="m.75 22.5h3.75v-12h-3.75c-.414 0-.75.336-.75.75v10.5c0 .414.336.75.75.75z" />
                    </svg>
                  )
                }
                onClick={() => {
                  this.props.onLikeAndDislike(item.postId, item.like, item.hash);
                }}
                text={item.like ? 'نپسندیدن' : 'پسندیدن'}
                label={`${item.like ? 'Dislike' : 'Like'}`}
              />
            )} */}
            <Menu.Divider />
            {item && (
              <MenuItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15">
                    <path
                      fill="#5c7080"
                      fillRule="evenodd"
                      d="M1 12c0 .794.357 1 1.143 1h5.714C8.643 13 9 12.794 9 12V3H1v9zm9-11H7V0H3v1H0v1h10V1z"
                    />
                  </svg>
                }
                onClick={() => {
                  console.log(
                    this.state.showRecents === true ? console.log('fuck') : console.log('shit'),
                  );
                  item.parentHash = this.props.hash;
                  this.props.onTrash(
                    [item],
                    this.props.filter.selected,
                    this.props.hash,
                    this.state.showRecents === true ? this.getRecentActivities : () => {},
                  );
                }}
                text="انتقال به سطل بازیافت"
                disabled={!(item.accessLevel && item.accessLevel === 'EDIT')}
              />
            )}
          </React.Fragment>
        </Menu>,
        { left: e.clientX, top: e.clientY },
        () => {}, // onContextMenuClose
      );
    };
  };

  baseContextMenu = (item: any) => {
    return (e: any) => {
      if (
        this.props.isLoading[this.props.filter.selected] ||
        this.state.imageSlider.open ||
        this.state.pdfReader.open
      ) {
        return;
      }
      const target = e.target;
      if (this.props.selectedCount > 1) {
        this.showContextMenu(e);
        return;
      } else if (
        ['TR', 'TD', 'I', 'SPAN', 'SVG', 'PATH'].includes(target.tagName.toUpperCase()) ||
        (target.tagName.toUpperCase() === 'DIV' &&
          (target.className.includes('text') ||
            target.className.includes('tbody') ||
            target.className.includes('grid-view') ||
            target.className.includes('box-container') ||
            target.className.includes('bp3-icon-circle') ||
            target.className.includes('box') ||
            target.className.includes('box-thumb') ||
            target.className.includes('inner') ||
            target.className.includes('inner-icon') ||
            target.className.includes('box-details') ||
            target.className.includes('title') ||
            target.className.includes('seyed') ||
            target.className.includes('last-mod') ||
            target.className.includes('folder-container') ||
            target.className.includes('folder-main') ||
            target.className.includes('folder-hold') ||
            target.className.includes('folder-hold-left') ||
            target.className.includes('icon-folder') ||
            target.className.includes('icons') ||
            target.className.includes('name'))) ||
        (target.tagName.toUpperCase() === 'P' && target.className.includes('name'))
      ) {
        if (item) {
          if (!item.isSelected) this.props.onSelectItem(item, this.props.filter.selected, false);
          // if (this.props.public) {
          //   this.showPublicContextMenu(e, item);
          // } else {
          // }
          // if (!item.isSelected) this.props.onSelectItem(item, this.props.filter.selected, false);
          this.showContextMenu(e);
        }
        return;
      }
      this.props.onSelectItem({}, this.props.filter.selected, false);
      e.preventDefault();
      const pathname = window.location.pathname;

      if (
        pathname !== '/recent' &&
        pathname !== '/shared-with-me' &&
        pathname !== '/bookmark' &&
        pathname !== '/search' &&
        this.props.accessLevel === 'EDIT'
      ) {
        ContextMenu.show(
          <Menu>
            {!this.props.public && (
              <MenuItem
                icon="folder-new"
                onClick={() => (this.newFolderRef as any).current.handleOpen()}
                text="ساخت پوشه"
              />
            )}
            <MenuItem
              icon="refresh"
              onClick={() => this.onRefresh()}
              text="بروزرسانی"
              label={'Refresh'}
            />
            {/* {!this.props.copy.isEmpty && (
              <MenuItem
                icon="document-open"
                onClick={() =>
                  this.props.onPaste(this.props.hash, this.props.filter.selected, this.onRefresh)
                }
                text={`چسباندن ${this.props.copy.items.length} فایل در اینجا`}
                label={`Paste ` + this.props.copy.items.length.toString()}
              />
            )} */}
          </Menu>,
          { left: e.clientX, top: e.clientY },
          () => {}, // onContextMenuClose
        );
      }
      // else if (pathname === '/trash') {
      //   ContextMenu.show(
      //     <Menu>
      //       <React.Fragment>
      //         <Menu.Divider title="سطل بازیافت" />
      //         <MenuItem
      //           text="حذف همه"
      //           intent={Intent.DANGER}
      //           onClick={() =>
      //             this.setState({
      //               disableContext: true,
      //               isConfirmOpen: true,
      //               confirmFunc: () => this.props.onEmptyTrash(),
      //               confirmText: `سطل بازیافت خالی خواهد شد آیا مطمئن هستید؟`,
      //             })
      //           }
      //         />
      //         <MenuItem
      //           text="بازگردانی همه"
      //           label="Restore All"
      //           onClick={() =>
      //             this.setState({
      //               disableContext: true,
      //               isConfirmOpen: true,
      //               confirmFunc: () => this.props.onRestoreAllFromTrash(),
      //               confirmText: `تمامی اطلاعات در سطل بازیافت به حافظه باز خواهد گشت آیا مطمئن هستید؟`,
      //             })
      //           }
      //         />
      //         <Menu.Divider />
      //         <MenuItem
      //           icon="refresh"
      //           onClick={() => this.onRefresh()}
      //           text="بروزرسانی"
      //           label={'Refresh'}
      //         />
      //       </React.Fragment>
      //     </Menu>,
      //     { left: e.clientX, top: e.clientY },
      //     () => {}, // onContextMenuClose
      //   );
      // } else {
      //   ContextMenu.show(
      //     <Menu>
      //       <React.Fragment>
      //         <MenuItem
      //           icon="refresh"
      //           onClick={() => this.onRefresh()}
      //           text="بروزرسانی"
      //           label={'Refresh'}
      //         />
      //       </React.Fragment>
      //     </Menu>,
      //     { left: e.clientX, top: e.clientY },
      //     () => {},
      //   );
      // }
    };
  };

  handleImageSlider = (image: any) => {
    const data = this.props.data[this.props.filter.selected];
    let images: any = [];
    const password = this.props.publicFolderPassword
      ? '&password=' + this.props.publicFolderPassword
      : '';
    Object.keys(data).forEach(key => {
      const item = data[key];
      const fileType = Util.getFileType((item && item.extension) || '');
      if (item.type_ !== 'folder' && fileType === 'IMAGE') {
        images = [...images, data[key]];
      }
    });
    if (!images.find((x: any) => x.hash === image.hash)) {
      images = [...images, image];
    }

    const startIndex = images.findIndex((i: any) => i.hash === image.hash);
    this.setState({ imageSlider: { open: true, images, startIndex, password } });
  };

  handlePlayerMusic = (audio: any, add = false) => {
    // console.log('audio is being played');
    const data = this.props.data[this.props.filter.selected];
    let list: any = [];
    if (
      add &&
      this.props.playList &&
      !this.props.playList.list.find((x: any) => x.hash === audio.hash)
    ) {
      this.props.onAddToPlayList([audio]);
    } else if (!add) {
      Object.keys(data).forEach(key => {
        const item = data[key];
        const fileType = Util.getFileType((item && item.extension) || '');
        if (item.type_ !== 'folder' && fileType === 'AUDIO') {
          list = [...list, data[key]];
        }
      });
      const password = this.props.publicFolderPassword
        ? '&password=' + this.props.publicFolderPassword
        : '';

      if (!list.find((x: any) => x.hash === audio.hash)) {
        list = [...list, audio];
      }
      this.props.onPlayAudioList(list, audio.hash, password);
    }
  };

  handleVideoPlayer = (video: any) => {
    const data = this.props.data[this.props.filter.selected];
    let videoList: any = [];
    Object.keys(data).forEach(key => {
      const item = data[key];
      const fileType = Util.getFileType((item && item.extension) || '');
      if (item.type_ !== 'folder' && fileType === 'VIDEO') {
        videoList = [...videoList, data[key]];
      }
    });
    const password = this.props.publicFolderPassword
      ? '&password=' + this.props.publicFolderPassword
      : '';
    if (!videoList.find((x: any) => x.hash === video.hash)) {
      videoList = [...videoList, video];
    }
    const startIndex = videoList.findIndex((i: any) => i.hash === video.hash);
    this.setState({ VideoPlayer: { open: true, list: videoList, startIndex, password } });
  };

  getItemSource = (fileDetails: any) => {
    let itemSource = `${Manifest.server.api.address}files/${fileDetails.hash}`;
    const token = window.localStorage.getItem('access_token');
    if (token && this.password) {
      itemSource += `?Authorization=${token}&password=${this.password}`;
    } else if (token && !this.password) {
      itemSource += `?Authorization=${token}`;
    } else if (this.password) {
      itemSource += `?password=${this.password}`;
    }
    return itemSource;
  };

  handlePdfReader = (item: any) => {
    const password = this.props.publicFolderPassword
      ? '&password=' + this.props.publicFolderPassword
      : '';
    item['itemSource'] = this.getItemSource(item);
    this.setState({ pdfReader: { data: item, open: true, password } });
  };

  closeImageSlider = () => {
    this.setState({ imageSlider: { startIndex: -1, open: false, images: [], password: null } });
  };

  closeVideoPlayer = () => {
    this.setState({ VideoPlayer: { open: false, list: [], startIndex: -1, password: null } });
  };

  closePdfReader = () => {
    this.setState({ pdfReader: { open: false, data: null } });
  };
  onSaveRecentMode = () => {
    this.state.showRecents !== true
      ? localStorage.setItem('show-recents', 'true')
      : localStorage.setItem('show-recents', 'false');
    this.setState((prevState: any) => ({
      showRecents: !prevState.showRecents,
    }));

    if (
      this.props.filter.selected === 'mybox' &&
      !this.props.public &&
      this.state.showRecents !== true
    ) {
      this.getRecentActivities();
    }
  };

  sharedLinkPassword = (e: any) => {
    this.password = e.target.value;
  };

  renderHandleError = () => {
    const message = this.password
      ? 'رمز عبور وارد شده صحیح نیست.'
      : 'برای دسترسی به اطلاعات فایل رمزعبور را وارد کنید.';

    return (
      <div className="password-form">
        <img width="148" height="198" alt="password-icon" src={passwordSVG} />
        <h1 className={`password-title ${this.password ? 'error' : ''}`}>{message}</h1>
        <FormGroup
          helperText={this.state.emptyPassword && 'لطفا رمز عبور را وارد نمایید'}
          intent={this.state.emptyPassword ? Intent.DANGER : Intent.NONE}
          style={{ flex: 1 }}
        >
          <label className="">رمز عبور</label>
          <InputGroup
            type="password"
            placeholder={'پسورد لینک ...'}
            onChange={this.sharedLinkPassword}
          />
        </FormGroup>

        <div className="button-container">
          <Button
            intent={Intent.PRIMARY}
            onClick={this.checkPassordSharedLink}
            disabled={this.state.showPassword}
            loading={this.state.showPassword}
          >
            تایید
          </Button>
        </div>
      </div>
    );
  };

  renderHandleForbidden = () => {
    const message = 'درخواست دسترسی رد شد.';

    return <div className="forbidden">{message}</div>;
  };

  checkPassordSharedLink = () => {
    if (this.password) {
      this.password = this.password.trim();
      const folderHash = this.props.match.params.folderHash || this.props.publicFolderId;
      this.props.onPublicFolderPasswordSet(this.password, folderHash);
      this.timeout = setTimeout(() => {
        this.props.fetchFilter(
          this.whatsEndpoint(this.props.filter.selected, folderHash),
          this.props.filter.selected,
          this.props.public,
          folderHash,
        );
      }, 10);
    }
  };

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
export default FilesListFunctions;
