import dateRelated from "../utils/dateRelated";

const API_URL = "https://contexts-service-production.up.railway.app/";

class ContextsService {
  // Helper to normalize array responses
  normalizeResponseArray(data, key) {
    if (data && data[key]) return data;
    if (Array.isArray(data)) return { [key]: data };
    if (data && typeof data === "object") return { [key]: [data] };
    return { [key]: [] };
  }

  // MANUFACTURERS
  // Retrieve all manufacturer's names
  async fetchAllManufacturerNames() {
    try {
      const response = await fetch(API_URL + "contexts/manufacturers/names", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all manufacturers is here.",
          response.status
        );
        return { manufacturers: [] };
      }

      const data = await response.json();
      console.log("Data for all manufacturers fetched: ", data);

      // Use helper to normalize response
      return this.normalizeResponseArray(data, "manufacturers");
    } catch (error) {
      console.log("Error occur while fetching all manufacturers!", error);
      return { manufacturers: [] };
    }
  }

  // Retrieve context names
  async fetchContextNames() {
    try {
      const response = await fetch(API_URL + "contexts/names", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all contexts is here.",
          response.status
        );
        return { suppliers: [], manufacturers: [] };
      }

      const data = await response.json();
      console.log("Data for all contexts fetched: ", data);
      return data;
    } catch (error) {
      console.log("Error occur while fetching all contexts!", error);
      // Returning default consistent empty arrays
      return { suppliers: [], manufacturers: [] };
    }
  }

  // Fetch supplier names
  async fetchAllSupplierNames() {
    try {
      const response = await fetch(API_URL + "contexts/suppliers/names", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching all suppliers is here.",
          response.status
        );
        return { suppliers: [] };
      }

      const data = await response.json();
      console.log("Data for all suppliers fetched: ", data);

      // Use helper to normalize response
      return this.normalizeResponseArray(data, "suppliers");
    } catch (error) {
      console.log("Error occur while fetching all suppliers!", error);
      return { suppliers: [] };
    }
  }

  // Fetch supplier name by id
  // Retrieve a product by id
  async fetchSuppNameById(id) {
    try {
      const response = await fetch(API_URL + `suppliers/${id}/`);

      if (!response.ok) {
        console.warn("Failed to fetch supplier's name by ID, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Supplier name fetched:", data);

      // Return supplier object if wrapped, else data directly
      return data && data.supplier ? data.supplier : data;
    } catch (error) {
      console.error(`Error occurred while fetching supplier with ID ${id}:`, error);
      return null;
    }
  }
}

const contextsService = new ContextsService();

export default contextsService;
