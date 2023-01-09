import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { fromEvent } from 'file-selector';
import Dropzone from '../dropzone';
import InfiniteScroll from '../infinite-scroll';
import { spinner as Spinner } from '../../../loading';
import { connect } from 'react-redux';
import FileItem from './grid-view-item';
import Subtitle from '../../../sub-title';
// import { likeAndDislikeRecents, likeAndDislike } from '../../actions';
import lodashForeach from 'lodash/forEach';
import lodashFilter from 'lodash/filter';
import lodashSize from 'lodash/size';
import List_HOC from '../HOC/List_HOC';
import { uploadStart } from '../../../upload/actions';
import { Icon } from '@blueprintjs/core';
import { Util } from '../../../../helpers';
import { addItemInList } from '../../actions';
import './index.scss';

class GridView extends Component {
  mobileAndTabletCheck = Util.mobileAndTabletCheck();
  static propTypes = {
    data: PropTypes.object.isRequired,
    size: PropTypes.number.isRequired,
    hash: PropTypes.string,
    error: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    uploadBox: PropTypes.object,
    filter: PropTypes.string.isRequired,
    onSelectItem: PropTypes.func.isRequired,
    baseContextMenu: PropTypes.func.isRequired,
    recentContextMenu: PropTypes.func.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    hasNewData: PropTypes.bool,
    selectedCount: PropTypes.number,
    recents: PropTypes.object,
    breadcrumb: PropTypes.array,
    body: PropTypes.object,
    showRecents: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.gridViewRef = null;
    this.state = {
      files: [],
      hash: null,
      gridViewHeight: 0,
    };
  }

