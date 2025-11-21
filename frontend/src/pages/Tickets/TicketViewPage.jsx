import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import TicketsMockupData from "../../data/mockData/tickets/tickets-mockup-data.json";
import "../../styles/Tickets/TicketViewPage.css";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import MediumButtons from "../../components/buttons/MediumButtons";
import Status from "../../components/Status";

function TicketViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Find ticket from mockup data
    const foundTicket = TicketsMockupData.find((t) => t.id === id);
    if (foundTicket) {
      setTicket(foundTicket);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return null;
  }

  if (!ticket) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ticket not found</h2>
      </div>
    );
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    console.log("Deleting ticket:", ticket.id);
    closeDeleteModal();
    navigate("/approved-tickets");
  };

  const handleCheckOut = () => {
    console.log("Check-Out ticket:", ticket.id);
  };

  const handleCheckIn = () => {
    console.log("Check-In ticket:", ticket.id);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Create action buttons with vertical layout - Check-Out, Check-In, Delete
  const actionButtons = (
    <div className="ticket-vertical-action-buttons">
      <button
        type="button"
        className="ticket-action-btn ticket-checkout-btn"
        onClick={handleCheckOut}
      >
        <i className="fas fa-sign-out-alt"></i>
        Check-Out
      </button>
      <button
        type="button"
        className="ticket-action-btn ticket-checkin-btn"
        onClick={handleCheckIn}
      >
        <i className="fas fa-sign-in-alt"></i>
        Check-In
      </button>
      <MediumButtons
        type="delete"
        onClick={handleDeleteClick}
      />
    </div>
  );

  // Tabs configuration
  const tabs = [
    { label: "About" }
  ];

  // Custom About tab content for Ticket Details
  const ticketDetailsContent = (
    <div className="ticket-about-section">
      <div className="ticket-details-section">
        <h3 className="ticket-section-header">Ticket Details</h3>
        <div className="ticket-details-grid">
          <div className="ticket-detail-row">
            <label>Ticket Number</label>
            <span>{ticket.ticket_id}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Asset</label>
            <span>{ticket.asset_name}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Requestor</label>
            <span>{ticket.requestor}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Subject</label>
            <span>{ticket.subject}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Location</label>
            <span>{ticket.requestor_location}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Status</label>
            <span>
              <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
            </span>
          </div>
          <div className="ticket-detail-row">
            <label>Priority</label>
            <span>{ticket.priority}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Category</label>
            <span>{ticket.category}</span>
          </div>
          <div className="ticket-detail-row">
            <label>Assigned To</label>
            <span>{ticket.assigned_to}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="ticket-description-section">
          <h4>Description</h4>
          <p>{ticket.description}</p>
        </div>
      </div>


    </div>
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
      <DetailedViewPage
        breadcrumbRoot="Tickets"
        breadcrumbCurrent="Show Ticket"
        breadcrumbRootPath="/approved-tickets"
        title={ticket.ticket_id}
        subtitle={ticket.subject}
        assetImage={DefaultImage}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
      >
        {ticketDetailsContent}
      </DetailedViewPage>
    </>
  );
}

export default TicketViewPage;
