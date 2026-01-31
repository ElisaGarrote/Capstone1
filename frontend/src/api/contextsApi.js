import axios from 'axios'

// Use fallback for Railway deployments where env vars may not be set at build time
// Prefer VITE_CONTEXTS_API_URL, then VITE_API_URL + /contexts, then /api/contexts/
export const contextsBase = import.meta.env.VITE_CONTEXTS_API_URL || 
  (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/contexts/` : '') || 
  '/api/contexts/'

const contextsApi = axios.create({
  baseURL: contextsBase,
})

export async function fetchCategories(params = {}) {
  // params: { fields, page, page_size, search, ids }
  const res = await contextsApi.get('/categories/', { params })
  // DRF may return paginated { results: [...], count } or a plain list
  return res.data.results ?? res.data
}

export async function createCategory(payload) {
  // payload: FormData or plain object. Prefer FormData for files.
  const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  const res = await contextsApi.post('/categories/', payload, { headers })
  return res.data
}

export async function updateCategory(id, payload) {
  const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  const res = await contextsApi.patch(`/categories/${id}/`, payload, { headers })
  return res.data
}

export async function getCategory(id) {
  const res = await contextsApi.get(`/categories/${id}/`)
  return res.data
}

export async function deleteCategory(id) {
  const res = await contextsApi.delete(`/categories/${id}/`)
  return res.data
}

export async function bulkDeleteCategories(ids = []) {
  const res = await contextsApi.post(`/categories/bulk_delete/`, { ids })
  return res.data
}

export async function importCategories(file, options = {}) {
  // file: File object (xlsx)
  const form = new FormData()
  form.append('file', file)
  // allow_update and upsert_by can be provided in options
  const params = {}
  if (options.allow_update) params.allow_update = options.allow_update
  if (options.upsert_by) params.upsert_by = options.upsert_by

  const headers = { 'Content-Type': 'multipart/form-data' }
  const res = await contextsApi.post(`/import/categories/`, form, { params, headers })
  return res.data
}

// Locations
export async function fetchAllLocations(params = {}) {
  const res = await contextsApi.get('/locations/', { params })
  // DRF may return paginated { results: [...], count } or a plain list
  const data = res.data.results ?? res.data
  // Ensure data is an array before mapping
  if (!Array.isArray(data)) {
    console.warn("fetchAllLocations: Expected array but got:", typeof data)
    return []
  }
  // Map to consistent format with id and name
  return data.map(loc => ({
    id: loc.id,
    name: loc.city || loc.name
  }))
}

export default contextsApi
