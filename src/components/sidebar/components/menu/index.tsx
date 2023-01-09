import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout } from '../../../../helpers/refreshToken';
import './index.scss';

declare interface IProps {
  options: {
    path: string;
    id: string;
    name: string;
    icon: string;
  }[];
  changeFilter: (id: string) => void;
}

const SidebarMenu = (props: IProps) => {
  return (
    <div className="side-links">
      <ul>
        {props.options.map(position => (
          <li key={position.path} style={{ display: position.id === 'search' ? 'none' : 'flex' }}>
            <NavLink onClick={() => props.changeFilter(position.id)} exact to={position.path}>
              <i className={`icon-${position.icon}`}></i> {position.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <ul>
        {/* <li className="mobile-menu">
          <NavLink to={'/settings'} onClick={e => e.preventDefault()}>
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
                    fill="#546e7a"
                    d="M17.93 9.093c0-.248.083-.5.083-.827a2.549 2.549 0 0 0-.083-.827l1.736-1.405a.389.389 0 0 0 .083-.5L18.1 2.645a.463.463 0 0 0-.5-.083l-2.067.827a7.85 7.85 0 0 0-1.405-.827L13.8.413A.333.333 0 0 0 13.466 0H10.16c-.165 0-.413.165-.413.331l-.331 2.232a6.236 6.236 0 0 0-1.405.827l-1.985-.827a.511.511 0 0 0-.579.165L3.794 5.621c-.083.083 0 .331.165.5L5.7 7.44c0 .248-.083.5-.083.827a2.549 2.549 0 0 0 .083.827L3.959 10.5a.389.389 0 0 0-.083.5l1.654 2.888a.463.463 0 0 0 .5.083l2.067-.827a7.85 7.85 0 0 0 1.405.827l.331 2.149a.378.378 0 0 0 .413.331h3.307c.165 0 .413-.165.413-.331l.331-2.149a7.85 7.85 0 0 0 1.405-.827l2.067.827a.4.4 0 0 0 .5-.165l1.653-2.893c.083-.165.083-.413-.083-.5zm-6.117 2.067a2.893 2.893 0 1 1 2.893-2.893 2.929 2.929 0 0 1-2.893 2.893z"
                    data-name="Path 1417"
                    transform="translate(-3.762)"
                  />
                </g>
              </g>
            </svg>
            تنظیمات
          </NavLink>
        </li> */}
        <li onClick={() => logout()} className="mobile-menu">
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
          <span>خروج</span>
        </li>
      </ul>
    </div>
  );
};

export default SidebarMenu;
