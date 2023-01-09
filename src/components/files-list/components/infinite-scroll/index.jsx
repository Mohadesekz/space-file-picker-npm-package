import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Util from '../../../../helpers/util';

export default class InfiniteScroll extends Component {
  constructor(props) {
    super();
    this.state = {
      showLoader: false,
      lastScrollTop: 0,
      pullToRefreshThresholdBreached: false,
      mobileAndTabletCheck: false,
    };
    // variables to keep track of pull down behaviour
    this.startY = 0;
    this.currentY = 0;
    this.dragging = false;
    // will be populated in componentDidMount
    // based on the height of the pull down element
    this.maxPullDownDistance = 0;
  }

  componentDidMount() {
    this.setState({
      mobileAndTabletCheck: Util.mobileAndTabletCheck(),
    });
    this.addEventListener();
    this.el.dispatchEvent(new Event('scroll'));
  }

  componentWillUnmount() {
    this.removeEventListener();
  }

  addEventListener = () => {
    this.el = this._infScroll;
    this.el.addEventListener('scroll', this.onScrollListener);

    if (
      typeof this.props.initialScrollY === 'number' &&
      this.el.scrollHeight > this.props.initialScrollY
    ) {
      this.el.scrollTo(0, this.props.initialScrollY);
    }

    if (this.props.pullDownToRefresh && !Util.mobileAndTabletCheck()) {
      this.el.addEventListener('touchstart', this.onStart, { passive: true });
      this.el.addEventListener('touchmove', this.onMove, { passive: true });
      this.el.addEventListener('touchend', this.onEnd, { passive: true });

      this.el.addEventListener('mousedown', this.onStart, { passive: true });
      this.el.addEventListener('mousemove', this.onMove, { passive: true });
      this.el.addEventListener('mouseup', this.onEnd, { passive: true });

      // get BCR of pullDown element to position it above
      this.maxPullDownDistance = this._pullDown.firstChild.getBoundingClientRect().height;
      if (this.maxPullDownDistance < this.props.pullDownToRefreshThreshold) {
        this.maxPullDownDistance = this.props.pullDownToRefreshThreshold;
      }
      this.forceUpdate();

      if (typeof this.props.refreshFunction !== 'function') {
        throw new Error(
          `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`,
        );
      }
    }
  };

  removeEventListener = () => {
    this.el.removeEventListener('scroll', this.onScrollListener);
    if (this.props.pullDownToRefresh) {
      this.el.removeEventListener('touchstart', this.onStart);
      this.el.removeEventListener('touchmove', this.onMove);
      this.el.removeEventListener('touchend', this.onEnd);

      this.el.removeEventListener('mousedown', this.onStart);
      this.el.removeEventListener('mousemove', this.onMove);
      this.el.removeEventListener('mouseup', this.onEnd);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.dataLength === prevProps.dataLength) return;
    this.nextCall = false;
  }

  onStart = evt => {
    if (evt.button) return;
    if (this.state.lastScrollTop) return;

    this.dragging = true;
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentY = this.startY;

    this._infScroll.style.transition = 'none';
  };

  onMove = evt => {
    if (!this.dragging) return;
    this.currentY = evt.pageY || evt.touches[0].pageY;

    // user is scrolling down to up
    if (this.currentY < this.startY) return;

    if (this.currentY - this.startY >= this.props.pullDownToRefreshThreshold) {
      this.setState({
        pullToRefreshThresholdBreached: true,
      });
    }

    // so you can drag upto 1.5 times of the maxPullDownDistance
    if (this.currentY - this.startY > this.maxPullDownDistance * 1.5) return;

    this._infScroll.parentElement.style.overflow = 'auto';
    this._infScroll.style.overflow = 'visible';
    this._infScroll.style.transform = `translate3d(0px, ${this.currentY - this.startY}px, 0px)`;
  };

  onEnd = () => {
    this.startY = 0;
    this.currentY = 0;

    this.dragging = false;

    if (this.state.pullToRefreshThresholdBreached) {
      if (this._infScroll) {
        this._infScroll.parentElement.style.overflow = 'auto';
        this._infScroll.style.overflow = 'visible';
        this._infScroll.style.transform = `translate3d(0px, ${this.maxPullDownDistance}px, 0px)`;
        this._infScroll.style.transition = 'transform 0.2s cubic-bezier(0,0,0.31,1)';
        this.props.refreshFunction && this.refreshFunction();
      }
    } else {
      if (this._infScroll) {
        this._infScroll.parentElement.style.overflow = 'hidden';
        this._infScroll.style.overflow = 'auto';
        this._infScroll.style.transform = `none`;
        this._infScroll.style.transition = 'transform 0.2s cubic-bezier(0,0,0.31,1)';
      }
    }
  };

