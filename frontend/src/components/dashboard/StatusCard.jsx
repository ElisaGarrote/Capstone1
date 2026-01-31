import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import StatusCardPopup from './StatusCardPopup';
import dateRelated from '../../utils/dateRelated';
import '../../styles/dashboard/StatusCard.css';

function StatusCard({ number, title, isRed, isLarge, index, dueCheckinData, overdueCheckinData }) {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (title === 'Upcoming End of Life') {
      navigate('/upcoming-end-of-life');
    } else if (title === 'Overdue Audits') {
      navigate('/audits/overdue');
    } else if (title === 'Upcoming Audits') {
      navigate('/audits');
    } else if (title === 'Expiring Warranties') {
      navigate('/warranties');
    } else if (title === 'Reached End of Life') {
      navigate('/reached-end-of-life');
    } else if (title === 'Expired Warranties') {
      navigate('/expired-warranties');
    } else if (title === 'Due for Return' || title === 'Low Stock' || title === 'Overdue for Return') {
      setShowPopup(true);
    }
  };

  const dueReturnItems = [
    {
      assetId: '100010',
      assetName: 'Macbook Pro 16"',
      checkedOutTo: 'Dan Rick Otso',
      expectedReturnDate: 'April 2, 2025'
    },
    {
      assetId: '100011',
      assetName: 'iPad Pro"',
      location: 'Makati',
      expectedReturnDate: 'April 3, 2025'
    }
  ];

  const overdueReturnItems = [
    {
      assetId: '100110',
      assetName: 'Macbook Pro 16"',
      checkedOutTo: 'Alan Rick Otso',
      expectedReturnDate: 'April 1, 2025'
    },
    {
      assetId: '103011',
      assetName: 'iPad Pro"',
      location: 'Makati',
      expectedReturnDate: 'April 1, 2025'
    }
  ];

  const upcomingAuditsItems = [
    {
      assetId: '100010',
      assetName: 'Macbook Pro 16"',
      checkedOutTo: 'Alan Rick Otso',
      expectedReturnDate: 'April 1, 2025'
    },
    {
      assetId: '100011',
      assetName: 'iPad Pro"',
      location: 'Makati',
      expectedReturnDate: 'April 1, 2025'
    }
  ];

  const lowStockItems = [
    {
      category: 'Magic Keyboard',
      minimumQuantity: 10,
      available: 5
    },
    {
      category: 'Laptops',
      minimumQuantity: 15,
      available: 6
    }
  ];

  const getItems = () => {
    switch (title) {
      case 'Due for Return':
        if (dueCheckinData && dueCheckinData.length > 0) {
          return dueCheckinData.map(item => ({
            assetDbId: item.asset_db_id,
            assetId: item.asset_id,
            assetName: item.asset_name,
            checkedOutTo: item.checked_out_to,
            expectedReturnDate: dateRelated.formatDate(item.return_date)
          }));
        }
        return dueReturnItems;
      case 'Overdue for Return':
        if (overdueCheckinData && overdueCheckinData.length > 0) {
          return overdueCheckinData.map(item => ({
            assetDbId: item.asset_db_id,
            assetId: item.asset_id,
            assetName: item.asset_name,
            checkedOutTo: item.checked_out_to,
            expectedReturnDate: dateRelated.formatDate(item.return_date)
          }));
        }
        return overdueReturnItems;
      case 'Upcoming Audits':
        return upcomingAuditsItems;
      case 'Low Stock':
        return lowStockItems;
      default:
        return [];
    }
  };

  return (
    <div className={`card-position-${index}`}>
      <div
        className={`status-card ${isLarge ? 'large' : ''} ${title === 'Low Stock' ? 'low-stock-card' : ''} ${showPopup ? 'active' : ''}`}
        onClick={handleClick}
      >
        <div className="content-wrapper">
          <div className={`status-number ${isRed ? 'red' : 'blue'}`}>{number}</div>
          <div className="status-title">{title}</div>
        </div>
      </div>

      {showPopup && title !== 'Upcoming Audits' && (
        <StatusCardPopup
          title={title}
          dueDate={title === 'Due for Return' ? 30 : (title === 'Low Stock' || title === 'Overdue for Return' ? null : 14)}
          items={getItems()}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

StatusCard.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isRed: PropTypes.bool,
  isLarge: PropTypes.bool,
  index: PropTypes.number.isRequired,
  dueCheckinData: PropTypes.array,
  overdueCheckinData: PropTypes.array
};

StatusCard.defaultProps = {
  isRed: false,
  isLarge: false
};

export default StatusCard;