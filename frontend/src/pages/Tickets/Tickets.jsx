import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/GlobalStyles.css";
import "../../styles/Tickets/Tickets.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import Pagination from "../../components/Pagination";
import TicketViewModal from "../../components/Modals/TicketViewModal";
import dtsService from "../../services/dts-integration-service";
import Alert from "../../components/Alert";
import DefaultImage from "../../assets/img/default-image.jpg";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>TICKET NUMBER</th>
      <th>ASSET</th>
      <th>REQUESTOR</th>
      <th>SUBJECT</th>
      <th>LOCATION</th>
      <th>CHECK-IN / CHECK-OUT</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ ticket, onView, onCheckInOut }) {
  return (
    <tr>
      <td>{ticket.id}</td>
      <td>{ticket.assetName}</td>
      <td>{ticket.requestor}</td>
      <td>{ticket.subject}</td>
      <td>{ticket.requestorLocation}</td>

      {/* CHECK-IN / CHECK-OUT Column */}
      <td>
        {ticket.isCheckInOrOut && (
          <button
            className={
              ticket.isCheckInOrOut === "Check-In"
                ? "check-in-btn"
                : "check-out-btn"
            }
            onClick={() => onCheckInOut(ticket)}
          >
            {ticket.isCheckInOrOut}
          </button>
        )}
      </td>

      {/* ACTIONS Column (View) */}
      <td>
        <div className="action-buttons">
          <TableBtn type="view" onClick={() => onView(ticket)} />
        </div>
      </td>
    </tr>
  );
}

const Tickets = () => {
  const navigate = useNavigate();
  const toggleRef = useRef(null);
  const exportRef = useRef(null);

  const [ticketItems, setTicketItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await dtsService.fetchAssetCheckouts();

        const mappedTickets = (response || []).map(ticket => {
          const isCheckInOrOut = !ticket.is_resolved
            ? (ticket.checkin_date ? "Check-In" : "Check-Out")
            : null;

          return {
            id: ticket.ticket_id,
            assetId: ticket.asset_id,
            assetName: ticket.asset_name,
            subject: ticket.subject,
            requestor: ticket.requestor,
            requestorId: ticket.requestor_id,
            requestorLocation: ticket.requestor_location || "-",
            checkoutDate: ticket.checkout_date,
            returnDate: ticket.return_date,
            image: DefaultImage,
            isResolved: ticket.is_resolved,
            isCheckInOrOut,
          };
        });

        setTicketItems(mappedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setErrorMessage("Failed to load tickets.");
        setTicketItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleViewClick = (ticket) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };

  const handleCheckInOut = (item) => {
    if (item.isCheckInOrOut === "Check-In") {
      navigate(`/assets/check-in/${item.assetId}`, {
        state: {
          id: item.assetId,
          assetId: item.assetId,
          product: item.assetName || "Generic Asset",
          image: DefaultImage,
          employee: item.requestor || "Not assigned",
          empLocation: item.requestorLocation || "Unknown",
          checkOutDate: item.checkoutDate || "Unknown",
          returnDate: item.returnDate || "Unknown",
          checkoutId: item.id,
          checkinDate: item.checkinDate || "Unknown",
          condition: item.condition || "Unknown",
          ticketId: item.id,
          fromAsset: true,
        },
      });
    } else {
      navigate(`/assets/check-out/${item.assetId}`, {
        state: {
          id: item.assetId,
          assetId: item.assetId,
          product: item.assetName || "Generic Asset",
          image: DefaultImage,
          ticketId: item.id,
          empId: item.requestorId,
          employee: item.requestor || "Not assigned",
          empLocation: item.requestorLocation || "Unknown",
          checkoutDate: item.checkoutDate || "Unknown",
          returnDate: item.returnDate || "Unknown",
          fromAsset: true,
        },
      });
    }
  };

  // Filter tickets based on search query
  const filteredTickets = ticketItems.filter(ticket =>
    ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.requestor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isViewModalOpen && selectedTicket && (
        <TicketViewModal
          ticket={selectedTicket}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Approved Tickets</h1>
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Tickets ({filteredTickets.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
              </section>
            </section>

            {/* Table Structure */}
            <section className="tickets-table-section">
              {exportToggle && (
                <section className="export-button-section" ref={exportRef}>
                  <button>Download as Excel</button>
                  <button>Download as PDF</button>
                  <button>Download as CSV</button>
                </section>
              )}
              {isLoading ? (
                <div className="loading-container">
                  <SkeletonLoadingTable />
                </div>
              ) : (
                <table>
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {paginatedTickets.length > 0 ? (
                      paginatedTickets.map((ticket, index) => (
                        <TableItem
                          key={index}
                          ticket={ticket}
                          onView={handleViewClick}
                          onCheckInOut={handleCheckInOut}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="no-data-message">
                          No tickets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </section>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={filteredTickets.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
      </section>
    </>
  );
};

export default Tickets;