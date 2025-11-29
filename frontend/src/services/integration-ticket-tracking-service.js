import ticketTrackingAxios from "../api/integrationTicketTracking";

/* ===============================
                TICKETS
================================= */
// GET all tickets
export async function fetchAllTickets() {
  const res = await ticketTrackingAxios.get("tickets/unresolved/");
  return res.data;
}

// Resolve ticket
export async function resolveTicket(ticketId, actionId) {
  const res = await ticketTrackingAxios.patch(
    `tickets/${ticketId}/resolve/`,
    {
      id: actionId,
    }
  );
  return res.data;
}
