import React, { useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { addMember, removeMember, getTeamMember } from '../Redux/Actions';
import { Classes, Dialog, Intent, Icon, Button } from '@blueprintjs/core';
import './Scss/UserInfo.scss';
import { changeFolder } from '../../files-list/actions';

const authority = {
  VIEWER: 'خواندن',
  EDITOR: 'نوشتن',
  MANAGER: 'مدیریت',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FORM':
      return { ...state, errorMessage: null, formData: action.value };
    case 'DISABLE_FORM':
      return { ...state, errorMessage: null, disableForm: action.value };
    case 'SET_USERS_TEAM':
      return {
        ...state,
        users: action.value,
        selectMember: null,
        currentUserIsManager: action.currentUserIsManager,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.value };
    case 'SET_USER':
      return { ...state, dialog_loading: false, selectMember: action.value };
    case 'SET_DIALOG_LOADING':
      return { ...state, dialog_loading: action.value };
    default:
      throw new Error();
  }
};

const UsersInfo = props => {
  const initialState = {
    disableForm: true,
    loading: false,
    users: null,
    currentUserIsManager: false,
    formData: {
      identity: null,
      authority: 'VIEWER',
    },
    selectMember: null,
    dialog_loading: false,
    errorMessage: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleChange = e => {
    if (e.target.name === 'identity') {
      dispatch({
        type: 'UPDATE_FORM',
        value: {
          ...state.formData,
          identity: e.target.value,
        },
      });
    } else if (e.target.name === 'authority') {
      dispatch({
        type: 'UPDATE_FORM',
        value: {
          ...state.formData,
          authority: e.target.value,
        },
      });
    }
  };

  const submitForm = event => {
    event.preventDefault();
    if (!state.formData.identity) {
      dispatch({
        type: 'SET_ERROR',
        value: 'لطفا نام کاربری مورد نظر را وارد کنید.',
      });
    } else {
      dispatch({
        type: 'SET_LOADING',
        value: true,
      });
      props.onAddMember(
        {
          ...state.formData,
          hash: props.team.hash,
        },
        result => {
          if (result !== 'ERROR') {
            getMembers();
          } else {
            dispatch({
              type: 'SET_LOADING',
              value: false,
            });
          }
        },
      );
    }
  };

  const removeFromTeam = () => {
    const selectMember = state.selectMember;
    dispatch({
      type: 'SET_DIALOG_LOADING',
      value: true,
    });
    props.onRemoveMember(selectMember.user.username, props.team.hash, result => {
      if (result !== 'ERROR') {
        getMembers();
      } else {
        dispatch({
          type: 'SET_DIALOG_LOADING',
          value: false,
        });
      }
    });
  };

  const generateRow = userList => {
    return userList.map((userItem, index) => (
      <tr key={userItem.user.username}>
        <td>
          <div className="user-info">
            <span className="avatar">
              {userItem.user.avatar ? (
                <img src={userItem.user.avatar} width="40" height="40" alt="avatar" />
              ) : null}
            </span>
            <span className="username">{userItem.user.name || '_'}</span>
          </div>
        </td>
        <td>{userItem.user.username || '_'}</td>
        <td>{authority[userItem.authority]}</td>
        {state.currentUserIsManager ? (
          <td className="actions" title="حذف">
            <Icon
              icon="cross"
              iconSize={20}
              onClick={() =>
                dispatch({
                  type: 'SET_USER',
                  value: userItem,
                })
              }
            />
          </td>
        ) : (
          '_'
        )}
      </tr>
    ));
  };

  const getMembers = () => {
    props.onGetTeamMember(props.team.hash, result => {
      if (result !== 'ERROR') {
        dispatch({
          type: 'SET_USERS_TEAM',
          value: result.members || [],
          currentUserIsManager: state.currentUserIsManager,
        });
      }
    });
  };

  useEffect(() => {
    const username = window.localStorage.getItem('username');
    let currentUserIsManager = false;
    if (props.team && props.team.owner && props.team.owner.username === username) {
      currentUserIsManager = true;
    } else if (props.team && props.team.members) {
      const findCurrentUser = props.team.members.find(member => member.user.username === username);
      currentUserIsManager = findCurrentUser && findCurrentUser.authority === 'VIEWER';
    }
    dispatch({
      type: 'SET_USERS_TEAM',
      value: props.team.members || [],
      currentUserIsManager,
    });
    return () => {};
  }, [props.team]);

  return (
    <div className="team-wrapper">
      {state.users && state.users.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table cellSpacing="0" cellPadding="0">
              <thead>
                <tr>
                  <th>نام عضو سازمان</th>
                  <th>نام کاربری</th>
                  <th>سطح دسترسی</th>
                  <th className="actions">حذف دسترسی</th>
                </tr>
              </thead>
              <tbody>{generateRow(state.users)}</tbody>
            </table>
          </div>
          {state.selectMember ? (
            <Dialog
              icon={true}
              onClose={() => {
                if (state.selectMember) {
                  dispatch({
                    type: 'SET_USER',
                    value: null,
                  });
                }
              }}
              title="حذف عضویت"
              className="header modal-custom"
              isOpen={state.selectMember}
              canOutsideClickClose={false}
              autoFocus={true}
            >
              <div className={Classes.DIALOG_BODY}>
                <p>آیا از حذف عضویت {state.selectMember.user.username} اطمینان دارید ؟</p>
              </div>
              <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                  <Button
                    onClick={() =>
                      dispatch({
                        type: 'SET_USER',
                        value: null,
                      })
                    }
                  >
                    انصراف
                  </Button>
                  <Button
                    loading={state.dialog_loading}
                    intent={Intent.PRIMARY}
                    onClick={removeFromTeam}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </Dialog>
          ) : null}
        </>
      ) : (
        <div className="empty-message">
          هنوز عضوی اضافه نشده است.
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="prefix__error"
              width="14.057"
              height="14.057"
              viewBox="0 0 14.057 14.057"
            >
              <g id="prefix__Group_133" data-name="Group 133">
                <path
                  id="prefix__Path_1347"
                  fill="#90a4ae"
                  d="M7.029 0a7.029 7.029 0 1 0 7.029 7.029A7.037 7.037 0 0 0 7.029 0zm0 11.714a.586.586 0 1 1 .586-.586.586.586 0 0 1-.586.586zm.586-2.05a.293.293 0 0 1-.293.293h-.586a.293.293 0 0 1-.293-.293V2.636a.293.293 0 0 1 .293-.293h.586a.293.293 0 0 1 .293.293z"
                  data-name="Path 1347"
                />
              </g>
            </svg>
          </span>
        </div>
      )}
      <div className="user-form">
        <div className="description">
          <button
            className="new-user"
            onClick={() => {
              dispatch({
                type: 'DISABLE_FORM',
                value: false,
              });
            }}
          >
            <Icon icon="person" iconSize={15} />
            <span className="button-title"> افزودن عضو جدید به {props.team.name} </span>
          </button>
        </div>
        <form onSubmit={submitForm} autoComplete="off">
          <div className="bp3-form-group">
            <label className="bp3-label" htmlFor="form-group-input">
              افزودن
            </label>
            <input
              type="text"
              className="bp3-input"
              name="identity"
              placeholder="فرد مورد نظر"
              disabled={state.disableForm}
              onChange={handleChange}
            />
          </div>
          <div className="bp3-form-group">
            <label className="bp3-label" htmlFor="form-group-input">
              با نوع دسترسی
            </label>
            <select
              name="authority"
              placeholder="انتخاب نمایید"
              onChange={handleChange}
              disabled={state.disableForm}
            >
              <option value="VIEWER">{authority['VIEWER']}</option>
              <option value="EDITOR">{authority['EDITOR']}</option>
              <option value="MANAGER">{authority['MANAGER']}</option>
            </select>
          </div>
          <Button
            loading={state.loading}
            type="submit"
            disabled={state.disableForm}
            className="add-user"
          >
            افزودن
          </Button>
        </form>
        <div className="team-detail">
          <small>شما می توانید تعداد 16 نفر را در حساب سازمانی خود اضافه نمایید</small>
          <NavLink
            className="folder-link"
            to={`/folders/${props.team.folder}`}
            onClick={() => {
              props.onChangeFolder();
            }}
          >
            نمایش پوشه مربوطه
          </NavLink>
        </div>
        {state.errorMessage ? (
          <div className="error">
            <label>{state.errorMessage}</label>
          </div>
        ) : null}
      </div>
    </div>
  );
};
const mapDispatchToProps = dispatch => ({
  onAddMember: (userDetails, onEnd) => dispatch(addMember(userDetails, onEnd)),
  onRemoveMember: (identity, teamHash, onEnd) => dispatch(removeMember(identity, teamHash, onEnd)),
  onGetTeamMember(teamHash, onEnd) {
    dispatch(getTeamMember(teamHash, onEnd));
  },
  onChangeFolder: () => {
    dispatch(changeFolder(null, null));
  },
});

export default connect(null, mapDispatchToProps)(UsersInfo);
