import React, { Fragment } from 'react';
import { Util } from '../../helpers';
import Loading from '../loading';
import './index.scss';
import { Icon } from '@blueprintjs/core';
import { Button, Intent } from '@blueprintjs/core';

class CommentsInfo extends React.Component {
  state = {
    comment: '',
  };
  userName = localStorage.getItem('fullName') || '';
  avatar = localStorage.getItem('avatar');

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    this.commentlist.scrollIntoView({ behavior: 'smooth' });
  };

  enterPressed = event => {
    const code = event.keyCode || event.which;
    if (code === 13) {
      //13 is the enter keycode
      const { sendComment, data } = this.props;
      const { comment } = this.state;
      sendComment(data.postId, comment);
      this.clearText();
    }
  };

  componentWillUnmount() {
    if (this.TimeOut) {
      clearTimeout(this.TimeOut);
    }
  }

  clearText = () => {
    this.setState({
      comment: '',
    });
  };

  handleComment = event => {
    this.setState({
      comment: event.target.value,
    });
  };

  saveComment = () => {
    const { comment } = this.state;
    const { sendComment, data } = this.props;
    sendComment(data.postId, comment);
    this.clearText();
  };

  render() {
    const { toggleComments, comments, likeComment } = this.props;
    const { comment } = this.state;

    return (
      <Fragment>
        <div className="inner" style={{ alignItems: 'flex-end' }}>
          <div className="header-wrapper">
            <div className="header">
              <div className="pull-left" onClick={() => toggleComments()}>
                <i className="icon-close"></i>
              </div>
              <strong className="comment-title">نظرات کاربران</strong>
              <Icon className="pull-right pin-icon" icon="pin" iconSize={18} />
            </div>
          </div>
          <div className="new-comment">
            {this.userName ? (
              <div className="owner-details">
                <div className="user-avatar">
                  {this.avatar ? (
                    <img className="comment-avatar user-avatar" src={this.avatar} alt="avatar" />
                  ) : null}
                </div>
                <h4>{this.userName}</h4>
              </div>
            ) : null}
            <input
              className="new-comment-input"
              value={comment}
              onChange={this.handleComment}
              onKeyPress={this.enterPressed}
              placeholder="نظر خود را بنویسید"
              ref={this.commentRef}
            ></input>
            <small className="owner-name">این نظر توسط مشترکان این فایل قابل نمایش است</small>
            <div className="button-wrapper">
              <Button intent={Intent.PRIMARY} onClick={this.saveComment}>
                ارسال نظر
              </Button>
              <Button intent={Intent.PRIMARY} outlined={true} onClick={() => toggleComments()}>
                لغو
              </Button>
            </div>
          </div>
          <div className="comment-list">
            {this.props.loading ? (
              <div className="bp3-non-ideal-state">
                <Loading />
              </div>
            ) : (
              <Fragment>
                {comments.map((item, index) => (
                  <div className="comment-card" key={index}>
                    <div className="comment-header">
                      <img
                        className="comment-avatar"
                        src={
                          item && item.user && item.user.profileImage
                            ? item.user.profileImage
                            : '/static/media/default-avatar.5097b024.png'
                        }
                        alt=""
                      />
                      <h4 className="comment-username">{item.user.name}</h4>
                      <small className="comment-date">{Util.fileDateTimeFa(item.timestamp)}</small>
                    </div>

                    <p className="comment-body">{item.text}</p>

                    <div
                      className="comment-like"
                      onClick={() => likeComment(item.id, item.liked)}
                      style={{ color: item.liked ? '#518ef8' : '#bdbdbd' }}
                    >
                      {item.liked ? (
                        <Fragment>
                          لایک شده
                          <Icon
                            className="pull-right bounceIn"
                            icon="thumbs-up"
                            style={{ marginLeft: '10px', padding: 0, transform: 'rotateY(180deg)' }}
                            iconSize={18}
                          />
                        </Fragment>
                      ) : (
                        <Fragment>
                          لایک نشده
                          <Icon
                            className="pull-right"
                            icon="thumbs-up"
                            style={{ marginLeft: '10px', padding: 0, transform: 'rotateY(180deg)' }}
                            iconSize={18}
                          />
                        </Fragment>
                      )}
                    </div>
                  </div>
                ))}
              </Fragment>
            )}

            <div
              style={{ float: 'left', clear: 'both' }}
              ref={el => {
                this.commentlist = el;
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}

export default CommentsInfo;
