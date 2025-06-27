const API_URL = "https://contexts-service-production.up.railway.app/contexts/";

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

  async resolveCheckoutTicket(ticketId) {
    try {
      const response = await fetch(`${API_URL}tickets/${ticketId}/resolve/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to resolve ticket, status:", response.status);
        throw new Error("Ticket resolution failed.");
      }

      return await response.json(); // or return nothing if it returns 204
    } catch (error) {
      console.error("An error occurred while resolving the ticket:", error);
      throw error;
    }
  }
}

const dtsService = new DtsService();

export default dtsService;