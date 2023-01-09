import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { changeAdvancedSearch } from '../../actions';
import { changeFilter } from '../../../sidebar/actions';
import { connect } from 'react-redux';
import {
  AnchorButton,
  HTMLSelect,
  Dialog,
  Classes,
  Intent,
  FormGroup,
  InputGroup,
  ControlGroup,
  Button,
  MenuItem,
  Menu,
  ContextMenu,
} from '@blueprintjs/core';
import DateTimeRangePicker from './components/DateTimeRangePicker';
import moment from 'moment-jalaali';
import { Util } from '../../../../helpers';
import './index.scss';

class Search extends PureComponent {
  static propTypes = {
    filter: PropTypes.shape({
      selected: PropTypes.string,
      options: PropTypes.array,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.eventListeners = [];
    this.searchInputRef = React.createRef();
    this.advanceSearchForm = React.createRef();
    this.advanceSearchFormDateStart = React.createRef();
    this.advanceSearchFormDateEnd = React.createRef();
    this.fileSizeStart = React.createRef();
    this.fileSizeEnd = React.createRef();
    this.fileSizeStartType = React.createRef();
    this.fileSizeEndType = React.createRef();
    this.errorAdvanceSearch = React.createRef();
    this.keywords = React.createRef();
    this.fileName = React.createRef();
    this.sizeSelectOptions = [
      { value: 'B', label: '‌Byte' },
      { value: 'KB', label: 'KB' },
      { value: 'MB', label: 'MB' },
      { value: 'GB', label: 'GB' },
    ];

    this.state = {
      isOpen: false,
      fileSizeStartType: 'B',
      fileSizeEndType: 'B',
      searchCr: {
        words: '',
        title: '',
        type: '',
        minSize: '',
        maxSize: '',
        after: '',
        before: '',
      },
    };
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onEnterPressed);
    window.addEventListener('click', this.contextHide);
    this.onUpdateDataParamToForm();
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onEnterPressed);
    window.removeEventListener('click', this.contextHide);
  }

  onUpdateDataParamToForm = () => {
    const params = this.props.location.search;
    const urlSearchParams = Util.getUrlParams(params);

    this.setState(
      {
        searchCr: urlSearchParams,
      },
      () => {
        if (urlSearchParams) {
          if (urlSearchParams.words) this.searchInputRef.current.value = urlSearchParams.words;

          if (urlSearchParams.after && Util.checkValidDate(urlSearchParams.after))
            this.setState({ dateValueStartOriginal: moment(new Date(urlSearchParams.after)) });

          if (urlSearchParams.before && Util.checkValidDate(urlSearchParams.before))
            this.setState({ dateValueEndOriginal: moment(new Date(urlSearchParams.before)) });
        }
      },
    );
  };

  onEnterPressed = e => {
    if (this.state.isOpen && e.keyCode === 13) {
      e.preventDefault();
      this.advanceSearch();
    }
  };

  datePickerInput = props => {
    return (
      <input
        ref={
          props.id === 'file-start-date'
            ? this.advanceSearchFormDateStart
            : this.advanceSearchFormDateEnd
        }
        {...props}
      />
    );
  };

  valueToByte(value, type) {
    switch (type) {
      case 'GB':
        value *= 1024; // falls through
      case 'MB':
        value *= 1024; // falls through
      case 'KB':
        value *= 1024; // falls through
      default:
        return value;
    }
  }

  contextHide() {
    ContextMenu.hide();
  }

  byteToValue(value, type) {
    switch (type) {
      case 'GB':
        value /= 1024; // falls through
      case 'MB':
        value /= 1024; // falls through
      case 'KB':
        value /= 1024; // falls through
      default:
        return value;
    }
  }

  kilobyteToValue(value, type) {
    switch (type) {
      case 'GB':
        value /= 1024; // falls through
      case 'MB':
        value /= 1024;
        return value;
      case 'B':
        value *= 1024; // falls through
      default:
        return value;
    }
  }

  MegabyteToValue(value, type) {
    switch (type) {
      case 'GB':
        value /= 1024;
        return value;
      case 'B':
        value *= 1024; // falls through
      case 'KB':
        value *= 1024; // falls through
      default:
        return value;
    }
  }

  GigabyteToValue(value, type) {
    switch (type) {
      case 'B':
        value *= 1024; // falls through
      case 'KB':
        value *= 1024; // falls through
      case 'MB':
        value *= 1024; // falls through
      default:
        return value;
    }
  }

