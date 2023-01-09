import axios from 'axios';
import Manifest from '../manifest';
import { refreshToken } from './refreshToken';

const coreAxios = axios.create({});

coreAxios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
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

const coreFetch = async (
  url,
  method,
  data = {},
  headers = {},
  isPublic = false,
  baseURL = null,
) => {
  if (baseURL) {
    coreAxios.defaults.baseURL = baseURL;
  } else {
    coreAxios.defaults.baseURL = Manifest.coreApi + 'srv/core/nzh/';
  }

  const request = {
    method,
    url,
    data: method.toLowerCase() === 'get' ? undefined : data,
    params: method.toLowerCase() === 'post' ? undefined : data,
    retry: 5,
    retryDelay: 1500,
    headers: isPublic
      ? {
          ...headers,
          'Content-Type': 'application/json;charset=utf-8',
          'Accept-Language': 'fa-IR',
        }
      : {
          ...headers,
          'Content-Type': 'application/json;charset=utf-8',
          _token_: window.localStorage.getItem('access_token'),
          _token_issuer_: '1',
          'Accept-Language': 'fa-IR',
        },
  };
  try {
    const response = await coreAxios(request);
    if (response && response.data && response.data.hasError) {
      if (response && response.data && response.data.errorCode === 21) {
        await refreshToken();
        return await coreFetch(url, method, data, headers, isPublic);
      }

      throw response;
    } else {
      return response;
    }
  } catch (error) {
    throw error;
  }
};

export default coreFetch;
