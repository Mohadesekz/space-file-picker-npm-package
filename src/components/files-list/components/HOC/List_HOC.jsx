import React, { Component } from 'react';
import { newFetch } from '../../../../helpers';
import { AppToaster } from '../../../toast';
import {
  Intent,
  Dialog,
  Classes,
  FormGroup,
  Button,
  Icon,
  RadioGroup,
  Radio,
  Alignment,
} from '@blueprintjs/core';
import Util from '../../../../helpers/util';
import './List_HOC.scss';
import { act } from 'react-dom/test-utils';

const DoubleSlashesReg = /\/\/+/g;

const List_HOC = FileListComponent => {
  return class extends Component {
    maxFileLentgh = 100;
    uploadCount = 0; // upper than this length process box will be display
    timout;
    constructor(props) {
      super(props);
      this.inFolderDrop = false;
      this.cntrlIsPressed = false;
      this.state = {
        uploadOption: 'KEEP_BOTH',
        useOptionForAll: false,
        files: [],
        dialogIndex: -1,
        uploadInProgress: null,
      };
    }

    handleUploadOption = e => {
      const uploadOption = e.target.value;
      this.setState({ uploadOption });
    };

    rememberOptionForAll = e => {
      this.setState({ useOptionForAll: !this.state.useOptionForAll });
    };

    getDirectoryList = (pathList, fileList, index) => {
      return new Promise(resolve => {
        if (
          fileList[index] &&
          (fileList.length < this.maxFileLentgh || this.state.uploadInProgress)
        ) {
          const file = fileList[index];
          const directory = ('/' + file.path.replace(file.name, '') + '/').replace(
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

    addTimestamp = (fileList, index, timeStamp) => {
      return new Promise(resolve => {
        // if (fileList[index]) {
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

    addQueueFileProcess = (fileList, index) => {
      const { hashList } = this.state;
      return new Promise(resolve => {
        if (fileList[index] && this.state.uploadInProgress && this.uploadBoxIsOpen) {
          const directory = ('/' + fileList[index].path.replace(fileList[index].name, '')).replace(
            DoubleSlashesReg,
            '/',
          );

          const parentHash = hashList[directory] ? hashList[directory] : this.props.hash;
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

    waitForContinueInterval;
    waitForContinue = () => {
      return new Promise(resolve => {
        this.waitForContinueInterval = setInterval(() => {
          if (this.props.upload.uploadInProgressCount === 0) {
            resolve();
          }
        }, 1000);
      });
    };

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
        let directory = ('/' + fileList[index].path.replace(fileList[index].name, '')).replace(
          DoubleSlashesReg,
          '/',
        );

        const parentHash = hashList[directory] ? hashList[directory] : this.props.hash;

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
            fileList[index].path.replace(fileList[index].name, '') +
            '/'
          ).replace(DoubleSlashesReg, '/');
          const parentHash = hashList[directory] ? hashList[directory] : this.props.hash;
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

    checkBoxOnOpenInterval;
    checkBoxOnCloseInterval;
    uploadBoxIsOpen = true;
    checkUploadBoxCondition = () => {
      this.checkBoxOnOpenInterval = setInterval(() => {
        if (this.props.upload.isOpen) {
          clearInterval(this.checkBoxOnOpenInterval);
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
    checkFileExistance = async (files, hash) => {
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
      if (files.length > this.maxFileLentgh && !this.state.uploadInProgress) {
        // user canceled upload process
        return;
      }
      const directories = await this.getDirectoryList([], fileList, 0); // return array of files paths liske ['/test/' , '/test2/']
      if (files.length > this.maxFileLentgh && !this.state.uploadInProgress) {
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

      if (files.length > this.maxFileLentgh && !this.state.uploadInProgress) {
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
      const parentHash = this.props.hash || 'ROOT';
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
    };

    calculateSizeProcess = (fileList, index, filesSize) => {
      return new Promise(resolve => {
        const { remainSpace } = this.props.userSpace;

        if (fileList[index] && filesSize < remainSpace && this.state.uploadInProgress) {
          filesSize += fileList[index].size;
          this.setState({
            uploadInProgress: {
              userSize: Util.bytesToSize(remainSpace),
              percent: filesSize < remainSpace ? (filesSize / remainSpace).toFixed(1) * 100 : 100,
              size: Util.bytesToSize(filesSize),
            },
          });
          if (fileList[index + 1]) {
            setTimeout(async () => {
              // await this.calculateSizeProcess(fileList, index + 1, filesSize);
              resolve(await this.calculateSizeProcess(fileList, index + 1, filesSize));
            }, 1);
          } else {
            setTimeout(() => {
              resolve(filesSize);
            }, 1);
          }
        } else {
          setTimeout(() => {
            resolve(filesSize);
          }, 1);
        }
      });
    };

    addTimestamp = (fileList, index, timeStamp) => {
      return new Promise(resolve => {
        // if (fileList[index]) {
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
    checkFolderSpace = (folderHash, filesSize) => {
      return new Promise(async resolve => {
        const fileExistResult = await newFetch(
          encodeURI(`folders/${folderHash}/check/upload?size=${filesSize}`),
          'GET',
        );
        resolve(fileExistResult);
        return fileExistResult;
      });
    };

    onDrop = filesAccepted => {
      // get remain space of user and compare it to file size
      const { remainSpace } = this.props.userSpace;
      const username = localStorage.getItem('username');
      let folderSpaceResult = {};
      let filesSize = 0;
      let canUpload = false;

      if (filesAccepted.length > this.maxFileLentgh) {
        this.setState(
          {
            uploadInProgress: {
              ...this.state.uploadInProgress,
              calculateSize: {
                userSize: Util.bytesToSize(remainSpace),
                percent: filesSize < remainSpace ? (filesSize / remainSpace).toFixed(1) * 100 : 100,
                size: Util.bytesToSize(filesSize),
                hide: false,
              },
            },
          },
          () => {
            setTimeout(async () => {
              filesSize = await this.calculateSizeProcess(filesAccepted, 0, 0);

              if (!this.state.uploadInProgress) {
                //user canceled process of calculating size of files
                return;
              }

              if (this.props.owner.username === username) {
                canUpload = remainSpace > filesSize;
              } else {
                folderSpaceResult = await this.checkFolderSpace(this.props.hash, filesSize);
                canUpload = folderSpaceResult.canUpload;
              }
              if (canUpload) {
                if (!this.inFolderDrop) {
                  this.checkFileExistance(filesAccepted, this.props.hash);
                } else {
                  this.inFolderDrop = false; //enable main dropzone
                }
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
            });
          },
        );
      } else {
        setTimeout(async () => {
          filesAccepted.forEach(file => {
            filesSize += file.size;
          });

          if (this.props.owner && this.props.owner.username === username) {
            canUpload = remainSpace > filesSize;
          } else {
            folderSpaceResult = await this.checkFolderSpace(this.props.hash, filesSize);
            canUpload = folderSpaceResult.canUpload;
          }
          if (canUpload) {
            if (!this.inFolderDrop) {
              this.checkFileExistance(filesAccepted, this.props.hash);
            } else {
              this.inFolderDrop = false; //enable main dropzone
            }
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
        });
      }
    };

    fileOrFolderDrop = (filesAccepted, _, e, parent) => {
      let filesOnFolder = [];
      let folderOnFolder = [];

      if (filesAccepted.length === 0) {
        AppToaster.show(
          {
            message: 'امکان آپلود فولدر خالی وجود ندارد!',
            icon: 'warning-sign',
            intent: Intent.DANGER,
          },
          'alert-fetch-files',
        );
      } else {
        filesAccepted.forEach(item => {
          if (parent) {
            let newItem = new File([item], item.name, { type: item.type });
            newItem['path'] = ('/' + parent.name + '/' + item.path).replace(DoubleSlashesReg, '/');

            folderOnFolder = [...folderOnFolder, newItem];
          } else {
            filesOnFolder = [...filesOnFolder, item];
          }
        });
      }

      this.inFolderDrop = true; //disable main dropzone

      if (filesOnFolder.length > 0) {
        this.folderDrop(filesOnFolder, _, e);
      }

      if (folderOnFolder.length > 0) {
        this.checkFileExistance(folderOnFolder, parent.parentHash);
      }
    };

    folderDrop = (filesAccepted, _, e) => {
      e.stopPropagation();
      let hash;

      for (let target = e.target; target; target = target.parentElement) {
        hash = target.getAttribute('data-hash');
        if (hash) break;
      }

      if (hash) {
        this.checkFileExistance(filesAccepted, hash);
      }
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
      } else if (action === 'CANCEL_ALL') {
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

        if (this.state.useOptionForAll || action === 'CANCEL_ALL') {
          this.duplicateFileAction(duplicateFileIndex, action);
        }
      }
      this.setState({
        uploadOption: 'KEEP_BOTH',
        useOptionForAll: false,
      });
    }

    folderDragEnter = e => {
      e.stopPropagation();
      e.currentTarget.classList.add('dropzone-folder-active');
    };

    folderDragLeave = e => {
      e.stopPropagation();
      e.currentTarget.classList.remove('dropzone-folder-active');
    };

    componentWillUnmount() {
      clearInterval(this.checkBoxOnOpenInterval);
      clearInterval(this.checkBoxOnCloseInterval);
      clearInterval(this.waitForContinueInterval);
      this.setState({});
    }

    render() {
      const { files, dialogIndex } = this.state;

      return (
        <>
          {files.map((item, index) =>
            index === dialogIndex ? (
              <Dialog
                key={index}
                icon="share"
                isOpen={item.exist}
                onClose={() => this.duplicateFileAction(index, 'CANCEL')}
                title={item.name}
                className="header modal-custom share-modal"
              >
                <div className={Classes.DIALOG_BODY}>
                  <FormGroup
                    label="آیا مایلید فایل قبلی با فایل جدید جایگزین شود؟"
                    className="from-label"
                  >
                    <RadioGroup
                      onChange={this.handleUploadOption}
                      selectedValue={this.state.uploadOption}
                      inline={true}
                      className="radio-group"
                    >
                      <Radio
                        alignIndicator={Alignment.RIGHT}
                        selected={true}
                        label="بارگذاری و نگهداری هردو"
                        value="KEEP_BOTH"
                      />
                      <Radio
                        alignIndicator={Alignment.RIGHT}
                        label="جایگذاری با قبلی"
                        value="REPLACE"
                      />

                      <Radio
                        alignIndicator={Alignment.RIGHT}
                        label="نگهداری نسخه پیشین"
                        value="CANCEL"
                      />
                    </RadioGroup>
                  </FormGroup>
                </div>

                <div className={Classes.DIALOG_FOOTER}>
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {/* <Button onClick={() => this.duplicateFileAction(index, 'REPLACE')}>
                      جایگذاری با قبلی
                    </Button>

                    <Button onClick={() => this.duplicateFileAction(index, 'KEEP_BOTH')}>
                      بارگذاری و نگهداری هردو
                    </Button> */}

                    <label className="remember-option">
                      <input
                        type="checkbox"
                        onChange={this.rememberOptionForAll}
                        checked={this.state.useOptionForAll}
                        value={this.state.useOptionForAll}
                      />
                      <span className="bp3-control-indicator">انتخاب برای همه</span>
                    </label>
                    <div className="action-containter">
                      <Button
                        disabled={this.state.uploadOption === ''}
                        onClick={() => {
                          this.duplicateFileAction(index, this.state.uploadOption);
                        }}
                        intent={Intent.PRIMARY}
                      >
                        تایید
                      </Button>
                      <Button onClick={() => this.duplicateFileAction(index, 'CANCEL_ALL')}>
                        انصراف بارگذاری
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog>
            ) : null,
          )}

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

          <FileListComponent
            {...this.props}
            onDrop={this.onDrop}
            fileOrFolderDrop={this.fileOrFolderDrop}
            folderDragEnter={this.folderDragEnter}
            folderDragLeave={this.folderDragLeave}
          />
        </>
      );
    }
  };
};

export default List_HOC;
