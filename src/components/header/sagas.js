import { call, all, takeLatest, put } from 'redux-saga/effects';
import Constants from './constants';
import { newFetch } from '../../helpers';
// import { receiveTeams } from './actions';
import { throw_exception } from '../Main/Actions';

function* getUserInfo(action) {
  try {
    sessionStorage.setItem('back_url', window.location.pathname);
    const result = yield call(newFetch, '/me', 'GET');
    action.onEnd(result.type ? result.type : result);
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getTeams(action) {
  // try {
  //   const result = yield call(newFetch, '/teams', 'GET');
  //   if (result.type !== 'ERROR') {
  //     yield put(receiveTeams(result));
  //   }
  // } catch (error) {
  //   yield put(throw_exception(error));
  // }
}

const headerSaga = function* watchAll() {
  yield all([
    takeLatest(Constants.GET_ME.toString(), getUserInfo),
    takeLatest(Constants.GET_TEAMS.toString(), getTeams),
  ]);
};

export default headerSaga;
