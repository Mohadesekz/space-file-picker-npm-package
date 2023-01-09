import React, { useState, useEffect } from 'react';
import Manifest from '../../../../manifest';
import Viewer from 'react-viewer';
import { Icon } from '@blueprintjs/core';
import Download from '../../../files-list/containers/download';
import { refreshToken } from './../../../../helpers/refreshToken';
import './index.scss';

const ImageSlider = props => {
  const [srcList, setSrcList] = useState([]);
  const [downloadDetails, setDownloadDetails] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);
  const [index, setIndex] = useState(props.startIndex || 0);
  const password = props.password;

  const token = localStorage.getItem('access_token');

  const checkToken = async () => {
    const imageList = props.images;
    if (!window.location.pathname.startsWith('/public')) {
      await refreshToken();
    }
    if (imageList && imageList.length > 0) {
      let list = [];
      imageList.forEach(image => {
        list = [
          ...list,
          {
            src: `${Manifest.server.api.address}files/${
              image.hash
            }/thumbnail/?Authorization=${token}&time=${+new Date()}${password ? password : ''}`,
          },
        ];
      });
      setSrcList(list);
      const imageDetails = imageList[props.startIndex || 0];
      setImageDetails(imageDetails);
      list[props.startIndex || 0] = {
        src: `${Manifest.server.api.address}files/${
          imageDetails.hash
        }?Authorization=${token}&time=${+new Date()}${password ? password : ''}`,
      };
    }
  };

  useEffect(() => {
    if (props.startIndex) {
      setIndex(props.startIndex);
    }
    if (props.public) {
      const imageList = props.images;
      if (imageList && imageList.length > 0) {
        let list = [];
        imageList.forEach(image => {
          list = [
            ...list,
            {
              src: `${Manifest.server.api.address}files/${image.hash}?time=${+new Date()}${
                password ? password : ''
              }`,
            },
          ];
        });
        setSrcList(list);
        const imageDetails = imageList[props.startIndex || 0];
        setImageDetails(imageDetails);
      }
    } else {
      checkToken();
    }
    return () => {};
  }, []);

  const downloadImage = imageSrc => {
    if (imageSrc) {
      const imageDetails = props.images.find(image => imageSrc.src.indexOf(image.hash) !== -1);
      setDownloadDetails([imageDetails]);
    }
  };

  const handleChange = imageSrc => {
    if (imageSrc) {
      const imageDetails = props.images.find(image => imageSrc.src.indexOf(image.hash) !== -1);
      setImageDetails(imageDetails);
      srcList.forEach(item => {
        var itemHash = item.src.substr(item.src.indexOf('files/') + 6, 16);
        if (!item.src.includes('thumbnail')) {
          item.src = item.src.replace(itemHash, `${itemHash + '/thumbnail/'}`);
        }
        if (itemHash === imageDetails.hash) {
          item.src = `${Manifest.server.api.address}files/${
            imageDetails.hash
          }?Authorization=${token}&time=${+new Date()}${password ? password : ''}`;
        }
      });
    }
  };

  return (
    <>
      {srcList && srcList.length > 0 ? (
        <Viewer
          activeIndex={index || 0}
          visible={true}
          onClose={props.close}
          images={srcList}
          onChange={imageDetails => handleChange(imageDetails)}
          className="image-viewer"
          drag={false}
          scalable={false}
          attribute={false}
          noResetZoomAfterChange={true}
          customToolbar={toolbars => {
            return toolbars.concat([
              {
                key: 'custom-download',
                render: (
                  <Icon
                    className="cloud-download"
                    icon="cloud-download"
                    style={{ color: '#FFF' }}
                  />
                ),
                onClick: imageSrc => {
                  downloadImage(imageSrc);
                },
              },
              // {
              //   key: 'next-img',
              //   render: (
              //     <Icon
              //       className="arrow-right"
              //       icon="arrow-right"
              //       style={{
              //         position: 'fixed',
              //         top: '42%',
              //         right: '3%',
              //         color: 'white',
              //         opacity: '0.8',
              //       }}
              //     />
              //   ),
              //   onClick: () => {
              //     setIndex(prevState => prevState + 1);
              //   },
              // },

              // {
              //   key: 'prev-img',
              //   render: (
              //     <Icon
              //       className="arrow-left"
              //       icon="arrow-left"
              //       style={{
              //         position: 'fixed',
              //         top: '42%',
              //         right: '96%',
              //         color: 'white',
              //         opacity: '0.8',
              //       }}
              //     />
              //   ),
              //   onClick: () => {
              //     setIndex(prevState => prevState - 1);
              //   },
              // },
            ]);
          }}
        />
      ) : null}
      {downloadDetails ? (
        <Download
          fileDetails={downloadDetails}
          publicFolderPassword={password}
          onEndDownload={() => {
            setDownloadDetails(null);
          }}
        />
      ) : null}
      {imageDetails ? (
        <div
          className="image-text"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1006,
            right: 0,
            color: '#FFF',
          }}
        >
          <div
            className="image-content-wrapper"
            style={{
              display: 'flex',
              alignItems: 'center',
              // justifyContent: 'center',
              padding: '20px 0',
              justifyContent: 'end',
              marginLeft: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                maxWidth: '40%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              <p
                className="image-size"
                style={{
                  margin: '0px 5px',
                  fontSize: '12px',
                  direction: 'ltr',
                }}
              >
                {imageDetails.size_}
              </p>
              <p
                className="image-name"
                style={{
                  margin: '0px 5px',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
              >
                {imageDetails.name + '.' + imageDetails.extension}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default ImageSlider;
