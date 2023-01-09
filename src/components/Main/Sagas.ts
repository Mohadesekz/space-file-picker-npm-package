import { all, takeLatest } from 'redux-saga/effects';
import { Constants } from './Constants';
import * as Sentry from '@sentry/react';

declare interface IA_ErrorException {
  type: 'EXCEPTION_ERROR';
  error: Error;
}

function* handleSagaExceptions(action: IA_ErrorException) {
  if (process.env.NODE_ENV === 'development' && action.error) {
    throw action.error;
  }
  yield Sentry.captureException(action.error);
}

const exceptionSaga = function* watchAll() {
  yield all([takeLatest(Constants.EXCEPTION_ERROR, handleSagaExceptions)]);
};

export default exceptionSaga;
