import React, { useEffect, useState } from 'react';
import NavBar from "../../components/NavBar";
import StatusCard from '../../components/dashboard/StatusCard';
import AssetMetrics from '../../components/dashboard/AssetMetrics';
import KPISummaryCards from '../../components/Dashboard/KPISummaryCards';
import AssetStatusForecastChart from '../../components/Dashboard/AssetStatusForecastChart';
import ProductDemandForecastChart from '../../components/Dashboard/ProductDemandForecastChart';
import assetsService from '../../services/assets-service';
import forecastService from '../../services/forecast-service';
import "../../styles/Dashboard.css";

function Dashboard() {
  const [statusCards, setStatusCards] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [assetForecast, setAssetForecast] = useState(null);
  const [productForecast, setProductForecast] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const normalizeCount = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    return value;
  };

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const stats = await assetsService.fetchDashboardStats();

        const cards = [
          { number: normalizeCount(stats?.due_for_return), title: 'Due for Return' },
          { number: normalizeCount(stats?.upcoming_audits), title: 'Upcoming Audits' },
          { number: normalizeCount(stats?.upcoming_end_of_life), title: 'Upcoming End of Life' },
          { number: normalizeCount(stats?.expiring_warranties), title: 'Expiring Warranties' },
          { number: normalizeCount(stats?.overdue_for_return), title: 'Overdue for Return' },
          { number: normalizeCount(stats?.overdue_audits), title: 'Overdue Audits' },
          { number: normalizeCount(stats?.reached_end_of_life), title: 'Reached End of Life' },
          { number: normalizeCount(stats?.expired_warranties), title: 'Expired Warranties', isRed: true },
          { number: normalizeCount(stats?.low_stock), title: 'Low Stock', isRed: true },
        ];

        setStatusCards(cards);
        setDashboardStats(stats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        const defaultCards = [
          { number: 0, title: 'Due for Return' },
          { number: 0, title: 'Upcoming Audits' },
          { number: 0, title: 'Upcoming End of Life' },
          { number: 0, title: 'Expiring Warranties' },
          { number: 0, title: 'Overdue for Return' },
          { number: 0, title: 'Overdue Audits' },
          { number: 0, title: 'Reached End of Life' },
          { number: 0, title: 'Expired Warranties', isRed: true },
          { number: 0, title: 'Low Stock', isRed: true },
        ];
        setStatusCards(defaultCards);
        setDashboardStats(null);
      }
    }

    function loadForecastData() {
      try {
        const kpi = forecastService.getKPISummary();
        const assetData = forecastService.getAssetStatusForecast();
        const productData = forecastService.getProductDemandForecast();

        setKpiData(kpi);
        setAssetForecast(assetData);
        setProductForecast(productData);
      } catch (error) {
        console.error('Failed to load forecast data:', error);
      }
    }

    loadDashboardStats();
    loadForecastData();
  }, []);

  return (
    <div className="dashboard-container">
      <NavBar />
      <main className="dashboard-content">
        <h1>Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'forecasting' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecasting')}
          >
            Forecasting
          </button>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            <div className="status-cards-grid">
              {statusCards.map((card, index) => (
                <StatusCard
                  key={index}
                  {...card}
                  index={index}
                />
              ))}
            </div>

            <AssetMetrics stats={dashboardStats} />
          </>
        )}

        {/* Forecasting Tab Content */}
        {activeTab === 'forecasting' && (
          <>
            {/* KPI Summary Cards */}
            {kpiData.length > 0 && <KPISummaryCards kpiData={kpiData} />}

            {/* Asset Status Forecast Section */}
            {assetForecast && (
              <AssetStatusForecastChart
                chartData={assetForecast.chartData}
                tableData={assetForecast.tableData}
              />
            )}

            {/* Product Demand Forecast Section */}
            {productForecast && (
              <ProductDemandForecastChart
                chartData={productForecast.chartData}
                tableData={productForecast.tableData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
