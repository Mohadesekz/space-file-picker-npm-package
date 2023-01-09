import React from 'react';
import {
  Button,
  Classes,
  Dialog,
  Intent,
  FormGroup,
  RadioGroup,
  Radio,
  Alignment,
  AnchorButton,
  InputGroup,
  ContextMenu,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import TagsInput from 'react-tagsinput';
import DatePicker from 'react-datepicker2';
import ShareFunctions from './shareFunctions';
import 'react-tagsinput/react-tagsinput.css';
import { Icon } from '@blueprintjs/core';
import moment from 'moment-jalaali';
import './index.scss';
import defaultAvatar from 'assets/images/default-avatar.png';

class Share extends ShareFunctions {
  constructor(props) {
    super(props);
    this.linkInputRef = React.createRef();
    this.inputPasswordRef = React.createRef();
    this.repeatPasswordRef = React.createRef();
  }
  async contextMenuInput(event, { current: input }) {
    let clipboardText = '';
    event.persist();
    try {
      clipboardText = await navigator.clipboard?.readText();
    } catch (e) {}

    ContextMenu.show(
      <Menu>
        <MenuItem
          disabled={!clipboardText}
          onClick={async () => {
            let text = '';
            try {
              text = await navigator.clipboard.readText();
            } catch (e) {
              console.log('error get text from clipboard', e);
            }
            input.value += text;
          }}
          icon="document-open"
          text="چسباندن"
          label="paste"
        />
      </Menu>,
      {
        left: event.clientX,
        top: event.clientY,
      },
    );
    if (this.state.isSelectSearchText) {
      setTimeout(() => {
        input.select();
        this.setState({ isSelectSearchText: false });
      }, 0);
    }
    event.preventDefault();
  }
  render() {
    const minDate = moment().subtract(1, 'days');
    return (
      <>
        <Dialog
          key={0}
          icon="share"
          onClose={this.handleClose}
          isOpen={!!this.state.item}
          title="اشتراک گذاری"
          className="share-modal"
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup className="share-button-container">
              <label className="bp3-label bp3-inline">
                <AnchorButton
                  text="دریافت لینک اشتراک گذاری"
                  className="share-button"
                  onClick={this.getLink}
                  minimal={true}
                  icon="link"
                />
                <span className="file-name">{this.state._name}</span>
              </label>
            </FormGroup>

            <FormGroup
              label="با چه کسانی به اشتراک می گذارید؟"
              labelFor="users"
              helperText={
                this.state.tried && this.state.tagError && 'لطفا حداقل یک نفر را وارد کنید'
              }
              intent={this.state.tried && this.state.tagError ? Intent.DANGER : Intent.NONE}
            >
              <TagsInput
                addOnBlur={true}
                addKeys={[9, 13, 32, 47, 44, 63, 38]}
                onlyUnique={true}
                inputProps={{
                  placeholder: 'می توانید ایمیل، شماره موبایل یا نام کاربری وارد کنید',
                  id: 'users',
                  autoComplete: 'off',
                }}
                onChange={this.handleChange}
                value={this.state.tags}
                disabled={this.state.gotLink}
              />
            </FormGroup>

            {this.props.shares.shares.length > 0 && (
              <FormGroup label="دسترسی ها">
                <div className="previous-accesses">
                  {this.props.shares.shares.map((shareItem, index) => (
                    <div className="tag" key={index}>
                      <div
                        className="user-avatar"
                        title={shareItem && shareItem.person && shareItem.person.username}
                      >
                        {shareItem.person && shareItem.person.avatar ? (
                          <img src={shareItem.person.avatar} width="20" height="20" alt="avatar" />
                        ) : (
                          <img src={defaultAvatar} width="20" height="20" alt="avatar" />
                        )}
                      </div>
                      <span className="tag-title">
                        {shareItem.type === 'PUBLIC'
                          ? 'عمومی'
                          : shareItem && shareItem.person && shareItem.person.username}

                        <Icon
                          icon="small-cross"
                          iconSize={17}
                          onClick={() =>
                            this.setState({
                              removeShareItem: shareItem,
                            })
                          }
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </FormGroup>
            )}

            <FormGroup
              label="تاریخ انقضا اشتراک"
              labelFor="date"
              className="jdtrp"
              helperText={
                this.state.tried && this.state.dateError && 'لطفا تاریخی در آینده انتخاب کنید'
              }
              intent={this.state.tried && this.state.dateError ? Intent.DANGER : Intent.NONE}
            >
              <DatePicker
                isGregorian={false}
                timePicker={false}
                inputFormat="YYYY-MM-DD"
                inputJalaaliFormat="jDD jMMMM jYYYY"
                onChange={this.changeDate}
                id="date"
                min={minDate}
                ref={this.refDatePicker}
              />
            </FormGroup>

            <FormGroup
              helperText={
                !this.state.gotLink &&
                this.state.tried &&
                this.state.editError &&
                'لطفا یک گزینه را انتخاب کنید'
              }
              intent={
                !this.state.gotLink && this.state.tried && this.state.editError
                  ? Intent.DANGER
                  : Intent.NONE
              }
            >
              <RadioGroup
                label="نوع دسترسی"
                onChange={this.handleEdit}
                selectedValue={this.state.edit}
                inline={true}
                disabled={this.state.gotLink}
              >
                <Radio
                  alignIndicator={Alignment.RIGHT}
                  selected={true}
                  label="فقط خواندن"
                  value="view"
                />
                <Radio alignIndicator={Alignment.RIGHT} label="ویرایش" value="edit" />
              </RadioGroup>
            </FormGroup>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={this.tried && this.hasError ? Intent.DANGER : Intent.PRIMARY}
                onClick={this.onSave}
                disabled={this.state.gotLink || (this.state.hasError && this.state.tried)}
                loading={this.state.gotLink}
              >
                ذخیره
              </Button>

              {!this.state.gotLink && (
                <Button intent={Intent.PRIMARY} outlined={'true'} onClick={this.handleClose}>
                  لغو
                </Button>
              )}
            </div>
          </div>
        </Dialog>

        <Dialog
          key={1}
          icon="share"
          isOpen={!!this.state.link}
          onClose={this.handleClose}
          title="لینک اشتراک گذاری"
          className="share-modal"
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup className="share-button-container no-margin-bottom">
              <label className="bp3-label bp3-inline">
                <span className="file-name">{this.state._name}</span>
              </label>
            </FormGroup>

            <FormGroup
              label=""
              className="form-group-short-link"
              helperText={this.state.copyLinkInDirect ? 'آدرس لینک مورد نظر کپی شد' : ''}
              intent={this.state.copyLinkInDirect ? 'success' : 'none'}
            >
              <div className="shared-link-input">
                <InputGroup
                  id="shareLinkInDirect"
                  intent={this.state.copyLinkInDirect ? 'success' : 'none'}
                  placeholder={this.state.inDirectLink}
                  value={this.state.inDirectLink}
                  readOnly={true}
                  onClick={this.focusAndCopy}
                  ref="sharedLink"
                />
                <Button onClick={() => this.copyToClipord('indirect')} className="copy-to-clipord">
                  <div className="flex">
                    <Icon icon="duplicate" iconSize={10} />
                    <p className="link-text">
                      {this.state.link && this.state.link.search('/file/') !== -1
                        ? 'کپی لینک غیرمستقیم'
                        : 'کپی لینک'}
                    </p>
                  </div>
                </Button>
              </div>
              <button
                onClick={() => this.handleShortLink('indirect')}
                disabled={this.state.shortLinkInDirect}
                className="share-short-link"
              >
                لینک کوتاه
              </button>
            </FormGroup>

            {this.state.link && this.state.link.search('/file/') !== -1 && (
              <FormGroup
                label=""
                className="form-group-short-link"
                helperText={this.state.copyLinkDirect ? 'آدرس لینک مورد نظر کپی شد' : ''}
                intent={this.state.copyLinkDirect ? 'success' : 'none'}
              >
                <div className="shared-link-input">
                  <InputGroup
                    id="shareLinkDirect"
                    intent={this.state.copyLinkDirect ? 'success' : 'none'}
                    placeholder={this.state.directLink}
                    value={this.state.directLink}
                    readOnly={true}
                    onClick={this.focusAndCopy}
                    ref="sharedLink"
                  />
                  <Button onClick={() => this.copyToClipord('direct')} className="copy-to-clipord">
                    <div className="flex">
                      <Icon icon="duplicate" iconSize={10} />
                      <p className="link-text">کپی لینک مستقیم</p>
                    </div>
                  </Button>
                </div>
                <button
                  onClick={() => this.handleShortLink('direct')}
                  disabled={this.state.shortLinkDirect}
                  className="share-short-link"
                >
                  لینک کوتاه
                </button>
              </FormGroup>
            )}
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {this.props.desableSetPassword ? null : (
                <button
                  onClick={this.handleShowPassword}
                  disabled={this.state.shortLink}
                  className="share-link-password"
                >
                  <Icon icon="key" iconSize={14} />
                  رمز عبور
                </button>
              )}
            </div>
          </div>
        </Dialog>

        <Dialog
          key={2}
          icon="share"
          isOpen={this.state.showPassword}
          onClose={this.handleClosePassword}
          title="تعیین/تغییر رمز عبور"
          className="share-modal share-password-modal"
        >
          <div className={Classes.DIALOG_BODY}>
            <div className="button-container">
              <FormGroup
                // helperText={
                //   this.state.triedPassword &&
                //   !this.state.password &&
                //   'لطفا رمز عبور خود را وارد نمایید'
                // }
                helperText={
                  // this.state.triedPassword &&
                  this.state.password &&
                  this.state.passwordValidationText.length > 0 &&
                  this.state.passwordValidationText
                }
                intent={
                  // this.state.triedPassword && !this.state.password ? Intent.DANGER : Intent.NONE
                  this.state.password &&
                  // this.state.triedPassword &&
                  this.state.passwordValidationText.length > 0
                    ? Intent.DANGER
                    : Intent.NONE
                }
                style={{ flex: 1 }}
              >
                <InputGroup
                  type="password"
                  placeholder="رمز عبور"
                  onContextMenu={e => this.contextMenuInput(e, this.inputPasswordRef)}
                  inputRef={this.inputPasswordRef}
                  onKeyPress={this.enterPressed.bind(this)}
                  onChange={this.changePassword}
                  intent={
                    // this.state.triedPassword && !this.state.password ? Intent.DANGER : Intent.NONE
                    this.state.password &&
                    // this.state.triedPassword &&
                    this.state.passwordValidationText.length > 0
                      ? Intent.DANGER
                      : Intent.NONE
                  }
                />
              </FormGroup>
            </div>
            <div className="button-container">
              <FormGroup
                style={{ flex: 1 }}
                helperText={
                  // this.state.triedPassword &&
                  this.state.password !== this.state.rePassword &&
                  this.state.validatePassword &&
                  'رمز عبور وارد شده یکسان نیست'
                }
                intent={
                  // this.state.triedPassword &&
                  this.state.password !== this.state.rePassword && this.state.validatePassword
                    ? Intent.DANGER
                    : Intent.NONE
                }
              >
                <InputGroup
                  type="password"
                  placeholder="تکرار رمز عبور"
                  onKeyPress={this.enterPressed.bind(this)}
                  onChange={this.changeRePassword}
                  onContextMenu={e => this.contextMenuInput(e, this.repeatPasswordRef)}
                  inputRef={this.repeatPasswordRef}
                  intent={
                    // this.state.triedPassword &&
                    this.state.password !== this.state.rePassword && this.state.validatePassword
                      ? Intent.DANGER
                      : Intent.NONE
                  }
                />
              </FormGroup>
            </div>
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={
                  this.triedPassword &&
                  (!this.state.password || this.state.password !== this.state.rePassword)
                    ? Intent.DANGER
                    : Intent.PRIMARY
                }
                onClick={this.handlePassword}
                // disabled={this.state.gotPassword}
                disabled={!this.state.validatePasswordAndRepassword}
              >
                تایید
              </Button>

              <Button
                intent={Intent.PRIMARY}
                outlined={'true'}
                onClick={this.handleRemovePassword}
                disabled={this.state.gotPassword}
              >
                حذف رمزعبور
              </Button>
            </div>
          </div>
        </Dialog>

        <Dialog
          key={3}
          icon="share"
          isOpen={!!this.state.removeShareItem}
          onClose={() => this.setState({ removeShareItem: null })}
          title="حذف اشتراک گذاری"
          className="share-modal share-password-modal"
        >
          <div className={Classes.DIALOG_BODY}>
            <p>آیا از حذف اشتراک گذاری اطمینان دارید؟</p>
            {this.state.removeShareItem && !this.state.removeShareItem.selfShare && (
              <small style={{ color: 'red', display: 'block', marginTop: 15 }}>
                در صورت حذف اشتراک ، اشتراک فولدر بالاتر و فایل ها و فولدر های مرتبط آن نیز از بین
                خواهد رفت
              </small>
            )}
          </div>

          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button intent={Intent.PRIMARY} onClick={this.removeShare}>
                تایید
              </Button>

              <Button
                intent={Intent.PRIMARY}
                outlined={'true'}
                onClick={() => this.setState({ removeShareItem: null })}
              >
                انصراف
              </Button>
            </div>
          </div>
        </Dialog>
      </>
    );
  }
}

export default Share;
