import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Classes } from '@blueprintjs/core';
import TermsAndConditionText from './terms-condition-text';

class TermsAndCondition extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Dialog
        isOpen={this.props.open}
        onClose={this.props.close}
        className="terms-condition"
        title="قوانین و مقررات استفاده"
        key={8}
      >
        <div className={`${Classes.DIALOG_BODY}`}>
          <TermsAndConditionText />
        </div>
      </Dialog>
    );
  }
}

export default TermsAndCondition;
