import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MediumButtons from '../buttons/MediumButtons';
import '../../styles/dashboard/ProductForecastTable.css';

const ITEMS_PER_PAGE = 5;

const getTrendLabel = (trend) => {
  if (trend === 'up') return 'Increasing';
  if (trend === 'down') return 'Decreasing';
  return 'Stable';
};

function ProductForecastTable({ data, title = 'Product Demand Forecast' }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, endIndex);

  const handleExportExcel = () => {
    const headers = ['Product Name', 'Current Demand', 'Forecast Demand', 'Trend'];
    const rows = data.map(item => [
      item.productName,
      item.currentDemand,
      item.forecastDemand,
      getTrendLabel(item.trend),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Generate filename with date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const filename = `product-demand-forecast_${dateStr}.csv`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="forecast-table-wrapper">
      <div className="forecast-table-header">
        <h3 className="forecast-table-title">{title}</h3>
      </div>
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Current Demand</th>
            <th>Forecast Demand</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>{item.currentDemand}</td>
              <td>{item.forecastDemand}</td>
              <td>
                <div className={`trend-cell ${item.trend}`}>
                  {item.trend === 'up' && <FiTrendingUp className="trend-icon" />}
                  {item.trend === 'down' && <FiTrendingDown className="trend-icon" />}
                  {item.trend === 'stable' && <FiMinus className="trend-icon" />}
                  <span>{getTrendLabel(item.trend)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
        <MediumButtons type="export" onClick={handleExportExcel} />
      </div>
    </div>
  );
}

ProductForecastTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      currentDemand: PropTypes.number.isRequired,
      forecastDemand: PropTypes.number.isRequired,
      trend: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string,
};

export default ProductForecastTable;