  loadMore = () => {
    const { size } = this.props;
    this.props.onLoadMore(size);
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleCtrl);
    window.addEventListener('keyup', this.removeCtrl);
  }

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

  componentDidUpdate() {
    let { data, size, recentSelectedFile } = this.props;

    if (size > 0 && recentSelectedFile) {
      if (!data[recentSelectedFile]) {
        console.error('what the hell');
        this.props.getFileDetail(recentSelectedFile);
      }
    }
  }

  handleResize = () => {
    if (this.resizeTimeOut) {
      clearTimeout(this.resizeTimeOut);
      this.resizeTimeOut = null;
    }

    this.resizeTimeOut = setTimeout(() => {
      if (this.gridViewRef) {
        const gridViewHeight =
          window.innerHeight - (this.gridViewRef.getBoundingClientRect().top + 20) || 0;
        this.setState({ gridViewHeight: gridViewHeight || 0 });
      }
    }, 300);
  };

  onClickItem = item => {
    if (this.props.selectedCount > 0 && this.mobileAndTabletCheck) {
      this.props.onToggleItem(item);
    } else if (!item.isSelected) {
      return this.props.onSelectItem(item, this.props.filter, this.cntrlIsPressed);
    } else {
      return this.props.onUnSelectItem(item);
    }
  };

  renderRecentsFileItem = () => {
    const { recents, filter } = this.props;
    const shouldThereBeDropZoneItem =
      !this.props.public &&
      !this.props.loading &&
      this.props.hash &&
      filter !== 'trash' &&
      filter !== 'shared';
    let renderItems = [];

    lodashForeach(recents, recent => {
      const item = { ...recent.entity };
      item.created_ = Util.fileDateTimeFa(item.created);
      item.updated_ = Util.fileDateTimeFa(item.updated);
      item.size_ = item.size ? Util.bytesToSize(item.size) : '_';
      item.type_ = recent.reference.toLowerCase();
      const isSelected = !!Object.keys(this.props.data).find(
        key => this.props.data[key].isSelected,
      );
      renderItems.push(
        <FileItem
          key={item.hash + item.created}
          detail={item}
          onClick={() => (this.mobileAndTabletCheck ? this.runItem(item) : this.onClickItem(item))}
          onDoubleClick={() => {
            if (Object.is(item.type_, 'folder')) {
              const filterPath = Util.getFilterByPath();
              this.props.navigation.push(`${filterPath.path}/folders/${item.hash}`);
            } else {
              const fileType = Util.getFileType((item && item.extension) || '');
              this.handleFileType(fileType, item);
            }
          }}
          onContextMenu={this.props.recentContextMenu(item)}
          onSelect={() => this.props.onToggleItem(item)}
          hasSelect={isSelected}
          dontShowSelect={true}
          onDrop={
            shouldThereBeDropZoneItem
              ? (filesAccepted, _, e) => this.props.fileOrFolderDrop(filesAccepted, _, e, item)
              : null
          }
          // likeAndDislike={() => {
          //   this.props.likeAndDislike(item.postId, item.like, item.hash);
          // }}
          onDragEnter={shouldThereBeDropZoneItem ? this.props.folderDragEnter : null}
          onDragLeave={this.props.folderDragLeave}
          isPublic={this.props.public}
          kindOfChangeRecent={recent.kind}
          filter={filter}
        />,
      );
    });

    return renderItems;
  };

  runItem = item => {
    if (this.mobileAndTabletCheck && this.props.selectedCount > 0) {
      this.props.onToggleItem(item);
    } else {
      if (Object.is(item.type_, 'folder') && this.props.filter !== 'trash') {
        const filter = Util.getFilterByPath();
        const publicAddress = this.props.public ? '/public' : filter.path;
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

  renderFileItem = files => {
    const { filter } = this.props;
    const shouldThereBeDropZoneItem =
      !this.props.public &&
      !this.props.loading &&
      this.props.hash &&
      filter !== 'trash' &&
      filter !== 'shared';
    let renderItems = [];
    lodashForeach(files, item => {
      renderItems.push(
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
          hasSelect={this.props.selected}
          // likeAndDislike={() => {
          //   this.props.likeAndDislike(item.postId, item.like, item.hash);
          // }}
          onDrop={
            shouldThereBeDropZoneItem
              ? (filesAccepted, _, e) => this.props.fileOrFolderDrop(filesAccepted, _, e, item)
              : null
          }
          onDragEnter={shouldThereBeDropZoneItem ? this.props.folderDragEnter : null}
          onDragLeave={this.props.folderDragLeave}
          isPublic={this.props.public}
          filter={filter}
        />,
      );
    });

    return renderItems;
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

  render() {
    let { data, filter, size, recents, body, loading, accessLevel } = this.props;
    const shouldThereBeDropZone =
      !this.props.public &&
      !loading &&
      this.props.hash &&
      accessLevel === 'EDIT' &&
      window.location.pathname !== '/bookmark' &&
      window.location.pathname !== '/shared-with-me' &&
      window.location.pathname !== '/recent';

    const folders = lodashFilter(data, item => item.type_ === 'folder');
    const folderSize = lodashSize(folders);
    const filesData = lodashFilter(data, item => item.type_ === 'file');
    const fileSize = lodashSize(filesData);

    return (
      <Fragment>
        <div className="small-devices">
          <label className="select-all">
            <input type="checkbox" onChange={this.selectAllFiles} checked={this.isSelectedAll()} />
            {this.props.selectedCount ? (
              <h1>{this.props.selectedCount} آیتم انتخاب شد</h1>
            ) : (
              <h1>انتخاب همه موارد</h1>
            )}
          </label>
          {/* <div className="actions">
            <div className="small-device-menu" onClick={this.props.baseContextMenu(null)}></div>
            <Icon className="active action" icon="plus" iconSize={20} />
          </div> */}
        </div>
        <Dropzone
          onDrop={shouldThereBeDropZone ? this.props.onDrop : null}
          disabled={!shouldThereBeDropZone}
          getDataTransferItems={evt => fromEvent(evt)}
          activeClassName={shouldThereBeDropZone ? 'dropzone-active' : ''}
          rejectClassName={shouldThereBeDropZone ? 'dropzone-reject' : ''}
          className="dropzone-grid"
          disableClick
        >
          {(!loading || body) && data && size > 0 ? (
            <div className="grid-view" ref={e => (this.gridViewRef = e)}>
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
                next={this.loadMore}
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
                height={this.state.gridViewHeight}
              >
                {window.location.pathname === '/my-space' &&
                !this.mobileAndTabletCheck &&
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

                {window.location.pathname !== '/my-space' ||
                (window.location.pathname === '/my-space' && (fileSize || folderSize)) ? (
                  <Subtitle title="فایل ها" />
                ) : null}

                {fileSize || folderSize ? (
                  <div className="files grid">{this.renderFileItem(data)} </div>
                ) : null}
              </InfiniteScroll>
            </div>
          ) : null}

          {(loading || this.props.public || this.props.filter === 'search' || size === 0) && (
            <div className="grid-extra">
              {!loading && size === 0 && !this.props.error && (
                <div className="bp3-non-ideal-state">
                  <div className="bp3-non-ideal-state-visual">
                    <span
                      className={`bp3-icon bp3-icon-${
                        filter === 'search' ? 'zoom-out' : 'folder-open'
                      }`}
                    ></span>
                  </div>
                  <h4 className="bp3-heading">
                    {filter === 'search' ? 'جستجو بدون نتیجه بود !' : 'این پوشه خالیست !'}
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
              {loading && (
                <div className="bp3-non-ideal-state">
                  <Spinner />
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </Fragment>
    );
  }
}

GridView.defaultProps = {
  hasNewData: true,
};

const mapDispatchToProps = dispatch => ({
  // likeAndDislike: (postId, like, hash) => dispatch(likeAndDislike(postId, like, hash)),
  onUploadStart: () => dispatch(uploadStart()),
  // likeAndDislikeRecents: (postId, like, hash) =>
  // dispatch(likeAndDislikeRecents(postId, like, hash)),
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
export default connect(mapStateToProps, mapDispatchToProps, null)(List_HOC(GridView));
