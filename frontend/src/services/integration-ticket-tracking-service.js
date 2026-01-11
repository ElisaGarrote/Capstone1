import ticketTrackingAxios from "../api/integrationTicketTracking";

/* ===============================
                TICKETS
================================= */
// GET all unresolved tickets (for checkout)
export async function fetchAllTickets() {
  const res = await ticketTrackingAxios.get("tickets/asset/unresolved/");
  return res.data;
}

// GET all resolved tickets (for checkin history)
export async function fetchResolvedTickets() {
  const res = await ticketTrackingAxios.get("tickets/asset/resolved/");
  return res.data;
}

// GET ticket by ID
export async function fetchTicketById(id) {
  const res = await ticketTrackingAxios.get(`tickets/asset/unresolved/`, { params: { id } });
  return res.data;
}