import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

const propTypes = {
  title: PropTypes.string,
  style: PropTypes.any,
};

function subTitle(props) {
  return (
    <div className="sub-title" style={props.style}>
      {props.title}
    </div>
  );
}

subTitle.propTypes = propTypes;

export default subTitle;
