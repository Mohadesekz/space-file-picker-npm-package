import React from 'react';
import icon from '../../assets/images/docs.svg';

const loading = ({ render }) => {
  return (
    <div className="inner">
      {render()}
      <div className="details">
        <div className="top"></div>

        <div className="info no-file-selected">
          <div className="inner-icon" style={{ backgroundImage: `url(${icon})` }}></div>
          <p>فایل یا پوشه ای انتخاب نشده است</p>
        </div>
      </div>
    </div>
  );
};

export default loading;
