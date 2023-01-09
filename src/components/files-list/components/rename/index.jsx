import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Classes, Dialog, Intent, FormGroup, InputGroup } from '@blueprintjs/core';

// eslint-disable-next-line no-useless-escape
const ReservedFolderNamesRegex = /[\\?%*:|"<>\/]/;

class Rename extends Component {
  constructor(props) {
    super(props);
    this.renameInputRef = React.createRef();
    this.isSelectSearchText = true;
  }
  static propTypes = {
    onChangeName: PropTypes.func.isRequired,
    onEnd: PropTypes.func,
  };

  state = {
    isOpen: false,
    data: {
      name: undefined,
      newName: undefined,
      hash: undefined,
      itemType: undefined,
    },
    hasError: false,
    sameValue: false,
    wrongValue: false,
    emptyValue: false,
    helperText: '',
    tried: false,
    rtl: false,
    extension: undefined,
    // displayName: undefined,
  };
  createSelection = (field, start, end) => {
    if (field.createTextRange) {
      var selRange = field.createTextRange();
      selRange.collapse(true);
      selRange.moveStart('character', start);
      selRange.moveEnd('character', end);
      selRange.select();
    } else if (field.setSelectionRange) {
      field.setSelectionRange(start, end);
    } else if (field.selectionStart) {
      field.selectionStart = start;
      field.selectionEnd = end;
    }
    field.focus();
  };

  handleOpen = (hash, name, extension, itemType, onEnd) => {
    const _name = Object.is(itemType, 'folder')
      ? name
      : name + (extension && extension !== '' ? `.${extension}` : '');
    // const _name = name;
    // const _extension = extension && extension !== '' ? extension : undefined;
    this.onEnd = onEnd;
    this.setState({
      isOpen: true,
      data: {
        hash,
        itemType,
        name: _name,
        newName: _name,
      },
      hasError: false,
      sameValue: false,
      wrongValue: false,
      emptyValue: false,
      helperText: '',
      tried: false,
      rtl: false,
      extension: undefined,
      // displayExtension: _extension,
      // displayName: _extension
      //   ? _name
      //       .split('.')
      //       .slice(0, -1)
      //       .join('.')
      //   : _name,
      // extension: undefined,
    });
    setTimeout(() => {
      var index = _name.lastIndexOf('.');
      if (Object.is(itemType, 'folder')) {
        this.renameInputRef.current.select();
      } else {
        this.createSelection(this.renameInputRef.current, 0, index);
      }
    }, 100);
  };

  handleClose = () => {
    this.setState(
      {
        isOpen: false,
        data: {
          name: undefined,
          newName: undefined,
          hash: undefined,
          itemType: undefined,
        },
      },
      this.onEnd,
    );
  };

  onInputChange = e => {
    const newName = e.target.value;
    if (this.state.tried) {
      const sameValue = newName === this.state.data.name;
      const emptyValue = !newName;
      const wrongValue = ReservedFolderNamesRegex.test(newName);
      const hasError = sameValue || emptyValue || wrongValue;
      let helperText = '';

      if (sameValue) {
        helperText = 'لطفا نام دیگری را جهت تغییر نام انتخاب نمایید';
      }

      if (emptyValue) {
        helperText = 'لطفا نام جدید را وارد نمایید';
      }

      if (wrongValue) {
        helperText = 'در نام دقت نمایید از کارکترهای محدود شده در سیستم عامل ها استفاده نکنید .';
      }

      this.setState({
        data: {
          ...this.state.data,
          // newName:
          //   newName +
          //   (this.state.displayExtension && this.state.displayExtension !== ''
          //     ? `.${this.state.displayExtension}`
          //     : ''),
          newName,
        },
        hasError,
        sameValue,
        emptyValue,
        wrongValue,
        helperText,
      });
    } else {
      this.setState({
        data: {
          ...this.state.data,
          // newName:
          //   newName +
          //   (this.state.displayExtension && this.state.displayExtension !== ''
          //     ? `.${this.state.displayExtension}`
          //     : ''),
          newName,
        },
      });
    }
  };

  onChange = () => {
    const sameValue = this.state.data.newName === this.state.data.name;
    const emptyValue = !this.state.data.newName;
    const wrongValue = ReservedFolderNamesRegex.test(this.state.data.newName);
    const hasError = sameValue || emptyValue || wrongValue;
    let helperText = '';

    if (sameValue) {
      helperText = 'لطفا نام دیگری را جهت تغییر نام انتخاب نمایید';
    }

    if (emptyValue) {
      helperText = 'لطفا نام جدید فایل را وارد نمایید';
    }

    if (wrongValue) {
      helperText = 'در نام دقت نمایید از کارکترهای محدود شده در سیستم عامل ها استفاده نکنید .';
    }

    if (hasError) {
      this.setState({ hasError, sameValue, emptyValue, wrongValue, helperText, tried: true });
    } else {
      this.handleClose();
      this.props.onChangeName(this.state.data, this.props.onEnd);
    }
  };

  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.onChange();
    }
  };

  render() {
    return (
      <Dialog
        icon="edit"
        onClose={this.handleClose}
        title="تغییر نام"
        className="header modal-custom"
        {...this.state}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            helperText={this.state.tried && this.state.hasError ? this.state.helperText : ''}
            intent={this.state.tried && this.state.hasError ? Intent.DANGER : Intent.NONE}
            label="نام جدید"
            labelFor="text-input"
          >
            <InputGroup
              id="text-input"
              inputRef={this.renameInputRef}
              onChange={this.onInputChange}
              defaultValue={this.state.data.name}
              onKeyDown={this.onKeyDown}
              autoFocus
              autoComplete="off"
            />
          </FormGroup>

          {this.props.item.length !== 0 ? (
            this.props.item[0] !== undefined ? (
              this.props.item[0].share ? (
                <div style={{ color: 'red', fontSize: '12px' }}>
                  تذکر ! این فایل اشتراک گذاری شده است
                </div>
              ) : null
            ) : null
          ) : null}
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              intent={this.state.tried && this.state.hasError ? Intent.DANGER : Intent.PRIMARY}
              onClick={this.onChange}
              disabled={this.state.tried && this.state.hasError}
            >
              تغییر نام
            </Button>
            <Button intent={Intent.PRIMARY} outlined={'true'} onClick={this.handleClose}>
              انصراف
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default Rename;
