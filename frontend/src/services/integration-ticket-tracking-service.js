import ticketTrackingAxios from "../api/integrationTicketTracking";

/* ===============================
                TICKETS
================================= */
// GET all unresolved tickets (for checkout)
export async function fetchAllTickets() {
  const res = await ticketTrackingAxios.get("external/ams/tickets/");
  return res.data;
}