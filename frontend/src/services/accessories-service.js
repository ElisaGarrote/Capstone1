const API_URL_AUTH ="https://accessories-service-production.up.railway.app/";

class AccessoriesService {
  // Helper to normalize array responses
  normalizeResponseArray(data, key) {
    if (data && data[key]) return data;
    if (Array.isArray(data)) return { [key]: data };
    if (data && typeof data === "object") return { [key]: [data] };
    return { [key]: [] };
  }

  // Retrieve all accessories
  async fetchAllAccessories() {
    try {
      const response = await fetch(API_URL + "accessories/");

      if (!response.ok) {
        console.warn(
          "Failed to fetch accessories, status:",
          response.status
        );
        return { accessories: [] };
      }

      const data = await response.json();
      console.log("Data for all accessories fetched:", data);

      return this.normalizeResponseArray(data, "accessories");
    } catch (error) {
      console.error("Error occurred while fetching all accessories:", error);
      return { accessories: [] };
    }
  }

  // Continuation
}

const accessoriesService = new AccessoriesService();

export default accessoriesService;