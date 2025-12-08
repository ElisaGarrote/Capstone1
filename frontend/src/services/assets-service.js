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
  const res = await assetsAxios.post(
    "asset-checkout/checkout-with-status/",
    data
  );
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

// GET asset by ID
export async function fetchAssetById(id) {
  const res = await assetsAxios.get(`assets/${id}/`);
  return res.data;
}

// GET next asset ID
export async function getNextAssetId() {
  const res = await assetsAxios.get("assets/generate-asset-id/");
  return res.data;
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

// UPDATE asset status
export async function updateAssetStatus(id, data) {
  const res = await assetsAxios.patch(`assets/${id}/update-status/`, data);
  return res.data;
}

/* ===============================
          ASSET CHECKIN
================================= */
// Checkin with status
export async function createAssetCheckinWithStatus(data) {
  const res = await assetsAxios.post(
    "asset-checkin/checkin-with-status/",
    data
  );
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
          ASSET REPORT
================================= */

/**
 * Fetch asset report data with optional filters
 * @param {Object} filters - Filter parameters
 * @param {number} filters.status_id - Filter by status ID
 * @param {number} filters.category_id - Filter by category ID
 * @param {number} filters.supplier_id - Filter by supplier ID
 * @param {number} filters.location_id - Filter by location ID
 * @param {string} filters.format - Response format: 'json' or 'xlsx'
 * @returns {Promise} - Report data or blob for Excel download
 */
export async function fetchAssetReport(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status_id) params.append("status_id", filters.status_id);
  if (filters.category_id) params.append("category_id", filters.category_id);
  if (filters.supplier_id) params.append("supplier_id", filters.supplier_id);
  if (filters.location_id) params.append("location_id", filters.location_id);
  if (filters.product_id) params.append("product_id", filters.product_id);
  if (filters.manufacturer_id)
    params.append("manufacturer_id", filters.manufacturer_id);
  // Use 'export_format' instead of 'format' to avoid conflict with DRF's format suffix
  if (filters.export_format)
    params.append("export_format", filters.export_format);
  // Add columns parameter for selective column export
  if (filters.columns) params.append("columns", filters.columns);

  const queryString = params.toString();
  const url = `reports/assets/${queryString ? "?" + queryString : ""}`;

  // If requesting Excel format, return as blob
  // Use longer timeout (60 seconds) for report generation as it may take time
  if (filters.export_format === "xlsx" || !filters.export_format) {
    const res = await assetsAxios.get(url, {
      responseType: "blob",
      timeout: 60000,
    });
    return res.data;
  }

  // Use longer timeout for JSON report as well
  const res = await assetsAxios.get(url, { timeout: 60000 });
  return res.data;
}

/**
 * Download asset report as Excel file
 * @param {Object} filters - Filter parameters
 * @param {string} filename - Optional custom filename
 * @param {Array} columns - Optional array of column IDs to include
 */
export async function downloadAssetReportExcel(
  filters = {},
  filename = null,
  columns = []
) {
  const params = { ...filters, export_format: "xlsx" };
  if (columns && columns.length > 0) {
    params.columns = columns.join(",");
  }
  const blob = await fetchAssetReport(params);

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `asset_report_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/* ===============================
      ASSET REPORT TEMPLATES
================================= */

/**
 * Fetch all report templates
 * @param {number} userId - Optional user ID to filter templates
 * @returns {Promise<Array>} - List of templates
 */
export async function fetchReportTemplates(userId = null) {
  let url = "report-templates/";
  if (userId) {
    url += `?user_id=${userId}`;
  }
  const res = await assetsAxios.get(url);
  return res.data;
}

/**
 * Fetch a single report template by ID
 * @param {number} templateId - Template ID
 * @returns {Promise<Object>} - Template data
 */
export async function fetchReportTemplateById(templateId) {
  const res = await assetsAxios.get(`report-templates/${templateId}/`);
  return res.data;
}

/**
 * Create a new report template
 * @param {Object} templateData - Template data (name, filters, columns, user_id)
 * @returns {Promise<Object>} - Created template
 */
export async function createReportTemplate(templateData) {
  const res = await assetsAxios.post("report-templates/", templateData);
  return res.data;
}

/**
 * Update an existing report template
 * @param {number} templateId - Template ID
 * @param {Object} templateData - Updated template data
 * @returns {Promise<Object>} - Updated template
 */
export async function updateReportTemplate(templateId, templateData) {
  const res = await assetsAxios.put(
    `report-templates/${templateId}/`,
    templateData
  );
  return res.data;
}

/**
 * Delete a report template (soft delete)
 * @param {number} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function deleteReportTemplate(templateId) {
  await assetsAxios.delete(`report-templates/${templateId}/`);
}

/* ===============================
        ACTIVITY REPORT
================================= */

/**
 * Fetch activity report data
 * @param {Object} filters - Filter parameters
 * @param {string} filters.start_date - Start date (YYYY-MM-DD)
 * @param {string} filters.end_date - End date (YYYY-MM-DD)
 * @param {string} filters.activity_type - Activity type (Asset, Component, Audit, Repair)
 * @param {string} filters.action - Action type (Create, Update, Delete, Checkout, Checkin, Schedule, Passed, Failed)
 * @param {number} filters.user_id - Filter by user ID
 * @param {string} filters.search - Search term
 * @param {number} filters.limit - Max number of records
 * @param {string} filters.export_format - Response format: 'json' or 'xlsx'
 * @returns {Promise} - Report data or blob for Excel download
 */
export async function fetchActivityReport(filters = {}) {
  const params = new URLSearchParams();

  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.activity_type)
    params.append("activity_type", filters.activity_type);
  if (filters.action) params.append("action", filters.action);
  if (filters.user_id) params.append("user_id", filters.user_id);
  if (filters.search) params.append("search", filters.search);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.export_format)
    params.append("export_format", filters.export_format);

  const queryString = params.toString();
  const url = `reports/activity/${queryString ? "?" + queryString : ""}`;

  // If requesting Excel format, return as blob
  if (filters.export_format === "xlsx" || !filters.export_format) {
    const res = await assetsAxios.get(url, {
      responseType: "blob",
      timeout: 60000,
    });
    return res.data;
  }

  // JSON format
  const res = await assetsAxios.get(url, { timeout: 60000 });
  return res.data;
}

/**
 * Download activity report as Excel file
 * @param {Object} filters - Filter parameters
 * @param {string} filename - Optional custom filename
 */
export async function downloadActivityReportExcel(
  filters = {},
  filename = null
) {
  const params = { ...filters, export_format: "xlsx" };
  const blob = await fetchActivityReport(params);

  // Create download link
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download =
    filename || `ActivityReport_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
