import assetsAxios from "../api/assetsAxios";

/* ===============================
          PRODCTS CRUD
================================= */
// GET all products
export async function fetchAllProducts() {
  const res = await assetsAxios.get("products/");
  return res.data;
}

// GET product by ID
export async function fetchProductById(id) {
  const res = await assetsAxios.get(`products/${id}/`);
  return res.data;
}

// GET product list for asset registration
export async function fetchProductsForAssetRegistration() {
  const res = await assetsAxios.get("products/asset-registration/");
  return res.data;
}

// CREATE product
export async function createProduct(data) {
  const res = await assetsAxios.post("products/", data);
  return res.data;
}

// UPDATE product
export async function updateProduct(id, data) {
  const res = await assetsAxios.put(`products/${id}/`, data);
  return res.data;
}

// DELETE product
export async function deleteProduct(id) {
  const res = await assetsAxios.delete(`products/${id}/`);
  return res.data;
}

// GET product names and images for bulk edit
export const fetchProductNames = ({ids = [], search = "" }) => {
  const params = {};

  if (ids.length) params.ids = ids.join(",");
  if (search) params.search = search;

  return assetsAxios
    .get("products/names/", { params })
    .then(res => res.data);
}

// BULK EDIT products
export async function bulkEditProducts(data, useFormData = false) {
  const headers = useFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  const res = await assetsAxios.patch("products/bulk-edit/", data, { headers });
  return res.data;
}

