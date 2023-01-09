import React, { Fragment } from 'react';
import { Button, Intent, Dialog, Classes } from '@blueprintjs/core';
import Manifest from '../../manifest';
import { Util } from '../../helpers';
import CommentsInfo from './comments';
// import { getComments, sendComment, likeComment } from './actions';
import { connect } from 'react-redux';
import { spinner as Spinner } from '../loading';
import defaultAvatar from '../../assets/images/default-avatar.png';
const mapStateToProps = state => ({
  loading: state.files.activities.isLoading,
  comments: state.files.activities.comments,
  filter: state.sidebar.filter.selected,
});

const mapDispatchToProps = dispatch => ({
  // getComments: id => dispatch(getComments(id)),
  // sendComment: (id, comment) => dispatch(sendComment(id, comment)),
  // likeComment: (id, liked) => dispatch(likeComment(id, liked)),
});

class InformationSide extends React.Component {
  state = {
    commmentSideBar: false,
    dialogSection: '',
    dialog: false,
    selfShare: true,
    dialogTitle: '',
    confirm: false,
    shareHash: null,
    fileHash: null,
    shareType: null,
  };

  // componentDidMount() {
  // if (this.props.onToggleComments && typeof this.props.onToggleComments === 'function') {
  //   this.props.onToggleComments(this.toggleComments);
  // }
  // }

  componentDidUpdate(prevProps) {
    if (this.props.data.hash !== prevProps.data.hash) {
      this.setState({ commmentSideBar: false });
    }
  }

  restoreFile = item => {
    const hash = item.hash;
    const fileHash = this.props.data.hash;
    this.props.restoreFile(hash, fileHash);
  };

  confirmRemove() {
    const { shareHash, fileHash, selfShare } = this.state;
    let { shareType } = this.state;
    const shares = this.props.shares.shares;

    this.setState({
      shareHash: null,
      fileHash: null,
      confirm: false,
      dialog: shares.length > 1,
      shareType: null,
    });
    this.props.removeShare(shareHash, fileHash, shareType, selfShare);
  }

  showRemoveAlert = (shareHash, shareType, selfShare) => {
    const fileHash = this.props.data.hash;

    this.setState({
      shareHash,
      fileHash,
      confirm: true,
      selfShare, // if true its shred by itself but in false case it shared by parent
      shareType,
      dialogTitle: this.updateDialog('access', true),
    });
  };

  // toggleComments = () => {
  //   if (!this.state.commmentSideBar) {
  //     const { data } = this.props;
  //     this.props.getComments(data.postId);
  //   }
  //   this.setState({
  //     commmentSideBar: !this.state.commmentSideBar,
  //   });
  // };

  // likeComment(commentID, liked) {
  //   this.props.likeComment(commentID, liked);
  // }

  handleCloseDialog = () => {
    this.setState({
      dialogSection: '',
      dialog: false,
      confirm: false,
    });
  };

  handleOpenDialog = dialogName => {
    if (dialogName === 'access') {
      this.setState({
        dialogSection: dialogName,
        dialog: true,
        dialogTitle: this.updateDialog(dialogName),
      });
    } else {
      this.setState({
        dialogSection: dialogName,
        dialog: true,
        dialogTitle: this.updateDialog(dialogName),
      });
    }
  };

  updateDialog(dialogSection, confirm = false) {
    const shares = this.props.shares;
    if (dialogSection === 'access') {
      if (shares.shares.length === 0) {
        this.handleCloseDialog();
        return '';
      } else {
        return !shares.isLoading &&
          !shares.hasError &&
          shares.shares &&
          Array.isArray(shares.shares) &&
          shares.shares.length > 0
          ? confirm
            ? 'حذف دسترسی'
            : Util.toPersinaDigit(shares.shares.length) +
              ` عضو به این فایل دسترسی ` +
              (shares.shares.length > 1 ? 'دارند' : 'دارد')
          : '';
      }
    } else if (dialogSection === 'activity') {
      return 'فعالیت های ثبت شده';
    } else if (dialogSection === 'history') {
      return 'نسخه ثبت شده';
    } else if (dialogSection === 'comments') {
      return 'نظر ثبت شده';
    } else {
      return '';
    }
  }

  filePreview = () => {
    sessionStorage.setItem('back_url', window.location.pathname);
    if (this.props.data && this.props.data.hash && this.props.history) {
      this.props.history.push(`/file/${this.props.data.hash}`);
    }
  };

