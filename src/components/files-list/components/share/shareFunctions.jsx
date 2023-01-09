import { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-jalaali';
import Manifest from 'manifest';

class ShareFunctions extends Component {
  static propTypes = {
    onShare: PropTypes.func.isRequired,
  };

  state = {
    item: {},
    tags: [],
    _name: '',
    edit: '',
    canGetLink: false,
    link: null,
    directLink: null,
    inDirectLink: null,
    gotLink: false,
    tried: false,
    hasError: true,
    tagError: true,
    dateError: true,
    editError: true,
    password: '',
    rePassword: '',
    gotPassword: false,
    triedPassword: false,
    showPassword: false,
    validatePassword: false,
    validatePasswordAndRepassword: false,
    passwordValidationText: 'لطفا رمز عبور خود را وارد نمایید',
    passwordIsSet: false,
    shortLink: false,
    copyLink: false,
    copyLinkDirect: false,
    copyLinkInDirect: false,
    shortLinkDirect: false,
    shortLinkInDirect: false,
    removeShareItem: null,
    date: null,
  };

  componentDidMount() {
    this.onEnd = this.props.onEnd;

    const _name = Object.is(this.props.fileDetails.type_, 'folder')
      ? this.props.fileDetails.name
      : this.props.fileDetails.name +
        (this.props.fileDetails.extension !== '' ? `.${this.props.fileDetails.extension}` : '');

    this.setState({
      item: this.props.fileDetails,
      _name,
    });
  }

  handleClose = () => {
    this.onEnd();

    this.setState({
      item: {},
      _name: '',
      tags: [],
      edit: '',
      link: null,
      gotLink: false,
      tried: false,
      hasError: true,
      tagError: true,
      dateError: true,
      editError: true,
      password: '',
      rePassword: '',
      gotPassword: false,
      triedPassword: false,
      showPassword: false,
      shortLink: false,
      copyLinkDirect: false,
      copyLinkInDirect: false,
      shortLinkDirect: false,
      shortLinkInDirect: false,
    });
  };

  afterGotLink = link => {
    if (!link) {
      this.setState({
        gotLink: false,
      });
      return;
    }
    this.setState({
      link,
      item: null,
      _name: '',
      // directLink: `${link}?dl=1`,
      directLink: `${Manifest.server.api.address}files/${this.state.item.hash}`,
      inDirectLink: link,
      tags: [],
      edit: '',
      gotLink: false,
      tried: false,
      hasError: true,
      tagError: true,
      dateError: true,
      editError: true,
      password: '',
      rePassword: '',
      gotPassword: false,
      triedPassword: false,
      showPassword: false,
      orginalType: this.state.item.type_,
      copyLinkDirect: false,
      copyLinkInDirect: false,
      shortLinkDirect: false,
      shortLinkInDirect: false,
    });

    if (link) {
      this.props.onRefreshRecent();
    }
  };

  getLink = () => {
    this.setState(
      {
        gotLink: true,
        link: '',
        tags: [],
        edit: '',
        copyLink: false,
      },
      () => {
        this.props.onShare(
          {
            hash: this.state.item.hash,
            itemType: this.state.item.type_,
            isPublic: true,
            expiration:
              this.state.date ||
              moment()
                .add(50, 'years')
                .format('YYYY-MM-DD'),
          },
          this.afterGotLink,
        );
      },
    );
  };

  handleChange = tags => {
    const tagError = tags.length === 0;
    const hasError = tagError || this.state.editError || this.state.dateError;
    this.setState({ tags: tags.map(tag => tag.trim()), tagError, hasError });
  };

  onSave = () => {
    if (this.state.hasError) {
      this.setState({ tried: true });
    } else {
      this.props.onShare(
        {
          hash: this.state.item.hash,
          itemType: this.state.item.type_,
          expiration: this.state.date,
          persons: this.state.tags,
          level: this.state.edit,
        },
        () => {
          this.setState({
            tags: [],
            edit: '',
            hasError: true,
            tagError: true,
            editError: true,
            tried: false,
          });
        },
      );
    }
  };
  passwordRegex = str => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-+=()])(?=\S+$).{8,20}$/;
    return regex.test(str);
  };

  changePassword = e => {
    const value = e.target.value;

    if (this.passwordRegex(value)) {
      this.setState({ validatePassword: true, passwordValidationText: '' });
    } else if (value.trim().length < 1) {
      this.setState({
        validatePassword: false,
        passwordValidationText: 'لطفا رمز عبور خود را وارد نمایید',
      });
    } else {
      this.setState({
        validatePassword: false,
        passwordValidationText:
          'گذرواژه مورد نظر ضعیف می باشد.(می بایست شامل عدد، حروف کوچک و بزرگ و کارکتر خاص باشد)',
      });
    }

    this.setState({ password: value });
  };

  changeRePassword = e => {
    const value = e.target.value;
    if (
      this.state.password &&
      this.state.password.trim() !== '' &&
      this.state.password === value &&
      value.trim() !== ''
    ) {
      this.setState({ validatePasswordAndRepassword: true });
    } else {
      this.setState({ validatePasswordAndRepassword: false });
    }
    this.setState({ rePassword: value });
  };

  handleShowPassword = () => {
    this.setState({ showPassword: true });
  };

  handlePassword = () => {
    const { password, rePassword, orginalType } = this.state;

    const hash = this.props.fileDetails.hash;
    if (password && password === rePassword && password.trim() !== '' && rePassword.trim() !== '') {
      this.setState({
        gotPassword: true,
      });
      this.props.onChangePassword(password, hash, orginalType, () => {
        this.setState({
          gotPassword: false,
          showPassword: false,
          passwordIsSet: true,
        });
      });
    } else {
      this.setState({ triedPassword: true });
    }
  };

  handleShortLink = type => {
    const hash = this.props.fileDetails.hash;

    if (type === 'direct') {
      this.setState({
        shortLinkDirect: true,
      });
    } else {
      this.setState({
        shortLinkInDirect: true,
      });
    }

    this.props.shortLink(
      type === 'direct' ? this.state.directLink : this.state.inDirectLink,
      hash,
      (link, status) => {
        if (status) {
          if (type === 'direct') {
            this.setState({
              directLink: link,
            });
          } else {
            this.setState({
              inDirectLink: link,
            });
          }
        } else {
          if (type === 'direct') {
            this.setState({
              shortLinkDirect: false,
            });
          } else {
            this.setState({
              shortLinkInDirect: false,
            });
          }
        }
      },
    );
  };

  handleRemovePassword = () => {
    const { orginalType } = this.state;

    const hash = this.props.fileDetails.hash;

    this.setState({
      gotPassword: true,
    });

    this.props.onChangePassword('', hash, orginalType, () =>
      this.setState({
        gotPassword: false,
        showPassword: false,
        passwordIsSet: true,
      }),
    );
  };

  handleClosePassword = () => {
    this.setState({ showPassword: false, password: '', rePassword: '', triedPassword: false });
  };

  handleEdit = e => {
    const edit = e.target.value;
    const editError = !edit;
    const hasError = editError || this.state.tagError || this.state.dateError;
    this.setState({ edit, editError, hasError });
  };

  changeDate = date => {
    const dateError = date.diff(new Date(), 'days') < 0;
    const hasError = dateError || this.state.editError || this.state.tagError;
    this.setState({ date: date.format('YYYY-MM-DD'), dateError, hasError });
  };

  focusAndCopy = e => {
    e.target.select();
    document.execCommand && document.execCommand('copy');
  };

  copyToClipord = type => {
    if (type === 'direct') document.querySelector('#shareLinkDirect').select();
    else document.querySelector('#shareLinkInDirect').select();
    document.execCommand && document.execCommand('copy');

    if (type === 'direct') {
      this.setState({
        copyLinkDirect: true,
      });
    } else {
      this.setState({
        copyLinkInDirect: true,
      });
    }
  };

  enterPressed(event) {
    var code = event.keyCode || event.which;
    if (code === 13) {
      this.handlePassword();
    }
  }

  refDatePicker = e => {
    if (e && e.input) {
      e.input.setAttribute('placeholder', 'تاریخ انقضا اشتراک‌گذاری');
      e.input.addEventListener('keydown', event => {
        event.preventDefault();
      });
    }
  };

  removeShare = () => {
    const { removeShareItem } = this.state;
    if (removeShareItem) {
      this.props.OnRemoveShare(
        removeShareItem.hash,
        removeShareItem.entity.hash,
        removeShareItem.type,
        removeShareItem.selfShare,
      );
      this.setState({
        removeShareItem: null,
      });
    }
  };
}

export default ShareFunctions;
