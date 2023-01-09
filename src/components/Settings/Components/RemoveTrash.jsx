import React, { useState } from 'react';
import './Scss/RemoveTrash.scss';

function RemoveTrash() {
  const [state, setstate] = useState();
  return (
    <div className="main-wrapper remove-container">
      <h4 className="title">پاکسازی اطلاعات</h4>
      <div className="description">
        حذف فایل‌ها و پوشه های موجود در سطل زباله به صورت
        <select
          name="trash-type"
          placeholder="انتخاب نمایید"
          value={'document'}
          onChange={e => {
            e.persist();
            setstate(() => {
              const value = e.target.value;
              return value;
            });
          }}
        >
          <option value="">همه</option>
          <option value="document">اسناد</option>
          <option value="image">عکس</option>
          <option value="video">ویدئو</option>
          <option value="audio">صوتی</option>
          <option value="folder">پوشه</option>
        </select>
      </div>
    </div>
  );
}

export default RemoveTrash;
