import React from 'react';
import AppLogo from '../components/app-logo';
import Search from '../components/search';
import { Icon } from '@blueprintjs/core';
import UserSettings from '../components/user';
import LightDark from '../components/light-dark';
import backtSvg from '../../../assets/icons/arrow.svg';
import { useHistory } from 'react-router-dom';
import './index.scss';

const Header = props => {
  const routerProps = {
    match: props.match,
    location: props.location,
    history: props.history,
  };
  const history = useHistory();

  return (
    <header className="app-header">
      <AppLogo />
      {!props.public && (
        <div className="app-nav">
          {/* <div className="toggle-menu">
            <Icon className="icon-menu" onClick={props.menuToggle} iconSize={20} icon="menu" />
            <h1>پاداسپیس</h1>
          </div> */}
          {/* <Search {...routerProps} /> */}
          <div className="user-settings pull-left">
            <UserSettings />
          </div>
          <LightDark />
        </div>
      )}
      {props.public && (
        <div
          className="icon-btn"
          onClick={() => {
            history.push('/');
          }}
        >
          <img width="14" alt="" src={backtSvg} />
        </div>
      )}
    </header>
  );
};

export default Header;
