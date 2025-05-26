import dateRelated from "../utils/dateRelated";

const API_URL = "https://contexts-service-production.up.railway.app/";

class ContextsService {
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
      
      // Ensure we always return an object with manufacturers property
      if (data && data.manufacturers) {
        return data; // Already in correct format
      } else if (Array.isArray(data)) {
        return { manufacturers: data }; // Convert array to object with property
      } else {
        return { manufacturers: [] }; // Default empty result
      }
    } catch (error) {
      console.log("Error occur while fetching all manufacturers!", error);
      return { manufacturers: [] };  // Return consistent structure
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
    }
  }

  // Fetch context names
  async fetchContextNames() {
    try {
      const response = await fetch(API_URL + "contexts/names", {
        method: "GET",
      });

      if (!response.ok) {
        console.log(
          "The status of the response for fetching context names is here.",
          response.status
        );
        return { 
          suppliers: [],
          manufacturers: []
        };
      }

      const data = await response.json();
      console.log("Context names fetched: ", data);
      
      // Return the data with default empty arrays for any missing properties
      return {
        suppliers: data.suppliers || [],
        manufacturers: data.manufacturers || []
      };
    } catch (error) {
      console.log("Error occurred while fetching context names!", error);
      return { 
        suppliers: [],
        manufacturers: []
      };
    }
  }
}

const contextsService = new ContextsService(); // Create object for Assets Service.

export default contextsService;
