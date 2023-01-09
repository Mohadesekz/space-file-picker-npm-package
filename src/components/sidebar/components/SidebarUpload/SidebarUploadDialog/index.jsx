import React, { useRef } from 'react';
import { Popover, Position, Classes } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import './index.scss';
import { useSelector, useDispatch } from 'react-redux';
import {
  changeFolder,
  unSelectAll,
  fetchFilesRequest,
  recentRequest,
  folderRequest,
} from 'components/files-list/actions';
import { changeFilter } from 'components/sidebar/actions';
import { Util } from 'helpers';
import CreateFolder from 'components/files-list/components/newFolder';
import Manifest from '../../../../../manifest';
const SidebarUploadDialog = props => {
  const { buttonClassName, onUploadFileButton, onUploadFolderButton, match } = props;
  // const menuRef = useRef();
  const dispatch = useDispatch();
  const result = useSelector(state => state.files.list);
  const filter = useSelector(state => state.sidebar.filter);
  const isPublic = false;
  // const itemInfo = useSelector(state => state.files.selected);

  const mobileAndTabletCheck = Util.mobileAndTabletCheck();

  const newFolderRef = useRef();

  const onUnSelectAll = () => {
    dispatch(unSelectAll());
  };
  const changeFolderAction = (folder, item = undefined) => {
    dispatch(unSelectAll());
    dispatch(changeFolder(folder, item));
  };
  const onChangeFilter = (id, body) => {
    dispatch(unSelectAll());
    dispatch(changeFilter(id, body));
  };

  const fetchFilter = (endpoint, filter, isPublic, folderHash) => {
    dispatch(fetchFilesRequest({ endpoint, filter, isPublic, folderHash }));
  };

  const onGetRecents = () => {
    dispatch(recentRequest());
  };

  const onCreateFolder = (parentHash, onEnd) => {
    return name => {
      dispatch(folderRequest({ name, parentHash }, onEnd));
    };
  };

  const changeRoute = path => {
    switch (path) {
      case 'search':
        onChangeFilter('search');
        break;
      case 'recent':
        onChangeFilter('lastmod');
        break;
      case 'shared-with-me':
        onChangeFilter('shared');
        break;
      case 'bookmark':
        onChangeFilter('favorite');
        break;
      case 'trash':
        onChangeFilter('trash');
        break;
      default:
        onChangeFilter('mybox');
    }
  };

  const whatsEndpoint = (filter, hasFolderHash) => {
    const pathName = (window.location.pathname || '').replace('/', '');
    switch (true) {
      case (filter === 'mybox' && pathName === 'my-space') || !!hasFolderHash:
        return `/folders/${hasFolderHash ? hasFolderHash : 'ROOT'}/children?size=${
          Manifest.pageSize
        }${isPublic || !hasFolderHash ? '' : '&breadcrumb=true'}`;
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
        changeRoute(pathName);
    }
  };

  const getRecentActivities = () => {
    if (!mobileAndTabletCheck) {
      onGetRecents();
    }
  };

  const onRefresh = () => {
    const folderHash = match.params.folderHash;
    // changeFolderAction(folderHash);
    fetchFilter(
      whatsEndpoint(filter.selected, folderHash),
      filter.selected,
      isPublic,
      match.params.folderHash,
    );
    // if (filter.selected === 'mybox' && !isPublic) {
    //   getRecentActivities();
    // }
    // onUnSelectAll();
  };

  const newItemMenu = (
    <ul className="bp3-menu bp3-elevation-1 users-info">
      <li>
        <button
          type="button"
          className={`${Classes.POPOVER_DISMISS} bp3-menu-item`}
          onClick={() => onUploadFileButton()}
        >
          {/* <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
              <path
                fill="#90a4ae"
                fillRule="evenodd"
                d="M7 0C3.15 0 0 3.15 0 7s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7zm1 11H6V6h2v5zm0-6H6V3h2v2z"
              />
            </svg>
          </span> */}
          <Icon icon="cloud-upload" className="icon" />
          بارگذاری فایل
        </button>
      </li>
      <li>
        <button
          type="button"
          className={`${Classes.POPOVER_DISMISS} bp3-menu-item`}
          onClick={() => onUploadFolderButton()}
        >
          <Icon icon="cloud-upload" className="icon" />
          بارگذاری فولدر
        </button>
      </li>
      <li>
        <button
          type="button"
          className={`${Classes.POPOVER_DISMISS} bp3-menu-item`}
          onClick={() => newFolderRef.current.handleOpen()}
        >
          {/* <span className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="prefix__logout"
              width="15.605"
              height="15.605"
              viewBox="0 0 15.605 15.605"
            >
              <path
                fill="#90a4ae"
                id="prefix__Path_1348"
                d="M9.753 8.457a.65.65 0 0 0-.65.65v2.6a.651.651 0 0 1-.65.65H6.5V2.6a1.311 1.311 0 0 0-.886-1.236l-.19-.064h3.029a.651.651 0 0 1 .65.65v1.955a.65.65 0 1 0 1.3 0V1.954A1.953 1.953 0 0 0 8.453 0h-6.99a.511.511 0 0 0-.07.014C1.362.015 1.332 0 1.3 0A1.3 1.3 0 0 0 0 1.3V13a1.311 1.311 0 0 0 .886 1.236l3.913 1.3a1.346 1.346 0 0 0 .4.06 1.3 1.3 0 0 0 1.3-1.3v-.65h1.954a1.953 1.953 0 0 0 1.947-1.938v-2.6a.65.65 0 0 0-.65-.65zm0 0"
                className="prefix__cls-1"
                data-name="Path 1348"
                transform="translate(0 -.004)"
              />
              <path
                fill="#90a4ae"
                id="prefix__Path_1349"
                d="M284.294 109.457l-2.6-2.6a.65.65 0 0 0-1.11.46v1.951h-2.6a.65.65 0 1 0 0 1.3h2.6v1.951a.65.65 0 0 0 1.11.46l2.6-2.6a.65.65 0 0 0 0-.922zm0 0"
                className="prefix__cls-1"
                data-name="Path 1349"
                transform="translate(-268.879 -103.415)"
              />
            </svg>
          </span> */}
          <Icon icon="folder-new" className="icon" />
          ساخت پوشه
        </button>
      </li>
      {/* <li className="bp3-menu-divider"></li> */}
    </ul>
  );

  return (
    <div className="user-dropdown">
      <Popover
        content={newItemMenu}
        position={Position.BOTTOM}
        portalClassName="newItem-popover"
        disabled={buttonClassName === 'disable' ? true : false}
      >
        <div className="upload-button">
          <input
            // ref={e => (this.fileInputRef = e)}
            // onChange={this.onChangeFileInput}
            type="file"
            multiple
            hidden
          />

          <button className={buttonClassName}>
            <div className="pull-left">
              {/* <i className="icon-upload"></i> */}
              <Icon className="active action plus" icon="plus" iconSize={20} />
            </div>
            <p className="pull-right">جدید</p>
          </button>
        </div>
      </Popover>
      <CreateFolder onCreate={onCreateFolder(result.hash, onRefresh)} ref={newFolderRef} />
    </div>
  );
};

export default SidebarUploadDialog;
// export default connect(mapStateToProps, mapDispatchToProps, null)(SidebarUploadDialog);
