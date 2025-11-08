import React from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import MediumButtons from '../buttons/MediumButtons';
import '../../styles/dashboard/AssetForecastTable.css';

function AssetForecastTable({ data }) {
  const handleExportExcel = () => {
    const headers = ['Status', 'Current Count', 'Forecast Count', 'Trend'];
    const rows = data.map(item => [
      item.status,
      item.currentCount,
      item.forecastCount,
      item.trend === 'up' ? 'Increasing' : 'Decreasing',
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
    <div className="forecast-audit-wrapper">
      <div className="forecast-audit-header">
        <h3 className="forecast-audit-title">Asset Status Summary</h3>
        <MediumButtons type="export" onClick={handleExportExcel} />
      </div>
      <div className="forecast-audit-table-section">
        <table className="forecast-audit-table">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>CURRENT COUNT</th>
              <th>FORECAST COUNT</th>
              <th>TREND</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.status}</td>
                <td>{item.currentCount}</td>
                <td>{item.forecastCount}</td>
                <td>
                  <div className={`forecast-trend-cell ${item.trend}`}>
                    {item.trend === 'up' ? (
                      <FiTrendingUp className="forecast-trend-icon" />
                    ) : (
                      <FiTrendingDown className="forecast-trend-icon" />
                    )}
                    <span>{item.trend === 'up' ? 'Increasing' : 'Decreasing'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

