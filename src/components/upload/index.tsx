import React from 'react';
import Draggable from 'react-draggable';
// import PropTypes from 'prop-types';
import { Card, Icon, Elevation, Spinner } from '@blueprintjs/core';
import { Util } from '../../helpers';
import './index.scss';

declare interface IProps {
  isMinimize: boolean;
  onToggleMinimize: () => void;
  itemsQueue: any[];
  onClose: () => void;
  uploadCancel: (file: any) => void;
  uploadPause: (file: any) => void;
  uploadResume: (file: any) => void;
  uploadRequest: (file: any) => void;
}

// class UploadBox extends Component {
//   mobileAndTabletCheck = Util.mobileAndTabletCheck();
//   static propTypes = {
//     isMinimize: PropTypes.bool.isRequired,
//     onToggleMinimize: PropTypes.func.isRequired,
//     itemsQueue: PropTypes.array.isRequired,
//     onClose: PropTypes.func.isRequired,
//     uploadCancel: PropTypes.func.isRequired,
//     uploadPause: PropTypes.func.isRequired,
//     uploadResume: PropTypes.func.isRequired,
//   };

//   render() {
//     const itemList = props.itemsQueue;
//     return (
//       <Draggable
//         handle={this.mobileAndTabletCheck ? '.disable-dragging' : '.header'}
//         bounds="parent"
//       >
//         <Card
//           interactive={true}
//           elevation={Elevation.TWO}
//           className={`upload-box ${Object.is(props.isMinimize, true) ? 'expand' : ''}`}
//         >

//           <div className="header">
//             <div className="pull-right">بارگذاری فایل</div>

//             <div className="pull-left">
//               {itemList.length > 5 && (
//                 <Icon
//                   icon={props.isMinimize ? 'minimize' : 'maximize'}
//                   iconSize={14}
//                   onClick={props.onToggleMinimize}
//                 />
//               )}
//               <Icon icon="cross" iconSize={16} onClick={props.onClose} />
//             </div>
//           </div>

//           <div className="files-list">
//             <div className="inner">
//               <table>
//                 <tbody>
//                   {itemList.map((file, index) => {
//                     return (
//                       <tr key={index} className="item">
//                         <td>
//                           <Icon icon="document" />
//                         </td>
//                         <td>
//                           <div className="file-name">{file.name}</div>
//                         </td>
//                         <td>
//                           {file.uploadState === 'SUCCESS' ? (
//                             <Icon icon="tick" iconSize={20} />
//                           ) : file.uploadState === 'ERROR' ? (
//                             <Icon icon="cross" iconSize={20} />
//                           ) : (
//                             <Icon
//                               icon="remove"
//                               iconSize={20}
//                               onClick={() => props.uploadCancel(file)}
//                             />
//                           )}
//                           {file.uploadState !== 'SUCCESS' && file.uploadState !== 'ERROR' ? (
//                             <>
//                               <Spinner
//                                 size="35"
//                                 value={file.progress.toFixed(1).toString()}
//                                 key={index + '_spinner'}
//                               />
//                               {file.progress.toFixed(1) < 0.9 ? (
//                                 file.uploadState === 'START' ? (
//                                   <Icon
//                                     icon="pause"
//                                     className="pause"
//                                     iconSize={17}
//                                     key={index + '_icon'}
//                                     onClick={() => props.uploadPause(file)}
//                                   />
//                                 ) : (
//                                   <Icon
//                                     icon="play"
//                                     className="play"
//                                     iconSize={17}
//                                     key={index + '_icon'}
//                                     onClick={() => props.uploadResume(file)}
//                                   />
//                                 )
//                               ) : null}
//                             </>
//                           ) : null}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </Card>
//       </Draggable>
//     );
//   }
// }

const UploadBox = (props: IProps) => {
  const mobileAndTabletCheck = Util.mobileAndTabletCheck();
  const itemList = props.itemsQueue;

  // const processUpload = (file: any) => {
  //   file.progress = 0;
  //   file.success = false;
  //   file.error = false;
  //   file.uploadState = 'START';
  //   if (!file.cancelUpload) {
  //     props.uploadRequest(file);
  //   }
  // };

  return (
    <Draggable handle={mobileAndTabletCheck ? '.disable-dragging' : '.header'} bounds="parent">
      <Card
        interactive={true}
        elevation={Elevation.TWO}
        className={`upload-box ${Object.is(props.isMinimize, true) ? 'expand' : ''}`}
      >
        <div className="header">
          <div className="pull-right">بارگذاری فایل</div>

          <div className="pull-left">
            {itemList.length > 5 && (
              <Icon
                icon={props.isMinimize ? 'minimize' : 'maximize'}
                iconSize={14}
                onClick={props.onToggleMinimize}
              />
            )}
            <Icon icon="cross" iconSize={16} onClick={props.onClose} />
          </div>
        </div>

        <div className="files-list">
          <div className="inner">
            <table>
              <tbody>
                {itemList.map((file, index) => {
                  return (
                    <tr key={index} className="item">
                      <td>
                        <Icon icon="document" />
                      </td>
                      <td>
                        <div className="file-name">{file.name}</div>
                      </td>
                      <td>
                        {file.uploadState === 'SUCCESS' ? (
                          <Icon icon="tick" iconSize={20} />
                        ) : file.uploadState === 'ERROR' ? (
                          <Icon
                            icon="refresh"
                            iconSize={16}
                            onClick={() => props.uploadResume(file)}
                            // onClick={() => processUpload(file)}
                          />
                        ) : (
                          <Icon
                            icon="remove"
                            iconSize={20}
                            onClick={() => props.uploadCancel(file)}
                          />
                        )}
                        {file.uploadState !== 'SUCCESS' &&
                        file.uploadState !== 'ERROR' &&
                        file.uploadState !== 'ERROR_NO_RETRY' ? (
                          <>
                            <Spinner
                              size={35}
                              value={file.progress.toFixed(1).toString()}
                              key={index + '_spinner'}
                            />
                            {file.progress.toFixed(1) < 0.9 ? (
                              file.uploadState === 'START' ? (
                                <Icon
                                  icon="pause"
                                  className="pause"
                                  iconSize={17}
                                  key={index + '_icon'}
                                  onClick={() => props.uploadPause(file)}
                                />
                              ) : (
                                <Icon
                                  icon="play"
                                  className="play"
                                  iconSize={17}
                                  key={index + '_icon'}
                                  onClick={() => props.uploadResume(file)}
                                />
                              )
                            ) : null}
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Draggable>
  );
};

export default UploadBox;
