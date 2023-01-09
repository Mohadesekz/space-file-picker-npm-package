import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from '@blueprintjs/core';
import { changeView } from '../files-list/actions';
import { Util } from '../../helpers';
import './index.scss';

class Breadcrumb extends PureComponent {
  mobileAndTabletCheck = Util.mobileAndTabletCheck();
  state = {
    team: null,
  };
  static propTypes = {
    breadcrumb: PropTypes.array.isRequired,
    infoSidebarToggle: PropTypes.func,
    infoSidebarStatus: PropTypes.bool,
    menuToggle: PropTypes.func,
    menuStatus: PropTypes.bool,
    viewSelection: PropTypes.string.isRequired,
    viewSelectionList: PropTypes.func.isRequired,
    viewSelectionGrid: PropTypes.func.isRequired,
    public: PropTypes.bool,
  };

  renderBreadcrumb = () => {
    let list = [];
    let breadcrumb = this.props.breadcrumb ? [...this.props.breadcrumb].reverse() : [];
    const filter = Util.getFilterByPath();

    const firstCrumb = this.props.public
      ? null
      : {
          link: filter.path,
          name: filter.name,
        };
    if (!this.props.public) {
      list = [firstCrumb];
    }

    breadcrumb = [
      ...breadcrumb.filter(
        crumb =>
          !(crumb.attributes && crumb.attributes[0] && crumb.attributes[0] === 'ROOT_FOLDER'),
      ),
    ]; // remove root folder from breadcrumb;

    breadcrumb.forEach(crumb => {
      list = [
        ...list,
        {
          link: this.props.public
            ? `/public/folders/${crumb.hash}`
            : (filter.path ? filter.path : '') + `/folders/${crumb.hash}`,
          name: crumb.name,
        },
      ];
    });

    const navigate = this.props.navigation.push;

    return (
      <>
        {list.length > 1 ? (
          <div className="pull-right bradcrumb-wrapper">
            <div
              className="head-title"
              onClick={() => {
                navigate(list[list.length - 2].link);
              }}
            >
              <p className="title">{list[list.length - 2].name}</p>
              <i className="icon-back"></i>
            </div>

            <div className="items">
              <ul>
                {list.map((crumb, index) => {
                  return (
                    <Fragment key={index}>
                      {index > 0 && <i className="icon-to-left"></i>}
                      <li key={index}>
                        <span
                          onClick={() => {
                            navigate(crumb.link);
                          }}
                          className={index === list.length - 1 ? 'inactive' : ''}
                        >
                          {crumb.name}
                        </span>
                      </li>
                    </Fragment>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  findTeam = folderHash => {
    const team = this.props.teams.find(team => team.folder === folderHash);
    return (
      <>
        {team && (
          <>
            <div className="avatar">
              {team.avatar ? (
                <img src={team.avatar} width="55" height="55" alt="team-avatar" />
              ) : (
                <Icon iconSize={25} icon="people" />
              )}
            </div>
            <h3 className="team-name">
              <label> نام سازمان : </label>
              <span className="name">{team.name}</span>
            </h3>
          </>
        )}
      </>
    );
  };

  isItTeam = () => {
    const breadCrumbList = this.props.breadcrumb;
    return (
      breadCrumbList &&
      breadCrumbList[breadCrumbList.length - 1] &&
      breadCrumbList[breadCrumbList.length - 1].attributes &&
      breadCrumbList[breadCrumbList.length - 1].attributes[0] === 'TEAM_FOLDER'
    );
  };

  render() {
    return (
      <div className="breadcrumb">
        {/* {!this.props.public ? (
          <Icon className="icon-menu" onClick={this.props.menuToggle} iconSize={20} icon="menu" />
        ) : null} */}

        {this.isItTeam() ? (
          <div className="team">
            {this.findTeam(this.props.breadcrumb[this.props.breadcrumb.length - 1].hash)}
          </div>
        ) : null}
        {this.renderBreadcrumb()}
        {!this.props.public && !this.mobileAndTabletCheck && (
          <div className="pull-left">
            <div className="tools">
              <i
                className={`icon-info${
                  this.props.infoSidebarStatus
                    ? ' active'
                    : this.props.selectedCount > 1
                    ? ' disabled'
                    : ''
                }`}
                onClick={this.props.selectedCount > 1 ? null : this.props.infoSidebarToggle}
              />
            </div>
          </div>
        )}

        <div className="pull-left">
          <div className="view-selection">
            <span className="text">شیوه نمایش</span>

            <span
              className={`bp3-icon-standard bp3-icon-list${
                this.props.viewSelection === 'list' ? ' active' : ''
              }`}
              onClick={this.props.viewSelectionList}
            />

            <span
              className={`bp3-icon-standard bp3-icon-grid-view${
                this.props.viewSelection === 'grid' ? ' active' : ''
              }`}
              onClick={this.props.viewSelectionGrid}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  viewSelectionList() {
    dispatch(changeView('list'));
  },
  viewSelectionGrid() {
    dispatch(changeView('grid'));
  },
});

const mapStateToProps = state => ({
  viewSelection: state.files.list.view,
  teams: state.userTeams.teams,
  selectedCount: state.files.list.selectedCount,
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Breadcrumb);
