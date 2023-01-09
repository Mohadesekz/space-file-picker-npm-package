import { Button, Intent } from '@blueprintjs/core';
import React, { Component } from 'react';
import alertSvg from './assets/icons/alert.svg';
import { connect } from 'react-redux';
import * as Sentry from '@sentry/react';

declare interface IProps {
  errorException?: boolean;
  children?: React.ReactNode;
}
declare interface IState {
  hasError: boolean;
}
class ErrorBoundary extends Component<IProps, IState> {
  state: IState = {
    hasError: false,
  };

  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  reload = () => {
    window.location.reload();
  };

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError || this.props.errorException) {
      // You can render any custom fallback UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
          className="error-boundry"
        >
          <img src={alertSvg} alt="alertSvg" style={{ width: '175px', height: '175px' }} />
          <p
            style={{
              textAlign: 'center',
              color: '#546e7a',
              fontSize: '32px',
              letterSpacing: '-1px',
            }}
          >
            خطای ناشناخته ای به وجود آمده است!
          </p>
          <Button intent={Intent.PRIMARY} onClick={this.reload}>
            بارگذاری مجدد
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const mapStateToProps = (state: any) => ({
  errorException:
    state.files.list.exception ||
    state.files.activities.exception ||
    state.files.copy.exception ||
    state.files.histories.exception ||
    state.files.recents.exception ||
    state.files.selected.exception ||
    state.files.shares.exception ||
    state.files.trash.exception ||
    state.userTeams.exception ||
    state.upload.exception ||
    state.sidebar.filter.exception ||
    state.sidebar.space.exception ||
    state.main.exception,
});

export default connect(mapStateToProps, null)(ErrorBoundary);
