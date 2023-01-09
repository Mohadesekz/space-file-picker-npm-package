import React, { Component } from 'react';
import Manifest from '../manifest';
import Loading from '../components/loading';
import * as serviceWorker from '../serviceWorker';
const Routes = [
  '/',
  '/user/terms',
  '/payment/:android',
  '/payment/',
  '/video/:videoHash',
  '/public/folders/:folderHash',
  '/auth',
  '/auth(#accessToken=.+&refreshToken=.+&expiresIn=[0-9]+)?',
  '/file/:fileHash',
  '/my-space/folders/:folderHash',
  '/recent/folders/:folderHash',
  '/shared-with-me/folders/:folderHash',
  '/bookmark/folders/:folderHash',
  '/search/folders/:folderHash',
  '/my-space',
  '/recent',
  '/shared-with-me',
  '/bookmark',
  '/trash',
  '/search',
  '/404',
];

export default class Auth extends Component {
  letsAuth = () => {
    setTimeout(() => {
      const url = `${Manifest.server.api.address}oauth2/login?ssoType=POD&redirectUri=${window.location.origin}/auth`;
      window.location.replace(url);
    }, 1000);
  };
  checkToken({ accessToken, refreshToken, path }) {
    window.localStorage.setItem('isAuthenticated', true);
    window.localStorage.setItem('refresh_token', refreshToken);
    window.localStorage.setItem('access_token', accessToken);
    if (path) {
      if (path === window.location.origin) {
        setTimeout(() => window.location.replace(path), 100);
      } else {
        setTimeout(() => window.location.replace(`${window.location.origin}/404`), 100);
      }
      return;
    }
    if (sessionStorage.getItem('back_url')) {
      const backURL = sessionStorage.getItem('back_url');
      sessionStorage.clear();
      setTimeout(() => window.location.replace(backURL), 100);
    } else {
      setTimeout(() => window.location.replace('/my-space'), 100);
    }
  }

  redirectAllowed = path => {
    let isInList = false;
    if (Routes.includes(path)) {
      isInList = true;
    }
    return isInList;
  };
  parse_query_string = query => {
    const vars = query.split('&');
    const query_string = {};
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1]);
      // If first entry with this name
      if (typeof query_string[key] === 'undefined') {
        query_string[key] = decodeURIComponent(value);
        // If second entry with this name
      } else if (typeof query_string[key] === 'string') {
        const arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
        // If third or later entry with this name
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
  };

  render() {
    const params = this.parse_query_string(window.location.hash.replace('#', ''));
    if (params.accessToken && params.refreshToken) {
      serviceWorker.register();

      this.checkToken(params);
      return (
        <React.Fragment>
          <Loading style={{ right: 'unset' }} />
        </React.Fragment>
      );
    } else {
      serviceWorker.unregister();
      const urlString = window.location.href;
      const url = new URL(urlString);
      const backUrl = url.searchParams.get('back_url');
      if (backUrl) {
        if (!this.redirectAllowed(backUrl)) {
          sessionStorage.setItem('back_url', '/404');
        } else {
          sessionStorage.setItem('back_url', backUrl);
        }
      }

      this.letsAuth();

      return (
        <React.Fragment>
          <Loading style={{ right: 'unset' }} />
        </React.Fragment>
      );
    }
  }
}
