import React from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import MediumButtons from '../buttons/MediumButtons';
import '../../styles/dashboard/ProductForecastTable.css';

function ProductForecastTable({ data }) {
  const handleExportExcel = () => {
    const headers = ['Product Name', 'Current Demand', 'Forecast Demand', 'Trend'];
    const rows = data.map(item => [
      item.productName,
      item.currentDemand,
      item.forecastDemand,
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
    a.download = 'product-forecast.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="forecast-audit-wrapper">
      <div className="forecast-audit-header">
        <h3 className="forecast-audit-title">Product Demand Summary</h3>
        <MediumButtons type="export" onClick={handleExportExcel} />
      </div>
      <div className="forecast-audit-table-section">
        <table className="forecast-audit-table">
          <thead>
            <tr>
              <th>PRODUCT NAME</th>
              <th>CURRENT DEMAND</th>
              <th>FORECAST DEMAND</th>
              <th>TREND</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.currentDemand}</td>
                <td>{item.forecastDemand}</td>
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

ProductForecastTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      productName: PropTypes.string.isRequired,
      currentDemand: PropTypes.number.isRequired,
      forecastDemand: PropTypes.number.isRequired,
      trend: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProductForecastTable;

