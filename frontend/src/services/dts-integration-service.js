const API_URL ="https://mockapi-production-b1cb.up.railway.app/api/ams/";

class DtsService {
  // fetch asset checkout and checkin tickets
  async fetchAssetCheckouts() {
    try {
      const response = await fetch(API_URL + "checkout-tickets?is_resolved=false");

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

  // post to update ticket status
  async resolveCheckoutTicket(ticketId) {
    try {
      const payload = {
        is_resolved: true,
      };
      console.log('Sending resolve payload:', payload);

      const response = await fetch(`${API_URL}checkout-resolve/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Resolve Checkout Ticket Error:', errorData);
        throw errorData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resolving checkout ticket:', error);
      throw error;
    }
  }
  
}

const dtsService = new DtsService();

export default dtsService;