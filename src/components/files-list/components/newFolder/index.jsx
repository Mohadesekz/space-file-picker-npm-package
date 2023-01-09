import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Classes, Dialog, Intent, FormGroup, InputGroup } from '@blueprintjs/core';

// eslint-disable-next-line no-useless-escape
const ReservedFolderNamesRegex = /[\\?%*:|"<>\/]/;
class newFolder extends Component {
  static propTypes = {
    onCreate: PropTypes.func.isRequired,
  };

  state = {
    isOpen: false,
    folder: {
      name: undefined,
    },
    hasError: false,
    wrongValue: false,
    emptyValue: false,
    helperText: '',
    tried: false,
  };

  handleOpen = onEnd => {
    this.onEnd = onEnd;
    this.setState({
      isOpen: true,
    });
  };

  handleClose = () => {
    if (typeof this.onEnd === 'function') {
      this.onEnd();
    }

    this.setState({
      isOpen: false,
      folder: {
        name: undefined,
      },
      helperText: '',
    });
  };

  onInputChange = e => {
    const name = e.target.value;

    if (this.state.tried) {
      const emptyValue = !name;
      const wrongValue = ReservedFolderNamesRegex.test(name);
      const hasError = emptyValue || wrongValue;
      let helperText = '';
      if (emptyValue) {
        helperText = 'لطفا نام را وارد نمایید';
      }
      if (wrongValue) {
        helperText = 'در نام دقت نمایید از کارکترهای محدود شده در سیستم عامل ها استفاده نکنید .';
      }
      this.setState({ folder: { name }, hasError, emptyValue, wrongValue, helperText });
    } else {
      this.setState({ folder: { name } });
    }
  };

  onChange = () => {
    const emptyValue = !this.state.folder.name;
    const wrongValue = ReservedFolderNamesRegex.test(this.state.folder.name);
    const hasError = emptyValue || wrongValue;
    let helperText = '';

    if (emptyValue) {
      helperText = 'لطفا نام را وارد نمایید';
    }

    if (wrongValue) {
      helperText = 'در نام دقت نمایید از کارکترهای محدود شده در سیستم عامل ها استفاده نکنید .';
    }

    if (hasError) {
      this.setState({ hasError, emptyValue, wrongValue, helperText, tried: true });
    } else {
      this.handleClose();
      this.props.onCreate(this.state.folder.name);
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
        icon="folder-new"
        onClose={this.handleClose}
        title="ساخت پوشه جدید"
        className="header modal-custom"
        {...this.state}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            helperText={this.state.tried && this.state.hasError ? this.state.helperText : ''}
            intent={this.state.tried && this.state.hasError ? Intent.DANGER : Intent.NONE}
            label="نام پوشه"
            labelFor="text-input"
          >
            <InputGroup
              id="text-input"
              className="input-ltr"
              onChange={this.onInputChange}
              onKeyDown={this.onKeyDown}
              autoFocus
            />
          </FormGroup>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={this.handleClose}>انصراف</Button>
            <Button intent={Intent.PRIMARY} onClick={this.onChange}>
              ساخت پوشه
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default newFolder;
