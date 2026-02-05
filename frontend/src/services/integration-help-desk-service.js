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
    console.log(`Fetching employee ${id} from contexts proxy...`);
    const res = await contextsAxios.get(`helpdesk-employees/${id}/`);
    
    console.log(`fetchEmployeeById(${id}) - Full response:`, res);
    console.log(`fetchEmployeeById(${id}) - Response data:`, res.data);
    
    const emp = res.data;

    // Handle error responses
    if (emp && emp.error) {
      console.error(`Employee ${id} error response:`, emp.error);
      return null;
    }

    if (emp && emp.warning) {
      console.warn(`Employee ${id} warning:`, emp.warning);
      return null;
    }

    if (!emp || typeof emp !== 'object') {
      console.warn(`Invalid employee data for ID ${id}:`, emp);
      return null;
    }

    // Log all available fields to debug structure
    console.log(`Employee ${id} fields:`, Object.keys(emp));

    // Check if the response has the expected name fields
    const hasNameFields = emp.first_name || emp.last_name || emp.firstName || emp.lastName;
    if (!hasNameFields) {
      console.warn(`Employee ${id} missing name fields. Available fields:`, Object.keys(emp));
      console.warn(`Full employee object:`, emp);
      return null;
    }

    // Handle both snake_case and camelCase field names
    const firstName = emp.first_name || emp.firstName || '';
    const middleName = emp.middle_name || emp.middleName || '';
    const lastName = emp.last_name || emp.lastName || '';
    const suffix = emp.suffix || '';
    const email = emp.email || '';
    const username = emp.username || '';
    const phone = emp.phone_number || emp.phoneNumber || emp.phone || '';

    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
    console.log(`Employee ${id} full name constructed:`, fullName);

    return {
      id: emp.id,
      name: fullName,
      email: email,
      username: username,
      phone: phone,
    };
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    console.error(`Error response:`, error.response?.data);
    console.error(`Error status:`, error.response?.status);
    return null;
  }
}
// NOTE: Locations are fetched from external Help Desk service (http://165.22.247.50:5001/api/locations/)
// Location creation is not available - locations must be managed directly in the Help Desk system