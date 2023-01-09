import * as React from 'react';
import { useReducer } from 'react';
import Header from '../header/containers';
import UploadBox from '../upload/containers';
import { withRouter } from 'react-router';
import { Icon } from '@blueprintjs/core';
import { match } from 'react-router';
import { History, Location } from 'history';
import './index.scss';
import SideBarContainer from 'components/sidebar/SideBarContainer';

declare interface IProps {
  children: any;
  match: match;
  history: History;
  location: Location;
  title?: string;
}

declare interface IState {
  sideBarIsOpen: boolean;
  menuStatus: boolean;
}

declare interface AI_ChangeMenu {
  type: 'CHANGE_MENU_STATE';
}

const reducer = (state: IState, action: AI_ChangeMenu) => {
  switch (action.type) {
    case 'CHANGE_MENU_STATE':
      return { ...state, menuStatus: !state.menuStatus };
    default:
      throw new Error();
  }
};

const Index: (props: IProps) => JSX.Element = (props: IProps) => {
  const initialState = {
    sideBarIsOpen: false,
    menuStatus: false,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const uploadBoxRef: React.RefObject<HTMLUnknownElement> = React.createRef();
  const { children } = props;
  const routerProps = {
    match: props.match as match<{ page: string }>,
    location: props.location,
    history: props.history,
  };

  return (
    <>
      <Header {...routerProps} menuToggle={() => dispatch({ type: 'CHANGE_MENU_STATE' })} />
      <div className="main-container">
        <section
          onClick={() => dispatch({ type: 'CHANGE_MENU_STATE' })}
          className={`app-sidebar-overlay ${state.menuStatus ? 'show' : ''}`}
        ></section>
        <SideBarContainer
          uploadBox={uploadBoxRef}
          menuStatus={state.menuStatus}
          menuToggle={() => dispatch({ type: 'CHANGE_MENU_STATE' })}
          {...routerProps}
        />
        <div className="page-container">
          <div className="toggle-sidebar">
            <Icon
              iconSize={20}
              icon="menu"
              onClick={() => dispatch({ type: 'CHANGE_MENU_STATE' })}
            />
            {props.title ? <h1> {props.title} </h1> : null}
          </div>
          {children}
        </div>
        <UploadBox
          //@ts-ignore
          ref={uploadBoxRef}
          key={1}
        />
      </div>
    </>
  );
};

export default withRouter(Index);
