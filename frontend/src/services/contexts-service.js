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

  // cONTEXTS
  async fetchAllManufacturerNames() {
    try {
      const response = await fetch(API_URL + "contexts/manufacturers/names/", {
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
      const response = await fetch(API_URL + "contexts/names/", {
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
      const response = await fetch(API_URL + "contexts/suppliers/names/", {
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
  async fetchSuppNameById(id) {
    try {
      const response = await fetch(API_URL + `contexts/suppliers/${id}/`);

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

  // SUPPLIERS
  async fetchAllSuppliers() {
    try {
      const response = await fetch(API_URL + "contexts/suppliers/");

      if (!response.ok) {
        console.warn("Failed to fetch suppliers, status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Suppliers Parsed JSON data:", data); 
      // Sort by name (A-Z), case-insensitive
      const sortedData = data.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      return sortedData;

    } catch (error) {
      console.log("An error occurred while fetching all suppliers!", error);
    }
  }

  async fetchSupplierById(id) {
    try {
      const response = await fetch(`${API_URL}contexts/suppliers/${id}/`);
      if (!response.ok) {
        console.warn(`Failed to fetch suppliers with ID ${id}, status:`, response.status);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`An error occurred while fetching suppliers with ID ${id}:`, error);
      return null;
    }
  }

  async createSupplier(formData) {
    try {
      const response = await fetch(`${API_URL}contexts/suppliers/registration/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Create Supplier Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  async updateSupplier(id, formData) {
    try {
      const response = await fetch(`${API_URL}contexts/suppliers/${id}/update/`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Update Supplier Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating supplier with ID ${id}:`, error);
      throw error;
    }
  }

  // MANUFACTURERS
  async fetchAllManufacturers() {
    try {
      const response = await fetch(API_URL + "contexts/manufacturers/");

      if (!response.ok) {
        console.warn("Failed to fetch manufacturers, status:", response.status);
        return null;
      }

      const data = await response.json();

      // Sort by name (A-Z), case-insensitive
      const sortedData = data.sort((a, b) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      return sortedData;

    } catch (error) {
      console.log("An error occurred while fetching all manufacturers!", error);
    }
  }

  async fetchManufacturerById(id) {
    try {
      const response = await fetch(`${API_URL}contexts/manufacturers/${id}/`);
      if (!response.ok) {
        console.warn(`Failed to fetch manufacturer with ID ${id}, status:`, response.status);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`An error occurred while fetching manufacturer with ID ${id}:`, error);
      return null;
    }
  }

  async createManufacturer(formData) {
    try {
      const response = await fetch(`${API_URL}contexts/manufacturers/registration/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Create Manufacturer Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      throw error;
    }
  }

  async updateManufacturer(id, formData) {
    try {
      const response = await fetch(`${API_URL}contexts/manufacturers/${id}/update/`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Update Manufacturer Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating manufacturer with ID ${id}:`, error);
      throw error;
    }
  }

  // LOCATION
  async fetchAllLocations() {
    try {
      const response = await fetch(API_URL + "contexts/locations/");

      if (!response.ok) {
        console.warn("Failed to fetch locations, status:", response.status);
        return [];
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected locations data format:", data);
        return [];
      }

      // Sort by city name, handling missing cities safely
      const filteredData = data.filter(item => item && item.city);
      const sortedData = filteredData.sort((a, b) =>
        a.city.toLowerCase().localeCompare(b.city.toLowerCase())
      );
      console.log("locations:", sortedData);
      return sortedData;

    } catch (error) {
      console.log("An error occurred while fetching all locations!", error);
      return [];
    }
  }
}

const contextsService = new ContextsService();

export default contextsService;
