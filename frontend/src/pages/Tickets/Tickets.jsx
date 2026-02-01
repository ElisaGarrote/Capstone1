import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import TicketFilterModal from "../../components/Modals/TicketFilterModal";
import ActionButtons from "../../components/ActionButtons";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import View from "../../components/Modals/View";
import DefaultImage from "../../assets/img/default-image.jpg";
import { fetchAllTickets } from "../../services/integration-ticket-tracking-service";
import { fetchAssetById, fetchAssetCheckoutById, fetchAssetNames } from "../../services/assets-service";
import authService from "../../services/auth-service";

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
      <th>DATE</th>
      <th>REQUESTOR</th>
      <th>SUBJECT</th>
      <th>LOCATION</th>
      <th>CHECK-IN / CHECK-OUT</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({
  ticket,
  isSelected,
  onRowChange,
  onViewClick,
  onCheckInOut,
}) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(ticket.id, e.target.checked)}
        />
      </td>
      <td>{ticket.ticket_number}</td>
      <td>{ticket.formattedDate}</td>
      <td>{ticket.requestor_details?.name || "Unknown"}</td>
      <td>{ticket.subject}</td>
      <td>{ticket.location}</td>

      {/* CHECK-IN / CHECK-OUT Column */}
      <td>
        {ticket.isCheckInOrOut && (
          <ActionButtons
            showCheckout={ticket.isCheckInOrOut === "Check-Out"}
            showCheckin={ticket.isCheckInOrOut === "Check-In"}
            disableCheckout={ticket.disableCheckout}
            onCheckoutClick={() => onCheckInOut(ticket)}
            onCheckinClick={() => onCheckInOut(ticket)}
          />
        )}
      </td>

      {/* ACTIONS Column */}
      <td>
        <ActionButtons
          showEdit={false}
          showView
          onViewClick={() => onViewClick(ticket)}
        />
      </td>
    </tr>
  );
}

// Helper to check if a date string is in the future (after today)
function isFutureDate(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date > today;
}

