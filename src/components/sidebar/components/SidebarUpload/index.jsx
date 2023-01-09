import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { newFetch } from '../../../../helpers';
import { Dialog, Classes, FormGroup, Button, Icon } from '@blueprintjs/core';
import { AppToaster } from '../../../../components/toast';
import { Intent } from '@blueprintjs/core';
import { Pages } from '../../../../routers/Pages';
import { uploadStart } from '../../../upload/actions';
import { connect } from 'react-redux';
import SidebarUploadDialog from './SidebarUploadDialog';
import Util from 'helpers/util';
import { addItemInList } from 'components/files-list/actions';
const DoubleSlashesReg = /\/\/+/g;

class SidebarUpload extends Component {
  maxFileLengh = 100;
  uploadCount = 0; // upper than this length process box will be display
  timout;

  static propTypes = {
    filter: PropTypes.shape({
      options: PropTypes.array,
      selected: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      isExact: PropTypes.bool,
      params: PropTypes.object,
      path: PropTypes.string,
      url: PropTypes.string,
    }).isRequired,
    mobileSize: PropTypes.bool,
    userSpace: PropTypes.object,
    uploadBox: PropTypes.object.isRequired,
    currentHash: PropTypes.string,
  };
  maxFileLentgh = 100;

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      hash: null,
      uploadInProgress: null,
    };
    this.fileInputRef = React.createRef();
    this.folderInputRef = React.createRef();
  }

  onClickButton = () => {
    this.fileInputRef.click();
  };
  onFolderClickButton = () => {
    this.folderInputRef.click();
  };
  onChangeFileInput = e => {
    const { remainSpace } = this.props.userSpace;
    const event = e.dataTransfer || e.target;
    const files = event.files;
    let filesSize = 0;
    for (let i = 0; i < files.length; i++) {
      filesSize += files[i].size;
    }

    if (remainSpace > filesSize) {
      this.checkFileExistance(Object.values(event.files), this.props.currentHash);
      this.fileInputRef.value = null;
    } else {
      AppToaster.show(
        {
          message: 'به دلیل کمبود فضا امکان آپلود فایل وجود ندارد.',
          icon: 'warning-sign',
          intent: Intent.DANGER,
        },
        'alert-fetch-files',
      );
    }
  };

  onChangeFolderInput = e => {
    const { remainSpace } = this.props.userSpace;
    const event = e.dataTransfer || e.target;
    const files = event.files;
    let filesSize = 0;
    for (let i = 0; i < files.length; i++) {
      filesSize += files[i].size;
    }

    if (remainSpace > filesSize) {
      this.checkFileExistance(Object.values(event.files), this.props.currentHash);
      this.folderInputRef.value = null;
    } else {
      AppToaster.show(
        {
          message: 'به دلیل کمبود فضا امکان آپلود فایل وجود ندارد.',
          icon: 'warning-sign',
          intent: Intent.DANGER,
        },
        'alert-fetch-files',
      );
    }
  };

  addTimestamp = (fileList, index, timeStamp) => {
    return new Promise(resolve => {
      if (fileList[index] && this.state.uploadInProgress) {
        fileList[index]['uploadTime'] = timeStamp;
        if (fileList[index + 1]) {
          this.timout = setTimeout(async () => {
            await this.addTimestamp(fileList, index + 1, timeStamp);
            resolve(fileList);
          }, 1);
        } else {
          this.timout = setTimeout(() => {
            resolve(fileList);
          }, 1);
        }
      } else {
        this.timout = setTimeout(() => {
          resolve(fileList);
        }, 1);
      }
    });
  };

  checkBoxOnOpenInterval;
  checkBoxOnCloseInterval;
  uploadBoxIsOpen = true;
  checkUploadBoxCondition = () => {
    this.checkBoxInterval = setInterval(() => {
      if (this.props.upload.isOpen) {
        clearInterval(this.checkBoxInterval);
        this.uploadBoxIsOpen = true;
        this.checkBoxOnCloseInterval = setInterval(() => {
          if (!this.props.upload.isOpen) {
            this.uploadBoxIsOpen = false;
            clearInterval(this.checkBoxOnCloseInterval);
          }
        }, 100);
      }
    }, 100);
  };

  addQueueFileNotConfirmed = (fileList, index) => {
    return new Promise(resolve => {
      if (fileList[index] && this.state.uploadInProgress && this.uploadBoxIsOpen) {
        this.props.uploadBox.current.addQueueFile([fileList[index]], 'NOT_CONFIRMED');
        if (fileList[index - 1]) {
          setTimeout(async () => {
            await this.addQueueFileNotConfirmed(fileList, index - 1);
            resolve();
          }, 1);
        } else {
          setTimeout(() => {
            resolve();
          }, 1);
        }
      } else {
        setTimeout(() => {
          resolve();
        }, 1);
      }
    });
  };

  waitForContinueInterval;
  waitForContinue = () => {
    return new Promise(resolve => {
      this.waitForContinueInterval = setInterval(() => {
        if (this.props.upload.uploadInProgressCount === 0) {
          clearInterval(this.waitForContinueInterval);
          resolve();
        }
      }, 100);
    });
  };

  // uploadIfNotExist = (fileList, index, hash) => {

  //   return new Promise(async resolve => {
  //     if (!this.uploadBoxIsOpen) {
  //       resolve();
  //       return;
  //     }
  //     if (fileList[index - 1]) {
  //       await this.uploadIfNotExist(fileList, index - 1, hash);
  //     }
  //     if (!this.uploadBoxIsOpen) {
  //       resolve();
  //       return;
  //     }
  //     const parentHash = hash ? hash : 'ROOT';
  //     const fileExistResult = await newFetch(
  //       encodeURI(`files/${parentHash}/exist?fileName=${fileList[index].name}`),
  //       'GET',
  //     );
  //     if (!this.uploadBoxIsOpen) {
  //       resolve();
  //       return;
  //     }
  //     if (fileExistResult && fileExistResult !== 'OK') {
  //       fileList[index]['exist'] = true;
  //       fileList[index]['replaceHashCode'] = fileExistResult.hash;
  //       fileList[index]['replace'] = false;
  //     } else {
  //       const parentHash = hash ? hash : 'ROOT';
  //       if (this.uploadCount < 10) {
  //         this.uploadCount += 1;
  //       } else {
  //         this.uploadCount = 0;
  //         await this.waitForContinue();
  //       }
  //       if (!this.uploadBoxIsOpen) {
  //         //user close upload box
  //         resolve();
  //         return;
  //       }
  //       this.props.uploadBox.current.addQueueFile([fileList[index]], parentHash);
  //     }
  //     setTimeout(() => {
  //       resolve();
  //     }, 10);
  //   });
  // };

  uploadIfNotExist = (fileList, index, hashList) => {
    return new Promise(async resolve => {
      if (!this.uploadBoxIsOpen) {
        resolve();
        return;
      }
      if (fileList[index + 1]) {
        await this.uploadIfNotExist(fileList, index + 1, hashList);
      }
      if (!this.uploadBoxIsOpen) {
        resolve();
        return;
      }
      let directory = (
        '/' + fileList[index].webkitRelativePath.replace(fileList[index].name, '')
      ).replace(DoubleSlashesReg, '/');

      const parentHash = hashList[directory] ? hashList[directory] : this.props.currentHash;

      const fileExistResult = await newFetch(
        encodeURI(`files/${parentHash}/exist?fileName=${fileList[index].name}`),
        'GET',
      );
      if (!this.uploadBoxIsOpen) {
        resolve();
        return;
      }
      if (fileExistResult && fileExistResult !== 'OK') {
        fileList[index]['exist'] = true;
        fileList[index]['replaceHashCode'] = fileExistResult.hash;
        fileList[index]['replace'] = false;
      } else {
        const directory = (
          '/' +
          fileList[index].webkitRelativePath.replace(fileList[index].name, '') +
          '/'
        ).replace(DoubleSlashesReg, '/');
        const parentHash = hashList[directory] ? hashList[directory] : this.props.currentHash;
        if (this.uploadCount < 10) {
          this.uploadCount += 1;
        } else {
          this.uploadCount = 0;
          await this.waitForContinue();
          clearInterval(this.waitForContinueInterval);
        }
        if (!this.uploadBoxIsOpen) {
          //user close upload box
          resolve();
          return;
        }
        this.props.uploadBox.current.addQueueFile([fileList[index]], parentHash);
      }
      setTimeout(() => {
        resolve();
      }, 10);
    });
  };

  getDirectoryList = (pathList, fileList, index) => {
    return new Promise(resolve => {
      if (
        fileList[index] &&
        (fileList.length < this.maxFileLentgh || this.state.uploadInProgress)
      ) {
        const file = fileList[index];
        const directory = ('/' + file.webkitRelativePath.replace(file.name, '') + '/').replace(
          DoubleSlashesReg,
          '/',
        );
        if (pathList.indexOf(directory) === -1) {
          pathList = [...pathList, directory];
        }
        if (fileList[index + 1]) {
          this.timout = setTimeout(async () => {
            pathList = await this.getDirectoryList(pathList, fileList, index + 1);
            resolve(pathList);
          }, 1);
        } else {
          this.timout = setTimeout(() => {
            resolve(pathList);
          }, 1);
        }
      } else {
        this.timout = setTimeout(() => {
          resolve(pathList);
        }, 1);
      }
    });
  };
  objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }
    return target;
  }

  checkFileExistance = async (files, hash) => {
    console.log(files);
    if (!files.length) {
      AppToaster.show(
        {
          message: 'در حال حاضر امکان آپلود فولدر خالی وجود ندارد',
          icon: 'warning-sign',
          intent: Intent.DANGER,
          timeout: 5000,
        },
        'alert-upload-empty-folder',
      );
      return;
    }
    this.uploadBoxIsOpen = true;

    let fileList = await this.addTimestamp(files, 0, +new Date());
    if (files.length > this.maxFileLengh && !this.state.uploadInProgress) {
      // user canceled upload process
      return;
    }
    const directories = await this.getDirectoryList([], fileList, 0); // return array of files paths liske ['/test/' , '/test2/']
    if (files.length > this.maxFileLengh && !this.state.uploadInProgress) {
      // user canceled upload process
      return;
    }

    this.setState({
      uploadInProgress: {
        ...this.state.uploadInProgress,
        hide: true,
      },
    });
    this.props.onUploadStart();
    this.checkUploadBoxCondition();
    await this.addQueueFileNotConfirmed(fileList, fileList.length - 1);

    if (files.length > this.maxFileLengh && !this.state.uploadInProgress) {
      // user canceled upload process
      return;
    }

    let rootPathList = [];
    directories.forEach(key => {
      const root = key.split('/')?.[1];
      if (root && !rootPathList.includes(root)) {
        rootPathList = [...rootPathList, '/' + root + '/'];
      }
    });

    const directoryformData = new FormData();
    directoryformData.append('directories', [...directories, ...rootPathList]);
    const parentHash = hash || 'ROOT';

    const dir = async () => {
      return new Promise(async (resolve, reject) => {
        if (directories.length === 1 && directories[0] === '/') {
          resolve([{ '/': parentHash }]);
        } else {
          const hashList = await newFetch(
            `files/directories?parentHash=${parentHash}`,
            'POST',
            directoryformData,
          );

          for (let path of rootPathList) {
            const hash = hashList[path];

            if (hash) {
              const folderDetails = await newFetch(`files/${hash}/detail`, 'GET');
              const filterDetails = Util.getFilterByPath();

              if (folderDetails !== 'ERROR') {
                this.props.onAddItemInList(filterDetails.filter, {
                  ...folderDetails,
                  accessLevel: 'EDIT',
                  created_: Util.fileDateTimeFa(folderDetails.created),
                  size_: '_',
                  type_: 'folder',
                  updated_: Util.fileDateTimeFa(folderDetails.updated),
                });
              } else {
                reject();
              }
            }
          }
          resolve(hashList);
        }
      });
    };
    dir()
      .then(async hashList => {
        if (hashList !== 'ERROR') {
          this.setState({
            hashList,
          });
          if (fileList.length) {
            await this.uploadIfNotExist(fileList, 0, hashList);
          }
          const firstExistFileIndex = fileList.findIndex(file => file.exist);
          if (firstExistFileIndex !== -1) {
            const existFileList = fileList.filter(file => file.exist);
            const firstExistFileIndex2 = existFileList.findIndex(file => file.exist);
            this.setState({
              dialogIndex: firstExistFileIndex2,
              files: existFileList,
              hash,
            });
          }
        }
      })
      .catch(e => {
        AppToaster.show(
          {
            message: 'در حال حاضر امکان آپلود فولدر خالی وجود ندارد',
            icon: 'warning-sign',
            intent: Intent.DANGER,
            timeout: 5000,
          },
          'alert-upload-empty-folder',
        );
      });

    // await this.uploadIfNotExist(fileList, fileList.length - 1, hash);

    // const firstExistFileIndex = fileList.findIndex(file => file.exist);
    // if (firstExistFileIndex !== -1) {
    //   const existFileList = fileList.filter(file => file.exist);
    //   this.setState({
    //     dialogIndex: firstExistFileIndex,
    //     files: existFileList,
    //     hash,
    //   });
    // }
  };

  duplicateFileAction(index, action) {
    const { files, hash } = this.state;

    if (action === 'KEEP_BOTH') {
      files[index].exist = false;
      files[index].replace = false;
      files[index].cancelUpload = false;
    } else if (action === 'REPLACE') {
      files[index].exist = false;
      files[index].replace = true;
      files[index].cancelUpload = false;
    } else if (action === 'CANCEL') {
      files[index].exist = false;
      files[index].replace = false;
      files[index].cancelUpload = true;
    }

    const duplicateFileIndex = files.findIndex(file => file.exist);

    if (duplicateFileIndex === -1 && hash !== null) {
      this.setState({
        files: [],
        dialogIndex: -1,
      });

      this.addQueueFileProcess(files, files.length - 1);
    } else {
      this.setState({
        files,
        dialogIndex: duplicateFileIndex,
      });
    }
  }

  addQueueFileProcess = (fileList, index) => {
    const { hash } = this.state;
    return new Promise(resolve => {
      if (fileList[index] && this.state.uploadInProgress && this.uploadBoxIsOpen) {
        const parentHash = hash || 'ROOT';
        this.props.uploadBox.current.addQueueFile([fileList[index]], parentHash);

        if (fileList[index - 1]) {
          setTimeout(async () => {
            await this.addQueueFileProcess(fileList, index - 1);
            resolve();
          }, 1);
        } else {
          setTimeout(() => {
            resolve();
          }, 1);
        }
      } else {
        setTimeout(() => {
          resolve();
        }, 1);
      }
    });
  };

  shouldComponentUpdate(nextState, nextProps) {
    if (
      !Object.is(this.props.currentHash, nextProps.currentHash) ||
      !Object.is(this.props.filter?.selected, nextProps.filter?.selected) ||
      !Object.is(
        this.props.loading?.[this.props.filter?.selected],
        nextProps.loading?.[nextProps.filter?.selected],
      ) ||
      !Object.is(this.props.filter.selected, nextProps.filter.selected) ||
      nextState.files.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkBoxOnOpenInterval);
    clearInterval(this.checkBoxOnCloseInterval);
    clearInterval(this.waitForContinueInterval);
  }

  render() {
    const { files, dialogIndex } = this.state;

    let buttonClassName;
    if (
      this.props.loading ||
      !this.props.currentHash ||
      (Pages && Pages.indexOf(window.location.pathname) !== -1) ||
      this.props.accessLevel !== 'EDIT' ||
      window.location.pathname === '/bookmark' ||
      window.location.pathname === '/shared-with-me' ||
      window.location.pathname === '/recent'
    ) {
      buttonClassName = 'disable';
    }

    return (
      <Fragment>
        {files.map((item, index) => {
          return index === dialogIndex ? (
            <Dialog
              key={index}
              icon="share"
              isOpen={item.exist}
              onClose={() => this.duplicateFileAction(index, 'CANCEL')}
              title={item.name}
              className="header modal-custom share-modal"
            >
              <div className={Classes.DIALOG_BODY}>
                <FormGroup label="آیا مایلید فایل قبلی با فایل جدید جایگزین شود؟"></FormGroup>
              </div>

              <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                  <Button onClick={() => this.duplicateFileAction(index, 'REPLACE')}>
                    جایگذاری با قبلی
                  </Button>

                  <Button onClick={() => this.duplicateFileAction(index, 'KEEP_BOTH')}>
                    بارگذاری و نگهداری هردو
                  </Button>

                  <Button onClick={() => this.duplicateFileAction(index, 'CANCEL')}>
                    {' '}
                    انصراف بارگذاری
                  </Button>
                </div>
              </div>
            </Dialog>
          ) : null;
        })}

        {this.state.uploadInProgress && !this.state.uploadInProgress.hide ? (
          <div className="check-size">
            <div className="header">
              <p>در حال محاسبه میزان فضای مورد نیاز</p>
              <Icon
                iconSize={14}
                icon="cross"
                onClick={() => {
                  this.setState({
                    uploadInProgress: null,
                  });
                }}
              />
            </div>
            <div className="size-list">
              <span className="user-size">{this.state.uploadInProgress.userSize}</span>
              <span className="current-size">{this.state.uploadInProgress.size}</span>
            </div>
            <div
              className={`bp3-progress-bar ${
                this.state.uploadInProgress.size > this.props.remainSpace
                  ? 'bp3-intent-danger'
                  : 'bp3-intent-primary'
              } .modifier`}
            >
              <div
                className="bp3-progress-meter"
                style={{ width: `${this.state.uploadInProgress.percent}%` }}
              ></div>
            </div>
            {}
          </div>
        ) : null}

        <div className="upload-button">
          <input
            ref={e => (this.fileInputRef = e)}
            onChange={this.onChangeFileInput}
            type="file"
            multiple
            hidden
          />

          {/* <button onClick={this.onClickButton} className={buttonClassName}>
            <div className="pull-left">
              <i className="icon-upload"></i>
            </div>
            <p className="pull-right">بارگذاری فایل</p>
          </button> */}
        </div>

        <div className="upload-button">
          <input
            ref={e => (this.folderInputRef = e)}
            onChange={this.onChangeFolderInput}
            type="file"
            webkitdirectory=""
            mozdirectory=""
            directory=""
            multiple
            hidden
          />
        </div>

        <SidebarUploadDialog
          buttonClassName={buttonClassName}
          onUploadFileButton={this.onClickButton}
          onUploadFolderButton={this.onFolderClickButton}
          match={this.props.match}
        />
      </Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  onUploadStart: () => dispatch(uploadStart()),
  onAddItemInList: (filter, fileItem) => dispatch(addItemInList(filter, fileItem)),
});

const mapStateToProps = state => ({
  upload: state.upload,
  breadcrumb: state.files.list.breadcrumb,
  loading: state.files.isLoading,
  accessLevel: state.files.list.accessLevel,
});

export default connect(mapStateToProps, mapDispatchToProps, null)(SidebarUpload);
