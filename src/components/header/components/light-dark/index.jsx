import React, { useEffect } from 'react';
import { Icon } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { themeMode } from '../../../Main/Actions';

const Index = props => {
  const lightMode = () => {
    window.localStorage.setItem('mode', 'LIGHT');
    document.body.classList.remove('bp3-dark');
    props.onThemeMode(true);
  };
  const darkMode = () => {
    window.localStorage.setItem('mode', 'DARK');
    document.body.classList.add('bp3-dark');
    props.onThemeMode(false);
  };

  useEffect(() => {
    const lastMode = window.localStorage.getItem('mode');
    if (lastMode === 'DARK') {
      document.body.classList.add('bp3-dark');
      props.onThemeMode(false);
    }
    return () => {};
  }, [props]);

  return (
    <div className="change-mode" onClick={props.mode ? darkMode : lightMode}>
      {props.mode ? (
        <Icon icon="moon" iconSize={13} />
      ) : (
        <Icon icon="flash" iconSize={13} style={{ color: '#d7dde0' }} />
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  mode: state.main.mode,
});
const mapDispatchToProps = dispatch => ({
  onThemeMode: mode => {
    dispatch(themeMode(mode));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Index);
