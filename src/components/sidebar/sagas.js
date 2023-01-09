import { channel } from 'redux-saga';
import { call, delay, put, all, take, fork, takeEvery, takeLatest } from 'redux-saga/effects';
import Constants from './constants';
import { newFetch } from '../../helpers';
import { throw_exception } from '../Main/Actions';

import {
  fetchSpaceSuccess,
  fetchSpaceFailure,
  fetchPlanSuccess,
  fetchPlanFailure,
} from './actions';

const fetchSpaceAlertChannel = channel();
const fetchPlanAlertChannel = channel();

function* fetchSpace(action) {
  try {
    const result = yield call(newFetch, 'me/status', 'GET');
    if (result.type === 'ERROR') {
      yield put(fetchSpaceFailure());
    } else {
      yield put(fetchSpaceSuccess(result));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* fetchPlan(action) {
  try {
    const result = yield call(newFetch, 'plans', 'GET');
    if (result.type === 'ERROR') {
      yield put(fetchPlanFailure());
    } else {
      yield put(fetchPlanSuccess(result));
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* upgradePlanCheckPayment(action) {
  const { params } = action;

  try {
    const { billNumber, paymentBillNumber, invoiceId, terminalId, maskedCardNumber, rrn } = params;
    const allParams = `billNumber=${billNumber}&paymentBillNumber=${paymentBillNumber}&invoiceId=${invoiceId}&terminalId=${terminalId}&maskedCardNumber=${maskedCardNumber}&rrn=${rrn}`;
    const result = yield call(
      newFetch,
      'plan/validate?' + allParams,
      'POST',
      {},
      {},
      false,
      undefined,
      undefined,
      false,
    );
    if (result.type !== 'ERROR') {
      params.onSuccess(result);
    } else {
      params.onError(result);
    }
  } catch (error) {
    yield put(throw_exception(error));
  }
}

function* checkPlanStatus(action) {
  const userToken = localStorage.getItem('access_token');
  const result = yield call(
    newFetch,
    `plan/${action.hashPlan}/detail?redirectURL=${window.location.origin}/payment&Authorization=bearer ${userToken}`,
    'GET',
  );
  action.onEnd(result.type !== 'ERROR');
}

function* getAndroidLink(action) {
  yield delay(1000);
  const result = yield call(
    newFetch,
    'versions/android',
    'GET',
    undefined,
    undefined,
    undefined,
    undefined,
    null,
    false,
  );
  if (result.type !== 'ERROR') {
    action.onEnd(result);
  }
}

function* channelWatcher(chanName) {
  while (true) {
    const action = yield take(chanName);
    yield put(action);
  }
}

export default function* watchAll() {
  yield all([
    takeEvery(Constants.FETCH_SPACE_REQUEST.toString(), fetchSpace),
    takeEvery(Constants.FETCH_PLAN_REQUEST.toString(), fetchPlan),
    takeLatest(Constants.UPGRADE_PLAN_CHECK_PAYMENT.toString(), upgradePlanCheckPayment),
    takeLatest(Constants.PLAN_CHECK.toString(), checkPlanStatus),
    takeLatest(Constants.GET_ANDROID_LINK.toString(), getAndroidLink),
  ]);

  yield fork(channelWatcher, fetchSpaceAlertChannel, fetchPlanAlertChannel);
}
