import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import downloadSvg from '../../../assets/icons/download.svg';
import printSvg from '../../../assets/icons/print.svg';
import moreSvg from '../../../assets/icons/more.svg';
import { Icon } from '@blueprintjs/core';
import Share from '../../files-list/components/share';
import { sharePasswordRequest, shortLink } from '../../files-list/actions';
import { shareRequest } from '../../files-list/actions';
import { shareRemoveRequest } from '../../information/actions';
import './Scss/HeaderFilePreview.scss';
import Manifest from '../../../manifest';

const mapDispatchToProps = dispatch => ({
  onShortlink(link, hash, onEnd) {
    dispatch(shortLink(link, hash, onEnd));
  },
  onChangePassword(password, hash, orginalType, onEnd) {
    dispatch(sharePasswordRequest(password, hash, orginalType, onEnd));
  },
  onShare(data, onEnd) {
    dispatch(shareRequest(data, onEnd));
  },
  OnRemoveShare(shareHash, fileHash, shareType, selfShare) {
    dispatch(shareRemoveRequest(shareHash, fileHash, shareType, selfShare));
  },
});
const mapStateToProps = state => ({
  ...state.files.list,
  shares: state.files.shares,
});
let timeoutVar;

const HeaderFilePreview = props => {
  const [openShareDialog, setShareDialog] = useState(false);

  const printPage = () => {
    if (timeoutVar) clearTimeout(timeoutVar);
    timeoutVar = setTimeout(() => window.print(), 500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutVar);
    };
  }, []);
  const getSource = () => {
    const token = window.localStorage.getItem('access_token');
    const { password } = props;
    let source = `${Manifest.server.api.address}files/${props.fileDetails.hash}`;
    if (token && password) {
      source += `?authorization=${token}&password=${props.password}`;
    } else if (token && !password) {
      source += `?authorization=${token}`;
    } else if (!token && password) {
      source += `?password=${props.password}`;
    }
    return source;
  };

  return (
    <div className="header-preview">
      <div className="header-section actions">
        {/* {!props.isPublic && props.fileDetails && props.fileDetails.postId ? (
          <span className="icon-btn" onClick={() => props.likeAndDislike()}>
            {props.like ? (
              <Icon
                icon={
                  <svg
                    id="Bold"
                    width="14px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#78909c"
                  >
                    <path d="m23.934 15.304c.044-.096.066-.199.066-.304v-3c0-1.654-1.346-3-3-3h-6v-4.5c0-1.655-1.346-3-3-3h-2.25c-.414 0-.75.336-.75.75v3.55l-2.901 5.078c-.066.114-.099.241-.099.372v10.5c0 .414.336.75.75.75h12.038c1.185 0 2.262-.701 2.74-1.782z" />
                    <path d="m.75 22.5h3.75v-12h-3.75c-.414 0-.75.336-.75.75v10.5c0 .414.336.75.75.75z" />
                  </svg>
                }
                iconSize={14}
              />
            ) : (
              <Icon
                icon={
                  <svg
                    id="regular"
                    width="14px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#78909c"
                  >
                    <path d="m24 12c0-1.95-1.598-3.536-3.563-3.536h-4.875v-3.428c0-1.95-1.598-3.536-3.562-3.536h-2.109c-1.502 0-1.518 1.463-1.455 2.8.024.521.052 1.106.015 1.72-1.074 1.888-1.748 3.074-2.167 3.837h-5.534c-.414 0-.75.336-.75.75v11.143c0 .414.336.75.75.75h19.958c.296 0 .564-.174.686-.445 2.832-6.37 2.658-6.281 2.606-10.055zm-18.375 9h-4.125v-9.643h4.124c0 .002.001.005.001.008zm14.596 0h-13.096v-9.528c.154-.3.715-1.347 2.714-4.858.201-.352.114-1.972.095-2.385-.02-.424-.046-.985.004-1.229h2.062c1.138 0 2.062.913 2.062 2.036v4.179c0 .414.336.75.75.75h5.625c1.138 0 2.063.913 2.063 2.043.047 3.486.222 3.358-2.279 8.992z" />
                  </svg>
                }
                iconSize={14}
              />
            )}
          </span>
        ) : null} */}

        {/* {!props.isPublic && props.fileDetails && props.fileDetails.postId ? (
          <span className="icon-btn" onClick={props.toggleComments}>
            <img alt="" src={commentSvg} />
          </span>
        ) : null} */}

        {!props.fileDetails.isRemovedTemporary && (
          <a
            className="icon-btn"
            href={getSource()}
            download={'test'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img alt="" src={downloadSvg} />
          </a>
        )}
        <span className="icon-btn" onClick={() => printPage()}>
          <img width="12" alt="" src={printSvg} />
        </span>
        {!props.isPublic && (
          <span
            className="icon-btn"
            onClick={() => {
              setShareDialog(true);
            }}
          >
            <Icon icon="people" iconSize={14} color="#78909c" />
          </span>
        )}
        <span className="icon-btn toggle-sidebar" onClick={() => props.toggleSideBar()}>
          <img alt="" src={moreSvg} />
        </span>
      </div>
      {/* {startDownload ? (
        <Download
          fileDetails={props.fileDetails}
          publicFolderPassword={null}
          isPublic={props.isPublic}
          onEndDownload={() => {
            setDetails(null);
          }}
          unSelectAll={() => {}}
        />
      ) : null} */}
      {props.fileDetails && openShareDialog ? (
        <Share
          shortLink={props.onShortlink}
          onChangePassword={props.onChangePassword}
          onShare={props.onShare}
          onRefresh={() => {}}
          onRefreshRecent={() => {}}
          desableSetPassword={props.disable_set_password}
          shares={props.shares}
          fileDetails={props.fileDetails}
          onEnd={() => setShareDialog(false)}
          OnRemoveShare={props.OnRemoveShare}
        />
      ) : null}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderFilePreview);