const Tickets = () => {
  console.log("[Tickets] Component rendering...");
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
  const [isLoading, setIsLoading] = useState(true);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTicketData, setViewTicketData] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Extract loadTickets as a reusable function
  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // Fetch tickets from API
      const response = await fetchAllTickets();
      console.log("[Tickets] Raw API response:", response);
      // Handle different response formats: {results: [...]}, {value: [...]}, or direct array
      const ticketsData = response.results || response.value || (Array.isArray(response) ? response : []);
      console.log("[Tickets] Extracted ticketsData:", ticketsData);
      if (ticketsData.length > 0) {
        console.log("[Tickets] First ticket requestor_details:", ticketsData[0].requestor_details);
      }

      // Map API response to component format
      const mappedTickets = ticketsData.map((ticket) => {
        // Determine if ticket needs check-in or check-out action
        // Logic:
        // - If checkout_date exists and no asset_checkout → show Checkout button
        // - If asset_checkout exists → show Checkin button
        let isCheckInOrOut = null;
        if (!ticket.is_resolved) {
          if (ticket.asset_checkout) {
            isCheckInOrOut = "Check-In";
          } else if (ticket.checkout_date) {
            isCheckInOrOut = "Check-Out";
          }
        }

        // Disable checkout if checkout_date is in the future
        const disableCheckout =
          isCheckInOrOut === "Check-Out" && isFutureDate(ticket.checkout_date);

        const formattedDate =
          isCheckInOrOut === "Check-In"
            ? ticket.checkin_date?.slice(0, 10)
            : ticket.checkout_date?.slice(0, 10);

        return {
          ...ticket,
          isCheckInOrOut,
          disableCheckout,
          formattedDate,
          // Use location_details.name for display (location is now an integer ID)
          location: ticket.location_details?.name || "Unknown",
        };
      });

      console.log("[Tickets] Mapped tickets:", mappedTickets);
      if (mappedTickets.length > 0) {
        console.log("[Tickets] First mapped ticket requestor_details:", mappedTickets[0].requestor_details);
      }
      setTicketItems(mappedTickets);
      setFilteredData(mappedTickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
      setErrorMessage(
        "Failed to load tickets from server. Please try again later."
      );
      setTicketItems([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tickets on mount and when navigating back with success message
  useEffect(() => {
    console.log("[Tickets] useEffect triggered, calling loadTickets...");
    loadTickets();
  }, [location.key]);

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...ticketItems];

    // Filter by Ticket Number
    if (filters.ticketNumber && filters.ticketNumber.trim() !== "") {
      filtered = filtered.filter((ticket) =>
        ticket.ticketNumber
          ?.toLowerCase()
          .includes(filters.ticketNumber.toLowerCase())
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
        ticket.requestor
          ?.toLowerCase()
          .includes(filters.requestor.toLowerCase())
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
        ticket.requestorLocation
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Filter by Check-In / Check-Out
    if (filters.checkInOut && filters.checkInOut.value !== "All") {
      filtered = filtered.filter(
        (ticket) => ticket.isCheckInOrOut === filters.checkInOut.value
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

  const handleViewClick = async (ticket) => {
    try {
      let assetName = "N/A"; // default if null

      if (ticket.asset !== null && ticket.asset !== undefined) {
        if (ticket.asset === "") {
          assetName = "Unknown";
        } else {
          const isNumeric = !isNaN(ticket.asset);
          const params = isNumeric
            ? { ids: [Number(ticket.asset)] }     // numeric ID
            : { asset_ids: [ticket.asset] };     // asset_id string

          const assetData = await fetchAssetNames(params);
          const name = assetData?.[0]?.name || "Unknown";

          assetName = isNumeric ? name : `${ticket.asset} - ${name}`;
        }
      }

      // Build data array for modal
      const data = [
        { label: "Ticket Number", value: ticket.ticket_number },
        { label: "Subject", value: ticket.subject || "N/A" },
        { label: "Issue Type", value: ticket.issue_type || "N/A" },
        { label: "Location", value: ticket.location_details?.name || "Unknown" },
        { label: "Requestor", value: ticket.requestor_details?.name || "Unknown" },
        { label: "Asset", value: assetName },
      ];

      if (ticket.checkout_date) data.push({ label: "Checkout Date", value: ticket.checkout_date });
      if (ticket.return_date) data.push({ label: "Return Date", value: ticket.return_date });
      if (ticket.checkin_date) data.push({ label: "Checkin Date", value: ticket.checkin_date });

      setSelectedTicket(ticket);
      setViewTicketData(data);
      setIsViewModalOpen(true);

    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setErrorMessage("Failed to load ticket details.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewTicketData(null);
    setSelectedTicket(null);
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

  const handleCheckInOut = async (ticket) => {
    // Use ticket.asset (numeric ID) or ticket.asset_id as fallback
    let assetId = ticket.asset || ticket.asset_id;
    let checkoutId = ticket.asset_checkout;

    if(!checkoutId && ticket.isCheckInOrOut === "Check-In") {
      // Clear first to ensure re-render even if same message
      setErrorMessage("");
      setTimeout(() => {
        setErrorMessage("Missing checkout ID. Cannot perform check-in.");
        setTimeout(() => setErrorMessage(""), 5000);
      }, 10);
      return;
    }

    // If asset ID is missing but we have asset_checkout, fetch asset from checkout
    if (!assetId && checkoutId) {
      try {
        const checkout = await fetchAssetCheckoutById(ticket.asset_checkout);
        assetId = checkout?.asset;
      } catch (error) {
        console.error("Failed to fetch checkout for asset ID:", error);
      }
    }

    if (ticket.isCheckInOrOut === "Check-In") {
      console.log("Navigating to check-in from tickets page for ticket:", ticket);
      navigate(`/assets/check-in/${assetId}`, {
        state: { ticket, fromAsset: false },
      });
    } else {
      console.log("Navigating to check-out from tickets page for ticket:", ticket);
      navigate(`/assets/check-out/${assetId}`, {
        state: { ticket, fromAsset: false },
      });
    }
  };

  // Filter tickets based on search query and applied filters
  let filteredTickets = filteredData.filter((ticket) => {
    const qWords = searchQuery.toLowerCase().trim().split(/\s+/); // split by space
    const fields = [
      ticket.ticketNumber?.toLowerCase() || "",
      ticket.formattedDate?.toLowerCase() || "",
      ticket.requestor_details?.name?.toLowerCase() || "",
      ticket.subject?.toLowerCase() || "",
      ticket.location?.toLowerCase() || "",
    ];

    // Every word in search query must match at least one field
    return qWords.every((word) => fields.some((f) => f.includes(word)));
  });

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
      const newSelectedIds = [
        ...selectedIds,
        ...paginatedTickets.map((ticket) => ticket.id),
      ];
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

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {/* Ticket Filter Modal */}
      <TicketFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      {/* View Ticket Modal */}
      {isViewModalOpen && viewTicketData && (
        <View
          title={`Ticket: ${selectedTicket?.ticket_number || "Details"}`}
          data={viewTicketData}
          closeModal={closeViewModal}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
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
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
                {authService.getUserInfo().role === "Admin" && (
                  <div ref={toggleRef}>
                    <MediumButtons
                      type="export"
                      onClick={() => setExportToggle(!exportToggle)}
                    />
                  </div>
                )}
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : paginatedTickets.length > 0 ? (
                    paginatedTickets.map((ticket) => (
                      <TableItem
                        key={ticket.id}
                        ticket={ticket}
                        isSelected={selectedIds.includes(ticket.id)}
                        onRowChange={handleRowChange}
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