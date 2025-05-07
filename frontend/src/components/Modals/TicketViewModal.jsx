import "../../styles/TicketViewModal.css";
import CloseIcon from "../../assets/icons/close.svg";
import { useNavigate } from "react-router-dom";
import TicketIcon from "../../assets/icons/ticket.svg";

export default function TicketViewModal({ ticket, closeModal }) {
  const navigate = useNavigate();

  // Always use the dvi.jpeg image for ticket view
  const ticketImage = "/src/assets/img/dvi.jpeg";

  return (
    <main className="ticket-view-modal">
      <div className="overlay" onClick={closeModal}></div>
      <div className="content">
        <button onClick={closeModal} className="close-button">
          <img src={CloseIcon} alt="Close" />
        </button>

        <fieldset className="header-fieldset">
          <img src={ticketImage} alt="Ticket" />
          <h2>{ticket.subject}</h2>
        </fieldset>

        <div className="details-container">
          <section className="left-content">
            <fieldset className="detail-item">
              <label>Ticket Number</label>
              <p>{ticket.id}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Requestor</label>
              <p>{ticket.requestor}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Creation Date</label>
              <p>{ticket.creationDate}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Notes</label>
              <p>{ticket.notes || "-"}</p>
            </fieldset>
          </section>

          <section className="right-content">
            <fieldset className="detail-item">
              <label>Category</label>
              <p>{ticket.category}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Status</label>
              <p>{ticket.status}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Last Updated</label>
              <p>{ticket.lastUpdated}</p>
            </fieldset>
          </section>
        </div>

        <div className="action-buttons">
          <button
            className="checkout-btn"
            onClick={() => {
              closeModal();

              // Map ticket categories to asset types for demonstration
              const assetTypeMap = {
                "Software Installation": "Laptop",
                "Hardware Replacement": "Keyboard",
                "Peripheral Request": "Mouse"
              };

              // Create a mock asset based on the ticket information
              const mockAsset = {
                id: ticket.id,
                image: "/src/assets/img/dvi.jpeg", // Always use dvi.jpeg image
                assetId: `ASSET-${ticket.id}`,
                product: assetTypeMap[ticket.category] || "Generic Asset",
              };

              // Navigate to the asset checkout page with the mock asset information
              navigate(`/assets/check-out/${ticket.id}`, {
                state: {
                  id: ticket.id,
                  image: mockAsset.image,
                  assetId: mockAsset.assetId,
                  product: mockAsset.product,
                  ticketId: ticket.id,
                  ticketSubject: ticket.subject,
                  ticketRequestor: ticket.requestor
                },
              });
            }}
          >
            Check-Out
          </button>
        </div>
      </div>
    </main>
  );
}
