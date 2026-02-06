import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MediumButtons from '../buttons/MediumButtons';
import '../../styles/dashboard/AssetForecastTable.css';

const ITEMS_PER_PAGE = 5;

const getTrendLabel = (trend) => {
  if (trend === 'up') return 'Increasing';
  if (trend === 'down') return 'Decreasing';
  return 'Stable';
};

function AssetForecastTable({ data, title = 'Asset Status Forecast' }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, endIndex);

  const handleExportExcel = () => {
    const headers = ['Status', 'Current Count', 'Forecast Count', 'Trend'];
    const rows = data.map(item => [
      item.status,
      item.currentCount,
      item.forecastCount,
      getTrendLabel(item.trend),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create and download Excel file
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-forecast.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="forecast-table-wrapper">
      <div className="forecast-table-header">
        <h3 className="forecast-table-title">{title}</h3>
      </div>
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Current Count</th>
            <th>Forecast Count</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index}>
              <td>{item.status}</td>
              <td>{item.currentCount}</td>
              <td>{item.forecastCount}</td>
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

AssetForecastTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      currentCount: PropTypes.number.isRequired,
      forecastCount: PropTypes.number.isRequired,
      trend: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default AssetForecastTable;

