// Use contexts API proxy to avoid mixed content (HTTP/HTTPS) issues
// The contexts service proxies requests to the external Help Desk service
import contextsAxios from "../api/contextsAxios";

/* ===============================
          LOCATIONS CRUD
================================= */
// GET all locations (via contexts proxy)
export async function fetchAllLocations() {
  const res = await contextsAxios.get("helpdesk-locations/");
  // Map city to name for frontend compatibility
  const data = res.data.results ?? res.data;
  // Ensure data is an array before mapping
  if (!Array.isArray(data)) {
    console.warn("fetchAllLocations: Expected array but got:", typeof data);
    return [];
  }
  return data.map(loc => ({
    id: loc.id,
    name: loc.city || loc.name
  }));
}

// GET location by ID (via contexts proxy)
export async function fetchLocationById(id) {
  const res = await contextsAxios.get(`helpdesk-locations/${id}/`);
  const loc = res.data;
  // Map city to name for frontend compatibility
  return {
    id: loc.id,
    name: loc.display_name || loc.city || loc.name,
    city: loc.city,
    zip_code: loc.zip_code
  };
}

// NOTE: Locations are fetched from external Help Desk service (http://165.22.247.50:5001/api/locations/)
// Location creation is not available - locations must be managed directly in the Help Desk system