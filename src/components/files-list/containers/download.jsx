import React, { useEffect, useRef } from 'react';
import './download.scss';
import Manifest from '../../../manifest';
import { Icon } from '@blueprintjs/core';
import { refreshToken } from '../../../helpers/refreshToken';
import { newFetch } from 'helpers';
let unmounted = false;
const Download = ({ fileDetails, publicFolderPassword, onEndDownload, unSelectAll }) => {
  const downloadRef = useRef(null);

  const getDownloadLink = (hash, timestamp) => {
    return new Promise(async resolve => {
      const downloadLink = await newFetch(
        encodeURI(`files/${hash}/link?expiration=${timestamp}`),
        'GET',
      );
      let dlLink;
      if (downloadLink && downloadLink.downloadLink) {
        // setDlLink(`${Manifest.server.api.address}files/d/${downloadLink.downloadLink}`);
        // dlLink =`${Manifest.server.api.address}files/d/${downloadLink.downloadLink}`;
        dlLink = downloadLink;
      }
      setTimeout(() => {
        resolve(dlLink);
        return dlLink;
      }, 10);
    });
  };

  const startDownload = async fileDetails => {
    // await refreshToken();
    const token = window.localStorage.getItem('access_token');

    if (downloadRef && !unmounted) {
      // const href = `${Manifest.server.api.address}files/${fileDetails.hash}${
      //   publicFolderPassword ? '?password=' + publicFolderPassword : ''
      // }`;
      if (fileDetails.length > 1) {
        let entityHashes = '';
        for (let i = 0; i < fileDetails.length; i++) {
          entityHashes += fileDetails[i].hash + ',';
        }
        entityHashes = entityHashes.substring(0, entityHashes.length - 1);
        let href = `${Manifest.server.api.address}files?entityHashes=${entityHashes}&authorization=${token}`;
        const aTag = downloadRef.current;
        aTag.download = fileDetails.name;
        aTag.href = href;
        aTag.click();
      } else {
        fileDetails = fileDetails[0];
        if (Object.is(fileDetails.type_, 'folder')) {
          let href = `${Manifest.server.api.address}files?entityHashes=${fileDetails.hash}&authorization=${token}`;
          const aTag = downloadRef.current;
          aTag.download = fileDetails.name;
          aTag.href = href;
          aTag.click();
        } else {
          let href = `${Manifest.server.api.address}files/`;

          if (window.location.pathname.startsWith('/public')) {
            href += fileDetails.hash;
            if (token && publicFolderPassword) {
              href += `?authorization=${token}&password=${publicFolderPassword}`;
            } else if (token && !publicFolderPassword) {
              href += `?authorization=${token}`;
            } else if (!token && publicFolderPassword) {
              href += `?password=${publicFolderPassword}`;
            }
          } else {
            const date = +new Date();
            const timestamp = date + 59 * 60 * 1000;
            const dlLink = await getDownloadLink(fileDetails.hash, timestamp);
            if (dlLink.downloadLink) {
              href += `d/${dlLink.downloadLink}`;
            } else {
              href += fileDetails.hash;
              if (token && publicFolderPassword) {
                href += `?authorization=${token}&password=${publicFolderPassword}`;
              } else if (token && !publicFolderPassword) {
                href += `?authorization=${token}`;
              } else if (!token && publicFolderPassword) {
                href += `?password=${publicFolderPassword}`;
              }
            }
          }
          const aTag = downloadRef.current;
          aTag.download = fileDetails.name + '.' + fileDetails.extension;
          aTag.href = href;
          aTag.click();
          // console.log(href);
        }
      }
    } else {
      console.log('Unexpected Error');
    }

    if (!unmounted) {
      if (unSelectAll) unSelectAll();
      onEndDownload();
    }
  };

  useEffect(() => {
    startDownload(fileDetails);
    unmounted = false;
    // return () => {
    //   unmounted = true;
    // };
  }, []);

  return (
    <div className="download-process">
      <span className="prepare-for-download">
        <Icon icon="cloud-download" iconSize={20} />
      </span>
      <a ref={downloadRef} download target="_blank" />
    </div>
  );
};

export default Download;
