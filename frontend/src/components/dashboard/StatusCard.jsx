import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/dashboard/StatusCard.css';

function StatusCard({ number, title, isRed, isLarge }) {
  return (
    <div className={`status-card ${isLarge ? 'large' : ''}`}>
      <div className={`status-number ${isRed ? 'red' : 'blue'}`}>{number}</div>
      <div className="status-title">{title}</div>
    </div>
  );
}

StatusCard.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isRed: PropTypes.bool,
  isLarge: PropTypes.bool
};

StatusCard.defaultProps = {
  isRed: false,
  isLarge: false
};

export default StatusCard;