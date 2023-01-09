import React, { useState, useReducer, useEffect } from 'react';
import './index.scss';
import { Intent } from '@blueprintjs/core';
import { createTeam } from './Redux/Actions';
import { connect } from 'react-redux';
import { AppToaster } from '../toast';

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_IMAGE':
//       return { ...state, errorMessage: null, image: action.value, avatar: action.file };
//     case 'SET_NAME':
//       return { ...state, errorMessage: null, name: action.value };
//     case 'SET_DESCRIPTION':
//       return { ...state, errorMessage: null, description: action.value };
//     case 'SET_PRIVACE':
//       return { ...state, errorMessage: null, acceptPrivacy: action.value };
//     case 'SET_ERROR':
//       return { ...state, errorMessage: action.value };
//     case 'SUBMIT_FORM':
//       return { ...state, errorMessage: null, submit: action.value };
//     case 'SET_SUCCESS':
//       return { ...state, submit: false, success: action.value };
//     case 'SET_REDIRECT':
//       return { ...state, redirectHash: action.value };
//     default:
//       throw new Error();
//   }
// };

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_REPO':
      return { ...state, repoId: action.value, spinner: true };
    case 'SET_DOC':
      return { ...state, docId: action.value, spinner: true };
    case 'SET_VERSION':
      return { ...state, vId: action.value, spinner: true };
    case 'SET_TOKEN':
      return { ...state, token: action.value, spinner: true };
    case 'UPDATE':
      return { ...state, spinner: false };
    case 'SET_AUTO_SAVE':
      return { ...state, autosave: action.value };
    default:
      throw new Error();
  }
};

