import React from 'react';
import PropTypes from 'prop-types';

const header = props => {
  return (
    <div className="header">
      <div className="pull-left">
        <i className="icon-close" onClick={() => props.infoSidebarToggle()}></i>
      </div>
    </div>
  );
};

header.propTypes = {
  infoSidebarToggle: PropTypes.func.isRequired,
};

export default header;
