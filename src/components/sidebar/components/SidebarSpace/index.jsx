import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.scss';
import { Dialog, Classes, Button, Icon, Intent } from '@blueprintjs/core';
import { Util } from '../../../../helpers';
import { Spinner } from '@blueprintjs/core';
import defaultAvatar from '../../../../assets/icons/default-avatar.png';
import Manifest from '../../../../manifest';

class SidebarSpace extends Component {
  static propTypes = {
    total: PropTypes.string,
    inUse: PropTypes.string,
    inUsePercentage: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isPlanLoading: PropTypes.bool.isRequired,
    hasError: PropTypes.object,
    hasPlanError: PropTypes.bool,
    getSpace: PropTypes.func.isRequired,
    getPlans: PropTypes.func.isRequired,
    plans: PropTypes.array,
    onCheckPlan: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      planIsOpen: false,
      redirecting: false,
    };

    this.props.getSpace();
    this.props.getPlans();
  }

  openPLans = () => {
    if (
      !this.props.isPlanLoading &&
      !this.props.hasPlanError &&
      this.props.plans &&
      this.props.plans.length
    ) {
      this.setState({
        planIsOpen: true,
      });
    }
  };

  closePlans = () => {
    this.setState({
      planIsOpen: false,
    });
  };

  upgradePlanHandle(item) {
    this.setState({
      redirecting: true,
    });
    this.props.onCheckPlan(item.hash, result => {
      if (result) {
        const userToken = localStorage.getItem('access_token');
        window.location.replace(
          `${Manifest.server.api.address}plan/${item.hash}?redirectURL=${window.location.origin}/payment&Authorization=bearer ${userToken}`,
        );
      } else {
        this.setState({
          redirecting: false,
        });
      }
    });
  }

  render() {
    const { redirecting } = this.state;
    const inUsePercentage = this.props.inUsePercentage;
    const { plans } = this.props;
    const background =
      inUsePercentage >= 75 ? (inUsePercentage >= 90 ? '#E91E63' : '#FFC107') : null;
    const avatar = window.localStorage.getItem('avatar');
    const fullName = window.localStorage.getItem('fullName');
    const username = window.localStorage.getItem('username');
    return (
      <div className="side-info">
        <div className="info">
          <div
            className="user"
            style={{ backgroundImage: `url(${avatar || defaultAvatar})` }}
          ></div>
          <div className="user-info">
            <span>فضای اشغال شده</span>
            <p>
              {fullName}
              <small>{username}@</small>
            </p>
            {/* <div className={`progress-bar ${this.props.isLoading ? 'skeleton' : ''}`}> */}
            <div className={`progress-bar`}>
              <div
                className="percentage"
                style={{ width: `${inUsePercentage}%`, background }}
              ></div>
            </div>
            <div className="storage-value">
              <div className="pull-left">{this.props.total}</div>
              <div className="pull-right">
                {/* {this.props.isLoading ? 'در حال دریافت اطلاعات' : this.props.inUse} */}
                {this.props.inUse ? this.props.inUse : ''}
              </div>
            </div>
          </div>
          {this.state.planIsOpen && (
            <Dialog
              isOpen={this.state.planIsOpen}
              onClose={this.closePlans}
              className="plans-dialog"
              autoFocus
              enforceFocus
              usePortal
              canEscapeKeyClose
              canOutsideClickClose
            >
              <div className="bp3-dialog-header">
                <Icon icon="briefcase" iconSize={20} />
                <h4 className="bp3-heading">
                  <span className="title-right">طرح‌های افزایش فضای ذخیره‌سازی</span>
                </h4>
                <Button onClick={this.closePlans} className="bp3-minimal bp3-dialog-close-button">
                  <Icon icon="small-cross" iconSize={20} />
                </Button>
              </div>

              <div className={Classes.DIALOG_BODY} style={{ padding: '35px 20px' }}>
                {redirecting ? (
                  <div>
                    <h3>درحال انتقال به صفحه پرداخت</h3>
                    <p style={{ textAlign: 'center' }}>لطفا صبر کنید ...</p>
                    <Spinner />
                  </div>
                ) : !this.props.isPlanLoading &&
                  !this.props.hasPlanError &&
                  this.props.plans &&
                  this.props.plans.length ? (
                  this.props.plans.map((item, index) => (
                    <div className="wrapper-card" key={index}>
                      <div className={`plan-card ${item.status.toLocaleLowerCase()}`}>
                        <div className="plan-card-top-section">
                          <div className="plan-header">
                            <div className="plan-title">
                              <span className="title-top">{item.title}</span>
                              <span className="title-bottom">سازمانی / عادی</span>
                            </div>
                            <div className="plan-size">
                              <span>{Util.bytesToSize(item.size)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="plan-card-bottom-section">
                          <div className="plan-price">
                            <div className="price-time">
                              <span>{Util.toPersinaDigit(item.days)} روزه</span>
                            </div>
                            <div className="price-charge">
                              <span className="discount">
                                {item.price.toLocaleString('fa-ir')} ریال
                              </span>
                              {/* <span className="charge">{'۶۰۰۰۰'.toLocaleString('fa-ir')}</span> */}
                            </div>
                          </div>

                          {item.status !== 'ACTIVE' ? (
                            <Button
                              intent={Intent.PRIMARY}
                              outlined={'true'}
                              fill={true}
                              onClick={() => this.upgradePlanHandle(item)}
                              className="plan-upgrade-btn"
                              disabled={item.status === 'CAN_NOT_BUY'}
                            >
                              خرید و ارتقا طرح
                            </Button>
                          ) : item.status === 'ACTIVE' ? (
                            <p className="active-message">
                              طرح فعال
                              <Icon
                                className="icon-menu"
                                onClick={this.props.menuToggle}
                                iconSize={20}
                                icon="tick"
                              />
                            </p>
                          ) : null}

                          {item.description ? (
                            <div className="plan-content">{item.description}</div>
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : null}
              </div>
            </Dialog>
          )}
        </div>
        <div
          className={
            'change-plan' + (plans && plans.length && Manifest.enablePlan ? '' : ' deactivated')
          }
          onClick={Manifest.enablePlan ? this.openPLans : () => {}}
        >
          درخواست افزایش فضا
        </div>
      </div>
    );
  }
}

export default SidebarSpace;
