import React from 'react';
import './index.css';
import NoMatchImage from '../../assets/images/nomatch.png';

const NoMatch: React.FunctionComponent = () => {
  return (
    <div className="nomatch">
      <div className="nomatch-img-wrapper">
        <span>۴۰۴</span>
        <img src={NoMatchImage} alt="" />
      </div>
      <div className="nomatch-title-wrapper">
        <p>صفحه مورد نظر یافت نشد</p>
      </div>
      <div className="nomatch-backbutton-wrapper">
        <a href="/" title="">
          بازگشت به پاد اسپیس
        </a>
      </div>
    </div>
  );
};
export default NoMatch;
