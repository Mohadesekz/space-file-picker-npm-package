import React, { PureComponent } from 'react';
import { PDFDataRangeTransport } from 'pdfjs-dist';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { Util } from '../../../../helpers';
import 'react-pdf/src/Page/AnnotationLayer.css';
import './index.scss';
import Manifest from './../../../../manifest';
import { newFetch } from './../../../../helpers';
import {
  isArrayBuffer,
  isBlob,
  isBrowser,
  isFile,
  loadFromFile,
  dataURItoUint8Array,
} from 'react-pdf/src/shared/utils';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const dataURItoBlob = dataURI => {
  const ia = dataURItoUint8Array(dataURI);
  const [mimeString] = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';');
  return new Blob([ia], { type: mimeString });
};

export const readAsDataURL = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = event => {
      switch (event.target.error.code) {
        case event.target.error.NOT_FOUND_ERR:
          return reject(new Error('Error while reading a file: File not found.'));
        case event.target.error.NOT_READABLE_ERR:
          return reject(new Error('Error while reading a file: File not readable.'));
        case event.target.error.SECURITY_ERR:
          return reject(new Error('Error while reading a file: Security error.'));
        case event.target.error.ABORT_ERR:
          return reject(new Error('Error while reading a file: Aborted.'));
        default:
          return reject(new Error('Error while reading a file.'));
      }
    };
    reader.readAsDataURL(file);

    return null;
  });

export default class PdfReader extends PureComponent {
  state = {
    displayAll: false,
    externalLinkTarget: null,
    file: null,
    dlLink: null,
    numPages: null,
    pageNumber: null,
    pageWidth: null,
    passMethod: null,
    render: true,
    renderAnnotationLayer: true,
    renderInteractiveForms: true,
    renderTextLayer: true,
    rotate: null,
  };

  onDocumentLoadProgress = progressData => {
    /* console.log(
      'Loading a document',
      progressData.total ? progressData.loaded / progressData.total : '(unknown progress)',
    ); */
  };

  onDocumentLoadSuccess = document => {
    /* console.log('Loaded a document', document); */
    const { numPages } = document;
    this.setState({
      numPages,
      pageNumber: 1,
    });
  };

  onPageRenderSuccess = page => null /* console.log('Rendered a page', page) */;

  onItemClick = ({ pageNumber }) => this.setState({ pageNumber });

  setFile = file => this.setState({ file }, this.setFileForProps);

  setPassMethod = passMethod => this.setState({ passMethod }, this.setFileForProps);

  setFileForProps = async () => {
    const fileForProps = await (async () => {
      const { file } = this.state;
      if (!file) {
        return null;
      }

      const { passMethod } = this.state;

      switch (passMethod) {
        case 'blob': {
          if (file instanceof File || file instanceof Blob) {
            return file;
          }
          return dataURItoBlob(file);
        }

        case 'string': {
          if (typeof file === 'string') {
            return file;
          }

          if (file instanceof File || file instanceof Blob) {
            return readAsDataURL(file);
          }

          return file;
        }
        case 'object': {
          // File is a string
          if (typeof file === 'string') {
            return { url: file };
          }

          // File is PDFDataRangeTransport
          if (file instanceof PDFDataRangeTransport) {
            return { range: file };
          }

          // File is an ArrayBuffer
          if (isArrayBuffer(file)) {
            return { data: file };
          }

          /**
           * The cases below are browser-only.
           * If you're running on a non-browser environment, these cases will be of no use.
           */
          if (isBrowser) {
            // File is a Blob
            if (isBlob(file) || isFile(file)) {
              return { data: await loadFromFile(file) };
            }
          }
          return file;
        }
        default:
          return file;
      }
    })();

    this.setState({ fileForProps });
  };

  previousPage = () => this.changePage(-1);

  nextPage = () => this.changePage(1);

  changePage = offset =>
    this.setState(prevState => ({
      pageNumber: (prevState.pageNumber || 1) + offset,
    }));

