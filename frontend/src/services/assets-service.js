import assetsAxios from "../api/assetsAxios";

/* ===============================
              PRODCTS
================================= */
export async function fetchAllProducts() {
  const res = await assetsAxios.get("products/");
  return res.data;
}


// GET all products

/* ===============================
          ASSET CHECKOUT
================================= */

export async function createAssetCheckout(data) {
  const res = await assetsAxios.post("asset-checkout/", data);
  return res.data;
}

/* ===============================
          ASSET CHECKIN
================================= */

export async function createAssetCheckin(data) {
  const res = await assetsAxios.post("asset-checkin/", data);
  return res.data;
}

/* ===============================
          PRODUCTS CRUD
================================= */

// GET all components
export async function fetchAllComponents() {
  const res = await assetsAxios.get("components/");
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
            DASHBOARD
================================= */

export async function fetchDashboardStats() {
  const res = await assetsAxios.get("dashboard/");
  return res.data;
}

/* ===============================
          CONTEXTS PROXY
================================= */

// Fetch statuses and locations from contexts service via assets proxy
export async function fetchAssetContexts() {
  const [statusesRes, locationsRes] = await Promise.all([
    assetsAxios.get("contexts/statuses/"),
    assetsAxios.get("contexts/locations/")
  ]);

  return {
    statuses: statusesRes.data.results || statusesRes.data,
    locations: locationsRes.data.results || locationsRes.data
  };
}