const Index = props => {
  const [editFile, setFiles] = useState(null);
  const [fileName, setFileName] = useState(null);

  //   const initialState = {
  //     avatar: null,
  //     name: null,
  //     description: null,
  //     acceptPrivacy: false,
  //     image: null,
  //     errorMessage: null,
  //     submit: false,
  //     success: false,
  //     redirectHash: null,
  //   };

  const initialState = {
    repoId: null,
    docId: null,
    vId: null,
    token: null,
    spinner: true,
    autosave: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  //   const onChangeFileInput = e => {
  //     e.preventDefault();
  //     let files;
  //     if (e.dataTransfer) {
  //       files = e.dataTransfer.files;
  //     } else if (e.target) {
  //       files = e.target.files;
  //     }
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setFiles(reader.result);
  //     };
  //     if (files[0]) {
  //       setFileName(files[0].name);
  //       reader.readAsDataURL(files[0]);
  //     }
  //   };

  const onChangeFileInput = e => {
    e.preventDefault();
    const fieldName = e.target.name;
    let type = null;
    switch (fieldName) {
      case 'repoId':
        type = 'SET_REPO';
        break;
      case 'docId':
        type = 'SET_DOC';
        break;
      case 'vId':
        type = 'SET_VERSION';
        break;
      case 'token':
        type = 'SET_TOKEN';
        break;
      default:
        type = null;
    }
    if (type) {
      dispatch({
        type,
        value: e.target.value,
      });
    }
  };
  //   const saveImage = image => {
  //     const file = Util.dataURLtoFile(image, fileName);
  //     dispatch({
  //       type: 'SET_IMAGE',
  //       value: image,
  //       file,
  //     });
  //     setFiles(null);
  //   };

  //   const validateForm = () => {
  //     let message = null;
  //     switch (true) {
  //       case !state.name:
  //         message = 'لطفا نام کسب و کار خود را انتخاب کنید.';
  //         break;
  //       case !state.acceptPrivacy:
  //         message = 'شرایط و قوانین تایید نشده است.';
  //         break;
  //       default:
  //     }
  //     if (message) {
  //       dispatch({
  //         type: 'SET_ERROR',
  //         value: message,
  //       });
  //       return true;
  //     }
  //     return false;
  //   };

  let timeout;
  //   const submitForm = e => {
  //     e.preventDefault();
  //     if (!validateForm()) {
  //       dispatch({
  //         type: 'SUBMIT_FORM',
  //         value: true,
  //       });
  //       props.onCreateTeam(
  //         {
  //           avatar: state.avatar,
  //           name: state.name,
  //           description: state.description,
  //         },
  //         result => {
  //           dispatch({
  //             type: 'SET_SUCCESS',
  //             value: result !== 'ERROR',
  //           });
  //           if (result !== 'ERROR') {
  //             timeout = setTimeout(() => {
  //               dispatch({
  //                 type: 'SET_REDIRECT',
  //                 redirectHash: result.folder,
  //               });
  //             }, 2000);
  //           }
  //         },
  //       );
  //     }
  //   };

  useEffect(() => {
    return () => {
      clearTimeout(timeout);
    };
  }, [timeout]);

  const onSave = editorContent => {
    console.log(editorContent);
  };

  const handleError = error => {
    AppToaster.show({
      message: error.message || 'خطایی رخ داده.',
      icon: 'warning-sign',
      intent: Intent.DANGER,
    });
  };

  const handleClose = () => {
    console.log('close the editor after save');
  };

  const updateClasor = e => {
    e.preventDefault();
    if (state.token && state.docId && state.repoId && state.vId) {
      dispatch({
        type: 'UPDATE',
      });
    } else {
      AppToaster.dismiss('alert-clasor-toast');
      AppToaster.show({
        message: 'مقادیر وارد شده صحیح نیست.',
        icon: 'warning-sign',
        intent: Intent.WARNING,
      });
    }
  };

  return (
    <div className="team-space-wrapper">
      {/* {state.redirectHash ? <Redirect to={`/folders/${state.redirectHash}`} /> : null}
      <h4 className="title">درخواست اتصال کسب و کار به پاداسپیس</h4>
      <form onSubmit={submitForm}>
        <div className="bp3-form-group avatar">
          <label className="bp3-label" htmlFor="form-group-input">
            لوگو
          </label>
          <label className="bp3-label file-input" htmlFor="form-group-input">
            {state.image ? (
              <img src={state.image} alt="logo" width="75" height="75" />
            ) : (
              <Icon
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18.588"
                    height="13.27"
                    viewBox="0 0 18.588 13.27"
                  >
                    <g
                      fill="#e0e0e0"
                      id="prefix__add_1_"
                      data-name="add (1)"
                      transform="translate(-21.999 -89)"
                    >
                      <path
                        id="prefix__Path_1439"
                        d="M23.3 263.433h3.052L30 259.848l-3.88-1.9-4.12 2.397v1.771a1.309 1.309 0 0 0 1.3 1.317z"
                        className="prefix__cls-1"
                        data-name="Path 1439"
                        transform="translate(0 -162.246)"
                      />
                      <path
                        id="prefix__Path_1440"
                        d="M26.224 95.142l4.192 2.043 3.606-3.543a.279.279 0 0 1 .356-.029l2.673 1.892a3.69 3.69 0 0 1 2.217.44V90.3a1.311 1.311 0 0 0-1.32-1.3H23.3a1.294 1.294 0 0 0-1.3 1.3v7.157l3.968-2.3a.268.268 0 0 1 .256-.015zm3.447-3.93A1.675 1.675 0 1 1 28 92.887a1.675 1.675 0 0 1 1.675-1.675z"
                        className="prefix__cls-1"
                        data-name="Path 1440"
                      />
                      <path
                        id="prefix__Path_1441"
                        d="M188.19 160.978a1.119 1.119 0 1 0-1.119-1.119 1.119 1.119 0 0 0 1.119 1.119z"
                        className="prefix__cls-1"
                        data-name="Path 1441"
                        transform="translate(-158.519 -66.972)"
                      />
                      <path
                        id="prefix__Path_1442"
                        d="M333.256 269.4a3.116 3.116 0 1 0 3.116-3.116 3.116 3.116 0 0 0-3.116 3.116zm3.364-1.659v1.429h1.429a.278.278 0 0 1 0 .556h-1.429v1.389a.278.278 0 0 1-.556 0v-1.389h-1.389a.278.278 0 0 1 0-.556h1.389v-1.429a.278.278 0 1 1 .556 0z"
                        className="prefix__cls-1"
                        data-name="Path 1442"
                        transform="translate(-298.901 -170.244)"
                      />
                      <path
                        id="prefix__Path_1443"
                        d="M160.783 221.585l-2.071-1.465-7.1 6.982h7.266a3.675 3.675 0 0 1 1.9-5.517z"
                        className="prefix__cls-1"
                        data-name="Path 1443"
                        transform="translate(-124.467 -125.915)"
                      />
                    </g>
                  </svg>
                }
                iconSize={14}
              />
            )}
            <input type="file" className="custom-file-input" onChange={onChangeFileInput} />
          </label>
          <Dialog
            icon={true}
            onClose={() => {
              if (fileName) {
                setFiles(null);
              }
            }}
            title="ویرایش لوگو"
            className="header modal-custom"
            isOpen={editFile}
            canOutsideClickClose={false}
            autoFocus={true}
          >
            <div className={Classes.DIALOG_BODY}>
              <CropperImage editFile={editFile} saveImage={saveImage} />
            </div>
          </Dialog>
        </div>
        <div className="bp3-form-group">
          <label className="bp3-label" htmlFor="form-group-input">
            نام کسب و کار
          </label>
          <div className="bp3-form-content">
            <div className="bp3-input-group ">
              <input
                id="form-group-input"
                type="text"
                className="bp3-input"
                placeholder="نام کسب و کار خود را وارد کنید "
                dir="auto"
                onChange={event => {
                  dispatch({
                    type: 'SET_NAME',
                    value: event.target.value,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className="bp3-form-group">
          <label className="bp3-label" htmlFor="form-group-input">
            توضیحات
          </label>
          <TextArea
            large={true}
            intent={Intent.DEFAULT}
            onChange={event => {
              dispatch({
                type: 'SET_DESCRIPTION',
                value: event.target.value,
              });
            }}
          />
        </div>
        <div className="bp3-form-group privacy">
          <label className="option">
            <input
              type="checkbox"
              onChange={() => {
                dispatch({
                  type: 'SET_PRIVACE',
                  value: !state.acceptPrivacy,
                });
              }}
            />
            <span className="bp3-control-indicator">شرایط و قوانین موجود را می پذیرم.</span>
          </label>
        </div>
        <div className="action-buttons">
          {state.success ? (
            <h3 className="label-success">
              کسب و کار {state.name} با موفقیت ایجاد گردید. در حال انتقال به پوشه مورد نظر ...
            </h3>
          ) : (
            <Button
              loading={state.submit}
              className="cropp-btn"
              type="submit"
              intent={Intent.PRIMARY}
            >
              ارسال
            </Button>
          )}
        </div>
        <div className="error">
          {state.errorMessage ? <label>{state.errorMessage}</label> : null}
        </div>
      </form> */}
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  onCreateTeam: (teamDetails, onEnd) => dispatch(createTeam(teamDetails, onEnd)),
});

export default connect(null, mapDispatchToProps, null)(Index);