  isElementAtBottom() {
    return (
      this.el.scrollHeight - (this.el.scrollTop + this.el.offsetHeight) < 100 &&
      this.el.scrollTop !== 0
    );
  }

  nextCall = false;
  onScrollListener = event => {
    // if (typeof this.props.onScroll === 'function') {
    //   // Execute this callback in next tick so that it does not affect the
    //   // functionality of the library.
    //   setTimeout(() => this.props.onScroll(event), 0);
    // }
    // // return immediately if the action has already been triggered,
    // // prevents multiple triggers.
    // if (this.state.actionTriggered) return;

    let atBottom = this.isElementAtBottom();

    // call the `next` function in the props to trigger the next data fetch
    if (atBottom && this.props.hasMore && !this.nextCall) {
      this.nextCall = true;
      this.setState({ showLoader: true });
      this.props.next();
    }
  };

  refreshFunction = () => {
    this.props.refreshFunction(this.afterRecieveData);
  };

  afterRecieveData = () => {
    requestAnimationFrame(() => {
      if (this._infScroll) {
        this._infScroll.parentElement.style.overflow = 'hidden';
        this._infScroll.style.overflow = 'auto';
        this._infScroll.style.transform = `none`;
        this._infScroll.style.transition = 'transform 0.2s cubic-bezier(0,0,0.31,1)';
      }
    });

    this.setState({
      pullToRefreshThresholdBreached: false,
    });
  };

  infScrollRef = infScroll => {
    this._infScroll = infScroll;
    if (typeof this.props.infiniteScrollElRef === 'function') {
      this.props.infiniteScrollElRef(this._infScroll);
    }
  };

  render() {
    const style = {
      height: this.props.height || 'auto',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      ...this.props.style,
    };
    const hasChildren =
      this.props.hasChildren || !!(this.props.children && this.props.children.length);

    // because heighted infiniteScroll visualy breaks
    // on drag down as overflow becomes visible
    const outerDivStyle =
      this.props.pullDownToRefresh && this.props.height ? { overflow: 'auto' } : {};

    return (
      <div style={outerDivStyle}>
        <div className="infinite-scroll-component" ref={this.infScrollRef} style={style}>
          {this.props.pullDownToRefresh && !this.state.mobileAndTabletCheck && (
            <div style={{ position: 'relative' }} ref={pullDown => (this._pullDown = pullDown)}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: -1 * this.maxPullDownDistance,
                }}
              >
                {!this.state.pullToRefreshThresholdBreached && this.props.pullDownToRefreshContent}
                {this.state.pullToRefreshThresholdBreached && this.props.releaseToRefreshContent}
              </div>
            </div>
          )}
          {this.props.children}
          {!this.state.showLoader && !hasChildren && this.props.hasMore && this.props.loader}
          {this.state.showLoader && this.props.hasMore && this.props.loader}
          {!this.props.hasMore && this.props.endMessage}
        </div>
      </div>
    );
  }
}

InfiniteScroll.defaultProps = {
  pullDownToRefreshContent: <h3>Pull down to refresh</h3>,
  releaseToRefreshContent: <h3>Release to refresh</h3>,
  pullDownToRefreshThreshold: 100,
  disableBrowserPullToRefresh: true,
};

InfiniteScroll.propTypes = {
  next: PropTypes.func,
  hasMore: PropTypes.bool,
  children: PropTypes.node,
  loader: PropTypes.node.isRequired,
  endMessage: PropTypes.node,
  style: PropTypes.object,
  height: PropTypes.number,
  hasChildren: PropTypes.bool,
  pullDownToRefresh: PropTypes.bool,
  pullDownToRefreshContent: PropTypes.node,
  releaseToRefreshContent: PropTypes.node,
  pullDownToRefreshThreshold: PropTypes.number,
  refreshFunction: PropTypes.func,
  onScroll: PropTypes.func,
  dataLength: PropTypes.number.isRequired,
  ref: PropTypes.func,
};
