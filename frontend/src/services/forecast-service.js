// Forecast Service - Fetches forecast data from the backend API
import assetsAxios from "../api/assetsAxios";

// Fallback mock data for when API fails (6 historical + 2 forecast = 8 months)
// Historical months have BOTH historical and forecast values (lines overlap)
// Forecast months only have forecast values (dashed lines extend into future)
const MOCK_ASSET_STATUS_FORECAST = {
  chartData: [
    { month: 'Jan', available: 120, checkedOut: 45, underRepair: 15, forecastAvailable: 120, forecastCheckedOut: 45, forecastUnderRepair: 15 },
    { month: 'Feb', available: 125, checkedOut: 42, underRepair: 18, forecastAvailable: 125, forecastCheckedOut: 42, forecastUnderRepair: 18 },
    { month: 'Mar', available: 130, checkedOut: 40, underRepair: 20, forecastAvailable: 130, forecastCheckedOut: 40, forecastUnderRepair: 20 },
    { month: 'Apr', available: 128, checkedOut: 43, underRepair: 19, forecastAvailable: 128, forecastCheckedOut: 43, forecastUnderRepair: 19 },
    { month: 'May', available: 135, checkedOut: 38, underRepair: 17, forecastAvailable: 135, forecastCheckedOut: 38, forecastUnderRepair: 17 },
    { month: 'Jun', available: 140, checkedOut: 35, underRepair: 15, forecastAvailable: 140, forecastCheckedOut: 35, forecastUnderRepair: 15 },
    { month: 'Jul', available: null, checkedOut: null, underRepair: null, forecastAvailable: 145, forecastCheckedOut: 32, forecastUnderRepair: 13 },
    { month: 'Aug', available: null, checkedOut: null, underRepair: null, forecastAvailable: 150, forecastCheckedOut: 30, forecastUnderRepair: 12 },
  ],
  tableData: [
    { status: 'Available', currentCount: 140, forecastCount: 150, trend: 'up' },
    { status: 'Checked-Out', currentCount: 35, forecastCount: 30, trend: 'down' },
    { status: 'Under Repair', currentCount: 15, forecastCount: 12, trend: 'down' },
  ]
};

const MOCK_PRODUCT_DEMAND_FORECAST = {
  chartData: [
    { month: 'Jan', 'MacBook Pro': 25, 'Dell XPS': 18, 'HP Pavilion': 12, 'Lenovo ThinkPad': 15, 'forecastMacBook': 25, 'forecastDell': 18, 'forecastHP': 12, 'forecastLenovo': 15 },
    { month: 'Feb', 'MacBook Pro': 28, 'Dell XPS': 20, 'HP Pavilion': 14, 'Lenovo ThinkPad': 16, 'forecastMacBook': 28, 'forecastDell': 20, 'forecastHP': 14, 'forecastLenovo': 16 },
    { month: 'Mar', 'MacBook Pro': 30, 'Dell XPS': 22, 'HP Pavilion': 16, 'Lenovo ThinkPad': 18, 'forecastMacBook': 30, 'forecastDell': 22, 'forecastHP': 16, 'forecastLenovo': 18 },
    { month: 'Apr', 'MacBook Pro': 32, 'Dell XPS': 24, 'HP Pavilion': 18, 'Lenovo ThinkPad': 20, 'forecastMacBook': 32, 'forecastDell': 24, 'forecastHP': 18, 'forecastLenovo': 20 },
    { month: 'May', 'MacBook Pro': 35, 'Dell XPS': 26, 'HP Pavilion': 20, 'Lenovo ThinkPad': 22, 'forecastMacBook': 35, 'forecastDell': 26, 'forecastHP': 20, 'forecastLenovo': 22 },
    { month: 'Jun', 'MacBook Pro': 38, 'Dell XPS': 28, 'HP Pavilion': 22, 'Lenovo ThinkPad': 24, 'forecastMacBook': 38, 'forecastDell': 28, 'forecastHP': 22, 'forecastLenovo': 24 },
    { month: 'Jul', 'MacBook Pro': null, 'Dell XPS': null, 'HP Pavilion': null, 'Lenovo ThinkPad': null, 'forecastMacBook': 40, 'forecastDell': 30, 'forecastHP': 24, 'forecastLenovo': 26 },
    { month: 'Aug', 'MacBook Pro': null, 'Dell XPS': null, 'HP Pavilion': null, 'Lenovo ThinkPad': null, 'forecastMacBook': 42, 'forecastDell': 32, 'forecastHP': 26, 'forecastLenovo': 28 },
  ],
  tableData: [
    { productName: 'MacBook Pro', currentDemand: 38, forecastDemand: 42, trend: 'up' },
    { productName: 'Dell XPS', currentDemand: 28, forecastDemand: 32, trend: 'up' },
    { productName: 'HP Pavilion', currentDemand: 22, forecastDemand: 26, trend: 'up' },
    { productName: 'Lenovo ThinkPad', currentDemand: 24, forecastDemand: 28, trend: 'up' },
  ]
};

const MOCK_KPI_SUMMARY = [
  { title: 'Forecast: Asset Checkout', subtitle: 'Deployed Status', currentCount: 35, forecastCount: 40, value: '40', unit: 'assets', change: 14.3 },
  { title: 'Forecast: Under Maintenance', subtitle: 'Pending Status', currentCount: 12, forecastCount: 10, value: '10', unit: 'assets', change: -16.7 },
  { title: 'Forecast: Asset Write-off', subtitle: 'Undeployable Status', currentCount: 8, forecastCount: 6, value: '6', unit: 'assets', change: -25.0 },
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
