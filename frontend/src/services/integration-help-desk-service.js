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

// create location - Note: create is not proxied, may need to add if needed
export async function createLocation(data) {
  // Creating locations via external Help Desk is currently not proxied
  // If needed, add a proxy endpoint in the contexts service
  console.warn("createLocation: Direct Help Desk calls may have mixed content issues in production");
  const helpDeskAxios = (await import("../api/integrationHelpDesk")).default;
  const res = await helpDeskAxios.post("locations/", data);
  return res.data;
}