import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import StatusCard from "../components/dashboard/StatusCard";
import AssetMetrics from "../components/dashboard/AssetMetrics";
import KPISummaryCards from "../components/dashboard/KPISummaryCards";
import AssetStatusForecastChart from "../components/dashboard/AssetStatusForecastChart";
import ProductDemandForecastChart from "../components/dashboard/ProductDemandForecastChart";
import "../styles/Dashboard.css";
import { fetchDashboardStats } from "../services/assets-service";
import forecastService from "../services/forecast-service";
import authService from "../services/auth-service";

function Dashboard() {
  const [statusCards, setStatusCards] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [kpiData, setKpiData] = useState([]);
  const [assetForecast, setAssetForecast] = useState(null);
  const [productForecast, setProductForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const stats = await fetchDashboardStats();

        const cards = [
          { number: stats.due_for_return, title: "Due for Return" },
          { number: stats.upcoming_audits, title: "Upcoming Audits" },
          { number: stats.upcoming_end_of_life, title: "Upcoming End of Life" },
          { number: stats.expiring_warranties, title: "Expiring Warranties" },
          { number: stats.overdue_for_return, title: "Overdue for Return" },
          { number: stats.overdue_audits, title: "Overdue Audits" },
          { number: stats.reached_end_of_life, title: "Reached End of Life" },
          {
            number: stats.expired_warranties,
            title: "Expired Warranties",
            isRed: true,
          },
          { number: stats.low_stock, title: "Low Stock", isRed: true },
        ];

        setStatusCards(cards);
        setDashboardStats(stats);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Set default/sample data when API fails
        const defaultCards = [
          { number: 5, title: "Due for Return" },
          { number: 3, title: "Upcoming Audits" },
          { number: 2, title: "Upcoming End of Life" },
          { number: 1, title: "Expiring Warranties" },
          { number: 0, title: "Overdue for Return" },
          { number: 1, title: "Overdue Audits" },
          { number: 0, title: "Reached End of Life" },
          { number: 0, title: "Expired Warranties", isRed: true },
          { number: 2, title: "Low Stock", isRed: true },
        ];
        setStatusCards(defaultCards);
        setDashboardStats(null); // This will trigger sample data in AssetMetrics
      }
    }

    // Load forecast data (async)
    async function loadForecastData() {
      setForecastLoading(true);
      try {
        // Fetch all forecast data in parallel
        const [kpi, assetData, productData] = await Promise.all([
          forecastService.getKPISummary(),
          forecastService.getAssetStatusForecast(),
          forecastService.getProductDemandForecast(),
        ]);

        setKpiData(kpi);
        setAssetForecast(assetData);
        setProductForecast(productData);
      } catch (error) {
        console.error("Failed to load forecast data:", error);
      } finally {
        setForecastLoading(false);
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
        <div className="status-cards-grid">
          {statusCards.map((card, index) => (
            <StatusCard key={index} {...card} index={index} />
          ))}
        </div>

        {/* Forecast Section - Admin Only */}
        {authService.getUserInfo().role === "Admin" && (
          <>
            {/* KPI Summary Cards */}
            {!forecastLoading && kpiData && kpiData.length > 0 && (
              <KPISummaryCards kpiData={kpiData} />
            )}

            {/* Asset Status Forecast Section */}
            {!forecastLoading && assetForecast && assetForecast.chartData && (
              <AssetStatusForecastChart
                chartData={assetForecast.chartData}
                tableData={assetForecast.tableData}
              />
            )}

            {/* Product Demand Forecast Section */}
            {!forecastLoading && productForecast && productForecast.chartData && (
              <ProductDemandForecastChart
                chartData={productForecast.chartData}
                tableData={productForecast.tableData}
                productNames={productForecast.productNames}
              />
            )}
          </>
        )}

        <AssetMetrics stats={dashboardStats} />
      </main>
    </div>
  );
}

export default Dashboard;
