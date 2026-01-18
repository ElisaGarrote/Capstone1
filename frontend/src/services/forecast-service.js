// Forecast Service - Fetches forecast data from the backend API
import assetsAxios from "../api/assetsAxios";

// Fallback mock data for when API fails (6 historical + 2 forecast = 8 months)
// Historical months have BOTH historical and forecast values (lines overlap)
// Forecast months only have forecast values (dashed lines extend into future)
// Status groupings:
//   - Available = deployable + pending (assets that can potentially be assigned)
//   - Deployed = deployed (assets currently in use)
//   - Unavailable = undeployable + archived (assets that cannot be used)
const MOCK_ASSET_STATUS_FORECAST = {
  chartData: [
    { month: 'Jan', available: 120, deployed: 45, unavailable: 15, forecastAvailable: 120, forecastDeployed: 45, forecastUnavailable: 15 },
    { month: 'Feb', available: 125, deployed: 42, unavailable: 18, forecastAvailable: 125, forecastDeployed: 42, forecastUnavailable: 18 },
    { month: 'Mar', available: 130, deployed: 40, unavailable: 20, forecastAvailable: 130, forecastDeployed: 40, forecastUnavailable: 20 },
    { month: 'Apr', available: 128, deployed: 43, unavailable: 19, forecastAvailable: 128, forecastDeployed: 43, forecastUnavailable: 19 },
    { month: 'May', available: 135, deployed: 38, unavailable: 17, forecastAvailable: 135, forecastDeployed: 38, forecastUnavailable: 17 },
    { month: 'Jun', available: 140, deployed: 35, unavailable: 15, forecastAvailable: 140, forecastDeployed: 35, forecastUnavailable: 15 },
    { month: 'Jul', available: null, deployed: null, unavailable: null, forecastAvailable: 145, forecastDeployed: 32, forecastUnavailable: 13 },
    { month: 'Aug', available: null, deployed: null, unavailable: null, forecastAvailable: 150, forecastDeployed: 30, forecastUnavailable: 12 },
  ],
  tableData: [
    { status: 'Available', currentCount: 140, forecastCount: 150, trend: 'up' },
    { status: 'Deployed', currentCount: 35, forecastCount: 30, trend: 'down' },
    { status: 'Unavailable', currentCount: 15, forecastCount: 12, trend: 'down' },
  ]
};

// Mock product names and their forecast keys (must match getForecastKey logic)
const MOCK_PRODUCT_DEMAND_FORECAST = {
  chartData: [
    { month: 'Jan', 'MacBook Pro': 25, 'Dell XPS': 18, 'HP Pavilion': 12, 'Lenovo ThinkPad': 15, 'forecast_MacBook_Pro': 25, 'forecast_Dell_XPS': 18, 'forecast_HP_Pavilion': 12, 'forecast_Lenovo_ThinkPad': 15 },
    { month: 'Feb', 'MacBook Pro': 28, 'Dell XPS': 20, 'HP Pavilion': 14, 'Lenovo ThinkPad': 16, 'forecast_MacBook_Pro': 28, 'forecast_Dell_XPS': 20, 'forecast_HP_Pavilion': 14, 'forecast_Lenovo_ThinkPad': 16 },
    { month: 'Mar', 'MacBook Pro': 30, 'Dell XPS': 22, 'HP Pavilion': 16, 'Lenovo ThinkPad': 18, 'forecast_MacBook_Pro': 30, 'forecast_Dell_XPS': 22, 'forecast_HP_Pavilion': 16, 'forecast_Lenovo_ThinkPad': 18 },
    { month: 'Apr', 'MacBook Pro': 32, 'Dell XPS': 24, 'HP Pavilion': 18, 'Lenovo ThinkPad': 20, 'forecast_MacBook_Pro': 32, 'forecast_Dell_XPS': 24, 'forecast_HP_Pavilion': 18, 'forecast_Lenovo_ThinkPad': 20 },
    { month: 'May', 'MacBook Pro': 35, 'Dell XPS': 26, 'HP Pavilion': 20, 'Lenovo ThinkPad': 22, 'forecast_MacBook_Pro': 35, 'forecast_Dell_XPS': 26, 'forecast_HP_Pavilion': 20, 'forecast_Lenovo_ThinkPad': 22 },
    { month: 'Jun', 'MacBook Pro': 38, 'Dell XPS': 28, 'HP Pavilion': 22, 'Lenovo ThinkPad': 24, 'forecast_MacBook_Pro': 38, 'forecast_Dell_XPS': 28, 'forecast_HP_Pavilion': 22, 'forecast_Lenovo_ThinkPad': 24 },
    { month: 'Jul', 'MacBook Pro': null, 'Dell XPS': null, 'HP Pavilion': null, 'Lenovo ThinkPad': null, 'forecast_MacBook_Pro': 40, 'forecast_Dell_XPS': 30, 'forecast_HP_Pavilion': 24, 'forecast_Lenovo_ThinkPad': 26 },
    { month: 'Aug', 'MacBook Pro': null, 'Dell XPS': null, 'HP Pavilion': null, 'Lenovo ThinkPad': null, 'forecast_MacBook_Pro': 42, 'forecast_Dell_XPS': 32, 'forecast_HP_Pavilion': 26, 'forecast_Lenovo_ThinkPad': 28 },
  ],
  tableData: [
    { productName: 'MacBook Pro', currentDemand: 38, forecastDemand: 42, trend: 'up' },
    { productName: 'Dell XPS', currentDemand: 28, forecastDemand: 32, trend: 'up' },
    { productName: 'HP Pavilion', currentDemand: 22, forecastDemand: 26, trend: 'up' },
    { productName: 'Lenovo ThinkPad', currentDemand: 24, forecastDemand: 28, trend: 'up' },
  ],
  productNames: ['MacBook Pro', 'Dell XPS', 'HP Pavilion', 'Lenovo ThinkPad'],
};

