import React, { Component } from 'react';
import './index.css';
import PodSpaceAppLogo from '../../assets/images/posspace_app_logo.png';
import { connect } from 'react-redux';
import { getAndroidLink } from '../sidebar/actions';

class AlertSwitchToApp extends Component {
  state = {
    showAlert: false,
    loading: true,
    link: null,
    message: null,
    minimumVersion: null,
    version: null,
    versionName: null,
  };

  async componentDidMount() {
    const { onGetAndroidLink } = this.props;
    const Android = /(android)/i.test(navigator.userAgent);
    const showAlert = localStorage.getItem('appDownloadShow');

    onGetAndroidLink(result => {
      const { link, message, minimumVersion, version, versionName } = result;
      if (Android && showAlert !== 'false') {
        this.setState({ showAlert: true, link, message, minimumVersion, version, versionName });
      }
    });
  }

  ignoreDownload = () => {
    this.setState({ showAlert: false });
    localStorage.setItem('appDownloadShow', 'false');
  };

  render() {
    return this.state.showAlert &&
      this.state.link &&
      this.state.link.podspace &&
      this.state.versionName ? (
      <div className="alert-switch-to-app">
        <img src={PodSpaceAppLogo} alt="PodSpace Application" className="app-logo" />
        <div className="app-title">اپلیکیشن پاد اسپیس نسخه {this.state.versionName}</div>
        <a
          href={this.state.link.podspace}
          title="Download PodSpace Application"
          className="app-link"
        >
          دانلود اپلیکیشن
        </a>
        <button className="app-ignore" onClick={this.ignoreDownload}>
          فعلا نه
        </button>
      </div>
    ) : null;
  }
}

const mapDispatchToProps = dispatch => ({
  onGetAndroidLink(onEnd) {
    dispatch(getAndroidLink(onEnd));
  },
});
export default connect(null, mapDispatchToProps)(AlertSwitchToApp);
