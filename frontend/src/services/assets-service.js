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