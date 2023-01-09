import { applyMiddleware, createStore, combineReducers } from 'redux';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { fork, all } from 'redux-saga/effects';
import {
  SelectedReducer,
  FilesReducer,
  TrashReducer,
  CopyReducer,
  RecentReducer,
} from './components/files-list/reducers';
import { SpaceReducer, FilterReducer } from './components/sidebar/reducers';
import UploadReducer from './components/upload/reducers';
import { ActivityReducer, ShareReducer, HistoryReducer } from './components/information/reducers';

import watchAllActivity from './components/information/sagas';
import settingsSaga from './components/Settings/sagas';
import teamSaga from './components/TeamSpace/sagas';
import headerSaga from './components/header/sagas';
import watchAllSidebar from './components/sidebar/sagas';
import watchAllFilesList from './components/files-list/sagas';
import watchAllUpload from './components/upload/sagas';
import TeamReducer from 'components/header/reducers';
import exceptionSaga from 'components/Main/Sagas';
import MainReducer from 'components/Main/Reducer';

const sagaMiddleware = createSagaMiddleware();

let middleware: any[] = [sagaMiddleware];
if (process.env.NODE_ENV !== 'production') {
  // middleware.push(logger);//TODO: uncomment when needed
}

export default createStore(
  combineReducers({
    files: combineReducers({
      list: FilesReducer,
      copy: CopyReducer,
      trash: TrashReducer,
      activities: ActivityReducer,
      histories: HistoryReducer,
      shares: ShareReducer,
      selected: SelectedReducer,
      recents: RecentReducer,
    }),
    sidebar: combineReducers({
      space: SpaceReducer,
      filter: FilterReducer,
    }),
    upload: UploadReducer,
    userTeams: TeamReducer,
    main: MainReducer,
  }),
  applyMiddleware(...middleware),
);

// Sagas
function* watchAll() {
  yield all([
    fork(watchAllFilesList),
    fork(watchAllSidebar),
    fork(watchAllUpload),
    fork(watchAllActivity),
    fork(settingsSaga),
    fork(teamSaga),
    fork(headerSaga),
    fork(exceptionSaga),
  ]);
}
sagaMiddleware.run(watchAll);
