import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/dashboard/AssetStatusForecastChart.css';
import AssetForecastTable from './AssetForecastTable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-content">
          {payload[0].name}: <span className="tooltip-count">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

function AssetStatusForecastChart({ chartData, tableData }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="forecast-section">
      <div className="forecast-header">
        <h2 className="forecast-title">Asset Status Forecast</h2>
      </div>

      <div className="forecast-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} className="forecast-line-chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
<<<<<<< HEAD
            <Tooltip content={<CustomTooltip />} />
            <Legend className="forecast-legend" />
            {/* Historical data - solid lines */}
=======
            <Tooltip content={<CustomTooltip />} />
            <Legend className="forecast-legend" />
            {/* Historical data - solid lines */}
>>>>>>> Mergee2
            <Line
              type="monotone"
              dataKey="available"
              stroke="#0D6EFD"
              strokeWidth={2}
              name="Available (Historical)"
              connectNulls={true}
              dot={{ r: 4, fill: "#0D6EFD", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="deployed"
              stroke="#E6A700"
              strokeWidth={2}
              name="Deployed (Historical)"
              connectNulls={true}
              dot={{ r: 4, fill: "#E6A700", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="unavailable"
              stroke="#DC3545"
              strokeWidth={2}
              name="Unavailable (Historical)"
              connectNulls={true}
              dot={{ r: 4, fill: "#DC3545", strokeWidth: 0 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-toggle-section">
        <button
          className="view-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {showDetails && (
        <div className="forecast-table-container">
          <AssetForecastTable data={tableData} />
        </div>
      )}
    </div>
  );
}

AssetStatusForecastChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AssetStatusForecastChart;

