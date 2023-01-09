import Axios from 'axios';
import Manifest from '../manifest';
import { unregister } from '../serviceWorker';

let waitForRefreshToken = false;
export const refreshToken = async () => {
  if (!waitForRefreshToken) {
    waitForRefreshToken = true;
    const refreshToken = window.localStorage.getItem('refresh_token');
    if (refreshToken) {
      await addDelayBeforeRequest();
      return Axios.get(`${Manifest.server.api.address}oauth2/refresh?refreshToken=${refreshToken}`)
        .then(myJson => {
          if (myJson.data.result.access_token) {
            for (const [key, value] of Object.entries(myJson.data.result)) {
              window.localStorage.setItem(key, value);
            }
            waitForRefreshToken = false;
          } else logout();
        })
        .catch(() => logout());
    } else {
      logout();
    }
  } else {
    await waitForRefresh();
  }
};

export const logout = (goToLogoutPage = false) => {
  //unregister serviceworker
  unregister();
  const token = window.localStorage.getItem('access_token');
  Axios.delete(`${Manifest.server.api.address}oauth2/token?token=${token}&tokenType=access_token`);
  window.localStorage.clear();

  if (goToLogoutPage) {
    setTimeout(() => window.location.assign(`/`), 1500);
  } else {
    setTimeout(() => window.location.assign(`/auth?back_url=${window.location.pathname}`), 1500);
  }
};

const addDelayBeforeRequest = () => {
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve();
    }, 1000);
  });
};

const waitForRefresh = () => {
  return new Promise(resolve => {
    setTimeout(async () => {
      if (waitForRefreshToken) {
        await waitForRefresh();
      }
      resolve();
    }, 100);
  });
};
