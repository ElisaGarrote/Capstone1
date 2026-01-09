import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
import '../../styles/dashboard/AssetStatusForecastChart.css';
import AssetForecastTable from './AssetForecastTable';

function AssetStatusForecastChart({ chartData, tableData }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="forecast-section">
      <div className="forecast-header">
        <h2 className="forecast-title">Asset Status Forecast</h2>
      </div>

      <div className="forecast-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {/* Forecast data - dashed lines (lighter shades) - rendered FIRST (behind) */}
            <Line
              type="monotone"
              dataKey="forecastAvailable"
              stroke="#7BB8FF"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Available (Forecast)"
              connectNulls={true}
              dot={{ r: 5, fill: "#7BB8FF", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="forecastCheckedOut"
              stroke="#FFD966"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Checked-Out (Forecast)"
              connectNulls={true}
              dot={{ r: 5, fill: "#FFD966", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="forecastUnderRepair"
              stroke="#FF9999"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Under Repair (Forecast)"
              connectNulls={true}
              dot={{ r: 5, fill: "#FF9999", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            {/* Historical data - solid lines (darker shades) - rendered LAST (on top) */}
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
              dataKey="checkedOut"
              stroke="#E6A700"
              strokeWidth={2}
              name="Checked-Out (Historical)"
              connectNulls={true}
              dot={{ r: 4, fill: "#E6A700", strokeWidth: 0 }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="underRepair"
              stroke="#DC3545"
              strokeWidth={2}
              name="Under Repair (Historical)"
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

