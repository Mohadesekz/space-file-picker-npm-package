import { call, all, takeLatest, put } from 'redux-saga/effects';
import Constants from './Redux/Constants';
import { newFetch, Util } from '../../helpers';
import { throw_exception } from '../Main/Actions';

function* ftpCreateToken(action) {
  try {
    let result = yield call(newFetch, `/oauth2/ftp/token`, 'POST');
    if (result.type !== 'ERROR') {
      result.expiresIn = Util.fileDateTimeFa(result.expiresIn);
      action.onEnd(result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* ftpRevokeToken(action) {
  try {
    const result = yield call(newFetch, '/oauth2/ftp/token', 'DELETE');
    if (result.type !== 'ERROR' && action.onEnd) {
      action.onEnd();
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getDevices(action) {
  try {
    const result = yield call(
      newFetch,
      `/oauth2/devices?offset=${action.offset}&size=${action.size}`,
      'GET',
    );
    if (action.onEnd) {
      action.onEnd(result.type === 'ERROR' ? [] : result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* revokeDevices(action) {
  try {
    const result = yield call(newFetch, `/oauth2/devices/${action.uid}`, 'DELETE', {
      uid: action.uid,
    });
    if (action.onEnd) {
      action.onEnd(result.type !== 'ERROR');
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* addMember(action) {
  try {
    const result = yield call(
      newFetch,
      `/teams/${action.userDetails.hash}/users?authority=${action.userDetails.authority}&identity=${action.userDetails.identity}`,
      'POST',
    );
    if (action.onEnd) {
      action.onEnd(result.type ? result.type : result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* removeMember(action) {
  try {
    const result = yield call(
      newFetch,
      `/teams/${action.teamHash}/users?identity=${action.identity}`,
      'DELETE',
    );
    if (action.onEnd) {
      action.onEnd(result.type ? result.type : result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* getMembers(action) {
  try {
    const result = yield call(newFetch, `/teams/${action.teamHash}`, 'GET');
    if (action.onEnd) {
      action.onEnd(result.type ? result.type : result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

const settingsSaga = function* watchAll() {
  yield all([
    takeLatest(Constants.FTP_CREATE_TOKEN_REQUEST.toString(), ftpCreateToken),
    takeLatest(Constants.FTP_REVOKE_TOKEN_REQUEST.toString(), ftpRevokeToken),
    takeLatest(Constants.GET_DEVICES.toString(), getDevices),
    takeLatest(Constants.REVOKE_DEVICE.toString(), revokeDevices),
    takeLatest(Constants.ADD_MEMBER.toString(), addMember),
    takeLatest(Constants.REMOVE_MEMBER.toString(), removeMember),
    takeLatest(Constants.GET_TEAM_MEMBERS.toString(), getMembers),
  ]);
};

export default settingsSaga;
