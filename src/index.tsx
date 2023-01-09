import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import PodStorageRouter from './routers/AppRouter';
import ErrorBoundary from 'ErrorBoundary';
import * as Sentry from '@sentry/react';
import manifest from './manifest';
import './stylesheet/darkmode.scss';
import Store from './store';

if (manifest.environment === 'prod') {
  Sentry.init({
    autoSessionTracking: true,
    dsn: `${manifest.sentry}`,
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
  Sentry.setUser({
    username: localStorage.getItem('username') || undefined,
  });
}

ReactDOM.render(
  <Provider store={Store}>
    <ErrorBoundary>
      <PodStorageRouter />
    </ErrorBoundary>
  </Provider>,
  document.getElementById('root'),
);
