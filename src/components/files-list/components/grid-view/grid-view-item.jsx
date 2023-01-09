import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@blueprintjs/core';
import Dropzone from '../dropzone';
import Manifest from '../../../../manifest';
import Util from '../../../../helpers/util';
import './grid-view-item.scss';
import { fromEvent } from 'file-selector';

let timeout = null;
const mobileAndTabletCheck = Util.mobileAndTabletCheck();
const regexTest = str => {
  let persianChar = /[\u06F0-\u06F9\u06A9\u06AF\u06C0\u06CC\u060C\u062A\u062B\u062C\u062D\u062E\u062F\u063A\u064A\u064B\u064C\u064D\u064E\u064F\u067E\u0670\u0686\u0698\u200C\u0621-\u0629\u0630-\u0639\u0641-\u0654\S]+/;
  return persianChar.test(str);
};

const Item = ({
  detail,
  onClick,
  onDoubleClick,
  onContextMenu,
  onSelect,
  hasSelect,
  dontShowSelect,
  onDrop,
  onDragEnter,
  onDragLeave,
  isPublic,
  // likeAndDislike,
  recentSelectedFile,
  kindOfChangeRecent,
  filter,
}) => {
  const [highlightFlag, setHighlightFlag] = useState(false);

  useEffect(() => {
    if (recentSelectedFile) {
      setHighlightFlag(true);

      timeout = window.setTimeout(() => {
        setHighlightFlag(false);
      }, 5000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [recentSelectedFile]);
  const isFile = detail.type_ === 'file';
  const token = localStorage.getItem('access_token');
  const showMoreClick = e => {
    e.stopPropagation();
    onContextMenu(e);
  };

  const classFileType = Util.getFileIcon(detail, isFile);
  const kindRecent = {
    UPLOAD: 'آپلود شده',
    SHARE: 'به اشتراک گذاشته شده',
    RENAME: 'تغییر نام داده‌شده',
    COPY: 'کپی‌شده',
    MOVE: 'انتقال داده‌شده',
    CREATE: 'ایجاد شده',
    RESTORE: 'بازگردانی شده',
  };
  const canDorp = filter !== 'trash' && filter !== 'shared';

  return (
    <div
      className={
        'box-container' + (detail.isSelected ? ' active' : '') + (detail.hidden ? ' hidden' : '')
      }
      style={{}}
    >
      {!dontShowSelect && hasSelect ? (
        <span
          className={`bp3-icon bp3-icon-circle ${detail.isSelected ? 'selected' : ''}`}
          onClick={onSelect}
        />
      ) : null}

      <Dropzone
        onDrop={isFile ? null : onDrop}
        onDragEnter={isFile ? null : onDragEnter}
        onDragLeave={isFile ? null : onDragLeave}
        disabled={isFile}
        activeClassName={isFile && canDorp ? 'dropzone-folder-active' : ''}
        rejectClassName={isFile ? '' : 'dropzone-folder-reject'}
        disableClick
        getDataTransferItems={evt => fromEvent(evt)}
        className={
          'box vector' +
          (kindOfChangeRecent ? ' recent' : '') +
          (detail.isSelected ? ' active' : '') +
          (detail.isCut ? ' cut' : '') +
          (recentSelectedFile && highlightFlag ? ' highlightTrace ' : '')
        }
        recent={recentSelectedFile ? 'true' : 'false'}
        onContextMenu={mobileAndTabletCheck ? onSelect : onContextMenu}
        onDoubleClick={onDoubleClick}
        data-hash={detail.hash}
      >
        <div
          onClick={onClick}
          className="box-thumb"
          style={{
            backgroundImage: detail.thumbnail?.startsWith('THUMBNAIL_EXIST')
              ? `url(${Manifest.server.api.address}files/${detail.hash}/thumbnail${
                  isPublic ? '' : `?authorization=${token}`
                }&t=${detail.updated})`
              : '',
          }}
        >
          {!detail.thumbnail?.startsWith('THUMBNAIL_EXIST') && (
            <div className="inner">
              <div className={`inner-icon ${isFile ? classFileType : `folder`}`}></div>
            </div>
          )}
        </div>

        <div className="box-details">
          <div className="name" style={{ direction: regexTest(detail.name) ? 'ltr' : 'rtl' }}>
            <span
              className={`more ${mobileAndTabletCheck ? 'active' : ''}`}
              onClick={showMoreClick}
            >
              <Icon
                icon={
                  <svg
                    id="regular"
                    width="21px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#6d8bc0"
                  >
                    <title />
                    <desc />
                    <defs />
                    <g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1">
                      <g fill="#6d8bc0" id="Core" transform="translate(-178.000000, -340.000000)">
                        <g id="more-vert" transform="translate(178.000000, 340.000000)">
                          <path
                            d="M2,4 C3.1,4 4,3.1 4,2 C4,0.9 3.1,0 2,0 C0.9,0 0,0.9 0,2 C0,3.1 0.9,4 2,4 L2,4 Z M2,6 C0.9,6 0,6.9 0,8 C0,9.1 0.9,10 2,10 C3.1,10 4,9.1 4,8 C4,6.9 3.1,6 2,6 L2,6 Z M2,12 C0.9,12 0,12.9 0,14 C0,15.1 0.9,16 2,16 C3.1,16 4,15.1 4,14 C4,12.9 3.1,12 2,12 L2,12 Z"
                            id="Shape"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                }
              />
            </span>
            <span className="title">
              {detail.name || detail.extension
                ? (detail.name || '') + (detail.extension ? '.' + detail.extension : '')
                : '__WITHOUT_NAME__'}
            </span>
          </div>

          {kindOfChangeRecent && (
            <div className="title name kind" style={{ direction: 'rtl', textAlign: 'right' }}>
              {kindRecent[kindOfChangeRecent]}
            </div>
          )}

          <div className="icons">
            {/* {detail.type_ !== 'folder' ? (
              detail.like ? (
                <svg
                  id="Bold"
                  width="16px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#6d8bc0b8"
                  style={{ marginLeft: 3 }}
                  className="bounceIn like-icon"
                  onClick={() => {
                    if (!dontShowSelect) likeAndDislike();
                  }}
                >
                  <path d="m23.934 15.304c.044-.096.066-.199.066-.304v-3c0-1.654-1.346-3-3-3h-6v-4.5c0-1.655-1.346-3-3-3h-2.25c-.414 0-.75.336-.75.75v3.55l-2.901 5.078c-.066.114-.099.241-.099.372v10.5c0 .414.336.75.75.75h12.038c1.185 0 2.262-.701 2.74-1.782z" />
                  <path d="m.75 22.5h3.75v-12h-3.75c-.414 0-.75.336-.75.75v10.5c0 .414.336.75.75.75z" />
                </svg>
              ) : kindOfChangeRecent ? null : (
                <svg
                  id="regular"
                  width="16px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#6d8bc0"
                  style={{ marginLeft: 3 }}
                  className="bounceIn like-icon"
                  onClick={() => {
                    if (!dontShowSelect) likeAndDislike();
                  }}
                >
                  <path d="m24 12c0-1.95-1.598-3.536-3.563-3.536h-4.875v-3.428c0-1.95-1.598-3.536-3.562-3.536h-2.109c-1.502 0-1.518 1.463-1.455 2.8.024.521.052 1.106.015 1.72-1.074 1.888-1.748 3.074-2.167 3.837h-5.534c-.414 0-.75.336-.75.75v11.143c0 .414.336.75.75.75h19.958c.296 0 .564-.174.686-.445 2.832-6.37 2.658-6.281 2.606-10.055zm-18.375 9h-4.125v-9.643h4.124c0 .002.001.005.001.008zm14.596 0h-13.096v-9.528c.154-.3.715-1.347 2.714-4.858.201-.352.114-1.972.095-2.385-.02-.424-.046-.985.004-1.229h2.062c1.138 0 2.062.913 2.062 2.036v4.179c0 .414.336.75.75.75h5.625c1.138 0 2.063.913 2.063 2.043.047 3.486.222 3.358-2.279 8.992z" />
                </svg>
              )
            ) : null} */}
            {detail.isBookmarked && <Icon icon="star" iconSize={16} />}
            {detail.isShared && <Icon icon="people" iconSize={16} />}
            {detail.isPublic && <Icon icon="globe" iconSize={16} />}
          </div>

          {/* <div className="pull-right last-mod">{detail.updated_}</div> */}
          <div className="pull-right last-mod">{detail.created_}</div>
        </div>
      </Dropzone>
    </div>
  );
};

Item.propTypes = {
  detail: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func.isRequired,
};

export default Item;
