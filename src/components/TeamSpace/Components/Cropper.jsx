import React, { useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import './Scss/Cropper.scss';
import { spinner as Spinner } from '../../loading';

export const CropperImage = props => {
  const [cropData, setCropData] = useState(null);
  const [cropper, setCropper] = useState();

  const getCropData = () => {
    if (typeof cropper !== 'undefined') {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  const saveImage = () => {
    props.saveImage(cropper.getCroppedCanvas().toDataURL());
  };

  return (
    <div className="cropp-main-container">
      <div className="cropp-wrapper">
        {props.editFile ? (
          <div className="cropper-container">
            <Cropper
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              preview=".img-preview"
              src={props.editFile}
              guides={true}
              cropBoxResizable={true}
              zoomable={false}
              background={false}
              responsive={true}
              autoCropArea={1}
              viewMode={2}
              checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
              onInitialized={instance => {
                setCropper(instance);
              }}
            />
          </div>
        ) : (
          <Spinner />
        )}
      </div>
      <div className="action-buttons">
        <button className="cropp-btn" onClick={getCropData}>
          انتخاب
        </button>
        <button className="cropp-btn" onClick={saveImage}>
          ذخیره
        </button>
      </div>
      <div className="cropp-preview" style={{ overflow: cropData ? 'auto' : null }}>
        {cropData ? (
          <img style={{ width: '100%' }} src={cropData} alt="cropped" />
        ) : (
          <div className="placeHolder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18.588"
              height="13.27"
              viewBox="0 0 18.588 13.27"
            >
              <g
                fill="#e0e0e0"
                id="prefix__add_1_"
                data-name="add (1)"
                transform="translate(-21.999 -89)"
              >
                <path
                  id="prefix__Path_1439"
                  d="M23.3 263.433h3.052L30 259.848l-3.88-1.9-4.12 2.397v1.771a1.309 1.309 0 0 0 1.3 1.317z"
                  className="prefix__cls-1"
                  data-name="Path 1439"
                  transform="translate(0 -162.246)"
                />
                <path
                  id="prefix__Path_1440"
                  d="M26.224 95.142l4.192 2.043 3.606-3.543a.279.279 0 0 1 .356-.029l2.673 1.892a3.69 3.69 0 0 1 2.217.44V90.3a1.311 1.311 0 0 0-1.32-1.3H23.3a1.294 1.294 0 0 0-1.3 1.3v7.157l3.968-2.3a.268.268 0 0 1 .256-.015zm3.447-3.93A1.675 1.675 0 1 1 28 92.887a1.675 1.675 0 0 1 1.675-1.675z"
                  className="prefix__cls-1"
                  data-name="Path 1440"
                />
                <path
                  id="prefix__Path_1441"
                  d="M188.19 160.978a1.119 1.119 0 1 0-1.119-1.119 1.119 1.119 0 0 0 1.119 1.119z"
                  className="prefix__cls-1"
                  data-name="Path 1441"
                  transform="translate(-158.519 -66.972)"
                />
                <path
                  id="prefix__Path_1442"
                  d="M333.256 269.4a3.116 3.116 0 1 0 3.116-3.116 3.116 3.116 0 0 0-3.116 3.116zm3.364-1.659v1.429h1.429a.278.278 0 0 1 0 .556h-1.429v1.389a.278.278 0 0 1-.556 0v-1.389h-1.389a.278.278 0 0 1 0-.556h1.389v-1.429a.278.278 0 1 1 .556 0z"
                  className="prefix__cls-1"
                  data-name="Path 1442"
                  transform="translate(-298.901 -170.244)"
                />
                <path
                  id="prefix__Path_1443"
                  d="M160.783 221.585l-2.071-1.465-7.1 6.982h7.266a3.675 3.675 0 0 1 1.9-5.517z"
                  className="prefix__cls-1"
                  data-name="Path 1443"
                  transform="translate(-124.467 -125.915)"
                />
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropperImage;
