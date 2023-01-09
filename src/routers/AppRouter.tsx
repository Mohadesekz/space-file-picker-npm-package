import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  RouteComponentProps,
} from 'react-router-dom';
import Loadable from 'react-loadable';
import Loading from '../components/loading';
import NoMatch from '../components/nomatch';
import AuthPage from '../app/auth';
import Manifest from '../manifest';
import '../stylesheet/App.scss';
import GuardRoute from './GuardRoute';
import Tools from 'components/Tools';

const LoadableDrive = Loadable({
  loader: () => import('../app/drive'),
  loading: Loading,
});

// const LoadablePublicDrive = Loadable({
//   loader: () => import('../app/publicDrive'),
//   loading: Loading,
// });

// const LoadableFilePreview = Loadable({
//   loader: () => import('../components/file-preview'),
//   loading: Loading,
// });

// const LoadablePayment = Loadable({
//   loader: () => import('../app/payment'),
//   loading: Loading,
// });

const LoadableTerms = Loadable({
  loader: () => import('../components/header/components/terms-condition/terms-condition-text'),
  loading: Loading,
});

// const LoadablePublicVideo = Loadable({
//   loader: () => import('../app/publicVideo'),
//   loading: Loading,
// });

// const LoadableTeamSpace = Loadable({
//   loader: () => import('../components/TeamSpace'),
//   loading: Loading,
// });

const parse_query_string = (query: any) => {
  const vars = query.split('&');
  const query_string: any = {};
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

const AuthComponent = () => {
  const isAuthenticated = window.localStorage.getItem('isAuthenticated');
  const params = parse_query_string(window.location.hash.replace('#', ''));
  if (isAuthenticated && params.renew !== 'true') {
    return <Redirect to="/my-space" />;
  }

  return <AuthPage />;
};

// const PublicComponent = ({ match }: RouteComponentProps<{ folderHash: string }>) => {
//   return <LoadablePublicDrive publicFolderId={match.params.folderHash} />;
// };

// const FilePreviewComponent = ({ match }: RouteComponentProps<{ fileHash: string }>) => {
//   return <LoadableFilePreview fileHash={match.params.fileHash} />;
// };

const LandingPageComponent = () => {
  const isAuthenticated = window.localStorage.getItem('isAuthenticated');
  if (!isAuthenticated && Manifest.environment === 'prod') {
    window.location.href = 'http://office.pod.ir/space.html';
    return <></>;
  } else {
    return <Redirect to="/my-space" />;
  }
};

const TermsComponent = () => {
  return <LoadableTerms fullHeight={true} />;
};

const loginPath = `/auth?back_url=${window.location.pathname}`;
const isItDirectLink =
  new URLSearchParams(window.location.search).get('dl') &&
  window.location.pathname.startsWith('/file/');
if (isItDirectLink) {
  // window.location.replace(window.location.href); //TODO: fix download direct file
}

export default () => (
  <>
    <Tools />
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPageComponent} />
        <Route exact path="/user/terms" component={TermsComponent} />
        {/* <Route path={['/payment/:android', '/payment/']} component={LoadablePayment} /> */}
        {/* <Route path="/video/:videoHash" render={() => <LoadablePublicVideo />} /> */}
        {/* <Route exact path="/public/folders/:folderHash" render={PublicComponent} /> */}
        <Route
          path="/auth(#accessToken=.+&refreshToken=.+&expiresIn=[0-9]+)?"
          component={AuthComponent}
        />
        {/* <Route exact={true} path={['/file/:fileHash']} component={FilePreviewComponent} /> */}

        <GuardRoute
          redirectUrl={loginPath}
          exact
          path={[
            '/my-space/folders/:folderHash',
            // '/recent/folders/:folderHash',
            // '/shared-with-me/folders/:folderHash',
            // '/bookmark/folders/:folderHash',
            // '/search/folders/:folderHash',
          ]}
          component={LoadableDrive}
        />

        <GuardRoute
          redirectUrl={loginPath}
          exact
          path={[
            '/my-space',
            //  '/recent', '/shared-with-me', '/bookmark', '/trash', '/search'
          ]}
          component={LoadableDrive}
        />
        {/* <GuardRoute
        title="مدیریت و تنظیمات حساب"
        redirectUrl={loginPath}
        exact
        path={['/settings']}
        component={LoadableSettings}
      /> */}
        {/* <GuardRoute
          redirectUrl={loginPath}
          exact
          path={['/team-space']}
          component={LoadableTeamSpace}
        /> */}
        <GuardRoute exact redirectUrl={loginPath} path={['/404']} component={NoMatch} />
        {/* <Route exact path={['/404']} component={NoMatch} /> */}
        <GuardRoute exact redirectUrl={loginPath} path={['/*']} component={NoMatch} />
      </Switch>
    </Router>
  </>
);
