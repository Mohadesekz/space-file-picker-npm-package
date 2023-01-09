import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import lodashForeach from 'lodash/forEach';
import { connect } from 'react-redux';
import { fromEvent } from 'file-selector';
import { Icon } from '@blueprintjs/core';
import Dropzone from '../dropzone';
import InfiniteScroll from '../infinite-scroll';
import { spinner as Spinner } from '../../../loading';
import FileItem from './list-view-item';
import FileGridItem from '../grid-view/grid-view-item';
import { Util } from '../../../../helpers';
import Subtitle from './../../../sub-title/index';
// import { likeAndDislikeRecents } from '../../actions';
import { sortFiles } from '../../actions';
import { uploadStart } from '../../../upload/actions';
import List_HOC from '../HOC/List_HOC';
import Manifest from '../../../../manifest';
import { addItemInList } from '../../actions';
import './index.scss';

class ListViewTable extends Component {
  mobileAndTabletCheck = Util.mobileAndTabletCheck();
  cntrlIsPressed = false;
  static propTypes = {
    data: PropTypes.object.isRequired,
    size: PropTypes.number.isRequired,
    hash: PropTypes.string,
    error: PropTypes.bool,
    filter: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    body: PropTypes.object,
    uploadBox: PropTypes.object,
    onSelectItem: PropTypes.func.isRequired,
    baseContextMenu: PropTypes.func.isRequired,
    recentContextMenu: PropTypes.func.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    hasNewData: PropTypes.bool,
    selectedCount: PropTypes.number,
    recents: PropTypes.object,
    breadcrumb: PropTypes.array,
    public: PropTypes.bool,
    showRecents: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      hash: null,
      listViewHeight: 0,
      desc: false,
      sortType: 'name',
      hashList: [],
      isAudioPlaying: false,
    };
    this.isHiding = false;
  }
  componentDidMount() {
    window.addEventListener('keydown', this.handleCtrl);
    window.addEventListener('keyup', this.removeCtrl);
  }
  // componentDidUpdate() {
  //   console.log(this.props.showRecents);
  // }

  handleCtrl = event => {
    this.cntrlIsPressed = event.which === 17 || event.which === 91 || event.which === 16;
  };

  removeCtrl = () => {
    this.cntrlIsPressed = false;
  };

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleCtrl);
    window.removeEventListener('keyup', this.removeCtrl);
    this.clearPendingPromises();
  }

  pendingPromises = [];

  appendPendingPromise = promise => (this.pendingPromises = [...this.pendingPromises, promise]);

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise));

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel());

  componentDidUpdate(nextProps) {
    // let isAudioPlayingBool;
    // if (document.getElementsByClassName('audio-player').length > 0) {
    //   isAudioPlayingBool = true;
    // } else {
    //   isAudioPlayingBool = false;
    // }
    let { data, size, recentSelectedFile } = this.props;

    if (size > 0 && recentSelectedFile) {
      if (!data[recentSelectedFile]) {
        console.error('what the hell');
        this.props.getFileDetail(recentSelectedFile);
      }
    }

    if (nextProps.filter !== this.props.filter) {
      this.setState({
        desc: true,
        sortType: 'name',
      });
    }
  }

  onClickItem = item => {
    if (this.props.selectedCount > 0 && this.mobileAndTabletCheck) {
      this.props.onToggleItem(item);
    } else if (!item.isSelected) {
      return this.props.onSelectItem(item, this.props.filter, this.cntrlIsPressed);
    } else {
      return this.props.onUnSelectItem(item);
    }
  };

  sortFiles(sortType) {
    if (!this.props.isLoading[this.props.filter]) {
      const { desc } = this.state;
      const { hash } = this.props;
      let endpoint = '';
      switch (true) {
        case this.props.filter === 'search':
          endpoint = `search?size=` + Manifest.pageSize;
          break;
        case this.props.filter === 'shared':
          endpoint = `shares?size=` + Manifest.pageSize;
          break;
        case this.props.filter === 'favorite':
          endpoint = `bookmarks?size=` + Manifest.pageSize;
          break;
        case this.props.filter === 'trash':
          endpoint = `getTrashed?size=` + Manifest.pageSize;
          break;
        case this.props.filter === 'mybox' && window.location.pathname === '/my-space':
          endpoint = `/folders/ROOT/children?size=${Manifest.pageSize}&breadcrumb=true`;
          break;
        default:
          endpoint = hash
            ? `/folders/${hash}/children?size=${Manifest.pageSize}&breadcrumb=true`
            : `/folders/ROOT/children?size=${Manifest.pageSize}`;
      }
      this.props.sortFiles(endpoint, sortType, this.props.filter, !desc);
      this.setState({
        desc: !desc,
        sortType,
      });
    }
  }

  runItem = item => {
    if (this.mobileAndTabletCheck && this.props.selectedCount > 0) {
      this.props.onToggleItem(item);
    } else {
      if (Object.is(item.type_, 'folder') && this.props.filter !== 'trash') {
        const publicAddress = this.props.public ? '/public' : Util.getFilterByPath().path;
        this.props.navigation.push(`${publicAddress}/folders/${item.hash}`);
      } else {
        const fileType = Util.getFileType((item && item.extension) || '');
        this.handleFileType(fileType, item);
      }
    }
  };

  handleFileType = (fileType, item) => {
    if (fileType === 'PDF') {
      this.props.onPdfReader(item);
    } else if (fileType === 'IMAGE') {
      this.props.onImageItem(item);
    } else if (fileType === 'AUDIO') {
      this.props.onAudioItem(item);
    } else if (fileType === 'VIDEO') {
      this.props.onVideoItem(item);
    }
  };

  renderFileItem = () => {
    let { data, recentSelectedFile, filter } = this.props;
    const shouldThereBeDropZoneItem = !this.props.public && !this.props.loading && this.props.hash;
    let renderedItems = [];

    const recentsKeys = Object.keys(data);
    const keys = Object.keys(data).sort((a, b) => {
      if (data[a]['type_'] === 'folder' && data[b]['type_'] === 'file') {
        return -1;
      }
      if (data[a]['type_'] === 'file' && data[b]['type_'] === 'folder') {
        return 1;
      }
    });
    const isSelected = !!keys.find(key => data[key].isSelected);
    (filter === 'lastmod' ? recentsKeys : keys).forEach(key => {
      const item = data[key];
      // console.log(item);
      renderedItems = [
        ...renderedItems,
        <FileItem
          key={item.hash + item.created}
          detail={item}
          // onClick={() => (this.mobileAndTabletCheck ? this.runItem(item) : this.onClickItem(item))}
          // onDoubleClick={() => (this.mobileAndTabletCheck ? null : this.runItem(item))}

          onClick={() => {
            // create the cancelable promise and add it to the pending promises queue
            const waitForClick = Util.cancelablePromise(Util.delay(300));
            this.appendPendingPromise(waitForClick);
            return waitForClick.promise
              .then(() => {
                // if the promise wasn't cancelled, we execute the callback and remove it from the queue
                this.removePendingPromise(waitForClick);
                this.mobileAndTabletCheck ? this.runItem(item) : this.onClickItem(item);
              })
              .catch(errorInfo => {
                // rethrow the error if the promise wasn't rejected because of a cancelation
                this.removePendingPromise(waitForClick);
                if (!errorInfo.isCanceled) {
                  throw errorInfo.error;
                }
              });
          }}
          onDoubleClick={() => {
            this.clearPendingPromises();
            this.props.onSelectItem(item, this.props.filter, this.cntrlIsPressed);
            !this.mobileAndTabletCheck && this.runItem(item);
          }}
          onContextMenu={this.props.baseContextMenu(item)}
          onSelect={() => this.props.onToggleItem(item)}
          hasSelect={isSelected}
          onDrop={
            shouldThereBeDropZoneItem && item.accessLevel === 'EDIT'
              ? (filesAccepted, _, e) => this.props.fileOrFolderDrop(filesAccepted, _, e, item)
              : null
          }
          onDragEnter={
            shouldThereBeDropZoneItem && item.accessLevel === 'EDIT'
              ? this.props.folderDragEnter
              : null
          }
          onDragLeave={this.props.folderDragLeave}
          isPublic={this.props.public}
          recentSelectedFile={recentSelectedFile === item.hash ? true : false}
          filter={filter}
          accessLevel={item.accessLevel}
        />,
      ];
    });

    return renderedItems;
  };

  selectAllFiles = () => {
    if (this.isSelectedAll()) {
      this.props.onUnSelectAll();
    } else {
      this.props.onSelectAllItems();
    }
  };
  isSelectedAll = () => {
    //if there is no item that not selected yet so all items are selected
    //return true if all selected and false if not
    return (
      Object.keys(this.props.data).length > 0 &&
      !!!Object.keys(this.props.data).find(key => !this.props.data[key].isSelected)
    );
  };

  renderRecentsFileItem = () => {
    const shouldThereBeDropZoneItem =
      !this.props.public &&
      !this.props.loading &&
      this.props.hash &&
      this.props.filter !== 'trash' &&
      this.props.filter !== 'shared';
    const { recents, filter } = this.props;
    let renderItems = [];

    lodashForeach(recents, recent => {
      const item = recent.entity;
      item.created_ = Util.fileDateFa(item.created);
      item.updated_ = Util.fileDateFa(item.updated);
      item.size_ = recent.reference === 'FILE' ? Util.bytesToSize(item.size) : undefined;
      item.type_ = recent.reference === 'FILE' ? 'file' : 'folder';
      renderItems.push(
        <FileGridItem
          key={item.hash + item.created}
          detail={item}
          onClick={() => this.onClickItem(item)}
          // likeAndDislike={() => this.props.likeAndDislikeRecents(item.postId, item.like, item.hash)}
          onDoubleClick={() => {
            if (Object.is(item.type_, 'folder')) {
              this.props.navigation.push(`my-space/folders/${item.hash}`);
            } else {
              const fileType = Util.getFileType((item && item.extension) || '');
              this.handleFileType(fileType, item);
            }
          }}
          onContextMenu={this.props.recentContextMenu(item)}
          onSelect={() => this.props.onToggleItem(item)}
          hasSelect={this.props.selected}
          dontShowSelect={true}
          onDrop={(filesAccepted, _, e) => this.props.fileOrFolderDrop(filesAccepted, _, e, item)}
          onDragEnter={shouldThereBeDropZoneItem ? this.props.folderDragEnter : null}
          onDragLeave={this.props.folderDragLeave}
          kindOfChangeRecent={recent.kind}
          filter={filter}
        />,
      );
    });

    return renderItems;
  };

  onSmallDeviceAction = action => {
    let selectedItems = [];
    Object.keys(this.props.data).forEach(key => {
      if (this.props.data[key].isSelected) {
        selectedItems = [...selectedItems, this.props.data[key]];
      }
    });

    if (selectedItems.length === 0) {
      return;
    }

    switch (true) {
      case action === 'copy' || action === 'cut':
        this.props.onCopy(selectedItems, action, this.props.onUnSelectAll());
        break;
      case action === 'trash':
        this.props.onCopy(selectedItems, 'copy', this.props.onUnSelectAll());
        break;
      case action === 'move':
        break;
      default:
    }
  };

  render() {
    const { data, size, loading, recents, filter, body, accessLevel } = this.props;
    const { desc, sortType } = this.state;
    const shouldThereBeDropZone =
      !this.props.public &&
      !loading &&
      this.props.hash &&
      accessLevel === 'EDIT' &&
      window.location.pathname !== '/bookmark' &&
      window.location.pathname !== '/shared-with-me' &&
      window.location.pathname !== '/recent';
    return (
      <Fragment>
        <div className="small-devices">
          <label className="select-all">
            {this.props.selectedCount ? (
              <h1>{this.props.selectedCount} آیتم انتخاب شد</h1>
            ) : (
              <h1>انتخاب همه موارد</h1>
            )}
            <input type="checkbox" onChange={this.selectAllFiles} checked={this.isSelectedAll()} />
          </label>
          {/* <div className="actions">
            <div className="small-device-menu" onClick={this.props.baseContextMenu(null)}></div>
            <Icon className="active action" icon="plus" iconSize={20} />
          </div> */}
        </div>
        <Dropzone
          onDrop={shouldThereBeDropZone ? this.props.onDrop : null}
          getDataTransferItems={evt => fromEvent(evt)}
          disabled={!shouldThereBeDropZone}
          activeClassName={shouldThereBeDropZone ? 'dropzone-active' : ''}
          rejectClassName={shouldThereBeDropZone ? 'dropzone-reject' : ''}
          className="dropzone-files"
          disableClick
        >
          {(!loading || body) && data && size > 0 ? (
            <div className="list-view" ref={e => (this.listViewRef = e)}>
              <InfiniteScroll
                pullDownToRefresh={true}
                pullDownToRefreshContent={
                  <div className="bp3-non-ideal-state">
                    <div className="bp3-non-ideal-state-visual">
                      <span className="bp3-icon bp3-icon-circle-arrow-down"></span>
                    </div>
                    <h4 className="bp3-heading">جهت بارگذاری مجدد اطلاعات بکشید</h4>
                  </div>
                }
                releaseToRefreshContent={
                  <div className="bp3-non-ideal-state">
                    <div className="bp3-non-ideal-state-visual">
                      <span className="bp3-icon bp3-icon-circle-arrow-down to-up"></span>
                    </div>
                    <h4 className="bp3-heading">جهت بارگذاری مجدد اطلاعات رها کنید</h4>
                  </div>
                }
                dataLength={size}
                next={this.props.onLoadMore}
                hasMore={this.props.hasNewData}
                loader={
                  loading && (
                    <div className="bp3-non-ideal-state">
                      <Spinner />
                    </div>
                  )
                }
                endMessage={''}
                refreshFunction={this.props.onRefresh}
                height={this.state.listViewHeight}
              >
                {(!loading || body) &&
                !this.mobileAndTabletCheck &&
                // filter === 'mybox' &&
                window.location.pathname === '/my-space' &&
                // Object.keys(recents || {}).length > 0 &&
                this.props.breadcrumb.length === 0
                  ? [
                      <Subtitle title="دسترسی‌های اخیر" key={0} />,
                      <div key={1}>
                        <Icon
                          icon={!this.props.showRecents ? 'chevron-down' : 'chevron-up'}
                          iconSize={14}
                          onClick={this.props.onSaveRecentMode}
                          className="recents-btn"
                        />

                        {// this.props.showRecents &&
                        Object.keys(recents || {}).length > 0 ? (
                          <div
                            className="recents grid"
                            key={1}
                            style={{
                              opacity: !this.props.showRecents ? '0' : '1',
                              transition: 'all .5s',
                              visibility: !this.props.showRecents ? 'hidden' : 'visible',
                              height: !this.props.showRecents ? '0px' : '230px',
                            }}
                          >
                            {this.renderRecentsFileItem()}
                          </div>
                        ) : (
                          <div
                            className="recents grid"
                            key={1}
                            style={{
                              opacity: !this.props.showRecents ? '0' : '1',
                              transition: 'all .5s',
                              visibility: !this.props.showRecents ? 'hidden' : 'visible',
                              height: !this.props.showRecents ? '0px' : '230px',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <div className="bp3-non-ideal-state">
                              <Spinner />
                            </div>
                          </div>
                        )}
                      </div>,
                    ]
                  : null}
                <div
                  className={`file-list-container ${
                    !this.mobileAndTabletCheck &&
                    Object.keys(recents || {}).length > 0 &&
                    filter === 'mybox' &&
                    this.props.breadcrumb.length === 0
                      ? 'recents-is-on'
                      : ''
                  }`}
                >
                  <table>
                    <thead className={this.props.loading ? 'loading' : ''}>
                      <tr className="header">
                        <th className={'check-box-header'}>
                          <label className="select-all">
                            <input
                              type="checkbox"
                              onChange={this.selectAllFiles}
                              checked={this.isSelectedAll()}
                            />
                          </label>
                        </th>

                        {filter !== 'lastmod' ? (
                          <th onClick={() => this.sortFiles('name')}>
                            <div className="sorting-btn">
                              {sortType === 'name' ? (
                                desc ? (
                                  <Icon icon="chevron-down" iconSize={14} />
                                ) : (
                                  <Icon icon="chevron-up" iconSize={14} />
                                )
                              ) : null}
                              لیست تمامی فایل ها
                            </div>
                          </th>
                        ) : (
                          <th style={{ cursor: 'auto' }}>لیست تمامی فایل ها</th>
                        )}

                        {filter !== 'lastmod' ? (
                          <th
                            onClick={() =>
                              this.sortFiles(
                                filter === 'mybox' || filter === 'search' ? 'updated' : 'created',
                              )
                            }
                          >
                            <div className="sorting-btn">
                              {sortType === 'created' || sortType === 'updated' ? (
                                desc ? (
                                  <Icon icon="chevron-down" iconSize={14} />
                                ) : (
                                  <Icon icon="chevron-up" iconSize={14} />
                                )
                              ) : null}
                              تاریخ
                            </div>
                          </th>
                        ) : (
                          <th style={{ cursor: 'auto' }}>تاریخ</th>
                        )}

                        {filter !== 'lastmod' && filter !== 'favorite' ? (
                          <th onClick={() => this.sortFiles('size')}>
                            <div className="sorting-btn">
                              {sortType === 'size' && filter !== 'lastmod' ? (
                                desc ? (
                                  <Icon icon="chevron-down" iconSize={14} />
                                ) : (
                                  <Icon icon="chevron-up" iconSize={14} />
                                )
                              ) : null}
                              حجم
                            </div>
                          </th>
                        ) : (
                          <th style={{ cursor: 'auto' }}>حجم</th>
                        )}

                        <th className={'check-box-header'}>
                          <label className="select-all">
                            <input
                              type="checkbox"
                              onChange={this.selectAllFiles}
                              checked={this.isSelectedAll()}
                            />
                          </label>
                        </th>
                      </tr>
                    </thead>
                    <tbody>{this.renderFileItem()}</tbody>
                  </table>
                </div>
              </InfiniteScroll>
            </div>
          ) : (
            loading && (
              <div className="bp3-non-ideal-state">
                <Spinner />
              </div>
            )
          )}

          {!loading && size === 0 && !this.props.error && (
            <div className="bp3-non-ideal-state">
              <div className="bp3-non-ideal-state-visual">
                <span
                  className={`bp3-icon bp3-icon-${
                    this.props.filter === 'search' ? 'zoom-out' : 'folder-open'
                  }`}
                ></span>
              </div>
              <h4 className="bp3-heading">
                {this.props.filter === 'search' ? 'جستجو بدون نتیجه بود !' : 'این پوشه خالیست !'}
              </h4>
            </div>
          )}

          {!loading && size === 0 && this.props.error && (
            <div className="bp3-non-ideal-state">
              <div className="bp3-non-ideal-state-visual">
                <span className="bp3-icon bp3-icon-cross"></span>
              </div>
              <h4 className="bp3-heading">
                {this.props.public
                  ? 'پوشه پیدا نشد یا شما به پوشه مورد نظر دسترسی ندارید'
                  : 'خطا در دریافت اطلاعات !'}
              </h4>
            </div>
          )}
        </Dropzone>
      </Fragment>
    );
  }
}

ListViewTable.defaultProps = {
  hasNewData: true,
};

const mapDispatchToProps = dispatch => ({
  // likeAndDislikeRecents: (postId, like, hash) =>
  // dispatch(likeAndDislikeRecents(postId, like, hash)),
  sortFiles: (endpoint, sortType, filter, desc) =>
    dispatch(sortFiles(endpoint, sortType, filter, desc)),
  onUploadStart: () => dispatch(uploadStart()),
  onAddItemInList: (filter, fileItem) => dispatch(addItemInList(filter, fileItem)),
});

const mapStateToProps = state => ({
  recentSelectedFile: state.files.list.recentSelectedFile,
  userSpace: state.sidebar.space,
  upload: state.upload,
  copy: state.files.copy,
  isLoading: state.files.list.isLoading,
  accessLevel: state.files.list.accessLevel,
});

export default connect(mapStateToProps, mapDispatchToProps, null)(List_HOC(ListViewTable));
