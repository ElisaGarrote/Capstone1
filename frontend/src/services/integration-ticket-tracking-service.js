import ticketTrackingAxios from "../api/ticketTrackingAxios";

/* ===============================
                TICKETS
================================= */
// GET all tickets
export async function fetchAllTickets() {
  const res = await ticketTrackingAxios.get("tickets/unresolved/");
  return res.data;
}

// Resolve ticket
export async function resolveTicket(ticketId) {
  const res = await ticketTrackingAxios.patch(`tickets/${ticketId}/`, {
    is_resolved: true,
  });
  return res.data;
}