const MOCK_KPI_SUMMARY = [
  {
    title: 'Forecasted Total Demand',
    subtitle: 'Predicted checkouts next period',
    description: 'Total number of asset checkout requests expected in the next forecast period.',
    currentCount: 45,
    forecastCount: 52,
    value: '52',
    unit: 'checkouts',
    change: 15.6,
    insight: 'Based on 6 months of data, demand is increasing.'
  },
  {
    title: 'Most Requested Model',
    subtitle: 'Dell Latitude 5520 (LAT5520)',
    description: 'The product (model) with the highest combined checkout count across all its assets.',
    currentCount: 12,
    forecastCount: 15,
    value: 'Dell Latitude 5520 (LAT5520)',
    unit: 'checkouts',
    change: 25.0,
    insight: 'This product has 12 checkouts this month across all its assets. Expect increased demand.'
  },
  {
    title: 'Expected Shortage Risk',
    subtitle: 'Medium Risk',
    description: 'Risk assessment comparing forecasted demand against available inventory.',
    currentCount: 85,
    forecastCount: 45,
    value: '45%',
    unit: 'risk score',
    change: 8.5,
    riskLevel: 'Medium',
    insight: '85 assets available vs 52 forecasted demand. Consider procurement.'
  },
  {
    title: 'Predicted Status Change',
    subtitle: 'Net deployed asset change',
    description: 'Predicted net change in deployed assets (checkouts minus returns).',
    currentCount: 3,
    forecastCount: 5,
    value: '+5',
    unit: 'net change',
    change: 12.3,
    insight: 'More assets being checked out than returned.'
  },
];

/**
 * Fetch asset status forecast data from the API
 * Falls back to mock data if API fails
 */
export const getAssetStatusForecast = async () => {
  try {
    const res = await assetsAxios.get("dashboard/forecast/asset-status/");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch asset status forecast:", error);
    return MOCK_ASSET_STATUS_FORECAST;
  }
};

/**
 * Fetch product demand forecast data from the API
 * Falls back to mock data if API fails
 */
export const getProductDemandForecast = async () => {
  try {
    const res = await assetsAxios.get("dashboard/forecast/product-demand/");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch product demand forecast:", error);
    return MOCK_PRODUCT_DEMAND_FORECAST;
  }
};

/**
 * Fetch KPI summary data from the API
 * Falls back to mock data if API fails
 */
export const getKPISummary = async () => {
  try {
    const res = await assetsAxios.get("dashboard/forecast/kpi-summary/");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch KPI summary:", error);
    return MOCK_KPI_SUMMARY;
  }
};

export default {
  getAssetStatusForecast,
  getProductDemandForecast,
  getKPISummary,
};
