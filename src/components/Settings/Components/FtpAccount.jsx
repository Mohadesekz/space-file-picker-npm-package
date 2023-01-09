import * as React from 'react';
import { Button, Icon } from '@blueprintjs/core';
import { connect } from 'react-redux';
import { fetchFtpCreateTokenRequest, fetchFtpRevokeTokenRequest } from '../Redux/Actions';
import './Scss/FtpAccount.scss';

const mapDispatchToProps = dispatch => ({
  generateToken(onEnd) {
    dispatch(fetchFtpCreateTokenRequest(onEnd));
  },
  revokeToken(onEnd) {
    dispatch(fetchFtpRevokeTokenRequest(onEnd));
  },
});
class FtpOtp extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loadingType: null,
      ftpToken: null,
    };
  }

  getToken = token => {
    this.setState({ ftpToken: token });
  };

  copyToClipboard = () => {
    if (this.state.ftpToken && this.state.ftpToken.key) {
      const el = document.createElement('textarea');
      el.value = this.state.ftpToken.key;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  render() {
    const { ftpToken } = this.state;
    return (
      <div className="main-wrapper ftp-container">
        <h4 className="title"> دسترسی به حساب FTP</h4>
        <div className="ftp-form">
          {this.state.ftpToken ? (
            <>
              <p className="description">رمز عبور</p>
              <p className="token-key">{ftpToken.key}</p>
              <p className="expires-date">
                <span>تاریخ انقضا</span>
                {ftpToken.expiresIn}
              </p>
              <div className="actions">
                <Button
                  className="default-outline bp3-intent-default"
                  onClick={this.copyToClipboard}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    id="prefix__files-and-folders"
                    width="12.667"
                    height="12.667"
                    viewBox="0 0 12.667 12.667"
                    fill="#90a4ae"
                  >
                    <path
                      id="prefix__Path_1393"
                      d="M1.672 75.3L.1 76.874h1.572z"
                      className="prefix__cls-1"
                      data-name="Path 1393"
                      transform="translate(-.098 -73.439)"
                    />
                    <path
                      id="prefix__Path_1394"
                      d="M182.783.1l-1.572 1.572h1.572z"
                      className="prefix__cls-1"
                      data-name="Path 1394"
                      transform="translate(-176.728 -.098)"
                    />
                    <path
                      id="prefix__Path_1395"
                      d="M183.427 0v2.316h-2.316v8.49h8.189V0zm4.341 7.17h-5.128v-.742h5.129v.742zm0-1.577h-5.128v-.742h5.129v.742zm0-1.577h-5.128v-.741h5.129v.742z"
                      className="prefix__cls-1"
                      data-name="Path 1395"
                      transform="translate(-176.63)"
                    />
                    <path
                      id="prefix__Path_1396"
                      d="M3.738 84.89v-2.518H1.529v-.742h2.21v-.83h-2.21v-.742h2.21v-.835h-2.21v-.742h2.21V75.2H2.316v2.316H0v8.49h8.186V84.89z"
                      className="prefix__cls-1"
                      data-name="Path 1396"
                      transform="translate(0 -73.342)"
                    />
                  </svg>
                  <span>کپی کردن توکن</span>
                </Button>
                <Button
                  className="default-outline bp3-intent-default"
                  onClick={() => this.props.revokeToken(() => this.setState({ ftpToken: null }))}
                >
                  <Icon icon="trash" iconSize={13} />
                  حذف توکن
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="description">ایجاد توکن دسترسی به حساب</p>
              <Button
                className="outlined  bp3-intent-default"
                onClick={() => this.props.generateToken(token => this.getToken(token))}
              >
                ایجاد توکن
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(FtpOtp);
