import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Classes, Spinner } from '@blueprintjs/core';
import { Redirect, RouteComponentProps } from 'react-router';
import Header from '../components/header/containers';
import { upgradePlanCheckPayment } from '../components/sidebar/actions';
import IconPayError from '../assets/images/pay_error.svg';
import IconPaySuccess from '../assets/images/pay_success.svg';
import { themeMode } from '../components/Main/Actions';

declare interface IParams {
  billNumber: string | null;
  paymentBillNumber: string | null;
  invoiceId: string | null;
  terminalId: string | null;
  maskedCardNumber: string | null;
  rrn: string | null;
  onSuccess: () => void;
  onError: (error: any) => void;
}

interface MatchParams {
  android: string;
}

declare interface IProps extends RouteComponentProps<MatchParams> {
  checkPayment: (params: IParams) => void;
  onThemeMode: (mode: 'DARK' | 'LIGHT') => void;
}

declare interface IState {
  redirectToHomePage: boolean;
  paid: boolean;
  loading: boolean;
  hasError: boolean;
  message: JSX.Element[];
}

class Payment extends Component<IProps, IState> {
  state = {
    redirectToHomePage: false,
    paid: false,
    loading: true,
    hasError: false,
    message: [],
  };

  darkMode = () => {
    window.localStorage.setItem('mode', 'DARK');
    document.body.classList.add('bp3-dark');
    this.props.onThemeMode('DARK');
  };

  checkParams = () => {
    return new URLSearchParams(window.location.search);
  };

  componentDidMount() {
    const lastMode = window.localStorage.getItem('mode');
    if (lastMode === 'DARK') {
      this.darkMode();
    }

    const { checkPayment } = this.props;
    const urlParams = this.checkParams();
    const paid = urlParams.get('paid') === 'True' ? true : false;
    const billNumber = urlParams.get('billNumber');
    const paymentBillNumber = urlParams.get('paymentBillNumber');
    const invoiceId = urlParams.get('invoiceId');
    const terminalId = urlParams.get('terminalId');
    const maskedCardNumber = urlParams.get('maskedCardNumber');
    const rrn = urlParams.get('rrn');

    if (paid) {
      checkPayment({
        billNumber,
        paymentBillNumber,
        invoiceId,
        terminalId,
        maskedCardNumber,
        rrn,
        onSuccess: () => {
          this.setState({
            message: [
              <p key="success-plan-1">ارتقاء پلن شما با موفقیت انجام شد</p>,
              <p key="success-plan-2">{rrn ? `شماره ارجاع بانک: ${rrn}` : null}</p>,
            ],
            paid: true,
            hasError: false,
            loading: false,
          });
        },
        onError: (result: any) => {
          this.setState({
            message: [
              <p
                key="success-plan-3"
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                {result.message || 'فرآیند پرداخت به درستی انجام نشده است'}
              </p>,
            ],
            paid: false,
            hasError: true,
            loading: false,
          });
        },
      });
    } else {
      this.setState({
        message: [<p key="success-plan-4">فرآیند پرداخت به درستی انجام نشده است</p>],
        paid: false,
        hasError: true,
        loading: false,
      });
    }
  }

  handleClose = () => {
    this.setState({
      redirectToHomePage: true,
    });
  };

  render() {
    const { redirectToHomePage, loading, message, hasError } = this.state;
    const android = this.props.match && this.props.match.params && this.props.match.params.android;
    const urlParams = this.checkParams();
    return (
      <main>
        <div className="app">
          <Header public />
          <div
            className="app-intro"
            style={{
              minHeight: 'calc(100vh - 65px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {redirectToHomePage ? <Redirect to="/" /> : null}
            <section className="app-content is-public">
              {/* <Dialog
                icon={paid && !hasError ? 'small-tick' : 'info-sign'}
                onClose={this.handleClose}
                title="بررسی صحت پرداخت"
                className="header modal-custom"
                isOpen={true}
                canOutsideClickClose={false}
                autoFocus={true}
              > */}
              <div className={Classes.DIALOG_BODY}>
                {!loading && (
                  <div className="payment-result">
                    {hasError ? (
                      <img src={IconPayError} alt="error" />
                    ) : (
                      <img src={IconPaySuccess} alt="success" />
                    )}

                    {message}
                  </div>
                )}

                {loading && <Spinner />}
              </div>

              {!loading && (
                <div className={Classes.DIALOG_FOOTER}>
                  <div
                    className={Classes.DIALOG_FOOTER_ACTIONS}
                    style={{ justifyContent: 'center' }}
                  >
                    {android ? (
                      <a
                        href={`podspace://plans?${urlParams}`}
                        style={{
                          display: 'inline-block',
                          listStyle: 'none',
                          textDecoration: 'none',
                          padding: '5px 20px',
                          borderRadius: '3px',
                          color: '#03a9f4',
                          fontWeight: 'bold',
                        }}
                      >
                        بازگشت به برنامه
                      </a>
                    ) : (
                      <Button onClick={this.handleClose}>برگشت به صفحه اصلی</Button>
                    )}
                  </div>
                </div>
              )}
              {/* </Dialog> */}
            </section>
          </div>
        </div>
      </main>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  checkPayment(params: IParams) {
    dispatch(upgradePlanCheckPayment(params));
  },
  onThemeMode: (mode: 'DARK' | 'LIGHT') => {
    dispatch(themeMode(mode));
  },
});

export default connect(null, mapDispatchToProps)(Payment);
