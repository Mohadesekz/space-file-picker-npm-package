import { buffers, eventChannel, END } from 'redux-saga';
import Manifest from '../manifest';

const Config = Manifest.server;

export default file => {
  return eventChannel(emitter => {
    const xhr = new XMLHttpRequest();
    const onProgress = e => {
      let contentLength;
      if (e.lengthComputable) {
        contentLength = e.total;
      } else {
        contentLength = parseInt(e.target.getResponseHeader('x-decompressed-content-length'), 10);
      }

      const progress = e.loaded / contentLength;

      emitter({
        progress,
      });
    };

    const onFailure = (err, res = {}) => {
      emitter({
        error: err,
        res,
      });
      emitter(END);
    };

    xhr.upload.addEventListener('progress', onProgress);
    xhr.upload.addEventListener('error', onFailure);
    xhr.upload.addEventListener('abort', onFailure);

    xhr.onreadystatechange = () => {
      const { readyState, status } = xhr;
      if (readyState === 4) {
        if (status === 200) {
          const res = JSON.parse(xhr.response);
          if (res.hasError) {
            return onFailure(new Error('Upload failed, Server Code 999'), res);
          }

          emitter({
            success: true,
            res: xhr.response,
          });

          emitter(END);
        } else {
          onFailure(status);
        }
      }
    };

    const upload_key = localStorage.getItem('upload_key');
    let formData = new FormData();
    if (file.replace) {
      xhr.open(
        'PUT',
        `${Config.api.address}files/${file.replaceHashCode}${
          upload_key ? '?upload_key=' + upload_key : ''
        }`,
        true,
      );

      formData.append('file', file);

      // delete file.replace;
      // delete file.replaceHashCode;
      // delete file.exist;
      // delete file.cancelUpload;
    } else {
      const uploadUrl = `${Config.api.address}files?folderHash=${
        file.folderHash ? file.folderHash : 'ROOT'
      }${upload_key ? '&upload_key=' + upload_key : ''}`;

      xhr.open('POST', uploadUrl, true);
      formData.append('file', file, file.name);
    }

    xhr.setRequestHeader('Authorization', 'Bearer ' + window.localStorage.getItem('access_token'));
    xhr.send(formData);

    emitter({
      abort: onFailure,
    });

    return () => {
      xhr.upload.removeEventListener('progress', onProgress);
      xhr.upload.removeEventListener('error', onFailure);
      xhr.upload.removeEventListener('abort', onFailure);
      xhr.onreadystatechange = null;
      xhr.abort();
    };
  }, buffers.sliding(2));
  // });
};
