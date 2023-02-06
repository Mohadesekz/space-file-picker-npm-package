import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Header from '../components/header/containers';
import FilesListContainer from '../components/files-list/containers';
import InformationContainer from '../components/information/containers';
import Breadcrumb from '../components/breadcrumb/containers';
import UploadBox from '../components/upload/containers';
import AlertSwitchToApp from '../components/alert-switch-to-app';
import { getMe } from '../components/header/actions';
import { connect } from 'react-redux';
import Spinner from '../components/loading';
import { IUser } from 'Interfaces/User.interface';
import { History, Location } from 'history';
import { match } from 'react-router';
import { Action, Dispatch } from 'redux';
import { IA_GetMe } from 'Interfaces/Actions.interface';
import SideBarContainer from 'components/sidebar/SideBarContainer';
import { ContextMenu } from '@blueprintjs/core';
declare interface IState {
  sideBarIsOpen: boolean;
  menuStatus: boolean;
  uploadBoxRef: React.RefObject<HTMLUnknownElement> | null;
  loading: boolean;
}

declare interface IProps {
  onGetMe: (onEnd: (userInfo: IUser | 'ERROR') => void) => void;
  match: match;
  history: History;
  location: Location;
  mode?: boolean;
}

class PodSpace extends Component<IProps, IState> {
  uploadBoxRef: React.RefObject<HTMLUnknownElement> = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      sideBarIsOpen: false,
      menuStatus: false,
      uploadBoxRef: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.getUserInfo();
  }

  componentDidUpdate(prevProps: any) {
    const isRouteChanged = this.props.location !== prevProps.location;
    if (isRouteChanged) {
      // Fixed: contextMenu not closing after changing the route
      ContextMenu.hide();
    }
  }

  infoSidebarToggle = () => {
    this.setState({ sideBarIsOpen: !this.state.sideBarIsOpen });
  };

  menuToggle = () => {
    this.setState({
      menuStatus: !this.state.menuStatus,
    });
  };

  getUserInfo = async () => {
    this.props.onGetMe((userInfo: IUser | 'ERROR') => {
      if (userInfo === 'ERROR') {
        //handle error condition
      } else {
        localStorage.setItem('username', userInfo.username);
        localStorage.setItem('fullName', userInfo.name);
        localStorage.setItem('avatar', userInfo.avatar || '');
        localStorage.setItem('userId', userInfo.ssoId);

        this.setState(
          {
            loading: false,
          },
          () => {
            setTimeout(() => {
              this.setState({
                uploadBoxRef: this.uploadBoxRef as React.RefObject<HTMLUnknownElement>,
              });
            });
          },
        );
      }
    });
  };

  render() {
    const routerProps = {
      match: this.props.match as match<{ page: string }>,
      location: this.props.location,
      history: this.props.history,
    };
    const { uploadBoxRef, loading } = this.state;
    return (
      <>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className={`app ${this.props.mode ? '' : 'bp3-dark'}`} key={0}>
              <Header {...routerProps} menuToggle={this.menuToggle} />
              {/* <AlertSwitchToApp /> */}
              <div className="app-intro">
                <section
                  className={`app-sidebar-overlay${this.state.menuStatus ? ' show' : ''}`}
                  onClick={this.menuToggle}
                />
                {uploadBoxRef ? (
                  <SideBarContainer
                    uploadBox={uploadBoxRef}
                    menuStatus={this.state.menuStatus}
                    menuToggle={this.menuToggle}
                    {...routerProps}
                  />
                ) : null}
                <section
                  className={`app-content${this.state.sideBarIsOpen ? ' info-nav-active' : ''}`}
                >
                  <Breadcrumb
                    infoSidebarToggle={this.infoSidebarToggle}
                    infoSidebarStatus={this.state.sideBarIsOpen}
                    menuToggle={this.menuToggle}
                    //@ts-ignore
                    navigation={this.props.history}
                  />
                  {uploadBoxRef ? (
                    //@ts-ignore
                    <FilesListContainer
                      uploadBox={uploadBoxRef}
                      infoSidebarToggle={this.infoSidebarToggle}
                      infoSidebarStatus={this.state.sideBarIsOpen}
                      {...routerProps}
                    />
                  ) : null}
                </section>
                <section
                  className={`app-information-overlay${this.state.sideBarIsOpen ? ' show' : ''}`}
                  onClick={this.infoSidebarToggle}
                />
                <section className={`app-information${!this.state.sideBarIsOpen ? ' closed' : ''}`}>
                  {this.state.sideBarIsOpen ? (
                    <InformationContainer
                      //@ts-ignore
                      showPreview={true}
                      infoSidebarToggle={this.infoSidebarToggle}
                      history={this.props.history}
                    />
                  ) : null}
                </section>
              </div>
            </div>
            <UploadBox
              //@ts-ignore
              ref={this.uploadBoxRef}
            />
          </>
        )}
      </>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action<IA_GetMe>>) => ({
  onGetMe(onEnd: (userInfo: IUser | 'ERROR') => void) {
    dispatch(getMe(onEnd));
  },
});

const mapStateToProps = (state: any) => ({
  mode: state.main.mode,
});
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PodSpace));
