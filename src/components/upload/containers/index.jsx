import React, { Component } from 'react';
import { Alert, Intent } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  uploadCancel,
  uploadRequest,
  cancelAll,
  closeBox,
  uploadPause,
  uploadResume,
} from '../actions';
import UploadBox from '..';
import { fetchFilesRequest } from '../../files-list/actions';
import Manifest from '../../../manifest';

const mapStateToProps = state => ({
  ...state.upload,
  filter: state.sidebar.filter.selected,
});

const mapDispatchToProps = dispatch => ({
  uploadRequest(file) {
    dispatch(uploadRequest(file));
  },

  uploadCancel(file) {
    dispatch(uploadCancel(file));
  },

  uploadPause(file) {
    dispatch(uploadPause(file));
  },

  uploadResume(file) {
    dispatch(uploadResume(file));
  },

  fetchFilesRequest(hash, filter, isPublic) {
    dispatch(
      fetchFilesRequest({
        endpoint: `getFolderContent?parents=true&size=${Manifest.pageSize}&folderHash=${hash}`,
        filter,
        isPublic,
      }),
    );
  },

  closeBox() {
    dispatch(closeBox);
  },

  cancelAll() {
    dispatch(cancelAll);
  },
});

class Upload extends Component {
  static propTypes = {
    itemsQueue: PropTypes.array.isRequired,
    uploadRequest: PropTypes.func.isRequired,
    uploadCancel: PropTypes.func.isRequired,
    uploadPause: PropTypes.func.isRequired,
    closeBox: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isAlertOpen: false,
      isMinimize: false,
    };
  }

  addQueue = (e, hash) => {
    const event = e.dataTransfer || e.target;
    this.processUpload(event.files, hash);
    try {
      e.target.value = '';
    } catch {}

    try {
      e.target.type = '';
      e.target.type = 'file';
    } catch {}
  };

  addQueueFile = async (files, hash) => {
    this.startUpload(files, hash);
  };

  startUpload(files, hash) {
    if (files.length > 1 && !files.find(file => !file.cancelUpload)) {
      this.props.closeBox();
    } else if (files.length === 1 && files[0].cancelUpload) {
      this.props.uploadCancel(files[0]);
    } else {
      this.processUpload(files, hash);
    }
  }

  processUpload(files, hash) {
    files.forEach(file => {
      file.folderHash = hash;
      file.progress = 0;
      file.success = false;
      file.error = false;
      file.uploadState = 'START';
      if (!file.cancelUpload) {
        this.props.uploadRequest(file);
      }
    });
  }

  onToggleMinimize = () => {
    this.setState({ isMinimize: !this.state.isMinimize });
  };

  onClose = () => {
    const found = this.props.itemsQueue.find(item => {
      return (item.uploadState === 'START' || item.uploadState === 'PAUSE') && !item.cancelUpload;
    });

    if (found) {
      return this.setState({ isAlertOpen: true });
    } else this.props.closeBox();
  };

  render() {
    return (
      this.props.isOpen && (
        <React.Fragment>
          <UploadBox
            itemsQueue={this.props.itemsQueue.filter(item => !item.cancelUpload)}
            isMinimize={this.state.isMinimize}
            onClose={this.onClose}
            uploadCancel={this.props.uploadCancel}
            uploadPause={this.props.uploadPause}
            uploadResume={this.props.uploadResume}
            uploadRequest={this.props.uploadRequest}
            onToggleMinimize={this.onToggleMinimize}
          />

          <Alert
            cancelButtonText="ادامه بارگذاری"
            confirmButtonText="لغو بارگذاری و بستن پنجره"
            intent={Intent.PRIMARY}
            isOpen={this.state.isAlertOpen}
            onCancel={() => {
              this.setState({ isAlertOpen: false });
            }}
            onConfirm={() => {
              this.setState({ isAlertOpen: false });
              this.props.cancelAll();
            }}
          >
            <p>توجه : بارگذاری فایل ها به پایان نرسیده، با بستن پنجره بارگذاری متوقف می شود .</p>
          </Alert>
        </React.Fragment>
      )
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
  copyMethods: ['addQueue', 'addQueueFile'],
})(Upload);
// export default Upload;
