import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../../styles/dashboard/ProductDemandForecastChart.css';
import ProductForecastTable from './ProductForecastTable';

// Distinctive color palette for 5 products - high contrast
const COLORS = [
  '#2563EB', // Blue
  '#DC2626', // Red
  '#16A34A', // Green
  '#F59E0B', // Amber/Orange
  '#8B5CF6', // Purple
];

// Lighter versions for forecast (same hue, lighter shade)
const FORECAST_COLORS = [
  '#93C5FD', // Light Blue
  '#FCA5A5', // Light Red
  '#86EFAC', // Light Green
  '#FCD34D', // Light Amber
  '#C4B5FD', // Light Purple
];

// Generate forecast key from product name (must match backend logic)
const getForecastKey = (productName) => {
  return `forecast_${productName.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

function ProductDemandForecastChart({ chartData, tableData, productNames = [] }) {
  const [showDetails, setShowDetails] = useState(false);

  // Extract product names from data if not provided
  const products = useMemo(() => {
    if (productNames && productNames.length > 0) {
      return productNames;
    }
    // Fallback: extract from first data row (excluding 'month' and 'forecast_' keys)
    if (chartData && chartData.length > 0) {
      return Object.keys(chartData[0]).filter(
        key => key !== 'month' && !key.startsWith('forecast_')
      );
    }
    return [];
  }, [productNames, chartData]);

  // Custom legend showing product colors with historical/forecast distinction
  const renderLegend = () => {
    return (
      <div className="custom-legend">
        {products.map((product, index) => (
          <div key={product} className="legend-item">
            <div className="legend-color-group">
              <span
                className="legend-color solid"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span
                className="legend-color light"
                style={{ backgroundColor: FORECAST_COLORS[index % FORECAST_COLORS.length] }}
              />
            </div>
            <span className="legend-label">{product}</span>
          </div>
        ))}
        <div className="legend-hint">
          <span className="hint-solid">■ Historical</span>
          <span className="hint-forecast">□ Forecast</span>
        </div>
      </div>
    );
  };

  // Build bars array: interleave historical and forecast for each product
  const renderBars = () => {
    const bars = [];
    products.forEach((product, index) => {
      // Historical bar (solid color)
      bars.push(
        <Bar
          key={`hist-${product}`}
          dataKey={product}
          name={`${product} (Historical)`}
          fill={COLORS[index % COLORS.length]}
          barSize={undefined}
        />
      );
      // Forecast bar (lighter color)
      bars.push(
        <Bar
          key={`forecast-${product}`}
          dataKey={getForecastKey(product)}
          name={`${product} (Forecast)`}
          fill={FORECAST_COLORS[index % FORECAST_COLORS.length]}
          barSize={undefined}
        />
      );
    });
    return bars;
  };

  return (
    <div className="forecast-section">
      <div className="forecast-header">
        <h2 className="forecast-title">Product Demand Forecast</h2>
      </div>

      <div className="forecast-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            barGap={0}
            barCategoryGap="15%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value, name) => [value ?? 0, name]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend content={renderLegend} />
            {renderBars()}
          </BarChart>
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
          <ProductForecastTable data={tableData} />
        </div>
      )}
    </div>
  );
}

ProductDemandForecastChart.propTypes = {
  chartData: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableData: PropTypes.arrayOf(PropTypes.object).isRequired,
  productNames: PropTypes.arrayOf(PropTypes.string),
};

export default ProductDemandForecastChart;

