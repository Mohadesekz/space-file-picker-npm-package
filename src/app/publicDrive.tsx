import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Header from '../components/header/containers';
import FilesListContainer from '../components/files-list/containers';
import Breadcrumb from '../components/breadcrumb/containers';
import { connect } from 'react-redux';
import { History, Location } from 'history';
import { match } from 'react-router';

interface IProps {
  publicFolderId: string;
  match: match;
  history: History;
  location: Location;
}

const mapStateToProps = (state: any) => ({
  ...state,
});
class PodSpacePublic extends Component<IProps, {}> {
  render() {
    const routerProps = {
      match: this.props.match,
      location: this.props.location,
      history: this.props.history,
    };

    return (
      <main>
        <div className="app">
          <Header public />
          <div className="app-intro">
            <section className="app-content is-public">
              <Breadcrumb
                public
                infoSidebarStatus={false}
                //@ts-ignore
                navigation={this.props.history}
              />
              <FilesListContainer
                public
                infoSidebarStatus={false}
                //@ts-ignore
                publicFolderId={this.props.publicFolderId}
                {...routerProps}
              />
            </section>
          </div>
        </div>
      </main>
    );
  }
}
export default connect(mapStateToProps)(withRouter(PodSpacePublic));
