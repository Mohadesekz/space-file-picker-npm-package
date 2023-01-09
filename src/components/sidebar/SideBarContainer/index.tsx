import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  changeFilter,
  fetchSpaceRequest,
  fetchPlanRequest,
  checkPlan,
  getAndroidLink,
} from '../actions';
import { unSelectItem, resetSortFiles } from '../../files-list/actions';
import { match } from 'react-router';
import { History, Location } from 'history';
import { Util } from '../../../helpers';
import { IS_Space } from 'Interfaces/App.interface';
import AndroidAppIcon from '../../../assets/images/android-app.svg';
import Manifest from '../../../manifest';
import { Icon } from '@blueprintjs/core';
import SidebarMenu from '../components/menu';
import './index.scss';
import SidebarSpace from '../components/SidebarSpace';
import SidebarUpload from '../components/SidebarUpload';

declare interface IState {
  link: string | null;
}

declare interface IProps {
  match: match<{
    page: string;
  }>;
  history: History;
  location: Location;
  filter: {
    selected: string;
    options: any[];
  };
  selected: {
    empty: boolean;
    data: any[];
  };
  changeFilter: (id: string, body: any) => void;
  onUnSelectItem: () => void;
  onResetSortFile: () => void;
  menuToggle: () => void;
  getSpace: () => void;
  getPlans: () => void;
  onGetAndroidLink: (
    onEnd: (result: {
      id: number;
      link: { [key: string]: string };
      message: string;
      minimumVersion: number;
      version: number;
      versionName: string;
    }) => void,
  ) => void;
  onCheckPlan: (planHash: string, onEnd: (result: boolean) => void) => void;
  uploadBox: React.RefObject<HTMLUnknownElement>;
  currentHash: string;
  space: IS_Space;
  menuStatus: boolean;
}

class SideBarContainer extends Component<IProps, IState> {
  private sidebarArea: React.RefObject<HTMLUnknownElement>;
  constructor(props: IProps) {
    super(props);
    this.sidebarArea = React.createRef();
  }

  componentDidMount() {
    const { onGetAndroidLink } = this.props;

    onGetAndroidLink(result => {
      const { link } = result;
      this.setState({ link: link['podspace'] });
    });
    if (this.sidebarArea && this.sidebarArea.current) {
      this.sidebarArea.current!.addEventListener('mouseup', this.mouseUpListenerForItemUnSelection);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (
      prevProps.match.params.page !== this.props.match.params.page ||
      prevProps.location.search !== this.props.location.search
    ) {
      this.changeRoute();
    }
  }

  shouldComponentUpdate(nextProps: IProps) {
    if (
      !Object.is(this.props.filter.selected, nextProps.filter.selected) ||
      !Object.is(this.props.space.isLoading, nextProps.space.isLoading) ||
      !Object.is(this.props.space.hasError, nextProps.space.hasError) ||
      !Object.is(this.props.currentHash, nextProps.currentHash) ||
      !Object.is(this.props.menuStatus, nextProps.menuStatus) ||
      !Object.is(this.props.match.params.page, nextProps.match.params.page) ||
      !Object.is(this.props.location.search, nextProps.location.search)
    ) {
      return true;
    } else {
      return false;
    }
  }

  mouseUpListenerForItemUnSelection = () => {
    if (!this.props.selected.empty) {
      this.props.onUnSelectItem();
    }
  };

  changeFilter = (id: string, body: any = undefined) => {
    this.props.onResetSortFile();
    this.props.menuToggle();
    this.props.changeFilter(id, body);
  };

  handleSearchRoute = (queryParams: string) => {
    const params = Util.getUrlParams(queryParams);
    this.changeFilter('search', params);
  };

  changeRoute = () => {
    const pagePath = this.props.match.params.page ? this.props.match.params.page : null;
    const queryParams: string = this.props.location.search;

    if (pagePath) {
      const { options } = this.props.filter;
      const filter = options.find(option => {
        return Object.is(option.path, `/${pagePath}`);
      });

      switch (true) {
        case filter && filter.id && filter.id !== 'search':
          this.changeFilter(filter.id);
          break;

        case filter && filter.id && filter.id === 'search':
          if (queryParams === '') {
            this.props.history.push('/my-space');
          } else {
            this.handleSearchRoute(queryParams);
          }
          break;

        default:
          this.props.history.push('/404');
          break;
      }
    }
  };

  render() {
    return (
      <aside
        className={`app-sidebar${this.props.menuStatus ? ' show' : ''}`}
        ref={this.sidebarArea}
      >
        <Icon
          className="icon-close"
          iconSize={20}
          icon="cross"
          onClick={() => this.props.menuToggle()}
        />
        <div className="main-sidebar-wrapper">
          <SidebarMenu {...this.props.filter} changeFilter={this.changeFilter} />

          <SidebarSpace
            {...this.props.space}
            getSpace={this.props.getSpace}
            getPlans={this.props.getPlans}
            onCheckPlan={this.props.onCheckPlan}
          />
        </div>
        {this.state?.link && (
          <a href={this.state.link} title="دانلود اپلیکیشن" className="btnDownloadApp">
            <img src={AndroidAppIcon} alt="" />
            دانلود اپلیکیشن اندروید
          </a>
        )}
        <SidebarUpload
          uploadBox={this.props.uploadBox}
          filter={this.props.filter}
          match={this.props.match}
          currentHash={this.props.currentHash}
          userSpace={this.props.space}
        />
      </aside>
    );
  }
}

const mapStateToProps = (state: any) => ({
  currentHash: state.files.list.hash,
  filter: state.sidebar.filter,
  space: state.sidebar.space,
  selected: state.files.selected,
});

const mapDispatchToProps = (dispatch: any) => ({
  changeFilter(id: string, body: any) {
    dispatch(changeFilter(id, body));
  },

  getSpace() {
    dispatch(fetchSpaceRequest);
  },

  getPlans() {
    dispatch(fetchPlanRequest);
  },

  onUnSelectItem() {
    dispatch(unSelectItem());
  },

  onResetSortFile() {
    dispatch(resetSortFiles());
  },
  onCheckPlan(planHash: string, onEnd: (result: boolean) => void) {
    dispatch(checkPlan(planHash, onEnd));
  },
  onGetAndroidLink(
    onEnd: (result: {
      id: number;
      link: { [key: string]: string };
      message: string;
      minimumVersion: number;
      version: number;
      versionName: string;
    }) => void,
  ) {
    dispatch(getAndroidLink(onEnd));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(SideBarContainer);
