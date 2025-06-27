const API_URL = "https://contexts-service-production.up.railway.app/";

class DtsService {
  // fetch asset checkout and checkin tickets
  async fetchAssetCheckouts() {
    try {
      const response = await fetch(API_URL + "tickets/");

      if (!response.ok) {
        console.warn("Failed to fetch asset checkouts, status:", response.status);
        return null;
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.log("An error occurred while fetching asset checkouts!", error);
    }
  }
}

const dtsService = new DtsService();

export default dtsService;