  get pageProps() {
    return {
      className: 'custom-classname-page',
      onClick: (event, page) => null /* console.log('Clicked a page', { event, page }) */,
      onRenderSuccess: this.onPageRenderSuccess,
      renderAnnotationLayer: true,
      renderInteractiveForms: false,
      renderMode: 'canvas',
      renderTextLayer: false,
      width: this.props.pageWidth || 250,
      loading: 'در حال بارگیری سند ...',
      error: 'در دانلود سند از سرور مشکلی بوجود آمد ',
      customTextRenderer: textItem =>
        textItem.str
          .split('ipsum')
          .reduce(
            (strArray, currentValue, currentIndex) =>
              currentIndex === 0
                ? [...strArray, currentValue]
                : [...strArray, <mark key={currentIndex}>ipsum</mark>, currentValue],
            [],
          ),
    };
  }

  componentDidMount() {
    if (this.props.pdfHash) {
      if (this.props.public) {
        const token = localStorage.getItem('access_token');
        const password = this.props.password;

        const dlLink = `${Manifest.server.api.address}files/${this.props.pdfHash}?Authorization=${token}${password}`;
        this.setState({ dlLink });
      } else {
        const date = +new Date();
        const timestamp = date + 59 * 60 * 1000;
        this.getDownloadLink(this.props.pdfHash, timestamp);
      }
    }
  }

  getDownloadLink = async (hash, timestamp) => {
    const token = localStorage.getItem('access_token');
    const password = this.props.password;
    return new Promise(async resolve => {
      const downloadLink = await newFetch(
        encodeURI(`files/${hash}/link?expiration=${timestamp}`),
        'GET',
      );
      let dlLink = '';
      if (downloadLink && downloadLink.downloadLink) {
        dlLink = `${Manifest.server.api.address}files/d/${downloadLink.downloadLink}`;
        this.setState({ dlLink });
      } else {
        dlLink = `${Manifest.server.api.address}files/${hash}?Authorization=${token}${password}`;
        this.setState({ dlLink });
      }
      setTimeout(() => {
        resolve();
      }, 10);
    });
  };

  render() {
    const { displayAll, numPages, pageNumber, render, rotate, dlLink } = this.state;
    const { pageProps } = this;
    const documentProps = {
      externalLinkTarget: '_blank',
      // file: this.props.pdfSource,
      file: dlLink,
      options,
      rotate,
      error: 'در دانلود سند از سرور مشکلی بوجود آمد ',
      loading: 'در حال بارگیری سند ...',
    };
    console.log(dlLink);
    return (
      <div className="pdf-container">
        <div className="pdf">
          <div className="pdf-wrapper">
            <div className="pdf-wrapper__container">
              <main className="pdf-wrapper__container__content">
                <Document
                  {...documentProps}
                  className="custom-classname-document"
                  onClick={
                    (event, pdf) => null
                    // console.log('Clicked a document', { event, pdf })
                  }
                  onItemClick={this.onItemClick}
                  onLoadError={this.onDocumentLoadError}
                  onLoadProgress={this.onDocumentLoadProgress}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                  onSourceError={this.onDocumentLoadError}
                >
                  <div className="pdf-wrapper__container__content__document">
                    {render &&
                      (displayAll ? (
                        Array.from(new Array(numPages), (el, index) => (
                          <Page
                            {...pageProps}
                            key={`page_${index + 1}`}
                            inputRef={
                              pageNumber === index + 1 ? ref => ref && ref.scrollIntoView() : null
                            }
                            pageNumber={index + 1}
                          />
                        ))
                      ) : (
                        <Page {...pageProps} pageNumber={pageNumber || 1} />
                      ))}
                  </div>
                  {displayAll || (
                    <div className="pdf-wrapper__container__content__controls">
                      <button
                        disabled={pageNumber <= 1}
                        onClick={this.previousPage}
                        type="button"
                        className="bp3-button bp3-minimal bp3-icon-chevron-right"
                      >
                        {/* {<Icon icon="chevron-right" iconSize={30} color="#fff" />} */}
                      </button>
                      <span>
                        {`صفحه  
                            ${Util.toPersinaDigit(String(pageNumber)) || (numPages ? 1 : '--')}
                              از  
                            ${Util.toPersinaDigit(String(numPages)) || '--'}`}
                      </span>
                      <button
                        disabled={pageNumber >= numPages}
                        onClick={this.nextPage}
                        type="button"
                        className="bp3-button bp3-minimal bp3-icon-chevron-left"
                      >
                        {/* {<Icon icon="chevron-left" iconSize={30} color="#fff" />} */}
                      </button>
                    </div>
                  )}
                </Document>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
