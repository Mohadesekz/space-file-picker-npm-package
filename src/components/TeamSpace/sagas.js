import { call, all, takeLatest, fork, put, take } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import Constants from './Redux/Constants';
import { newFetch } from '../../helpers';

const retryActionChannel = channel();

function* createTeam(action) {
  const { teamDetails } = action;
  const formData = new FormData();
  if (teamDetails.avatar) {
    formData.append('avatar', teamDetails.avatar);
  }
  const result = yield call(
    newFetch,
    `/teams?description=${teamDetails.description}&name=${teamDetails.name}`,
    'POST',
    teamDetails.avatar ? formData : {},
    {},
    false,
    () => retryActionChannel.put(action),
  );
  if (action.onEnd) {
    action.onEnd(result.type ? result.type : result);
  }
}

function* channelWatcher(chanName) {
  while (true) {
    const action = yield take(chanName);
    yield put(action);
  }
}

const teamSaga = function* watchAll() {
  yield all([takeLatest(Constants.CREATE_TEAM.toString(), createTeam)]);
  yield fork(channelWatcher, retryActionChannel);
};

export default teamSaga;
