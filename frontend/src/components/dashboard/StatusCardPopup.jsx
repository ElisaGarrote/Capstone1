import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { HiOutlineTag } from 'react-icons/hi';
import { IoLocationOutline } from 'react-icons/io5';
import { RxPerson } from 'react-icons/rx';
import { BsKeyboard, BsLaptop } from 'react-icons/bs';
import Status from '../Status';
import Pagination from '../Pagination';
import MediumButtons from '../buttons/MediumButtons';
import '../../styles/dashboard/StatusCardPopup.css';
import '../../styles/custom-colors.css';

const StatusCardPopup = ({ title, dueDate, items, onClose }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Paginate items
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handleExport = () => {
    // TODO: Implement XLSX export functionality
    console.log('Exporting as XLSX...');
  };
  const getColumnTitles = () => {
    if (title === 'Low Stock') {
      return {
        category: 'CATEGORY',
        minimum: 'MINIMUM QUANTITY',
        available: 'AVAILABLE'
      };
    }

    switch (title) {
      case 'Due for Return':
        return {
          asset: 'ASSET',
          assignee: 'CHECKED OUT TO',
          date: 'EXPECTED RETURN DATE'
        };
      case 'Upcoming Audits':
        return {
          asset: 'ASSET',
          assignee: 'CHECKED OUT TO',
          date: 'AUDIT DUE DATE'
        };
      default:
        return {
          asset: 'ASSET',
          assignee: 'CHECKED OUT TO',
          date: 'DATE'
        };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'magic keyboard':
        return <BsKeyboard className="category-icon" />;
      case 'laptops':
        return <BsLaptop className="category-icon" />;
      default:
        return <HiOutlineTag className="category-icon" />;
    }
  };

  const columnTitles = getColumnTitles();

  const renderTableContent = () => {
    if (title === 'Low Stock') {
      return (
        <>
          <thead>
            <tr>
              <th>{columnTitles.category}</th>
              <th>{columnTitles.minimum}</th>
              <th>{columnTitles.available}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="category-info">
                    {getCategoryIcon(item.category)}
                    <span className="category-name">{item.category}</span>
                  </div>
                </td>
                <td>
                  <span className="quantity">{item.minimumQuantity}</span>
                </td>
                <td>
                  <span className="available">{item.available}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </>
      );
    }

    return (
      <>
        <thead>
          <tr>
            <th>{columnTitles.asset}</th>
            <th>{columnTitles.assignee}</th>
            <th className="date-header">{columnTitles.date}</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="asset-info">
                  <HiOutlineTag className="asset-icon" />
                  <span>
                    <span 
                      className="asset-link" 
                      onClick={() => navigate(`/assets/view/${item.assetId}`)}
                      style={{ cursor: 'pointer', color: '#0D6EFD', textDecoration: 'underline' }}
                    >
                      {item.assetId}
                    </span>
                    {' - '}{item.assetName}
                  </span>
                </div>
              </td>
              <td>
                {item.location ? (
                  <div className="location-info">
                    <IoLocationOutline style={{ color: '#0D6EFD' }} />
                    <span className="location-name">{item.location}</span>
                  </div>
                ) : (
                  <div className="user-info">
                    <RxPerson className="user-icon" />
                    <span className="user-name">{item.checkedOutTo}</span>
                  </div>
                )}
              </td>
              <td className="date-cell">{item.expectedReturnDate}</td>
            </tr>
          ))}
        </tbody>
      </>
    );
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>{title}{dueDate ? ` (next ${dueDate} days)` : ''}</h2>
          <div className="popup-header-actions">
            <MediumButtons
              type="export"
              onClick={handleExport}
            />
            <button className="close-button" onClick={onClose}>
              <IoClose />
            </button>
          </div>
        </div>
        <div className="popup-body">
          <div className="table-wrapper">
            <table className="status-card-table">
              {renderTableContent()}
            </table>
          </div>
        </div>
        <div className="popup-footer">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={items.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
};

StatusCardPopup.propTypes = {
  title: PropTypes.string.isRequired,
  dueDate: PropTypes.number,
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        assetId: PropTypes.string,
        assetName: PropTypes.string,
        checkedOutTo: PropTypes.string,
        location: PropTypes.string,
        expectedReturnDate: PropTypes.string,
      }),
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        minimumQuantity: PropTypes.number.isRequired,
        available: PropTypes.number.isRequired,
      })
    ])
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default StatusCardPopup;