import React, { Component, createRef } from 'react';
import { getTeams } from '../../actions';
import { Popover, Position } from '@blueprintjs/core';
import { changeFolder } from '../../../files-list/actions';
import { logout } from '../../../../helpers/refreshToken';
import defaultAvatar from '../../../../assets/icons/default-avatar.png';
import TermsAndCondition from '../terms-condition';
import { Icon } from '@blueprintjs/core';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Manifest from '../../../../manifest';
import { Util } from '../../../../helpers';
import './index.scss';

class UserSettings extends Component {
  menuRef = createRef();
  constructor() {
    super();
    this.state = {
      toggleDialogTermsCondition: false,
    };
  }

  componentDidMount() {
    this.props.onGetTeams();
  }
  logout = () => logout(true);

  toggleDialogTermsCondition = () => {
    this.setState({ toggleDialogTermsCondition: !this.state.toggleDialogTermsCondition });
  };

  render() {
    const fullName = window.localStorage.getItem('fullName');
    const avatar = window.localStorage.getItem('avatar');
    const teams = [];
    const logOutMenu = (
      <ul className="bp3-menu bp3-elevation-1 users-info">
        <li className="bp3-menu-header" style={{ margin: 0 }}>
          {/* {teams && teams.length === 0 ? (
            <button type="button" className="bp3-menu-item" disabled>
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14.438"
                  height="10.5"
                  viewBox="0 0 14.438 10.5"
                >
                  <g id="prefix__person" transform="translate(-1 -74.5)">
                    <g id="prefix__person-add" transform="translate(0 76.5)">
                      <path
                        id="prefix__Path_1416"
                        fill="#90a4ae"
                        d="M9.188 81.75a2.625 2.625 0 1 0-2.625-2.625 2.633 2.633 0 0 0 2.625 2.625zm-5.907-1.312v-1.969H1.969v1.969H0v1.312h1.969v1.969h1.312V81.75H5.25v-1.312zm5.906 2.625c-1.772 0-5.25.853-5.25 2.625V87h10.5v-1.312c.001-1.772-3.478-2.625-5.249-2.625z"
                        data-name="Path 1416"
                        transform="translate(1 -78.5)"
                      />
                    </g>
                  </g>
                </svg>
              </span>
              افزودن حساب کاربری
            </button>
          ) :
          null} */}
          <ul className="sub-menu">
            {teams &&
              teams.map(team => (
                <Link
                  to={`/folders/${team.folder}`}
                  key={team.hash}
                  onClick={() => {
                    if (window.location.pathname !== `/folders/${team.folder}`) {
                      this.props.onChangeFolder();
                    }
                  }}
                >
                  <li className="user-list">
                    <Icon icon="user" iconSize={16} color="#90a4ae" />
                    <p className="username">{team.name}</p>
                  </li>
                </Link>
              ))}
          </ul>
        </li>
        {/* <li>
          <button type="button" className="bp3-menu-item" disabled>
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16.207"
                height="16.451"
                viewBox="0 0 16.207 16.451"
              >
                <g id="prefix__adjust" transform="translate(-3.762)">
                  <g id="prefix__settings" transform="translate(3.762)">
                    <path
                      id="prefix__Path_1417"
                      fill="#90a4ae"
                      d="M17.93 9.093c0-.248.083-.5.083-.827a2.549 2.549 0 0 0-.083-.827l1.736-1.405a.389.389 0 0 0 .083-.5L18.1 2.645a.463.463 0 0 0-.5-.083l-2.067.827a7.85 7.85 0 0 0-1.405-.827L13.8.413A.333.333 0 0 0 13.466 0H10.16c-.165 0-.413.165-.413.331l-.331 2.232a6.236 6.236 0 0 0-1.405.827l-1.985-.827a.511.511 0 0 0-.579.165L3.794 5.621c-.083.083 0 .331.165.5L5.7 7.44c0 .248-.083.5-.083.827a2.549 2.549 0 0 0 .083.827L3.959 10.5a.389.389 0 0 0-.083.5l1.654 2.888a.463.463 0 0 0 .5.083l2.067-.827a7.85 7.85 0 0 0 1.405.827l.331 2.149a.378.378 0 0 0 .413.331h3.307c.165 0 .413-.165.413-.331l.331-2.149a7.85 7.85 0 0 0 1.405-.827l2.067.827a.4.4 0 0 0 .5-.165l1.653-2.893c.083-.165.083-.413-.083-.5zm-6.117 2.067a2.893 2.893 0 1 1 2.893-2.893 2.929 2.929 0 0 1-2.893 2.893z"
                      data-name="Path 1417"
                      transform="translate(-3.762)"
                    />
                  </g>
                </g>
              </svg>
            </span>
            تنظیمات
          </button>
        </li> */}
        {/* <li>
          <button type="button" className="bp3-menu-item" disabled>
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="prefix__question"
                width="15.955"
                height="15.955"
                viewBox="0 0 15.955 15.955"
              >
                <path
                  id="prefix__Path_1366"
                  fill="#90a4ae"
                  d="M208.443 203.286a5.173 5.173 0 0 0-2.837-4.606 7.035 7.035 0 0 1-6.927 6.927 5.159 5.159 0 0 0 7.23 2.12l2.511.694-.694-2.511a5.139 5.139 0 0 0 .717-2.624zm0 0"
                  className="prefix__cls-1"
                  data-name="Path 1366"
                  transform="translate(-192.489 -192.489)"
                />
                <path
                  id="prefix__Path_1367"
                  d="M12.184 6.092A6.092 6.092 0 1 0 .845 9.189l-.823 2.973L3 11.339a6.093 6.093 0 0 0 9.189-5.247zM5.157 4.674h-.935a1.87 1.87 0 1 1 3.131 1.38l-.794.727v.729h-.934V6.369l1.1-1a.925.925 0 0 0 .3-.69.935.935 0 0 0-1.87 0zm.467 3.771h.936v.935h-.935zm0 0"
                  className="prefix__cls-1"
                  fill="#90a4ae"
                  data-name="Path 1367"
                />
              </svg>
            </span>
            ارتباط با ما
          </button>
        </li> */}
        <li>
          <button type="button" className="bp3-menu-item" onClick={this.toggleDialogTermsCondition}>
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14">
                <path
                  fill="#90a4ae"
                  fillRule="evenodd"
                  d="M7 0C3.15 0 0 3.15 0 7s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7zm1 11H6V6h2v5zm0-6H6V3h2v2z"
                />
              </svg>
            </span>
            قوانین و مقررات استفاده
          </button>
        </li>
        <li>
          <button type="button" className="bp3-menu-item" onClick={this.logout}>
            <span className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="prefix__logout"
                width="15.605"
                height="15.605"
                viewBox="0 0 15.605 15.605"
              >
                <path
                  fill="#90a4ae"
                  id="prefix__Path_1348"
                  d="M9.753 8.457a.65.65 0 0 0-.65.65v2.6a.651.651 0 0 1-.65.65H6.5V2.6a1.311 1.311 0 0 0-.886-1.236l-.19-.064h3.029a.651.651 0 0 1 .65.65v1.955a.65.65 0 1 0 1.3 0V1.954A1.953 1.953 0 0 0 8.453 0h-6.99a.511.511 0 0 0-.07.014C1.362.015 1.332 0 1.3 0A1.3 1.3 0 0 0 0 1.3V13a1.311 1.311 0 0 0 .886 1.236l3.913 1.3a1.346 1.346 0 0 0 .4.06 1.3 1.3 0 0 0 1.3-1.3v-.65h1.954a1.953 1.953 0 0 0 1.947-1.938v-2.6a.65.65 0 0 0-.65-.65zm0 0"
                  className="prefix__cls-1"
                  data-name="Path 1348"
                  transform="translate(0 -.004)"
                />
                <path
                  fill="#90a4ae"
                  id="prefix__Path_1349"
                  d="M284.294 109.457l-2.6-2.6a.65.65 0 0 0-1.11.46v1.951h-2.6a.65.65 0 1 0 0 1.3h2.6v1.951a.65.65 0 0 0 1.11.46l2.6-2.6a.65.65 0 0 0 0-.922zm0 0"
                  className="prefix__cls-1"
                  data-name="Path 1349"
                  transform="translate(-268.879 -103.415)"
                />
              </svg>
            </span>
            خروج
          </button>
        </li>
        <li className="bp3-menu-divider"></li>
        <li>
          <span className="version">نسخه {Util.toPersinaDigit(Manifest.version)} </span>
        </li>
      </ul>
    );

    return (
      <div className="user-dropdown">
        <p>{fullName}</p>
        <Popover content={logOutMenu} position={Position.BOTTOM}>
          {avatar && avatar !== '' ? (
            <div
              className="user"
              style={{
                backgroundImage: `url(${avatar})`,
              }}
            ></div>
          ) : (
            <div
              className="user"
              style={{
                backgroundImage: `url(${defaultAvatar})`,
              }}
            ></div>
          )}
        </Popover>
        <TermsAndCondition
          open={this.state.toggleDialogTermsCondition}
          close={this.toggleDialogTermsCondition}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onGetTeams() {
    dispatch(getTeams());
  },
  onChangeFolder: () => {
    dispatch(changeFolder(null, null));
  },
});
const mapStateToProps = state => ({
  teams: state.userTeams.teams,
});

export default connect(mapStateToProps, mapDispatchToProps, null)(UserSettings);
