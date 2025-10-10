import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import TicketsMockupData from "../../data/mockData/tickets/tickets-mockup-data.json";
import FilterPanel from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import "../../styles/Tickets/Tickets.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import DefaultImage from "../../assets/img/default-image.jpg";
import Alert from "../../components/Alert";

// Filter configuration for tickets
const filterConfig = [
  {
    type: "select",
    name: "status",
    label: "Status",
    options: [
      { value: "open", label: "Open" },
      { value: "in-progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "closed", label: "Closed" },
    ],
  },
  {
    type: "select",
    name: "priority",
    label: "Priority",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    type: "text",
    name: "category",
    label: "Category",
  },
];

// TableHeader component to render the table header
function TableHeader({ allSelected, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onHeaderChange}
        />
      </th>
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
function TableItem({ ticket, isSelected, onRowChange, onDeleteClick, onViewClick, onCheckInOut }) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(ticket.id, e.target.checked)}
        />
      </td>
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

      {/* ACTIONS Column */}
      <td>
        <ActionButtons
          showEdit={false}
          showDelete
          showView
          onDeleteClick={() => onDeleteClick(ticket.id)}
          onViewClick={() => onViewClick(ticket)}
        />
      </td>
    </tr>
  );
}

const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleRef = useRef(null);
  const exportRef = useRef(null);

  const [ticketItems, setTicketItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    const loadTickets = () => {
      setIsLoading(true);
      try {
        // Use mockup data instead of API call
        const mappedTickets = TicketsMockupData.map(ticket => {
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
        console.error("Error loading tickets:", error);
        setErrorMessage("Failed to load tickets.");
        setTicketItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const handleViewClick = (ticket) => {
    navigate(`/tickets/view/${ticket.id}`);
  };

  // outside click for export toggle
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportToggle &&
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setExportToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportToggle]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, [location]);

  const handleCheckInOut = (ticket) => {
    if (ticket.isCheckInOrOut === "Check-In") {
      navigate(`/assets/check-in/${ticket.assetId}`, {
        state: {
          id: ticket.assetId,
          assetId: ticket.assetId,
          product: ticket.assetName || "Generic Asset",
          image: DefaultImage,
          employee: ticket.requestor || "Not assigned",
          empLocation: ticket.requestorLocation || "Unknown",
          checkOutDate: ticket.checkoutDate || "Unknown",
          returnDate: ticket.returnDate || "Unknown",
          checkoutId: ticket.id,
          condition: "Unknown",
          ticketId: ticket.id,
          fromTicket: true,
        },
      });
    } else {
      navigate(`/assets/check-out/${ticket.assetId}`, {
        state: {
          id: ticket.assetId,
          assetId: ticket.assetId,
          product: ticket.assetName || "Generic Asset",
          image: DefaultImage,
          ticketId: ticket.id,
          empId: ticket.requestorId,
          employee: ticket.requestor || "Not assigned",
          empLocation: ticket.requestorLocation || "Unknown",
          checkoutDate: ticket.checkoutDate || "Unknown",
          returnDate: ticket.returnDate || "Unknown",
          fromTicket: true,
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

  // Selection logic
  const allSelected =
    paginatedTickets.length > 0 &&
    paginatedTickets.every((ticket) => selectedIds.includes(ticket.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      const newSelectedIds = [...selectedIds, ...paginatedTickets.map((ticket) => ticket.id)];
      setSelectedIds([...new Set(newSelectedIds)]);
    } else {
      const paginatedIds = paginatedTickets.map((ticket) => ticket.id);
      setSelectedIds(selectedIds.filter((id) => !paginatedIds.includes(id)));
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      // Delete single ticket
      const updatedTickets = ticketItems.filter(ticket => ticket.id !== deleteTargetId);
      setTicketItems(updatedTickets);
      setSuccessMessage("Ticket deleted successfully");
    } else {
      // Bulk delete
      const updatedTickets = ticketItems.filter(ticket => !selectedIds.includes(ticket.id));
      setTicketItems(updatedTickets);
      setSelectedIds([]);
      setSuccessMessage(`${selectedIds.length} ticket(s) deleted successfully`);
    }
    closeDeleteModal();
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}



      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          <section className="title-page-section">
            <h1>Approved Tickets</h1>
          </section>

          <FilterPanel filters={filterConfig} />

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Tickets ({filteredTickets.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
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

            {exportToggle && (
              <section className="export-button-section" ref={exportRef}>
                <button>Download as Excel</button>
                <button>Download as PDF</button>
                <button>Download as CSV</button>
              </section>
            )}

            <section className="table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedTickets.length > 0 ? (
                    paginatedTickets.map((ticket) => (
                      <TableItem
                        key={ticket.id}
                        ticket={ticket}
                        isSelected={selectedIds.includes(ticket.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onViewClick={handleViewClick}
                        onCheckInOut={handleCheckInOut}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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