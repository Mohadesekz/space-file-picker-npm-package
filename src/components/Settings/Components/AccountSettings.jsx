import React from 'react';
import './Scss/AccountSettings.scss';

const AccountSettings = () => {
  return (
    <div className="main-wrapper account-settings">
      <h4 className="title">اعلان‌ها</h4>
      <div className="selector-container">
        <p className="description">
          دریافت نوتیفیکیشن درخواست صدور مجوز دسترسی برای فایل های به اشتراک گذاری شده
        </p>
        <div className="options-container">
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">SMS</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Email</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Push Notification</span>
          </label>
        </div>
      </div>
      <div className="selector-container">
        <p className="description">دریافت نوتیفیکیشن درخواست صدور مجوز دسترسی کسب و کار به حساب</p>
        <div className="options-container">
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">SMS</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Email</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Push Notification</span>
          </label>
        </div>
      </div>
      <div className="selector-container">
        <p className="description">دریافت نوتیفیکیشن ایجاد توکن جدید</p>
        <div className="options-container">
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">SMS</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Email</span>
          </label>
          <label className="option">
            <input type="checkbox" />
            <span className="bp3-control-indicator">Push Notification</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
