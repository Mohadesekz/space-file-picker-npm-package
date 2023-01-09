import React, { useState } from 'react';
import { Tab, Tabs, Spinner } from '@blueprintjs/core';
import AccountSettings from './Components/AccountSettings';
import FtpOtp from './Components/FtpAccount';
import Devices from './Components/Devices';
import UsersInfo from './Components/UsersInfo';
import RemoveTrash from './Components/RemoveTrash';
import { connect } from 'react-redux';
import './index.scss';

const Index = props => {
  const [selectedTabId, setActiveTab] = useState();
  const handleTabChange = event => {
    setActiveTab(event);
  };
  const teams = props.teams;
  return (
    <div className="settings-container">
      <AccountSettings />
      <FtpOtp />
      <Devices />
      {/* <Business /> */}
      <div className="main-wrapper">
        <h4 className="title"> اطلاعات اعضای سازمان</h4>
        {teams ? (
          Object.keys(teams).length > 0 ? (
            <Tabs
              className="tabs"
              id="TabsExample"
              onChange={handleTabChange}
              selectedTabId={selectedTabId}
            >
              {teams.map(team => (
                <Tab
                  key={team.hash}
                  id={team.hash}
                  title={team.name}
                  panel={<UsersInfo team={team} />}
                  panelClassName="ember-panel"
                />
              ))}
              <Tabs.Expander />
            </Tabs>
          ) : (
            <div className="empty-message">
              هنوز سازمانی اضافه نشده است.
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="prefix__error"
                  width="14.057"
                  height="14.057"
                  viewBox="0 0 14.057 14.057"
                >
                  <g id="prefix__Group_133" data-name="Group 133">
                    <path
                      id="prefix__Path_1347"
                      fill="#90a4ae"
                      d="M7.029 0a7.029 7.029 0 1 0 7.029 7.029A7.037 7.037 0 0 0 7.029 0zm0 11.714a.586.586 0 1 1 .586-.586.586.586 0 0 1-.586.586zm.586-2.05a.293.293 0 0 1-.293.293h-.586a.293.293 0 0 1-.293-.293V2.636a.293.293 0 0 1 .293-.293h.586a.293.293 0 0 1 .293.293z"
                      data-name="Path 1347"
                    />
                  </g>
                </svg>
              </span>
            </div>
          )
        ) : (
          <div className="spinner-container">
            <Spinner size={30} />
          </div>
        )}
      </div>
      <RemoveTrash />
    </div>
  );
};

const mapStateToProps = state => ({
  teams: state.userTeams.teams,
});
export default connect(mapStateToProps, null)(Index);
