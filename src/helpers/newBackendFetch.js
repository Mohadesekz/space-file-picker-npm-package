import axios from 'axios';
import Manifest from '../manifest';
import { refreshToken } from './refreshToken';
import { Intent, Position } from '@blueprintjs/core';
import * as Sentry from '@sentry/react';
import { AppToaster } from '../components/toast';

const Config = Manifest.server.api;
axios.defaults.baseURL = Config.address;

axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
  var config = err.config;
  // If config does not exist or the retry option is not set, reject
  if (!config || !config.retry) return Promise.reject(err);

  // Set the variable for keeping track of the retry count
  config.__retryCount = config.__retryCount || 0;

  // Check if we've maxed out the total number of retries
  if (config.__retryCount >= config.retry) {
    // Reject with the error
    return Promise.reject(err);
  }

  // Increase the retry count
  config.__retryCount += 1;

  // Create new promise to handle exponential backoff
  var backoff = new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, config.retryDelay || 1);
  });

  // Return the promise in which recalls axios to retry the request
  return backoff.then(function() {
    return axios(config);
  });
});

const newFetch = async (
  url,
  method,
  data = {},
  headers = {},
  isPublic = false,
  retryRequest,
  responseType = null,
  displayErrorMessage = true,
  position = Position.TOP_RIGHT,
  sagaMethod,
) => {
  if (
    sagaMethod === 'COPY' ||
    sagaMethod === 'MOVE' ||
    sagaMethod === 'TRASH' ||
    sagaMethod === 'WIPE' ||
    sagaMethod === 'RESTORE'
  ) {
    // let elems = document.querySelectorAll('*');
    // for (let index = 0; index < elems.length; index++) {
    //   elems[index].style.cursor = 'progress !important'
    // }
    document.body.style.cursor = 'progress';
  }
  axios.defaults.baseURL = Config.address;

  const request = {
    method,
    url,
    data,
    retry: 0,
    retryDelay: 1500,
    responseType,
    headers: isPublic
      ? {
          ...headers,
          'Content-Type': 'application/json;charset=utf-8',
          'Ps-Client': 'BROWSER',
          'Ps-Client-Version': Manifest.version,
          'Accept-Language': 'fa-IR',
        }
      : {
          ...headers,
          'Content-Type': 'application/json;charset=utf-8',
          Authorization: 'Bearer ' + window.localStorage.getItem('access_token'),
          'Ps-Client': 'BROWSER',
          'Ps-Client-Version': Manifest.version,
          'Accept-Language': 'fa-IR',
        },
  };
  const response = await axios(request)
    .then(res => {
      if (
        sagaMethod === 'COPY' ||
        sagaMethod === 'MOVE' ||
        sagaMethod === 'TRASH' ||
        sagaMethod === 'WIPE' ||
        sagaMethod === 'RESTORE'
      ) {
        document.body.style.cursor = 'unset';
      }
      if (res.data && responseType === 'arraybuffer') {
        // return data when responseType === 'arraybuffer'
        return res.data;
      } else if (res.data && typeof res.data.result === 'boolean') {
        return res.data.result;
      } else {
        return res.data.result || res.data.results || 'OK';
      }
    })
    .catch(async err => {
      if (
        sagaMethod === 'COPY' ||
        sagaMethod === 'MOVE' ||
        sagaMethod === 'TRASH' ||
        sagaMethod === 'WIPE' ||
        sagaMethod === 'RESTORE'
      ) {
        document.body.style.cursor = 'unset';
      }

      const status = err.response && err.response.data && err.response.data.status;
      const message = err.response && err.response.data && err.response.data.message;
      const error = err.response && err.response.data && err.response.data.error;

      if (status === 401) {
        await refreshToken();
        return await newFetch(url, method, data, headers);
      } else if (status === 403) {
        if (error === 'Password is wrong') {
          if (request.url.includes('password')) {
            displayErrorMessage && message && showError(retryRequest, message, position);
          }
          return {
            type: 'PASSWORD_REQUIRED',
            status: 403,
            message,
          };
        } else if (error === 'Forbidden') {
          displayErrorMessage && message && showError(retryRequest, message, position);
          return {
            type: 'Forbidden',
            status: 403,
            message,
          };
        }
      } else if (status === 409) {
        displayErrorMessage && message && showError(retryRequest, message, position);
        return {
          type: err.response.data.result || 'CONFILICT',
          status: 409,
          message,
        };
      } else if (status === 500) {
        displayErrorMessage &&
          message &&
          showError(() => window.location.reload(), message, position);
        Sentry.captureException(err);
        return {
          type: 'ERROR',
          status: 500,
          message,
        };
      } else if (err.response && err.response.data && responseType === 'arraybuffer') {
        // handle error when responseType === 'arraybuffer'
        const decodedString = new TextDecoder('utf8').decode(err.response.data);
        const errorObj = JSON.parse(decodedString);
        displayErrorMessage &&
          errorObj.message &&
          showError(retryRequest, errorObj.message, position);
        return {
          type: 'ERROR',
          status,
          message: errorObj.message,
        };
      } else {
        displayErrorMessage && message && showError(retryRequest, message, position);
        return {
          type: 'ERROR',
          status: (err && err.response && err.response.data.status) || -1,
          message,
        };
      }
    });
  if (response === undefined) {
    showError(() => window.location.reload(), 'خطا در برقراری ارتباط با سرور', position);
    return {
      type: 'ERROR',
      status: null,
    };
  }
  return response;
};

const showError = (retryRequest, message, position) => {
  if (!message) {
    return;
  }
  // const AppToaster = Toaster.create({
  //   className: 'recipe-toaster',
  //   position,
  // });
  AppToaster.dismiss('alert-fetch-backend-req');
  const action = retryRequest
    ? {
        onClick: () => {
          if (retryRequest) {
            retryRequest();
          }
        },
        text: 'تلاش مجدد',
      }
    : {};
  AppToaster.show(
    {
      action,
      message,
      icon: 'danger-sign',
      intent: Intent.DANGER,
    },
    'alert-fetch-backend-req',
  );
};
export default newFetch;
