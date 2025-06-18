const API_URL ="https://mockapi-production-b1cb.up.railway.app/api/ams/";

class DtsService {
  async fetchAssetCheckouts() {
    try {
      const response = await fetch(API_URL + "checkout-tickets");

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