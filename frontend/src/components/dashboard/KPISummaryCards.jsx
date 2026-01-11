import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiArrowUp, FiArrowDown, FiInfo, FiAlertTriangle, FiTrendingUp, FiPackage, FiActivity } from 'react-icons/fi';
import '../../styles/dashboard/KPISummaryCards.css';

function KPISummaryCards({ kpiData }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const formatChange = (change) => {
    let changeValue = typeof change === 'string' ? parseFloat(change) : change;
    const isPositive = changeValue >= 0;
    const formattedValue = `${isPositive ? '+' : ''}${changeValue.toFixed(1)}%`;

    return {
      value: formattedValue,
      isPositive,
    };
  };

  // Get appropriate icon for each KPI type
  const getKpiIcon = (title) => {
    if (title.includes('Demand')) return <FiTrendingUp className="kpi-icon" />;
    if (title.includes('Model')) return <FiPackage className="kpi-icon" />;
    if (title.includes('Shortage') || title.includes('Risk')) return <FiAlertTriangle className="kpi-icon" />;
    if (title.includes('Status')) return <FiActivity className="kpi-icon" />;
    return <FiInfo className="kpi-icon" />;
  };

  // Get risk level class for shortage risk card
  const getRiskClass = (kpi) => {
    if (kpi.riskLevel) {
      return `risk-${kpi.riskLevel.toLowerCase()}`;
    }
    return '';
  };

  return (
    <div className="kpi-summary-section">
      <h2 className="kpi-section-title">Forecast Insights</h2>
      <div className="kpi-cards-grid">
        {kpiData.map((kpi, index) => {
          const changeInfo = formatChange(kpi.change);
          const isRiskCard = kpi.title.includes('Shortage') || kpi.title.includes('Risk');
          const isModelCard = kpi.title.includes('Model');
          const isDemandCard = kpi.title.includes('Demand');
          const isStatusCard = kpi.title.includes('Status');

          // Determine what to show as main value based on card type
          const getMainValue = () => {
            if (isModelCard) {
              // For Model card, show the product name (from subtitle)
              return kpi.subtitle;
            }
            return kpi.value;
          };

          // Determine subtitle display
          const getSubtitle = () => {
            if (isModelCard) {
              // For Model card, don't show subtitle since it's the main value
              return null;
            }
            return kpi.subtitle;
          };

          return (
            <div
              key={index}
              className={`kpi-card ${getRiskClass(kpi)}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="kpi-card-content">
                <div className="kpi-header">
                  {getKpiIcon(kpi.title)}
                  <h3 className="kpi-title">{kpi.title}</h3>
                </div>

                {getSubtitle() && (
                  <p className={`kpi-subtitle ${isRiskCard ? getRiskClass(kpi) : ''}`}>
                    {getSubtitle()}
                  </p>
                )}

                <div className="kpi-main-value">
                  <span className={`kpi-value-large ${isModelCard ? 'model-name' : ''}`}>
                    {getMainValue()}
                  </span>
                  {!isModelCard && <span className="kpi-unit">{kpi.unit}</span>}
                </div>

                <div className="kpi-counts-section">
                  <div className="kpi-count-item">
                    <span className="kpi-count-label">
                      {isRiskCard ? 'Available:' : 'Current:'}
                    </span>
                    <span className="kpi-count-value">{kpi.currentCount ?? 0}</span>
                  </div>
                  <div className="kpi-count-item">
                    <span className="kpi-count-label">
                      {isRiskCard ? 'Risk Score:' : 'Forecast:'}
                    </span>
                    <span className="kpi-count-value forecast">
                      {isRiskCard ? `${kpi.forecastCount}%` : kpi.forecastCount ?? 0}
                    </span>
                  </div>
                </div>

                <div className={`kpi-change ${changeInfo.isPositive ? 'positive' : 'negative'}`}>
                  {changeInfo.isPositive ? (
                    <FiArrowUp className="kpi-change-indicator" />
                  ) : (
                    <FiArrowDown className="kpi-change-indicator" />
                  )}
                  <span>{changeInfo.value}</span>
                </div>

                {/* Insight tooltip on hover */}
                {kpi.insight && hoveredCard === index && (
                  <div className="kpi-insight">
                    <FiInfo className="insight-icon" />
                    <span>{kpi.insight}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

KPISummaryCards.propTypes = {
  kpiData: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      currentCount: PropTypes.number,
      forecastCount: PropTypes.number,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      unit: PropTypes.string.isRequired,
      change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      riskLevel: PropTypes.string,
      insight: PropTypes.string,
    })
  ).isRequired,
};

export default KPISummaryCards;

