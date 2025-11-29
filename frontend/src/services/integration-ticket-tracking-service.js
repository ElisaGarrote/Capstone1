import ticketTrackingAxios from "../api/integrationTicketTracking";

/* ===============================
                TICKETS
================================= */
// GET all tickets
export async function fetchAllTickets() {
  const res = await ticketTrackingAxios.get("tickets/unresolved/");
  return res.data;
}