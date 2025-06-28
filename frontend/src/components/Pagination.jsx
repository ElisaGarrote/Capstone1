import React from 'react';
import '../styles/custom-colors.css';
import '../styles/Pagination.css';

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100]
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    onItemsPerPageChange(newItemsPerPage);
    // Reset to page 1 when changing items per page
    onPageChange(1);
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-left">
        <span className="pagination-text">Show</span>
        <select 
          value={itemsPerPage} 
          onChange={handleItemsPerPageChange}
          className="pagination-select"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className="pagination-text">items per page</span>
      </div>
      
      <div className="pagination-right">
        <button 
          className="pagination-btn prev-btn" 
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="pagination-page-number">{currentPage}</span>
        <button 
          className="pagination-btn next-btn" 
          onClick={handleNext}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
