import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import PdfReader from '../../files-list/components/pdf-reader';
import { connect } from 'react-redux';
import {
  activityRequest,
  shareRequest,
  shareRemoveRequest,
  shareRemoveAllRequest,
  fileRestoreRequest,
  historyRequest,
  // getComments,
} from '../actions';
import InformationSide from '..';
import Header from '../header';
import Loading from '../loading';
import ImageSlider from '../../files-list/components/image-slider/imageSlider';
import VideoPlayer from '../../files-list/components/player-video';
import { Overlay, Icon } from '@blueprintjs/core';
import Manifest from '../../../manifest';

const mapStateToProps = state => ({
  ...state.files.selected,
  activities: state.files.activities,
  histories: state.files.histories,
  shares: state.files.shares,
});

const mapDispatchToProps = dispatch => ({
  getActivities: hash => dispatch(activityRequest({ hash })),
  getHistories: hash => dispatch(historyRequest({ hash })),
  // getComments: id => dispatch(getComments(id)),

  getShare: (hash, _type) => dispatch(shareRequest({ hash }, _type)),
  restoreFile: (hash, orginalHash) => dispatch(fileRestoreRequest(hash, orginalHash)),
  removeShare: (shareHash, fileHash, shareType, selfShare) =>
    dispatch(shareRemoveRequest(shareHash, fileHash, shareType, selfShare)),
  removeAllShares: hash => dispatch(shareRemoveAllRequest(hash)),
});

class InformationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSlider: {
        open: false,
        startIndex: -1,
        images: [],
      },
      playerMusic: {
        open: false,
        data: {},
      },
      VideoPlayer: {
        open: false,
        startIndex: -1,
        list: [],
      },
      pdfReader: {
        open: false,
        data: null,
      },
    };
  }
  static propTypes = {
    lastData: PropTypes.object.isRequired,
    lastHash: PropTypes.string,
    empty: PropTypes.bool.isRequired,
    infoSidebarToggle: PropTypes.func,
    getActivities: PropTypes.func.isRequired,
    getHistories: PropTypes.func.isRequired,
    // getComments: PropTypes.func.isRequired,
    getShare: PropTypes.func.isRequired,
    activities: PropTypes.shape({
      activities: PropTypes.array.isRequired,
      isLoading: PropTypes.bool.isRequired,
      hasError: PropTypes.bool.isRequired,
    }).isRequired,
    histories: PropTypes.shape({
      histories: PropTypes.array.isRequired,
      isLoading: PropTypes.bool.isRequired,
      hasError: PropTypes.bool.isRequired,
    }).isRequired,
    shares: PropTypes.shape({
      shares: PropTypes.array.isRequired,
      isLoading: PropTypes.bool.isRequired,
      hasError: PropTypes.bool.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    if (this.props.lastData && this.props.lastData.hash) {
      this.getInfoDetails();
    }
  }

  getInfoDetails = () => {
    if (this.props.isPublic) {
      return;
    }
    this.props.getActivities(this.props.lastData.hash);
    if (this.props.lastData.type_ === 'file') {
      this.props.getShare(this.props.lastData.hash, this.props.lastData.type_);
      // this.props.getComments(this.props.lastData.postId);
      this.props.getHistories(this.props.lastData.hash);
    } else if (this.props.lastData.type_ === 'folder') {
      this.props.getShare(this.props.lastData.hash, this.props.lastData.type_);
    }
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.lastData.hash !== prevProps.lastData.hash &&
      this.props.lastData.hash !== undefined
    ) {
      this.getInfoDetails();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !Object.is(this.props.lastHash, nextProps.lastHash) ||
      !Object.is(this.props.activities.isLoading, nextProps.activities.isLoading) ||
      !Object.is(this.props.activities.random, nextProps.activities.random) ||
      !Object.is(this.props.histories.isLoading, nextProps.histories.isLoading) ||
      !Object.is(this.props.histories.random, nextProps.histories.random) ||
      !Object.is(this.props.shares.isLoading, nextProps.shares.isLoading) ||
      !Object.is(this.props.shares.random, nextProps.shares.random) ||
      !Object.is(this.state.imageSlider.open, nextState.imageSlider.open) ||
      !Object.is(this.state.playerMusic.open, nextState.playerMusic.open) ||
      !Object.is(this.state.VideoPlayer.open, nextState.VideoPlayer.open) ||
      !Object.is(this.state.pdfReader.open, nextState.pdfReader.open)
    ) {
      return true;
    } else {
      return false;
    }
  }

  handleImageSlider = item => {
    this.setState({ imageSlider: { images: [item], open: true, startIndex: 0 } });
  };

  closeImageSlider = () => {
    this.setState({ imageSlider: { images: [], open: false, startIndex: -1 } });
  };

  handlePlayerMusic = item => {
    this.setState({ playerMusic: { open: true, data: item } });
  };

  handleVideoPlayer = item => {
    this.setState({ VideoPlayer: { open: true, list: [item], startIndex: 0 } });
  };

  closePlayerMusic = () => {
    this.setState({ playerMusic: { open: false, data: {} } });
  };

  closeVideoPlayer = () => {
    this.setState({ VideoPlayer: { open: false, list: [], startIndex: -1 } });
  };

  getItemSource = fileDetails => {
    let itemSource = `${Manifest.server.api.address}files/${fileDetails.hash}`;
    const token = window.localStorage.getItem('access_token');
    if (token && this.password) {
      itemSource += `?Authorization=${token}&password=${this.password}`;
    } else if (token && !this.password) {
      itemSource += `?Authorization=${token}`;
    } else if (this.password) {
      itemSource += `?password=${this.password}`;
    }
    return itemSource;
  };

  handlePdfReader = item => {
    item['itemSource'] = this.getItemSource(item);
    this.setState({ pdfReader: { open: true, data: item } });
  };

  closePdfReader = () => {
    this.setState({ pdfReader: { open: false, data: null } });
  };

  render() {
    return this.props.empty && this.props.infoSidebarToggle ? (
      <Loading render={() => <Header infoSidebarToggle={this.props.infoSidebarToggle} />} />
    ) : (
      <Fragment>
        <InformationSide
          data={this.props.lastData}
          activities={this.props.activities}
          histories={this.props.histories}
          restoreFile={(hash, orginalHash) => {
            this.props.restoreFile(hash, orginalHash);
            if (this.props.onVersionChange) {
              this.props.onVersionChange();
            }
          }}
          shares={this.props.shares}
          removeShare={this.props.removeShare}
          removeAllShares={this.props.removeAllShares}
          render={() =>
            this.props.infoSidebarToggle ? (
              <Header infoSidebarToggle={this.props.infoSidebarToggle} />
            ) : null
          }
          onImageItem={this.handleImageSlider}
          onAudioItem={this.handlePlayerMusic}
          onVideoItem={this.handleVideoPlayer}
          onPdfItem={this.handlePdfReader}
          isPublic={this.props.isPublic}
          showPreview={this.props.showPreview}
          onToggleComments={this.props.toggleComments}
          history={this.props.history}
        />

        {this.state.imageSlider.open ? (
          <ImageSlider
            images={this.state.imageSlider.images}
            startIndex={this.state.imageSlider.startIndex}
            close={this.closeImageSlider}
            public={this.props.public}
            password={this.state.imageSlider.password}
          />
        ) : null}

        {/* <PlayerMusic
          open={this.state.playerMusic.open}
          data={this.state.playerMusic.data}
          close={this.closePlayerMusic}
          public={this.props.public}
        /> */}

        {this.state.VideoPlayer.open ? (
          <VideoPlayer
            list={this.state.VideoPlayer.list}
            startIndex={this.state.VideoPlayer.startIndex}
            close={this.closeVideoPlayer}
            public={this.props.public}
            password={this.state.VideoPlayer.password}
          />
        ) : null}
        {this.state.pdfReader.open ? (
          <Overlay
            className="pdf-reader"
            isOpen={true}
            onClose={this.props.close}
            transitionDuration={200}
          >
            <Icon icon="cross" iconSize={30} color="#fff" onClick={this.closePdfReader} />
            <PdfReader
              pdfSource={this.state.pdfReader.data.itemSource}
              pageWidth={window.innerWidth > 768 ? 768 : window.innerWidth - 50}
            />
          </Overlay>
        ) : null}
      </Fragment>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(InformationContainer);