  onSubmitRequest = event => {
    event.preventDefault();

    this.setState({
      searchCr: {
        title: '',
        type: '',
        minSize: '',
        maxSize: '',
        after: '',
        before: '',
      },
    });

    this.props.update(
      this.searchInputRef.current.value,
      this.props.filter.selected,
      this.props.history.push,
    );
  };

  advanceSearchEnter = e => {
    e.preventDefault();

    if (e.keyCode === 13) {
      this.advanceSearch();
    }
  };

  openAdvanceSearch = () => {
    this.setState({
      isOpen: true,
    });
  };

  advanceSearchOpening = () => {
    this.keywords.current.value = this.searchInputRef.current.value;
    this.fileName.current.value = this.state.searchCr.title || '';
    this.fileSizeStart.current.value = this.state.searchCr.minSize
      ? Math.round(
          this.byteToValue(this.state.searchCr.minSize, this.state.fileSizeStartType || 'B') * 1000,
        ) / 1000
      : '';

    this.fileSizeEnd.current.value = this.state.searchCr.maxSize
      ? Math.round(
          this.byteToValue(this.state.searchCr.maxSize, this.state.fileSizeEndType || 'B') * 1000,
        ) / 1000
      : '';

    this.fileSizeStartType.current.value = this.state.fileSizeStartType || 'B';
    this.fileSizeEndType.current.value = this.state.fileSizeEndType || 'B';
  };

