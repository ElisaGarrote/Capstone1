const API_URL = "http://127.0.0.1:8000/assets/";

class AssetsService {
  // ASSETS

  // PRODUCTS

  // AUDITS
  // Create Audit
  async createAudit() {
    try {
      const response = await fetch(API_URL + "audits/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.status !== 201) {
        console.log("falied creating audit.");
        return false;
      }

      const data = await response.json();
      console.log("data:", data);
    } catch (error) {
      console.error("Failed Creating Audit!", error);
    }
  }
}

const assetsService = new AssetsService(); // Create object for Assets Service.

export default assetsService;
