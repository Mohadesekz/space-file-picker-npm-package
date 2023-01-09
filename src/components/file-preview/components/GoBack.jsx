import React from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import backtSvg from '../../../assets/icons/arrow.svg';
import './Scss/GoBack.scss';
import { unSelectAll } from '../../files-list/actions';
import defaultAvatar from '../../../assets/images/default-avatar.png';

const mapDispatchToProps = dispatch => ({
  onUnSelectAll: () => dispatch(unSelectAll()),
});

const GoBack = props => {
  const history = useHistory();
  const username = localStorage.getItem('fullName');
  const avatar = localStorage.getItem('avatar');
  return (
    <div
      className="icon-btn"
      onClick={() => {
        if (props.lastRoute) {
          props.onUnSelectAll();
          history.push(props.lastRoute);
        }
      }}
    >
      <div className="username">{username}</div>
      <div className="user-avatar">
        {avatar ? (
          <img src={avatar} width="40" height="40" alt="avatar" />
        ) : (
          <img src={defaultAvatar} width="35" height="35" alt="avatar" />
        )}
      </div>
      {props.lastRoute ? <img width="14" alt="" src={backtSvg} /> : null}
    </div>
  );
};

export default connect(null, mapDispatchToProps)(GoBack);