  fileSizeStartTypeChange = () => {
    switch (this.state.fileSizeStartType) {
      case 'B':
        this.fileSizeStart.current.value =
          Math.round(
            this.byteToValue(
              this.fileSizeStart.current.value,
              this.fileSizeStartType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      case 'KB':
        this.fileSizeStart.current.value =
          Math.round(
            this.kilobyteToValue(
              this.fileSizeStart.current.value,
              this.fileSizeStartType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      case 'MB':
        this.fileSizeStart.current.value =
          Math.round(
            this.MegabyteToValue(
              this.fileSizeStart.current.value,
              this.fileSizeStartType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      case 'GB':
        this.fileSizeStart.current.value =
          Math.round(
            this.GigabyteToValue(
              this.fileSizeStart.current.value,
              this.fileSizeStartType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      default:
        break;
    }
    this.setState({ fileSizeStartType: this.fileSizeStartType.current.value });
  };

  fileSizeEndTypeChange = () => {
    switch (this.state.fileSizeEndType) {
      case 'B':
        this.fileSizeEnd.current.value =
          Math.round(
            this.byteToValue(this.fileSizeEnd.current.value, this.fileSizeEndType.current.value) *
              1000,
          ) / 1000;
        break;

      case 'KB':
        this.fileSizeEnd.current.value =
          Math.round(
            this.kilobyteToValue(
              this.fileSizeEnd.current.value,
              this.fileSizeEndType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      case 'MB':
        this.fileSizeEnd.current.value =
          Math.round(
            this.MegabyteToValue(
              this.fileSizeEnd.current.value,
              this.fileSizeEndType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      case 'GB':
        this.fileSizeEnd.current.value =
          Math.round(
            this.GigabyteToValue(
              this.fileSizeEnd.current.value,
              this.fileSizeEndType.current.value,
            ) * 1000,
          ) / 1000;
        break;

      default:
        break;
    }

    this.setState({ fileSizeEndType: this.fileSizeEndType.current.value });
  };

  onKeywordChange = event => {
    this.searchInputRef.current.value = event.target.value;
  };

  closeAdvanceSearch = () => {
    this.setState({
      isOpen: false,
    });
  };

  setDatePickerStart = datetime => {
    if (datetime) {
      let dateValueStart = moment(datetime).format('YYYY-MM-DD');
      this.setState({ dateValueStart, dateValueStartOriginal: datetime });
    } else {
      this.setState({ dateValueStart: null, dateValueStartOriginal: null });
    }
  };

  setDatePickerEnd = datetime => {
    if (datetime) {
      let dateValueEnd = moment(datetime).format('YYYY-MM-DD');
      this.setState({ dateValueEnd, dateValueEndOriginal: datetime });
    } else {
      this.setState({ dateValueEnd: null, dateValueEndOriginal: null });
    }
  };

  resetForm = () => {
    this.advanceSearchForm.current.reset();

    this.setState(
      state => ({
        dateValueExStart: state.dateValueStart,
        dateValueStart: null,
        dateValueEnd: null,
        dateValueStartOriginal: null,
        dateValueEndOriginal: null,
      }),
      () => {
        if (this.advanceSearchFormDateStart && this.advanceSearchFormDateStart.current) {
          this.advanceSearchFormDateStart.current.value = '';
        }

        if (this.advanceSearchFormDateEnd && this.advanceSearchFormDateEnd.current) {
          this.advanceSearchFormDateEnd.current.value = '';
        }
      },
    );

    this.searchInputRef.current.value = '';
  };

  advanceSearch = () => {
    let startValue = this.fileSizeStart.current.value;
    let startValueType = this.fileSizeStartType.current.value;
    let endValue = this.fileSizeEnd.current.value;
    let endValueType = this.fileSizeEndType.current.value;

    if (startValue && !isNaN(parseInt(startValue, 10))) {
      startValue = Math.round(this.valueToByte(startValue, startValueType));
      if (endValue && !isNaN(parseInt(endValue, 10))) {
        endValue = Math.round(this.valueToByte(endValue, endValueType));
        if (endValue < startValue) {
          this.errorAdvanceSearch.current.innerText = 'سایز فایل وارد شده صحیح نمیباشد.';
          return;
        }
      } else if (endValue) {
        this.errorAdvanceSearch.current.innerText = 'سایز فایل وارد شده صحیح نمیباشد.';
        return;
      }
    } else if (!startValue && endValue && !isNaN(parseInt(endValue, 10))) {
      endValue = Math.round(this.valueToByte(endValue, endValueType));
    } else if (endValue) {
      this.errorAdvanceSearch.current.innerText = 'سایز فایل وارد شده صحیح نمیباشد.';
      return;
    }

    let formData = new FormData(this.advanceSearchForm.current);
    let searchCr = {};

    formData.forEach((value, key) => {
      if (value) {
        searchCr[key] = value;
      }
    });

    if (startValue) {
      searchCr.minSize = startValue;
    }

    if (endValue) {
      searchCr.maxSize = endValue;
    }

    if (this.state.dateValueStart) {
      searchCr.after = this.state.dateValueStart;
    }

    if (this.state.dateValueEnd) {
      searchCr.before = this.state.dateValueEnd;
    }

    this.closeAdvanceSearch();
    this.props.updateAdvancedSearch(searchCr, this.props.filter.selected, this.props.history.push);
    this.setState({ searchCr });
  };

  async inputContextMenu(event, { current: input }) {
    let clipboardText = '';
    event.persist();
    try {
      clipboardText = await navigator.clipboard?.readText();
    } catch (e) {
      console.log('error read clipboard', e);
    }

    ContextMenu.show(
      <Menu>
        <MenuItem
          disabled={!input.value}
          onClick={() => {
            input.select();
            document.execCommand('cut');
          }}
          icon="cut"
          text="برش"
          label="cut"
        />
        <MenuItem
          disabled={!input.value}
          onClick={() => {
            input.select();
            document.execCommand('copy');
          }}
          icon="duplicate"
          text="کپی"
          label="copy"
        />
        <MenuItem
          onClick={async () => {
            let text = '';
            try {
              text = await navigator.clipboard.readText();
            } catch (e) {
              console.log('error get text from clipboard', e);
            }
            input.value += text;
          }}
          icon="document-open"
          text="چسباندن"
          label="paste"
        />
        <MenuItem
          disabled={!input.value}
          onClick={() => {
            input.select();
            this.setState({ isSelectSearchText: true });
          }}
          icon="text-highlight"
          text="انتخاب همه"
          label="select all"
        />
      </Menu>,
      {
        left: event.clientX,
        top: event.clientY,
      },
    );
    if (this.state.isSelectSearchText) {
      setTimeout(() => {
        input.select();
        this.setState({ isSelectSearchText: false });
      }, 0);
    }
    event.preventDefault();
  }

  render() {
    const typeFile = this.state.searchCr.type;

    return [
      <div className="pull-right" key={0}>
        <form onSubmit={this.onSubmitRequest} className="search">
          <input
            onContextMenu={e => this.inputContextMenu(e, this.searchInputRef)}
            ref={this.searchInputRef}
            type="text"
            placeholder="جستجو در فایل ها"
          />
        </form>
      </div>,

      <Button
        icon="search"
        className="advance-search-mobile"
        onClick={this.openAdvanceSearch}
        key={2}
      />,

      <AnchorButton
        text="جستجو پیشرفته"
        small={true}
        className="bp3-intent-primary bp3-minimal pull-right advance-search"
        onClick={this.openAdvanceSearch}
        key={3}
      />,

      <Dialog
        className="advance-search-dialog"
        title="جستجو پیشرفته"
        isOpen={this.state.isOpen}
        onClose={this.closeAdvanceSearch}
        onOpening={this.advanceSearchOpening}
        key={4}
      >
        <div className={Classes.DIALOG_BODY}>
          <form ref={this.advanceSearchForm} autoComplete="off">
            <FormGroup label="کلمات کلیدی" labelFor="keywords" inline={true}>
              <InputGroup
                id="keywords"
                name="words"
                placeholder="کلمات کلیدی"
                onContextMenu={e => this.inputContextMenu(e, this.keywords)}
                inputRef={this.keywords}
                onChange={this.onKeywordChange}
                autoFocus
              />
            </FormGroup>

            <FormGroup label="نام فایل" labelFor="file-name" inline={true}>
              <InputGroup
                id="file-name"
                name="title"
                onContextMenu={event => this.inputContextMenu(event, this.fileName)}
                placeholder="یک کلمه در نام فایل وارد کنید"
                inputRef={this.fileName}
              />
            </FormGroup>

            <FormGroup label="تاریخ" labelFor="file-start-date" inline={true}>
              <DateTimeRangePicker
                preSelectedStart={
                  this.state.searchCr.after ? this.state.dateValueStartOriginal : undefined
                }
                preSelectedEnd={
                  this.state.searchCr.before ? this.state.dateValueEndOriginal : undefined
                }
                idStart="file-start-date"
                idEnd="file-end-date"
                placeholderStart="از تاریخ"
                placeholderEnd="تا تاریخ"
                onChangeStart={this.setDatePickerStart}
                onChangeEnd={this.setDatePickerEnd}
                inputComponent={this.datePickerInput}
                ref={e => (this.datePickerRef = e)}
              />
            </FormGroup>

            <FormGroup label="نوع فایل" labelFor="file-type" inline={true}>
              <div className="bp3-select bp3-minimal">
                <select
                  id="file-type"
                  name="type"
                  placeholder="انتخاب نمایید"
                  value={typeFile}
                  onChange={e => {
                    e.persist();
                    this.setState(prevState => ({
                      searchCr: { ...prevState.searchCr, type: e.target.value },
                    }));
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
            </FormGroup>

            <FormGroup label="سایز فایل" labelFor="file-size-start" inline={true}>
              <div className="file-size">
                <ControlGroup fill={true}>
                  <HTMLSelect
                    options={this.sizeSelectOptions}
                    elementRef={this.fileSizeStartType}
                    onChange={this.fileSizeStartTypeChange}
                  />
                  <InputGroup
                    id="file-size-start"
                    inputRef={this.fileSizeStart}
                    name="minSize"
                    placeholder="از سایز"
                    type="number"
                  />
                </ControlGroup>
                <span>-`{'>'}`</span>
                <ControlGroup fill={true}>
                  <HTMLSelect
                    options={this.sizeSelectOptions}
                    elementRef={this.fileSizeEndType}
                    onChange={this.fileSizeEndTypeChange}
                  />
                  <InputGroup
                    id="file-size-end"
                    inputRef={this.fileSizeEnd}
                    name="maxSize"
                    placeholder="تا سایز"
                    type="number"
                  />
                </ControlGroup>
              </div>
            </FormGroup>

            <p className="error-advance-search" ref={this.errorAdvanceSearch}></p>
          </form>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <AnchorButton intent={Intent.PRIMARY} onClick={this.advanceSearch}>
              جستجو
            </AnchorButton>
            <AnchorButton small={true} className="bp3-minimal" onClick={this.resetForm}>
              پاک کردن فرم
            </AnchorButton>
          </div>
        </div>
      </Dialog>,
    ];
  }
}

const mapDispatchToProps = dispatch => ({
  update(words, filterSelected, navigate) {
    navigate({
      pathname: '/search',
      search: `?words=${words}`,
    });

    if (words) {
      dispatch(changeFilter('search', { words }));
    }
  },

  updateAdvancedSearch(searchCr, filterSelected, navigate) {
    dispatch(changeAdvancedSearch({ searchCr }));

    const queryStringSearch = Util.convertToQueryString(searchCr);

    navigate({
      pathname: '/search',
      search: `?${queryStringSearch}`,
    });

    if (Object.keys(searchCr).length) {
      dispatch(changeFilter('search', searchCr));
    }
  },
});

const mapStateToProps = state => ({
  filter: state.sidebar.filter,
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Search);
