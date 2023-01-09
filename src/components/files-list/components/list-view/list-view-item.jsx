import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@blueprintjs/core';
import Dropzone from './../dropzone';
import { fromEvent } from 'file-selector';
import { Util } from '../../../../helpers';

const Item = ({
  detail,
  onClick,
  onDoubleClick,
  onContextMenu,
  onSelect,
  hasSelect,
  onDrop,
  onDragEnter,
  onDragLeave,
  recentSelectedFile,
  filter,
  accessLevel,
}) => {
  const mobileAndTabletCheck = Util.mobileAndTabletCheck();
  const [highlightFlag, setHighlightFlag] = useState(false);
  let timeout = null;
  useEffect(() => {
    if (recentSelectedFile) {
      setHighlightFlag(true);

      timeout = setTimeout(() => {
        setHighlightFlag(false);
      }, 5000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [recentSelectedFile]);

  const regexTest = str => {
    let persianChar = /[\u06F0-\u06F9\u06A9\u06AF\u06C0\u06CC\u060C\u062A\u062B\u062C\u062D\u062E\u062F\u063A\u064A\u064B\u064C\u064D\u064E\u064F\u067E\u0670\u0686\u0698\u200C\u0621-\u0629\u0630-\u0639\u0641-\u0654\S]+/;
    return persianChar.test(str);
  };
  const isFolder = Object.is(detail.type_, 'folder');
  const extension = !isFolder && detail.extension && `.${detail.extension}`;
  const itemName =
    detail.name || extension
      ? (detail.name || '') + (extension ? extension : '')
      : '__WITHOUT_NAME__';
  const showMoreClick = e => {
    e.stopPropagation();
    onContextMenu(e);
  };
  const classFileType = Util.getFileIcon(detail, !isFolder);
  const canDorp = filter !== 'trash' && accessLevel === 'EDIT';
  return (
    <Dropzone
      onDrop={isFolder ? onDrop : null}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      getDataTransferItems={evt => fromEvent(evt)}
      disabled={!isFolder}
      activeClassName={isFolder && canDorp ? 'dropzone-folder-active' : ''}
      rejectClassName={isFolder ? 'dropzone-folder-reject' : ''}
      disableClick
      renderAsTr
      className={
        'dropzone-folder' +
        (detail.isSelected ? 'active' : '') +
        (detail.hidden ? ' hidden' : '') +
        (detail.isCut ? ' cut' : '') +
        (recentSelectedFile && highlightFlag ? ' highlightTrace ' : '')
      }
      recent={recentSelectedFile ? 'true' : 'false'}
      onContextMenu={mobileAndTabletCheck ? onSelect : onContextMenu}
      onDoubleClick={onDoubleClick}
      data-hash={detail.hash}
      data-folder={isFolder}
    >
      <td className={`check-box ${hasSelect && !mobileAndTabletCheck ? '' : 'hidden'}`}>
        <input
          className={`bp3-icon ${detail.isSelected ? 'selected' : ''}`}
          type="checkbox"
          onChange={onSelect}
          checked={detail.isSelected || false}
          value={detail.isSelected}
        />
      </td>

      <td onClick={onClick}>
        <i className={isFolder ? 'folder' : classFileType}></i>
        <div
          className="text name"
          style={{
            direction: regexTest(itemName) ? 'ltr' : 'rtl',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="icons">
            {detail.like && (
              <svg
                id="Bold"
                width="13px"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fill="#6d8bc0b8"
                style={{ marginLeft: 3 }}
              >
                <path d="m23.934 15.304c.044-.096.066-.199.066-.304v-3c0-1.654-1.346-3-3-3h-6v-4.5c0-1.655-1.346-3-3-3h-2.25c-.414 0-.75.336-.75.75v3.55l-2.901 5.078c-.066.114-.099.241-.099.372v10.5c0 .414.336.75.75.75h12.038c1.185 0 2.262-.701 2.74-1.782z" />
                <path d="m.75 22.5h3.75v-12h-3.75c-.414 0-.75.336-.75.75v10.5c0 .414.336.75.75.75z" />
              </svg>
            )}
            {detail.isBookmarked && <Icon icon="star" iconSize={13} />}
            {detail.isShared && <Icon icon="people" iconSize={13} />}
            {detail.isPublic && <Icon icon="globe" iconSize={13} />}
            {mobileAndTabletCheck ? (
              hasSelect ? (
                <input
                  className="bp3-icon selected"
                  type="checkbox"
                  onChange={onSelect}
                  checked={detail.isSelected || false}
                  value={detail.isSelected}
                />
              ) : (
                <span className="more active" onClick={showMoreClick}>
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
                          <g
                            fill="#6d8bc0"
                            id="Core"
                            transform="translate(-178.000000, -340.000000)"
                          >
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
              )
            ) : null}
          </div>
          <div className="seyed">{itemName}</div>
        </div>
      </td>

      <td onClick={onClick} className="normal-device-info">
        {/* <div className="text">{detail.updated_}</div> */}
        <div className="text">{detail.created_}</div>
      </td>

      <td onClick={onClick} className="normal-device-info">
        <div className="text ltr">{!isFolder && detail.size_ ? detail.size_ : '_'}</div>
      </td>
      <td onClick={onClick} className="small-device-info">
        {/* <div className="text">{detail.updated_}</div> */}
        <div className="text">{detail.created_}</div>
        <div className="text ltr">{!isFolder && detail.size_ ? detail.size_ : '_'}</div>
      </td>
    </Dropzone>
  );
};

Item.propTypes = {
  detail: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
};

export default Item;
