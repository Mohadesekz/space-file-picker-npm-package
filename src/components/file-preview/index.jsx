import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Button } from '@blueprintjs/core';
import { fetchFileDetailRequest } from '../files-list/actions';
import InformationContainer from '../information/containers';
import GoBack from './components/GoBack';
import { FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import HeaderFilePreview from './components/HeaderFilePreview';
import AppLogo from '../header/components/app-logo';
// import { likeAndDislike } from '../files-list/actions';
import passwordSVG from '../../assets/icons/password.svg';
import ImagePreview from './components/ImagePreview';
import AudioPreview from './components/AudioPreview';
import VideoPreview from './components/VideoPreview';
import PdfPreview from './components/PdfPreview';
import LightDark from '../header/components/light-dark';
import { Util } from '../../helpers';
import Manifest from '../../manifest';
import Spinner from '../loading';
import './index.scss';

const mapDispatchToProps = dispatch => ({
  fetchFileDetail(fileHash, isPublic, returnDetails, password) {
    dispatch(fetchFileDetailRequest(fileHash, isPublic, returnDetails, password));
  },
  // likeAndDislike: (postId, like, hash, onEnd) =>
  // dispatch(likeAndDislike(postId, like, hash, onEnd)),
});

class FilePreview extends Component {
  state = {
    loading: false,
    fileDetails: null, // null , "PASSWORD_REQUIRED" , fileDetails object
    sideBar: false,
    like: false,
  };

  password = null;

  componentDidMount() {
    this.getFileDetails();
  }

  getFileDetails = () => {
    const { fileHash } = this.props;
    if (fileHash) {
      this.props.fetchFileDetail(
        fileHash,
        true,
        fileDetails => {
          //TODO: handle not found file
          this.setState({
            fileDetails,
            like: fileDetails.like,
          });
        },
        this.password,
      );
    }
  };

  changePassword = e => {
    const value = e.target.value;
    this.password = value;
  };

  handlePassword = () => {
    if (!this.password || this.password.trim() === '') {
      this.setState({
        emptyPassword: true,
      });
    } else {
      this.setState({
        fileDetails: null,
      });
      this.getFileDetails();
    }
  };

  renderHandleError = () => {
    const message = this.password
      ? 'رمز عبور وارد شده صحیح نیست.'
      : 'برای دسترسی به اطلاعات فایل رمزعبور را وارد کنید.';
    return (
      <div className="password-form">
        <img width="148" height="198" alt="password-icon" src={passwordSVG} />
        <h1 className={`password-title ${this.password ? 'error' : ''}`}>{message}</h1>
        <FormGroup
          helperText={this.state.emptyPassword && 'لطفا رمز عبور را وارد نمایید'}
          intent={this.state.emptyPassword ? Intent.DANGER : Intent.NONE}
          style={{ flex: 1 }}
        >
          <label className="">رمز عبور</label>
          <InputGroup
            type="password"
            placeholder="رمز عبور"
            onChange={this.changePassword}
            intent={this.state.emptyPassword ? Intent.DANGER : Intent.NONE}
          />
        </FormGroup>

        <div className="button-container">
          <Button
            intent={this.emptyPassword ? Intent.DANGER : Intent.PRIMARY}
            onClick={this.handlePassword}
          >
            تایید
          </Button>
        </div>
      </div>
    );
  };

  isPublicLink = () => {
    const { fileDetails } = this.state;
    const isAuthenticated = window.localStorage.getItem('isAuthenticated');
    const userToken = window.localStorage.getItem('access_token');
    return !(userToken && isAuthenticated === 'true' && fileDetails && fileDetails.isShared); // user is login and isPublic should be false
  };

  userIsLogin = () => {
    const isAuthenticated = window.localStorage.getItem('isAuthenticated');
    const userToken = window.localStorage.getItem('access_token');
    return userToken && isAuthenticated;
  };

  unmounted = false;
  componentWillUnmount() {
    this.unmounted = true;
  }

  getItemSource = fileDetails => {
    const timestamp = +new Date();
    let itemSource = `${Manifest.server.api.address}files/${fileDetails.hash}`;
    const token = window.localStorage.getItem('access_token');
    if (token && this.password) {
      itemSource += `?Authorization=${token}&password=${this.password}&t=${timestamp}`;
    } else if (token && !this.password) {
      itemSource += `?Authorization=${token}&t=${timestamp}`;
    } else if (this.password) {
      itemSource += `?password=${this.password}&t=${timestamp}`;
    }
    return itemSource;
  };

  checkToken = fileDetails => {
    //need to refactor!!
    return new Promise(async (resolve, reject) => {
      // check token expire time and refresh token if it required
      resolve(null);
    });
  };

  displayFile = fileDetails => {
    const classFileType = Util.getFileIcon(fileDetails, Object.is(fileDetails.type_, 'file'));
    const fileType = Util.getFileType((fileDetails && fileDetails.extension) || '');
    fileDetails.itemSource = this.getItemSource(fileDetails);

    return fileType === 'IMAGE' ? (
      <ImagePreview fileDetails={fileDetails} checkToken={this.checkToken} />
    ) : fileType === 'AUDIO' ? (
      <AudioPreview fileDetails={fileDetails} checkToken={this.checkToken} />
    ) : fileType === 'VIDEO' ? (
      <VideoPreview fileDetails={fileDetails} checkToken={this.checkToken} />
    ) : fileType === 'PDF' ? (
      <PdfPreview fileDetails={fileDetails} />
    ) : (
      <span className="content-wrapper">
        <div
          className={`thumb vector ${
            Object.is(fileDetails.type_, 'folder') ? 'folder' : classFileType
          }`}
        ></div>
      </span>
    );
  };

  onVersionChange = () => {
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      this.setState({
        loading: false,
      });
    });
  };
  render() {
    const { fileDetails } = this.state;
    const lastRoute = sessionStorage.getItem('back_url');

    return (
      <div className="main">
        {fileDetails && this.userIsLogin() ? (
          <div className="main-header">
            <AppLogo />
            <GoBack lastRoute={lastRoute} />
            <LightDark />
          </div>
        ) : null}
        <div
          className={`file-preview-container ${
            fileDetails && fileDetails.isPublic && !this.userIsLogin() ? 'public-mode' : ''
          }`}
        >
          {fileDetails ? (
            fileDetails === 'PASSWORD_REQUIRED' ? (
              this.renderHandleError()
            ) : (
              <Fragment>
                <section className="app-file-preview">
                  <HeaderFilePreview
                    // likeAndDislike={() => this.likeAndDislike(fileDetails)}
                    // toggleComments={this.toggleComments}
                    toggleSideBar={() => {
                      this.setState({ sideBar: true });
                    }}
                    fileDetails={fileDetails}
                    like={this.state.like}
                    isPublic={fileDetails.isPublic && !this.userIsLogin()}
                    password={this.password}
                  />
                  <div className="content">
                    {this.state.loading ? <Spinner /> : this.displayFile(fileDetails)}
                  </div>
                </section>
                <section className={`app-information ${this.state.sideBar ? 'active' : ''}`}>
                  <InformationContainer
                    showPreview={false}
                    isPublic={fileDetails.isPublic}
                    // toggleComments={this.setToggleComments}
                    infoSidebarToggle={() => {
                      this.setState({
                        sideBar: false,
                      });
                    }}
                    onVersionChange={this.onVersionChange}
                  />
                </section>
              </Fragment>
            )
          ) : null}
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(FilePreview);
