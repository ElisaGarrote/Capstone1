import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import TicketFilterModal from "../../components/Modals/TicketFilterModal";
import ActionButtons from "../../components/ActionButtons";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import TicketsMockupData from "../../data/mockData/tickets/tickets-mockup-data.json";
import DefaultImage from "../../assets/img/default-image.jpg";

import "../../styles/Tickets/Tickets.css";

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
          <ActionButtons
            showCheckout={ticket.isCheckInOrOut === "Check-Out"}
            showCheckin={ticket.isCheckInOrOut === "Check-In"}
            onCheckoutClick={() => onCheckInOut(ticket)}
            onCheckinClick={() => onCheckInOut(ticket)}
          />
        )}
      </td>

      {/* ACTIONS Column */}
      <td>
        <ActionButtons
          showEdit={false}
          showDelete={false}
          showView
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);



  useEffect(() => {
    const loadTickets = () => {
      try {
        // Use mockup data instead of API call
        const mappedTickets = TicketsMockupData.map((ticket) => {
          const isCheckInOrOut =
            ticket.isCheckInOrOut ??
            (!ticket.is_resolved
              ? ticket.checkin_date
                ? "Check-In"
                : "Check-Out"
              : null);

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
        setFilteredData(mappedTickets);
      } catch (error) {
        console.error("Error loading tickets:", error);
        setErrorMessage("Failed to load tickets.");
        setTicketItems([]);
      }
    };

    loadTickets();
  }, []);

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...ticketItems];

    // Filter by Ticket Number
    if (filters.ticketNumber && filters.ticketNumber.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.id?.toLowerCase().includes(filters.ticketNumber.toLowerCase())
      );
    }

    // Filter by Asset
    if (filters.asset && filters.asset.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.assetName?.toLowerCase().includes(filters.asset.toLowerCase())
      );
    }

    // Filter by Requestor
    if (filters.requestor && filters.requestor.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.requestor?.toLowerCase().includes(filters.requestor.toLowerCase())
      );
    }

    // Filter by Subject
    if (filters.subject && filters.subject.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.subject?.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    // Filter by Location
    if (filters.location && filters.location.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.requestorLocation?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by Check-In / Check-Out
    if (filters.checkInOut && filters.checkInOut.value !== "All") {
      filtered = filtered.filter((ticket) =>
        ticket.isCheckInOrOut === filters.checkInOut.value
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFilters(filters);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

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

  // Filter tickets based on search query and applied filters
  let filteredTickets = filteredData.filter(ticket =>
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

      {/* Ticket Filter Modal */}
      <TicketFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Approve Tickets ({filteredTickets.length})</h2>
              <section className="table-actions">
                  {/* Bulk delete removed for approval workflow */}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
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
        <Footer />
      </section>
    </>
  );
};

export default Tickets;