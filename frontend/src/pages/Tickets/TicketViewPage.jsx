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

  useEffect(() => {
    const foundTicket = TicketsMockupData.find((t) => t.ticket_id === id);
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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const actionButtons = (
    <div className="ticket-vertical-action-buttons">
      {ticket.ticketType === "Registration" && (
        <button
          type="button"
          className="ticket-action-btn ticket-register-asset-btn"
          onClick={() => navigate('/assets/registration')}
        >
          <i className="fas fa-plus"></i>
          Register Asset
        </button>
      )}
      {ticket.ticketType === "Checkout" && (
        <button
          type="button"
          className="ticket-action-btn ticket-checkout-asset-btn"
          onClick={() => navigate(`/assets/check-out/${ticket.assetId}`)}
        >
          <i className="fas fa-sign-out-alt"></i>
          Checkout Asset
        </button>
      )}
      {ticket.ticketType === "Checkin" && (
        <button
          type="button"
          className="ticket-action-btn ticket-checkin-asset-btn"
          onClick={() => navigate(`/assets/check-in/${ticket.assetId}`)}
        >
          <i className="fas fa-sign-in-alt"></i>
          Checkin Asset
        </button>
      )}
      <MediumButtons
        type="delete"
        onClick={handleDeleteClick}
      />
    </div>
  );

  const ticketDetailsContent = (
    <div className="ticket-about-section">
      <div className="ticket-details-section">
        <h3 className="ticket-section-header">
          Ticket Details {(ticket.ticketType === "Registration" || ticket.ticketType === "Checkout" || ticket.ticketType === "Checkin" || ticket.ticketType === "Repair" || ticket.ticketType === "Incident" || ticket.ticketType === "Disposal") && `(${ticket.ticketType === "Checkin" ? "Check-in" : ticket.ticketType})`}
        </h3>
        <div className="ticket-details-grid">
          <div className="ticket-detail-row">
            <label>Ticket Number</label>
            <span>{ticket.ticket_id}</span>
          </div>
          {ticket.ticketType === "Registration" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.employee}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Asset Model Name</label>
                <span>{ticket.assetModelName}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Serial Number</label>
                <span>{ticket.serialNumber}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Order Number</label>
                <span>{ticket.orderNumber}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Purchase Cost</label>
                <span>${ticket.purchaseCost}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Purchase Date</label>
                <span>{ticket.purchasedDate}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Warranty Expiration</label>
                <span>{ticket.warrantyExpiration}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Location</label>
                <span>{ticket.requestor_location}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Department</label>
                <span>{ticket.department}</span>
              </div>
            </>
          ) : ticket.ticketType === "Checkout" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.requestor}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Asset ID</label>
                <span>{ticket.assetId}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Serial Number</label>
                <span>{ticket.serialNumber}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Checkout Date</label>
                <span>{new Date(ticket.checkout_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Return Date</label>
                <span>{new Date(ticket.return_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Condition</label>
                <span>{ticket.condition}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Location</label>
                <span>{ticket.requestor_location}</span>
              </div>
            </>
          ) : ticket.ticketType === "Checkin" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.requestor}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Asset ID</label>
                <span>{ticket.assetId}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Serial Number</label>
                <span>{ticket.serialNumber}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Check-in Date</label>
                <span>{new Date(ticket.checkin_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Reference Ticket</label>
                <span>{ticket.referenceTicket}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Condition</label>
                <span>{ticket.condition}</span>
              </div>
            </>
          ) : ticket.ticketType === "Repair" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.requestor}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Repair Name</label>
                <span>{ticket.repairName}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Repair Type</label>
                <span>{ticket.repairType}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Asset ID</label>
                <span>{ticket.assetId}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Start Date</label>
                <span>{new Date(ticket.startDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>End Date</label>
                <span>{new Date(ticket.endDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Cost</label>
                <span>${ticket.cost}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Supplier</label>
                <span>{ticket.supplier}</span>
              </div>
            </>
          ) : ticket.ticketType === "Incident" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.requestor}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Asset ID</label>
                <span>{ticket.assetId}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Incident Date</label>
                <span>{new Date(ticket.incidentDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Last Location</label>
                <span>{ticket.lastLocation}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Schedule Audit</label>
                <span>{ticket.scheduleAudit}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Damage Description</label>
                <span>{ticket.damageDescription}</span>
              </div>
            </>
          ) : ticket.ticketType === "Disposal" ? (
            <>
              <div className="ticket-detail-row">
                <label>Category</label>
                <span>{ticket.category}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Sub-category</label>
                <span>{ticket.subcategory}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Subject</label>
                <span>{ticket.subject}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Employee</label>
                <span>{ticket.requestor}</span>
              </div>
              <div className="ticket-detail-row">
                <label>Status</label>
                <span>
                  <Status type={ticket.status.toLowerCase().replace(' ', '')} name={ticket.status} />
                </span>
              </div>
              <div className="ticket-detail-row">
                <label>Command Note</label>
                <span>{ticket.commandNote}</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
        actionButtons={actionButtons}
      >
        {ticketDetailsContent}
      </DetailedViewPage>
    </>
  );
}

export default TicketViewPage;
