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
