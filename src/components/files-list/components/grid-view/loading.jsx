import React from 'react';
import './index.css';
import './grid-view-item.css';

export default () => {
  return (
    <div className="grid-view" ref={this.setGridViewRef}>
      <div className="files grid">
        {[...Array(5)].map((_, i) => (
          <div className="box image">
            <div className="box-thumb skeleton"></div>
            <div className="box-details">
              <div className="pull-left title skeleton">-</div>
              <div className="pull-right last-mod skeleton">wwwwww</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
