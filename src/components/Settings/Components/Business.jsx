import React, { useEffect, useState } from 'react';
import { Icon, Spinner } from '@blueprintjs/core';

const generateRow = list => {
  return list.map((data, index) => (
    <tr key={index}>
      <td>Android 6.0.1</td>
      <td>امروز 10 اسفند 99 | 12:42</td>
      <td>54.38.232.147 France</td>
      <td className="actions" title="حذف">
        <Icon icon="cross" iconSize={20} />
      </td>
    </tr>
  ));
};

const Business = props => {
  const [dataTable, setData] = useState();
  useEffect(() => {
    const timeput = setTimeout(() => {
      setData([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
    }, 300);
    return () => {
      clearTimeout(timeput);
    };
  }, []);
  return (
    <div className="main-wrapper business-wrapper">
      <h4 className="title">کسب و کارهای متصل به حساب</h4>
      {dataTable && dataTable.length > 0 ? (
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr>
              <th>نام کسب و کار</th>
              <th>تاریخ اشتراک گذاری </th>
              <th>نوع دسترسی</th>
              <th className="actions">حذف دسترسی</th>
            </tr>
          </thead>
          <tbody>{generateRow(dataTable)}</tbody>
        </table>
      ) : (
        <div className="spinner-container">
          <Spinner size={30} />
        </div>
      )}
    </div>
  );
};

export default Business;
