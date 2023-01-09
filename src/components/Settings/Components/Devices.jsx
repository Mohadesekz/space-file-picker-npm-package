import React, { useEffect, useState } from 'react';
import './Scss/Devices.scss';
import { connect } from 'react-redux';
import { getDevices, revokeDevice } from '../Redux/Actions';
import ReactPaginate from 'react-paginate';
import { Util } from '../../../helpers';
import { Classes, Icon, Dialog, Spinner, Intent, Button } from '@blueprintjs/core';

const pageSize = 5;
//Mobile Phone/Desktop/Tablet/Console/TV Device
const deviceIcon = device => {
  switch (device) {
    case 'Desktop':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23.714"
          height="19.094"
          viewBox="0 0 23.714 19.094"
        >
          <g id="prefix__tv" transform="translate(0 -39.184)" fill="#78909c">
            <g id="prefix__Group_158" data-name="Group 158" transform="translate(0 39.184)">
              <g id="prefix__Group_157" data-name="Group 157">
                <path
                  id="prefix__Path_1373"
                  d="M122.288 316.082l-2.125 2.772h9.824l-2.125-2.772z"
                  className="prefix__cls-1"
                  data-name="Path 1373"
                  transform="translate(-113.08 -299.759)"
                />
                <path
                  id="prefix__Path_1374"
                  d="M21.866 39.184H1.848A1.848 1.848 0 0 0 0 41.032v11.395a1.848 1.848 0 0 0 1.848 1.848h20.018a1.848 1.848 0 0 0 1.848-1.848V41.032a1.848 1.848 0 0 0-1.848-1.848z"
                  className="prefix__cls-1"
                  data-name="Path 1374"
                  transform="translate(0 -39.184)"
                />
              </g>
            </g>
          </g>
        </svg>
      );
    case 'Tablet':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23.714"
          height="19.094"
          viewBox="0 0 23.714 19.094"
        >
          <g id="prefix__tv" transform="translate(0 -39.184)" fill="#78909c">
            <g id="prefix__Group_158" data-name="Group 158" transform="translate(0 39.184)">
              <g id="prefix__Group_157" data-name="Group 157">
                <path
                  id="prefix__Path_1373"
                  d="M122.288 316.082l-2.125 2.772h9.824l-2.125-2.772z"
                  className="prefix__cls-1"
                  data-name="Path 1373"
                  transform="translate(-113.08 -299.759)"
                />
                <path
                  id="prefix__Path_1374"
                  d="M21.866 39.184H1.848A1.848 1.848 0 0 0 0 41.032v11.395a1.848 1.848 0 0 0 1.848 1.848h20.018a1.848 1.848 0 0 0 1.848-1.848V41.032a1.848 1.848 0 0 0-1.848-1.848z"
                  className="prefix__cls-1"
                  data-name="Path 1374"
                  transform="translate(0 -39.184)"
                />
              </g>
            </g>
          </g>
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23.714"
          height="19.094"
          viewBox="0 0 23.714 19.094"
        >
          <g id="prefix__tv" transform="translate(0 -39.184)" fill="#78909c">
            <g id="prefix__Group_158" data-name="Group 158" transform="translate(0 39.184)">
              <g id="prefix__Group_157" data-name="Group 157">
                <path
                  id="prefix__Path_1373"
                  d="M122.288 316.082l-2.125 2.772h9.824l-2.125-2.772z"
                  className="prefix__cls-1"
                  data-name="Path 1373"
                  transform="translate(-113.08 -299.759)"
                />
                <path
                  id="prefix__Path_1374"
                  d="M21.866 39.184H1.848A1.848 1.848 0 0 0 0 41.032v11.395a1.848 1.848 0 0 0 1.848 1.848h20.018a1.848 1.848 0 0 0 1.848-1.848V41.032a1.848 1.848 0 0 0-1.848-1.848z"
                  className="prefix__cls-1"
                  data-name="Path 1374"
                  transform="translate(0 -39.184)"
                />
              </g>
            </g>
          </g>
        </svg>
      );
  }
};

