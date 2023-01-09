import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Breadcrumb from '..';

const mapStateToProps = state => ({
  breadcrumb: state.files.list.breadcrumb,
});

class BreadcrumbContainer extends Component {
  static propTypes = {
    breadcrumb: PropTypes.array.isRequired,
    infoSidebarToggle: PropTypes.func,
    infoSidebarStatus: PropTypes.bool,
    menuToggle: PropTypes.func,
    public: PropTypes.bool,
  };

  shouldComponentUpdate(nextProps) {
    if (
      !Object.is(this.props.breadcrumb, nextProps.breadcrumb) ||
      !Object.is(this.props.infoSidebarStatus, nextProps.infoSidebarStatus)
    ) {
      return true;
    } else {
      return false;
    }
  }

  render() {
    return (
      <Breadcrumb
        breadcrumb={this.props.breadcrumb}
        infoSidebarToggle={this.props.infoSidebarToggle}
        infoSidebarStatus={this.props.infoSidebarStatus}
        menuToggle={this.props.menuToggle}
        public={this.props.public}
        navigation={this.props.navigation}
      />
    );
  }
}
export default connect(mapStateToProps, null)(BreadcrumbContainer);