// BULK DELETE products
export async function bulkDeleteProducts(data) {
  const res = await assetsAxios.post("products/bulk-delete/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

/* ===============================
            ASSETS CRUD
================================= */

// GET all assets
export async function fetchAllAssets() {
  const res = await assetsAxios.get("assets/");
  return res.data;
}

// GET all assets for a product
export async function fetchAssetsByProduct(productId) {
  const res = await assetsAxios.get(`assets/by-product/${productId}/`);
  return res.data;
}

// GET asset by ID
export async function fetchAssetById(id) {
  const res = await assetsAxios.get(`assets/${id}/`);
  return res.data;
}

// GET next asset ID
export async function getNextAssetId() {
  const res = await assetsAxios.get("assets/generate-asset-id/");
  return res.data.asset_id;
}

// CREATE asset
export async function createAsset(data) {
  const res = await assetsAxios.post("assets/", data);
  return res.data;
}

// UPDATE asset
export async function updateAsset(id, data) {
  const res = await assetsAxios.patch(`assets/${id}/`, data);
  return res.data;
}

// DELETE asset
export async function deleteAsset(id) {
  const res = await assetsAxios.delete(`assets/${id}/`);
  return res.data;
}

// BULK DELETE assets
export async function bulkDeleteAssets(data) {
  const res = await assetsAxios.post("assets/bulk-delete/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

// GET product names and images for bulk edit
export const fetchAssetNames = ({ids = [], search = "" }) => {
  const params = {};

  if (ids.length) params.ids = ids.join(",");

  if (search) params.search = search;

  return assetsAxios
    .get("assets/names/", { params })
    .then(res => res.data);
}

// BULK EDIT assets
export async function bulkEditAssets(data, useFormData = false) {
  const headers = useFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  const res = await assetsAxios.patch("assets/bulk-edit/", data, { headers });
  return res.data;
}

// UPDATE asset status
export async function updateAssetStatus(id, data) {
  const res = await assetsAxios.patch(`assets/${id}/update-status/`, data);
  return res.data;
}

/* ===============================
          ASSET CHECKOUT
================================= */
// Create asset checkout
export async function createAssetCheckout(data) {
  const res = await assetsAxios.post("asset-checkout/", data);
  return res.data;
}

// Create asset checkout with status (atomic)
export async function createAssetCheckoutWithStatus(data) {
  const res = await assetsAxios.post("asset-checkout/checkout-with-status/", data);
  return res.data;
}

/* ===============================
          ASSET CHECKIN
================================= */
// Checkin with status
export async function createAssetCheckinWithStatus(data) {
  const res = await assetsAxios.post("asset-checkin/checkin-with-status/", data);
  return res.data;
}

/* ===============================
        ASSET CHECKIN FILES
================================= */
// Create asset checkin file
export async function createAssetCheckinFile(data) {
  const res = await assetsAxios.post("asset-checkin-file/", data);
  return res.data;
}

/* ===============================
          ASSET CHECKOUT
================================= */
// GET asset checkout by ID
export async function fetchAssetCheckoutById(id) {
  const res = await assetsAxios.get(`asset-checkout/${id}/`);
  return res.data;
}

/* ===============================
          COMPONENTS CRUD
================================= */

// GET all components
export async function fetchAllComponents() {
  const res = await assetsAxios.get("components/");
  return res.data;
}

// GET component by ID
export async function fetchComponentById(id) {
  const res = await assetsAxios.get(`components/${id}/`);
  return res.data;
}

// CREATE component
export async function createComponent(data) {
  const res = await assetsAxios.post("components/", data);
  return res.data;
}

// UPDATE component
export async function updateComponent(id, data) {
  const res = await assetsAxios.put(`components/${id}/`, data);
  return res.data;
}

// DELETE component
export async function deleteComponent(id) {
  const res = await assetsAxios.delete(`components/${id}/`);
  return res.data;
}

/* ===============================
          AUDIT SCHEDULE
================================= */
// Create audit schedule
export async function createAuditSchedule(data) {
  const res = await assetsAxios.post("audit-schedule/", data);
  return res.data;
}

/* ===============================
            DASHBOARD
================================= */

export async function fetchDashboardStats() {
  const res = await assetsAxios.get("dashboard/");
  return res.data;
}

/* ===============================
        REPORT TEMPLATES
================================= */

// GET all report templates
export async function fetchReportTemplates() {
  const res = await assetsAxios.get("report-templates/");
  return res.data;
}

// CREATE report template
export async function createReportTemplate(data) {
  const res = await assetsAxios.post("report-templates/", data);
  return res.data;
}

// DELETE report template
export async function deleteReportTemplate(id) {
  const res = await assetsAxios.delete(`report-templates/${id}/`);
  return res.data;
}

// DOWNLOAD asset report Excel
export async function downloadAssetReportExcel(filters) {
  const res = await assetsAxios.post("reports/asset-report/", filters, {
    responseType: "blob",
  });
  return res.data;
}

/* ===============================
        ACTIVITY REPORT
================================= */

// GET activity report data (JSON)
export async function fetchActivityReport(params = {}) {
  const res = await assetsAxios.get("reports/activity/", {
    params,
  });
  return res.data;
}

// DOWNLOAD activity report as Excel file
export async function downloadActivityReportExcel(filters = {}, fileName = "ActivityReport.xlsx") {
  const res = await assetsAxios.get("reports/activity/", {
    params: { ...filters, export_format: filters.export_format || "xlsx" },
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// Utility: return full URL for an uploaded audit file path
export function auditFileUrl(filePath) {
  // filePath may be a path like "media/audit_files/xxx.pdf" or "/media/.." - normalize
  const base = assetsAxios.defaults.baseURL || "";
  const cleanBase = String(base).replace(/\/$/, "");
  const cleanPath = String(filePath).replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

// Convenience counts for legacy code that expects an assetsService object
export async function countAllScheduleAudits() {
  try {
    const stats = await fetchDashboardStats();
    return stats.upcoming_audits ?? 0;
  } catch (err) {
    return 0;
  }
}

export async function countAllOverdueAudits() {
  try {
    const stats = await fetchDashboardStats();
    return stats.overdue_audits ?? 0;
  } catch (err) {
    return 0;
  }
}

export async function countAllAudits() {
  try {
    const stats = await fetchDashboardStats();
    // If backend doesn't provide completed count, return 0
    return stats.completed_audits ?? 0;
  } catch (err) {
    return 0;
  }
}

// Default export for legacy imports expecting an `assetsService` object
const assetsService = {
  fetchAllProducts,
  fetchAllAssets,
  fetchAssetById,
  fetchProductsForAssetRegistration,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchReportTemplates,
  createReportTemplate,
  deleteReportTemplate,
  downloadAssetReportExcel,
  fetchActivityReport,
  downloadActivityReportExcel,
  fetchDashboardStats,
  auditFileUrl,
  countAllScheduleAudits,
  countAllOverdueAudits,
  countAllAudits,
};

export default assetsService;