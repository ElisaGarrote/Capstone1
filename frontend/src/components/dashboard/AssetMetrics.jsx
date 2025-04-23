import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import '../../styles/dashboard/AssetMetrics.css';

const AssetMetrics = () => {
  const [selectedPeriod1, setSelectedPeriod1] = useState('This month');
  const [selectedPeriod2, setSelectedPeriod2] = useState('This month');

  const assetCategoriesData = [
    { name: 'Mobile Phone', value: 10, color: '#0D6EFD' },
    { name: 'Laptops', value: 20, color: '#FFB800' },
    { name: 'Tables', value: 14, color: '#82ca9d' }
  ];

  const assetStatusData = [
    { name: 'Ready to Deploy', value: 25, color: '#0D6EFD' },
    { name: 'Lost or Stolen', value: 5, color: '#FF6B6B' },
    { name: 'Being Repaired', value: 10, color: '#82ca9d' },
    { name: 'Deployed', value: 15, color: '#FFB800' }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {value}
      </text>
    );
  };

  return (
    <div className="metrics-section">
      <div className="metrics-header">
        <div className="metric-summary-card">
          <div className="summary-content">
            <h3>Total Asset Costs</h3>
            <div className="summary-value">₱24,000</div>
            <div className="time-period-buttons">
              <button
                className={`time-button ${selectedPeriod1 === 'This month' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod1('This month')}
              >
                This month
              </button>
              <button
                className={`time-button ${selectedPeriod1 === 'Last month' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod1('Last month')}
              >
                Last month
              </button>
              <button
                className={`time-button ${selectedPeriod1 === 'Two months ago' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod1('Two months ago')}
              >
                Two months ago
              </button>
            </div>
          </div>
        </div>

        <div className="metric-summary-card">
          <div className="summary-content">
            <h3>Asset Utilization</h3>
            <div className="summary-value">60%</div>
            <div className="time-period-buttons">
              <button
                className={`time-button ${selectedPeriod2 === 'This month' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod2('This month')}
              >
                This month
              </button>
              <button
                className={`time-button ${selectedPeriod2 === 'Last month' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod2('Last month')}
              >
                Last month
              </button>
              <button
                className={`time-button ${selectedPeriod2 === 'Two months ago' ? 'active pulse' : ''}`}
                onClick={() => setSelectedPeriod2('Two months ago')}
              >
                Two months ago
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-container">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Asset Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetCategoriesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {assetCategoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                layout="vertical" 
                align="left"
                verticalAlign="middle"
                iconType="circle"
                wrapperStyle={{ left: 0 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <button className="browse-all">Browse All</button>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Asset Statuses</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend 
                layout="vertical" 
                align="left"
                verticalAlign="middle"
                iconType="circle"
                wrapperStyle={{ left: 0 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <button className="browse-all">Browse All</button>
        </div>
      </div>
    </div>
  );
};

export default AssetMetrics; 