  render() {
    const {
      data,
      render,
      loading,
      comments,
      // sendComment,
      // likeComment,
      filter,
      shares,
      histories,
      activities,
      isPublic,
      showPreview,
    } = this.props;
    const { commmentSideBar, dialogSection, dialog, dialogTitle, selfShare } = this.state;
    let preview;
    const fileType = data.type && data.type.substr(0, data.type.indexOf('/'));
    const classFileType = Util.getFileIcon(data, Object.is(data.type_, 'file'));

    if (data.type === 'application/pdf') {
      preview = (
        <div
          className={`thumb vector ${Object.is(data.type_, 'folder') ? 'folder' : classFileType}`}
          onClick={() => this.props.onPdfItem(data)}
        ></div>
      );
    } else if (data.thumbnail?.startsWith('THUMBNAIL_EXIST')) {
      const token = localStorage.getItem('access_token');
      preview = (
        <div className="thumb">
          <img
            src={`${Manifest.server.api.address}files/${data.hash}/thumbnail?Authorization=${token}&t=${data.updated}`}
            alt=""
            onClick={() => this.props.onImageItem(data)}
          />
        </div>
      );
    } else if (Object.is(fileType, 'audio')) {
      preview = (
        <div
          className={`thumb vector ${Object.is(data.type_, 'folder') ? 'folder' : classFileType}`}
          onClick={() => this.props.onAudioItem(data)}
        ></div>
      );
    } else if (Object.is(fileType, 'video')) {
      preview = (
        <div
          className={`thumb vector ${Object.is(data.type_, 'folder') ? 'folder' : classFileType}`}
          onClick={() => this.props.onVideoItem(data)}
        ></div>
      );
    } else {
      preview = (
        <div
          className={`thumb vector ${Object.is(data.type_, 'folder') ? 'folder' : classFileType}`}
        ></div>
      );
    }
    return (
      <Fragment>
        {commmentSideBar ? (
          <CommentsInfo
            // likeComment={likeComment}
            // data={data}
            loading={loading}
            // sendComment={sendComment}
            comments={comments}
            // toggleComments={this.toggleComments}
          />
        ) : (
          <div className="inner">
            {render()}
            <div className="details">
              <div className="top">{showPreview ? preview : null}</div>
              <div
                id="Tabs"
                className={`infoTab${Object.is(data.type_, 'file') ? ' has-histories' : ''}`}
              >
                <InfoTab
                  data={data}
                  shares={shares}
                  activities={activities}
                  // toggleComments={this.toggleComments}
                  handleOpenDialog={name => this.handleOpenDialog(name)}
                  histories={histories}
                  commentsLength={comments.length}
                  filter={filter}
                  isPublic={isPublic}
                  filePreview={this.filePreview}
                />
              </div>
            </div>
          </div>
        )}

        {dialog ? (
          <Dialog
            key={2}
            icon=""
            isOpen={dialog}
            onClose={this.handleCloseDialog}
            title={dialogTitle}
            className="header modal-custom share-modal full-on-mobile"
          >
            <div className={Classes.DIALOG_BODY}>
              {this.state.confirm ? (
                <Fragment>
                  <label>آیا از حذف اشتراک گذاری اطمینان دارید ؟</label>
                  {!selfShare && (
                    <small style={{ color: 'red', display: 'block', marginTop: 15 }}>
                      در صورت حذف اشتراک ، اشتراک فولدر بالاتر و فایل ها و فولدر های مرتبط آن نیز از
                      بین خواهد رفت
                    </small>
                  )}

                  <div className="button-group">
                    <Button
                      intent={Intent.PRIMARY}
                      outlined={'true'}
                      onClick={() =>
                        this.setState({
                          confirm: false,
                          dialogTitle: this.updateDialog('access'),
                        })
                      }
                    >
                      انصراف
                    </Button>
                    <Button intent={Intent.PRIMARY} onClick={() => this.confirmRemove()}>
                      تایید
                    </Button>
                  </div>
                </Fragment>
              ) : dialogSection === 'access' &&
                !shares.isLoading &&
                !shares.hasError &&
                shares.shares &&
                Array.isArray(shares.shares) &&
                shares.shares.length > 0 ? (
                <Fragment>
                  {shares.shares.map((item, index) => {
                    return (
                      <div className="access-dialog" key={index}>
                        <div className="user-avatar">
                          {item.person && item.person.avatar ? (
                            <img src={item.person.avatar} width="40" height="40" alt="avatar" />
                          ) : (
                            <img src={defaultAvatar} width="100%" height="100%" alt="avatar" />
                            // <img src={defaultAvatar} width="26" height="26" alt="avatar" />
                          )}
                        </div>
                        <p className="username">
                          {item.type === 'PUBLIC'
                            ? 'عمومی'
                            : item.type === 'UNIQUE'
                            ? 'عمومی یکتا'
                            : item.person.name || item.person.username}
                        </p>
                        <small>
                          ({item.level === 'EDIT' ? 'خواندن و نوشتن' : 'فقط خواندن'} ، انقضا:{' '}
                          {Util.fileDateFa(item.expiration)})
                        </small>
                        <p className="remove-icon">
                          {item.creator.username === localStorage.getItem('username') && (
                            <span
                              className="bp3-icon bp3-icon-delete"
                              onClick={() =>
                                this.showRemoveAlert(item.hash, item.type, item.selfShare)
                              }
                              title="حذف اشتراک"
                            ></span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </Fragment>
              ) : null}
              {dialogSection === 'activity' &&
              !activities.isLoading &&
              activities.activities &&
              Array.isArray(activities.activities) &&
              activities.activities.length > 0 ? (
                <Fragment>
                  <div className="activity-list">
                    {!activities.isLoading &&
                      activities.activities &&
                      Array.isArray(activities.activities) &&
                      activities.activities.length > 0 &&
                      activities.activities.map((v, i) => {
                        if (v.kind && v.created) {
                          return (
                            <div className="activity-item" key={i}>
                              <strong>{Util.activityName(v.kind)}</strong> در{' '}
                              {Util.fileDateTimeFa(v.created)}
                            </div>
                          );
                        } else return null;
                      })}
                  </div>
                </Fragment>
              ) : null}
              {dialogSection === 'history'
                ? Object.is(data.type_, 'file') && (
                    <HistoryTab histories={this.props.histories} restoreFile={this.restoreFile} />
                  )
                : null}
              {shares.isLoading || activities.isLoading || histories.isLoading ? (
                <div className="text-center">
                  <Spinner />
                </div>
              ) : null}
            </div>
          </Dialog>
        ) : null}
      </Fragment>
    );
  }
}

const HistoryTab = props => {
  const { histories, restoreFile } = props;
  const versions = histories.histories;
  return (
    <React.Fragment>
      <div className="history-list">
        {!histories.isLoading &&
          versions &&
          Array.isArray(versions) &&
          versions.length > 0 &&
          versions.map(item => {
            if (item.created) {
              return (
                <div className="history-item" key={item.version}>
                  <strong className="date">
                    {item.name}
                    {item.extension ? '.' + item.extension : ''}{' '}
                    <span className="bp3-dir-rtl">
                      {' '}
                      (
                      {item.version === 0
                        ? 'نسخه اصلی'
                        : item.version === versions[versions.length - 1].version
                        ? 'آخرین نسخه'
                        : ' نسخه ' + Util.toPersinaDigit(item.version)}
                      )
                    </span>
                  </strong>

                  <div className="item">
                    {item.version === versions[versions.length - 1].version ? null : (
                      <Button
                        icon="updated"
                        intent={Intent.PRIMARY}
                        onClick={() => restoreFile(item)}
                      ></Button>
                    )}
                    در {Util.fileDateTimeFa(item.created)}
                  </div>
                </div>
              );
            } else return null;
          })}
      </div>
    </React.Fragment>
  );
};

const InfoTab = props => {
  const {
    data,
    shares,
    activities,
    handleOpenDialog,
    // toggleComments,
    histories,
    // commentsLength,
    filter,
    isPublic,
    filePreview,
  } = props;
  let ownerMessage = '';
  if (filter === 'search' && data.type_ === 'file') {
    ownerMessage = 'مالک فایل';
  } else if (filter === 'shared') {
    ownerMessage = 'اشتراک گذاری شده توسط';
  } else if (data.type_ === 'folder') {
    ownerMessage = 'سازنده پوشه';
  } else {
    ownerMessage = 'آپلود کننده';
  }
  return (
    <div className="info">
      <table>
        <tbody>
          <tr>
            <th>نام</th>
            <td style={{ direction: 'ltr' }}>
              {data.name} {data.extension && `.${data.extension}`}
            </td>
          </tr>
          {data.type_ === 'file' && (
            <>
              <tr>
                <th>نوع</th>
                <td>{data.type}</td>
              </tr>
              <tr>
                <th>سایز</th>
                <td className="ltr">{data.size_}</td>
              </tr>
            </>
          )}
          <tr>
            <th>تاریخ ساخت</th>
            <td>{data.created_}</td>
          </tr>
          <tr>
            <th>تاریخ ویرایش</th>
            <td>{data.updated_}</td>
          </tr>
          {data.type_ === 'file' &&
          window.location.pathname !== `/file/${data.hash}` &&
          filter !== 'trash' ? (
            <tr>
              <td></td>
              <td className="align-left">
                <button className="info-btn" onClick={filePreview}>
                  نمایش فایل
                </button>
              </td>
            </tr>
          ) : null}
          <tr>
            <td colSpan="2">
              <div className="line"></div>
            </td>
          </tr>
          <tr>
            <th>مالک فایل</th>
            <td className="uploader">
              <div className="user-avatar">
                {data.owner && data.owner.avatar ? (
                  <img src={data.owner.avatar} width="26" height="26" alt="avatar" />
                ) : (
                  <img src={defaultAvatar} width="26" height="26" alt="avatar" />
                )}
              </div>
              <div className="user-name">{(data && data.owner && data.owner.username) || '_'}</div>
            </td>
          </tr>
          <tr>
            <th>آپلود کننده</th>
            <td className="uploader">
              <div className="user-avatar">
                {data.uploader && data.uploader.avatar ? (
                  <img src={data.uploader.avatar} width="26" height="26" alt="avatar" />
                ) : (
                  <img src={defaultAvatar} width="26" height="26" alt="avatar" />
                )}
              </div>
              <div className="user-name">
                {(data && data.uploader && data.uploader.username) || '_'}
              </div>
            </td>
          </tr>
          {!isPublic &&
          (data.type_ === 'file' || data.type_ === 'folder') &&
          shares &&
          !shares.isLoading &&
          shares.shares &&
          shares.shares.length > 0 ? (
            <tr>
              <th>دسترسی ها</th>
              <td className="access">
                <div className="pull-left"></div>
                <div className="pull-right">
                  <div className="user-group">
                    {!shares.isLoading &&
                      !shares.hasError &&
                      shares.shares &&
                      Array.isArray(shares.shares) &&
                      shares.shares.length > 0 &&
                      shares.shares.map((item, index) => {
                        if (index < 3) {
                          return (
                            <div key={index} className="user user-avatar">
                              {item.person && item.person.avatar ? (
                                <img src={item.person.avatar} width="26" height="26" alt="avatar" />
                              ) : (
                                <img src={defaultAvatar} width="26" height="26" alt="avatar" />
                              )}
                            </div>
                          );
                        } else {
                          return null;
                        }
                      })}
                  </div>
                </div>
                <button className="info-btn" onClick={() => handleOpenDialog('access')}>
                  نمایش همه
                </button>
              </td>
            </tr>
          ) : null}
          <tr>
            <th colSpan="2">
              <div className="line"></div>
            </th>
          </tr>
          {!isPublic ? (
            <Fragment>
              <tr>
                <th colSpan="2">
                  <div className="title-lines">فعالیت‌ها</div>
                </th>
              </tr>

              <tr>
                <td className="value-color">
                  {activities && !activities.hasError
                    ? Util.toPersinaDigit(activities.activities.length) + ' فعالیت ثبت شده '
                    : 'فعالیتی ثبت نشده است'}
                </td>
                {activities && !activities.hasError && activities.activities.length > 0 ? (
                  <td className="align-left">
                    <button className="info-btn" onClick={() => handleOpenDialog('activity')}>
                      نمایش همه
                    </button>
                  </td>
                ) : null}
              </tr>
            </Fragment>
          ) : null}
          {!isPublic && histories && histories.histories && data.type_ === 'file' ? (
            <>
              <tr>
                <th colSpan="2">
                  <div className="title-lines">تعداد نسخه‌ها</div>
                </th>
              </tr>

              <tr>
                <td className="value-color">
                  {Util.toPersinaDigit(histories.histories.length)} نسخه تولید شده
                </td>
                <td className="align-left">
                  <button className="info-btn" onClick={() => handleOpenDialog('history')}>
                    نمایش همه
                  </button>
                </td>
              </tr>
            </>
          ) : null}
          {/* {!isPublic && data.type_ === 'file' && data.postId && data.postId !== 0 ? (
            <Fragment>
              <tr>
                <th colSpan="2">
                  <div className="title-lines">نظرات کاربران</div>
                </th>
              </tr>

              <tr>
                <td className="value-color">{Util.toPersinaDigit(commentsLength)} نظر ثبت شده</td>
                <td className="align-left">
                  <button className="info-btn" onClick={() => toggleComments()}>
                    نمایش همه
                  </button>
                </td>
              </tr>
            </Fragment>
          ) : null} */}
        </tbody>
      </table>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(InformationSide);
