import Main from 'components/Main';
import * as React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Pages } from './Pages';

declare interface IProps {
  path: string[];
  exact: boolean;
  component: React.ComponentClass | React.FunctionComponent;
  redirectUrl: string;
  title?: string;
}

const mainRequired = (pathList: string[]): boolean => {
  let isInList = false;
  pathList.forEach(path => {
    if (Pages.includes(path)) {
      isInList = true;
    }
  });
  return isInList;
};

const isAuthenticated = window.localStorage.getItem('isAuthenticated');
const GuardRoute = (props: IProps) => {
  const path = props.path || [];
  // we can check user condition here such as role and permission but for now we just check user is login or not
  return isAuthenticated ? (
    mainRequired(path) ? (
      <Main title={props.title}>
        <Route path={[...path]} exact={props.exact} component={props.component} />
      </Main>
    ) : (
      <Route path={[...path]} exact={props.exact} component={props.component} />
    )
  ) : (
    <Redirect to={props.redirectUrl} />
  );
};
export default GuardRoute;
