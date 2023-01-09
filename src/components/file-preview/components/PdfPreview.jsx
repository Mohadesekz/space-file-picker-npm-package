import React, { useState } from 'react';
import PdfReader from '../../files-list/components/pdf-reader';
import { Icon } from '@blueprintjs/core';
import './Scss/PdfPreview.scss';

const PdfPreview = ({ fileDetails }) => {
  const [pageOptions, setOptions] = useState({
    width: 250,
    style: 'minimize',
  });

  return (
    <div className={`pdf-preview pdf-reader ${pageOptions.style} `}>
      <div className="actions-buttons" style={{ width: `${pageOptions.width}px` }}>
        <Icon
          icon="cross"
          iconSize={35}
          color="#fff"
          onClick={() => {
            setOptions({
              width: 250,
              style: 'minimize',
            });
          }}
        />
        <Icon
          icon={'fullscreen'}
          iconSize={14}
          onClick={() => {
            setOptions({
              width: window.innerWidth > 768 ? 768 : window.innerWidth - 50,
              style: 'maximize',
            });
          }}
        />
      </div>
      <PdfReader pdfSource={fileDetails.itemSource} pageWidth={pageOptions.width} />
    </div>
  );
};

export default React.memo(PdfPreview);
