import { buffers, eventChannel, END } from 'redux-saga';
import Manifest from '../manifest';
import * as tus from 'tus-js-client';

const Config = Manifest.server;

const resumable = file => {
  return eventChannel(emitter => {
    const onCancel = () => {
      upload.abort();
      // emitter(END);
    };

    const onPause = () => {
      upload.abort();
    };
    const onResume = () => {
      upload.start();
    };

    const onResumableError = status => {
      emitter({
        error: status || 'ERROR',
        res: upload.file,
      });
      // emitter(END);
    };

    const metadata = {
      fileFullName: file.name,
      isPublic: false,
    };
    if (file.replace && file.replaceHashCode) {
      metadata['hash'] = file.replaceHashCode;
    } else if (file.folderHash) {
      metadata['folderHash'] = file.folderHash;
    }
    // const endpoint = file.replace
    const endpoint = file.replace
      ? `${Config.api.address}files/resumable_replace`
      : `${Config.api.address}files/resumable_upload`;
    const upload = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      endpoint: endpoint,
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [],
      chunkSize: 5 * 1024 * 1024,
      uploadSize: file.size,
      onChunkComplete: (chunkSize, bytesAccepted, bytesTotal) => {
        // console.log(chunkSize);
        // console.log('*****************');
        // console.log(bytesAccepted);
        // console.log('*****************');
        // console.log(bytesTotal);
        // console.log('*****************');
      },
      removeFingerprintOnSuccess: true,
      //set default headers
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('access_token'),
      },
      // Attach additional meta data about the file for the server
      metadata,
      // Callback for errors which cannot be fixed using retries
      onError: async error => {
        const status = error.originalResponse ? error.originalResponse.getStatus() : 0;
        onResumableError(status);
      },
      // Callback for reporting upload progress
      onProgress: (bytesUploaded, bytesTotal) => {
        var percentage = bytesUploaded / bytesTotal;
        emitter({
          progress: percentage,
        });
      },
      onBeforeRequest: () => {
        emitter({
          onPause,
          onResume,
          onCancel,
        });
      },
      // Callback for once the upload is completed
      onSuccess: () => {
        emitter({
          success: true,
          res: upload.file,
          uploadKey: upload.url.replace(endpoint + '/', ''),
        });
        emitter(END);
      },
    });
    upload.findPreviousUploads().then(previousUploads => {
      // If an upload has been chosen to be resumed, instruct the upload object to do so.
      if (previousUploads[0]) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      // Finally start the upload requests.
      upload.start();
    });
    return () => {};
  }, buffers.sliding(2));
};

export default resumable;
