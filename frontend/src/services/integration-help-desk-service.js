import helpDeskAxios from "../api/helpDeskAxios";

/* ===============================
          LOCATIONS CRUD
================================= */
// GET all locations
export async function fetchAllLocations() {
  const res = await helpDeskAxios.get("locations/");
  return res.data;
}

// create location
export async function createLocation(data) {
  const res = await helpDeskAxios.post("locations/", data);
  return res.data;
}