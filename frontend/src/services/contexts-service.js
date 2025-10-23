import contextsAxios from "../api/contextsAxios";

// CATEGORY
export async function fetchAllCategories() {
  const res = await contextsAxios.get("categories/");
  return res.data;
}

export async function createCategory(data) {
  const res = await contextsAxios.post("categories/", data);
  return res.data;
}

export async function updateCategory(id, data) {
  const res = await contextsAxios.put(`categories/${id}/`, data);
  return res.data;
}

export async function deleteCategory(id) {
  const res = await contextsAxios.delete(`categories/${id}/`);
  return res.data;
}

//SUPPLIER
export async function getSuppliers() {
  const response = await contextsAxios.get("suppliers/");
  return response.data;
}

export async function getSupplierById(id) {
  const response = await contextsAxios.get(`suppliers/${id}/`);
  return response.data;
}

export async function createSupplier(data) {
  const response = await contextsAxios.post("suppliers/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateSupplier(id, data) {
  const response = await contextsAxios.put(`suppliers/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchAllSupplierNames() {
  try {
    const response = await contextsAxios.get("suppliers/");
    // Ensure response.data exists and is an array
    return Array.isArray(response.data)
      ? response.data.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching supplier names:", error);
    return [];
  }
}

export async function deleteSupplier(id) {
  try {
    const response = await contextsAxios.delete(`suppliers/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}

