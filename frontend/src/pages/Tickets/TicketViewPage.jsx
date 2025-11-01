import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import ViewPage from "../../components/View/Viewpage";
import Status from "../../components/Status";
import DefaultImage from "../../assets/img/default-image.jpg";
import TicketsMockupData from "../../data/mockData/tickets/tickets-mockup-data.json";
import "../../styles/TicketViewPage.css";
import MediumButtons from "../../components/buttons/MediumButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";

function TicketViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Find ticket from mockup data
    const foundTicket = TicketsMockupData.find((t) => t.id === id);
    if (foundTicket) {
      setTicket(foundTicket);
    }
  }, [id]);

  if (!ticket) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Ticket not found</h2>
        </div>
      </>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="view-info-item">
        <label>Ticket ID:</label>
        <p>{ticket.ticket_id}</p>
      </div>
      <div className="view-info-item">
        <label>Asset:</label>
        <p>{ticket.asset_name}</p>
      </div>
      <div className="view-info-item">
        <label>Requestor:</label>
        <p>{ticket.requestor}</p>
      </div>
      <div className="view-info-item">
        <label>Email:</label>
        <p>{ticket.requestor_email}</p>
      </div>
      <div className="view-info-item">
        <label>Phone:</label>
        <p>{ticket.requestor_phone}</p>
      </div>
      <div className="view-info-item">
        <label>Location:</label>
        <p>{ticket.requestor_location}</p>
      </div>
      <div className="view-info-item">
        <label>Priority:</label>
        <p>{ticket.priority}</p>
      </div>
      <div className="view-info-item">
        <label>Status:</label>
        <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
      </div>
      <div className="view-info-item">
        <label>Category:</label>
        <p>{ticket.category}</p>
      </div>
      <div className="view-info-item">
        <label>Assigned To:</label>
        <p>{ticket.assigned_to}</p>
      </div>
      <div className="view-info-item">
        <label>Created:</label>
        <p>{formatDateTime(ticket.created_at)}</p>
      </div>
      <div className="view-info-item">
        <label>Updated:</label>
        <p>{formatDateTime(ticket.updated_at)}</p>
      </div>
      <div className="view-info-item">
        <label>Checkout Date:</label>
        <p>{formatDate(ticket.checkout_date)}</p>
      </div>
      <div className="view-info-item">
        <label>Return Date:</label>
        <p>{formatDate(ticket.return_date)}</p>
      </div>
      {ticket.checkin_date && (
        <div className="view-info-item">
          <label>Check-in Date:</label>
          <p>{formatDate(ticket.checkin_date)}</p>
        </div>
      )}
      {ticket.resolution_notes && (
        <div className="view-info-item">
          <label>Resolution Notes:</label>
          <p>{ticket.resolution_notes}</p>
        </div>
      )}
    </>
  );

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle ticket deletion logic here
    console.log("Deleting ticket:", ticket.id);
    closeDeleteModal();
    navigate("/approved-tickets");
  };

  // Action buttons
  const actionButtons = (
    <>
      <button
        className="view-action-btn delete"
        onClick={() => setDeleteModalOpen(true)}
      >
        Delete
      </button>
    </>
  );

  return (
    <>
      <NavBar />
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}
      <ViewPage
        breadcrumbRoot="Tickets"
        breadcrumbCurrent="Show Ticket"
        breadcrumbRootPath="/approved-tickets"
        title={`${ticket.ticket_id} - ${ticket.subject}`}
        sidebarContent={sidebarContent}
        actionButtons={actionButtons}
      >
        {/* Main Content - Ticket Details */}
        <div className="ticket-view-content">
          {/* Top Actions */}
          <div className="ticket-view-header">
            <div className="ticket-view-tabs">
              <span className="ticket-tab-text">Ticket Details</span>
            </div>
            <div className="ticket-view-actions">
              <input type="search" placeholder="Search..." className="ticket-search" />
            </div>
          </div>

          {/* Ticket Details Table */}
          <div className="ticket-view-table-wrapper">
            <table className="ticket-view-table">
              <thead>
                <tr>
                  <th>TICKET NUMBER</th>
                  <th>ASSET</th>
                  <th>REQUESTOR</th>
                  <th>SUBJECT</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ticket.ticket_id}</td>
                  <td>{ticket.asset_name}</td>
                  <td>{ticket.requestor}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.requestor_location}</td>
                  <td>
                    <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Description Section */}
          <div className="ticket-description-section">
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>

          {/* Pagination */}
          <div className="ticket-view-pagination">
            Showing 1 to 1 of 1 entries
          </div>
        </div>
      </ViewPage>
    </>
  );
}

export default TicketViewPage;
