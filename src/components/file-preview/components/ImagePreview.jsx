import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@blueprintjs/core';
import Viewer from 'react-viewer';
import Spinner from '../../loading';
import './Scss/ImagePreview.scss';

const ImagePreview = ({ fileDetails, checkToken }) => {
  const [previewStyle, setPreview] = useState('mini');
  const [details, setDetails] = useState(fileDetails);
  const [error, setError] = useState(false);
  const [imageStyle, setStyle] = useState(null);

  const imageRef = useRef(null);

  const handleEscape = event => {
    if (event.keyCode === 27) {
      setPreview('mini');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscape, false);
    return () => {
      document.removeEventListener('keydown', handleEscape, false);
    };
  }, []);

  const handleError = async event => {
    setDetails(null);
    const response = await checkToken(details);
    if (response) {
      setDetails(response);
    } else {
      setError(true);
    }
  };

  const getImageWidthAndHeight = () => {
    if (imageRef.current) {
      const imageTag = imageRef.current;
      if (imageTag.width >= imageTag.height) {
        setStyle('horizontal');
      } else {
        setStyle('vertical');
      }
    }
  };

  return (
    <div className={`image-preview ${previewStyle}`} onKeyDown={() => handleEscape}>
      <div className="image-wrapper">
        {!error && imageStyle && previewStyle === 'mini' && (
          <div className="actions-buttons">
            <Icon icon={'fullscreen'} iconSize={14} onClick={() => setPreview('full')} />
          </div>
        )}
        {details && details.isRemovedTemporary ? (
          <div className="message-container">
            <h1> فایل مورد نظر حذف شده است. </h1>
          </div>
        ) : error ? (
          <div className="message-container">
            <h1> خطایی در بارگذاری به وجود آمده است. </h1>
          </div>
        ) : details ? (
          previewStyle === 'full' ? (
            <Viewer
              visible={true}
              onClose={() => {
                setPreview('mini');
              }}
              images={[{ src: details.itemSource, alt: '' }]}
            />
          ) : (
            <img
              src={details.itemSource}
              alt="preview"
              onError={handleError}
              className={imageStyle}
              onLoad={getImageWidthAndHeight}
              ref={imageRef}
            />
          )
        ) : (
          <Spinner />
        )}
        {/* {details && !details.isRemovedTemporary && error ? (
          <div className="message-container">
            <h1> خطایی در بارگذاری به وجود آمده است. </h1>
          </div>
        ) : details ? (
          previewStyle === 'full' ? (
            <Viewer
              visible={true}
              onClose={() => {
                setPreview('mini');
              }}
              images={[{ src: details.itemSource, alt: '' }]}
            />
          ) : (
            <img
              src={details.itemSource}
              alt="preview"
              onError={handleError}
              className={imageStyle}
              onLoad={getImageWidthAndHeight}
              ref={imageRef}
            />
          )
        ) : (
          <Spinner />
        )} */}
      </div>
    </div>
  );
};

export default React.memo(ImagePreview);
