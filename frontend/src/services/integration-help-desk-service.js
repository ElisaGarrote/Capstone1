// Use contexts API proxy to avoid mixed content (HTTP/HTTPS) issues
// The contexts service proxies requests to the external Help Desk service
import contextsAxios from "../api/contextsAxios";

/* ===============================
          LOCATIONS CRUD
================================= */
// GET all locations (via contexts proxy)
export async function fetchAllLocations() {
  const res = await contextsAxios.get("helpdesk-locations/");
  // API returns { success, count, locations: [...] }
  const data = res.data.locations ?? res.data.results ?? res.data;
  // Ensure data is an array before mapping
  if (!Array.isArray(data)) {
    console.warn("fetchAllLocations: Expected array but got:", typeof data);
    return [];
  }
  return data.map(loc => ({
    id: loc.id,
    name: loc.display_name || loc.city || loc.name
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

/* ===============================
          EMPLOYEES CRUD
================================= */
// GET all employees (via contexts proxy)
export async function fetchAllEmployees() {
  const res = await contextsAxios.get("helpdesk-employees/");
  const data = res.data.employees ?? res.data.results ?? res.data;

  // Ensure data is an array before mapping
  if (!Array.isArray(data)) {
    console.warn("fetchAllEmployees: Expected array but got:", typeof data);
    return [];
  }

  return data.map(emp => ({
    id: emp.id,
    name: [emp.first_name, emp.middle_name, emp.last_name, emp.suffix].filter(Boolean).join(" "),
    email: emp.email,
    username: emp.username,
    phone: emp.phone_number,
  }));
}

// GET single employee by ID (via contexts proxy)
export async function fetchEmployeeById(id) {
  try {
    const res = await contextsAxios.get(`helpdesk-employees/${id}/`);
    const emp = res.data;

    console.log(`fetchEmployeeById(${id}) response:`, emp);

    if (!emp || typeof emp !== 'object') {
      console.warn(`Invalid employee data for ID ${id}:`, emp);
      return null;
    }

    // Check if the response has the expected fields
    if (!emp.first_name && !emp.last_name) {
      console.warn(`Employee ${id} missing name fields:`, emp);
      return null;
    }

    return {
      id: emp.id,
      name: [emp.first_name, emp.middle_name, emp.last_name, emp.suffix].filter(Boolean).join(" "),
      email: emp.email,
      username: emp.username,
      phone: emp.phone_number,
    };
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error.response?.data || error.message);
    return null;
  }
}
// NOTE: Locations are fetched from external Help Desk service (http://165.22.247.50:5001/api/locations/)
// Location creation is not available - locations must be managed directly in the Help Desk system