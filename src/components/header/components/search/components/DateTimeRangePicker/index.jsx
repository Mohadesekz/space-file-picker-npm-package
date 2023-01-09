import React, { PureComponent } from 'react';
import util from '../../../../../../helpers/util';
import DatePicker from 'react-datepicker2';
import { Icon } from '@blueprintjs/core';

class DateTimeRangePicker extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { min: new Date('2018-09-22T20:00:00+0800') };
    this.change = this.change.bind(this);
    this.secondchange = this.secondchange.bind(this);
  }

  resetStartDate() {
    const date = new Date();
    let { onChangeStart } = this.props;
    this.datePickerStart.removeDate();

    if (!!onChangeStart) onChangeStart(null);

    if (this.datePickerStart) {
      this.datePickerStart.setState({
        currentMonth: util.getMonth(date),
        daysCount: util.getDaysInMonth(date),
        inputValue: '',
        openPicker: false,
        selectedDay: '',
        selectedMonthFirstDay: 0,
        selectedTime: date.toTimeString().substr(0, 5),
        selectedYear: util.getYear(date),
      });
    }
  }

  resetEndDate() {
    const date = new Date();
    let { onChangeEnd } = this.props;
    this.datePickerEnd.removeDate();

    if (!!onChangeEnd) onChangeEnd(null);

    if (this.datePickerEnd) {
      this.datePickerEnd.setState({
        currentMonth: util.getMonth(date),
        daysCount: util.getDaysInMonth(date),
        inputValue: '',
        openPicker: false,
        selectedDay: '',
        selectedMonthFirstDay: 0,
        selectedTime: date.toTimeString().substr(0, 5),
        selectedYear: util.getYear(date),
      });
    }
  }

  change(formatted) {
    if (formatted) {
      this.setState({ min: formatted });
      let { onChangeStart } = this.props;
      if (!!onChangeStart) onChangeStart(formatted);
    }
  }

  secondchange(formatted) {
    if (formatted) {
      let { onChangeEnd } = this.props;
      if (!!onChangeEnd) onChangeEnd(formatted);
    }
  }

  refStart = e => {
    this.datePickerStart = e;

    if (e && e.input) {
      e.input.setAttribute('placeholder', this.props.placeholderStart);
      e.input.addEventListener('keydown', event => {
        event.preventDefault();
      });
    }

    if (typeof this.props.refStart === 'function') {
      this.props.refStart(e);
    }
  };

  refEnd = e => {
    this.datePickerEnd = e;

    if (e && e.input) {
      e.input.setAttribute('placeholder', this.props.placeholderEnd);
      e.input.addEventListener('keydown', event => {
        event.preventDefault();
      });
    }

    if (typeof this.props.refEnd === 'function') {
      this.props.refEnd(e);
    }
  };

  render() {
    let {
      placeholderEnd,
      placeholderStart,
      idStart,
      idEnd,
      preSelectedStart,
      preSelectedEnd,
    } = this.props;

    if (!placeholderStart) placeholderStart = '';
    if (!placeholderEnd) placeholderEnd = '';
    if (!idStart) idStart = '';
    if (!idEnd) idEnd = '';

    return (
      <div className="jdtrp" style={{ textAlign: 'initial' }}>
        <DatePicker
          isGregorian={false}
          timePicker={false}
          inputFormat="YYYY-MM-DD"
          inputJalaaliFormat="jDD jMMMM jYYYY"
          onChange={this.change}
          value={preSelectedStart}
          ref={this.refStart}
        />

        <Icon
          icon="small-cross"
          iconSize={20}
          color="#aeb8c0"
          onClick={() => this.resetStartDate()}
          className="date-icon-remove"
          style={{ left: '50%' }}
        />

        <DatePicker
          isGregorian={false}
          timePicker={false}
          inputFormat="YYYY-MM-DD"
          inputJalaaliFormat="jDD jMMMM jYYYY"
          onChange={this.secondchange}
          value={preSelectedEnd}
          ref={this.refEnd}
          min={this.state.min}
        />

        <Icon
          icon="small-cross"
          iconSize={20}
          color="#aeb8c0"
          onClick={() => this.resetEndDate()}
          className="date-icon-remove"
        />
      </div>
    );
  }
}

export default DateTimeRangePicker;
