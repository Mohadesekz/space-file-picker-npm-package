const getAddress = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL;
  } else if (process.env.REACT_APP_ENVIRONMENT === 'local') {
    return process.env.REACT_APP_LOCAL_API_URL;
  } else if (process.env.REACT_APP_ENVIRONMENT === 'sand') {
    return process.env.REACT_APP_SAND_API_URL;
  } else {
    return process.env.REACT_APP_PROD_API_URL;
  }
};

export default {
  $meta: 'PodStorage Manifest',
  server: {
    api: {
      address: getAddress(),
      timeout: process.env.REACT_APP_API_TIMEOUT,
    },
    token: process.env.REACT_APP_TOKEN,
  },
  version: '3.14.4.1',
  tilinUrl: process.env.REACT_APP_TINI_URL,
  coreApi: process.env.REACT_APP_CORE_URL,
  enablePlan: true,
  appAndroidUrl: 'https://podspace.pod.ir/app/android',
  environment: process.env.REACT_APP_ENVIRONMENT,
  sentry: process.env.REACT_APP_SENTRY,
  pageSize: 50,
};
