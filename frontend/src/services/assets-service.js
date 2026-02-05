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
export async function fetchProductById(id, options = {}) {
  const params = options.forForm ? { form: "true" } : {};
  const res = await assetsAxios.get(`products/${id}/`, { params });
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
export async function fetchAssetById(id, options = {}) {
  const params = options.forForm ? { form: "true" } : {};
  const res = await assetsAxios.get(`assets/${id}/`, { params });
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

// GET asset names and images
// - ids: array of database IDs (integers)
// - asset_ids: array of display asset IDs (strings like "AST-20260110-00030-43A7")
// - search: keyword to search by name
export const fetchAssetNames = ({ ids = [], asset_ids = [], search = "" } = {}) => {
  const params = {};

  if (ids.length) params.ids = ids.map(String).join(",");
  if (asset_ids.length) params.asset_ids = asset_ids.map(String).join(",");
  if (search?.trim()) params.search = search.trim();

  return assetsAxios
    .get("assets/names/", { params })
    .then(res => res.data);
};

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

// GET all checkouts for a specific asset
export async function fetchAssetCheckoutsByAsset(assetId) {
  const res = await assetsAxios.get(`asset-checkout/by-asset/${assetId}/`);
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

// BULK DELETE components
export async function bulkDeleteComponents(data) {
  const res = await assetsAxios.post("components/bulk_delete/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

// BULK EDIT components
export async function bulkEditComponents(data, useFormData = false) {
  const headers = useFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  const res = await assetsAxios.patch("components/bulk-edit/", data, { headers });
  return res.data;
}

// GET component names and images for bulk edit
export const fetchComponentNames = ({ ids = [], search = "" } = {}) => {
  const params = {};

  if (ids.length) params.ids = ids.join(",");
  if (search) params.search = search;

  return assetsAxios
    .get("components/names/", { params })
    .then(res => res.data);
};

/* ===============================
       COMPONENT CHECKOUT
================================= */

// GET all component checkouts
export async function fetchAllComponentCheckouts() {
  const res = await assetsAxios.get("component-checkout/");
  return res.data;
}

// GET active component checkouts (not fully returned)
export async function fetchActiveComponentCheckouts() {
  const res = await assetsAxios.get("component-checkout/active/");
  return res.data;
}

// GET component checkouts by component ID
export async function fetchComponentCheckoutsByComponent(componentId) {
  const res = await assetsAxios.get(`component-checkout/by-component/${componentId}/`);
  return res.data;
}

// GET component checkouts by asset ID
export async function fetchComponentCheckoutsByAsset(assetId) {
  const res = await assetsAxios.get(`component-checkout/by-asset/${assetId}/`);
  return res.data;
}

// CREATE component checkout
export async function createComponentCheckout(data) {
  const res = await assetsAxios.post("component-checkout/", data);
  return res.data;
}

/* ===============================
       COMPONENT CHECKIN
================================= */

// GET all component checkins
export async function fetchAllComponentCheckins() {
  const res = await assetsAxios.get("component-checkin/");
  return res.data;
}

// GET component checkins by checkout ID
export async function fetchComponentCheckinsByCheckout(checkoutId) {
  const res = await assetsAxios.get(`component-checkin/by-checkout/${checkoutId}/`);
  return res.data;
}

// CREATE component checkin (partial or full)
export async function createComponentCheckin(data) {
  const res = await assetsAxios.post("component-checkin/", data);
  return res.data;
}

/* ===============================
          AUDIT SCHEDULE
================================= */
// Fetch all audit schedules
export async function fetchAllAuditSchedules() {
  const res = await assetsAxios.get("audit-schedule/");
  return res.data;
}

// Fetch scheduled audits (future, not completed)
export async function fetchScheduledAudits() {
  const res = await assetsAxios.get("audit-schedule/scheduled/");
  return res.data;
}

// Fetch due audits (today, not completed)
export async function fetchDueAudits() {
  const res = await assetsAxios.get("audit-schedule/due/");
  return res.data;
}

// Fetch overdue audits (past date, not completed)
export async function fetchOverdueAudits() {
  const res = await assetsAxios.get("audit-schedule/overdue/");
  return res.data;
}

// Fetch audit schedule by ID
export async function fetchAuditScheduleById(id) {
  const res = await assetsAxios.get(`audit-schedule/${id}/`);
  return res.data;
}

// Create audit schedule
export async function createAuditSchedule(data) {
  const res = await assetsAxios.post("audit-schedule/", data);
  return res.data;
}

// Update audit schedule
export async function updateAuditSchedule(id, data) {
  const res = await assetsAxios.put(`audit-schedule/${id}/`, data);
  return res.data;
}

// Delete audit schedule
export async function deleteAuditSchedule(id) {
  const res = await assetsAxios.delete(`audit-schedule/${id}/`);
  return res.data;
}

// Bulk delete audit schedules
export async function bulkDeleteAuditSchedules(ids) {
  const res = await assetsAxios.post("audit-schedule/bulk_delete/", { ids });
  return res.data;
}

/* ===============================
              AUDITS
================================= */
// Fetch all completed audits
export async function fetchAllAudits() {
  const res = await assetsAxios.get("audits/");
  return res.data;
}

// Fetch audit by ID
export async function fetchAuditById(id) {
  const res = await assetsAxios.get(`audits/${id}/`);
  return res.data;
}

// Create audit (perform/complete an audit)
export async function createAudit(data) {
  const res = await assetsAxios.post("audits/", data);
  return res.data;
}

// Update audit
export async function updateAudit(id, data) {
  const res = await assetsAxios.put(`audits/${id}/`, data);
  return res.data;
}

// Delete audit
export async function deleteAudit(id) {
  const res = await assetsAxios.delete(`audits/${id}/`);
  return res.data;
}

/* ===============================
              REPAIRS
================================= */
export async function fetchAllRepairs() {
  const res = await assetsAxios.get("repairs/");
  return res.data;
}

export async function fetchRepairById(id) {
  const res = await assetsAxios.get(`repairs/${id}/`);
  return res.data;
}

export async function createRepair(data) {
  const res = await assetsAxios.post("repairs/", data);
  return res.data;
}

export async function updateRepair(id, data) {
  const res = await assetsAxios.put(`repairs/${id}/`, data);
  return res.data;
}

export async function bulkEditRepairs(data, useFormData = false) {
  const headers = useFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  const res = await assetsAxios.patch("repairs/bulk-edit/", data, { headers });
  return res.data;
}

export async function deleteRepair(id) {
  const res = await assetsAxios.delete(`repairs/${id}/`);
  return res.data;
}

export async function bulkDeleteRepairs(data) {
  const res = await assetsAxios.post("repairs/bulk-delete/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}

/* ===============================
            DASHBOARD
================================= */

export async function fetchDashboardStats() {
  const res = await assetsAxios.get("dashboard/metrics/");
  return res.data;
}

/* ===============================
            FILE URLS
================================= */

// Get full URL for audit file
export function auditFileUrl(filePath) {
  const baseUrl = import.meta.env.VITE_ASSETS_API_URL || "http://localhost:8000/api/assets/";
  return `${baseUrl}${filePath}`;
}