const Devices = props => {
  const [dataTable, setData] = useState();
  const [pageCount, setPageCount] = useState(0);
  const [selectDevice, setRevokeDevice] = useState(null);
  const [loading, setLoading] = useState(false);

  const onRevoke = () => {
    setLoading(true);
    props.onRevokeDevice(selectDevice.uid, result => {
      setRevokeDevice(null);
      if (result) {
        getAlldevices();
      }
      setLoading(false);
    });
  };

  const generateRow = list => {
    return list.map(data => (
      <tr key={data.uid}>
        <td>
          <p className="device-name">
            <span>{deviceIcon(data.deviceType)}</span>
            <span className="name">{data.os || '_'}</span>
          </p>
        </td>
        <td>{data.lastAccessTime}</td>
        <td>{data.ip}</td>
        <td className="actions" title="حذف">
          {data.current ? null : (
            <Icon icon="cross" iconSize={20} onClick={() => setRevokeDevice(data)} />
          )}
        </td>
      </tr>
    ));
  };

  const getAlldevices = () => {
    setData(null);
    props.onGetDevices(0, pageSize, resultDevices => {
      const pageCount = Math.floor(resultDevices.total / pageSize) + 1;
      let deviceList = [];
      resultDevices.devices.forEach(device => {
        device.lastAccessTime = Util.fileDateFa(device.lastAccessTime);
        deviceList = [...deviceList, device];
      });
      setPageCount(pageCount);
      setData([...deviceList]);
    });
  };

  useEffect(() => {
    let timeput;
    timeput = getAlldevices();
    return () => {
      clearTimeout(timeput);
    };
  }, []);

  const handlePageClick = e => {
    const offset = e.selected * pageSize;
    props.onGetDevices(offset, pageSize, resultDevices => {
      let deviceList = [];
      resultDevices.devices.forEach(device => {
        device.lastAccessTime = Util.fileDateFa(device.lastAccessTime);
        deviceList = [...deviceList, device];
      });
      setData([...deviceList]);
    });
  };

  return (
    <div className="main-wrapper user-devices">
      <h4 className="title">دستگاه‌های متصل به حساب</h4>
      {dataTable && dataTable.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table cellSpacing="0" cellPadding="0">
              <thead>
                <tr>
                  <th>نام دستگاه</th>
                  <th>آخرین اتصال</th>
                  <th>آی پی آدرس</th>
                  <th className="actions">حذف دسترسی</th>
                </tr>
              </thead>
              <tbody>{generateRow(dataTable)}</tbody>
            </table>
          </div>
          {pageCount ? (
            <ReactPaginate
              previousLabel={'قبلی'}
              nextLabel={'بعدی'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          ) : null}
          <Dialog
            icon={true}
            onClose={() => {
              setRevokeDevice(null);
            }}
            title="حذف دستگاه"
            className="header modal-custom"
            isOpen={!!selectDevice}
            canOutsideClickClose={false}
            autoFocus={true}
          >
            <div className={Classes.DIALOG_BODY}>
              <p>آیا از حذف این دستگاه اطمینان دارید ؟</p>
              {selectDevice ? (
                <div className="device-info">
                  <div className="field">
                    <p className="device-name">
                      <span>نام دستگاه</span>
                      <span className="name">{selectDevice.os || '_'}</span>
                    </p>
                  </div>
                  <p className="device-name">
                    <span>آی پی</span>
                    <span className="name">{selectDevice.ip || '_'}</span>
                  </p>
                </div>
              ) : null}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={() => setRevokeDevice(null)}>انصراف</Button>
                <Button loading={loading} intent={Intent.PRIMARY} onClick={onRevoke}>
                  حذف
                </Button>
              </div>
            </div>
          </Dialog>
        </>
      ) : loading ? (
        <div className="spinner-container">
          <Spinner size={30} />
        </div>
      ) : (
        <div className="empty-message">
          دستگاهی برای نمایش وجود ندارد.
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="prefix__error"
              width="14.057"
              height="14.057"
              viewBox="0 0 14.057 14.057"
            >
              <g id="prefix__Group_133" data-name="Group 133">
                <path
                  id="prefix__Path_1347"
                  fill="#90a4ae"
                  d="M7.029 0a7.029 7.029 0 1 0 7.029 7.029A7.037 7.037 0 0 0 7.029 0zm0 11.714a.586.586 0 1 1 .586-.586.586.586 0 0 1-.586.586zm.586-2.05a.293.293 0 0 1-.293.293h-.586a.293.293 0 0 1-.293-.293V2.636a.293.293 0 0 1 .293-.293h.586a.293.293 0 0 1 .293.293z"
                  data-name="Path 1347"
                />
              </g>
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};
const mapDispatchToProps = dispatch => ({
  onGetDevices: (offset, size, onEnd) => dispatch(getDevices(offset, size, onEnd)),
  onRevokeDevice: (uid, onEnd) => dispatch(revokeDevice(uid, onEnd)),
});

export default connect(null, mapDispatchToProps, null)(Devices);
