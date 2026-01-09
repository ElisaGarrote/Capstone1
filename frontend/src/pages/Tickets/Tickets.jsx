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
import TicketTabNavBar from "../../components/TicketTabNavBar";
import TicketsMockupData from "../../data/mockData/tickets/tickets-mockup-data.json";
import DefaultImage from "../../assets/img/default-image.jpg";
import RightArrowIcon from "../../assets/icons/right-arrow.svg";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/Tickets/Tickets.css";

function TableHeader({ allSelected, onHeaderChange, ticketType }) {
  const renderHeaders = () => {
    switch (ticketType) {
      case "registration":
        return (
          <>
            <th>TICKET ID</th>
            <th>CATEGORY</th>
            <th>SUB-CATEGORY</th>
            <th>ASSET MODEL NAME</th>
            <th>ASSET SERIAL NUMBER</th>
            <th>PURCHASED DATE</th>
          </>
        );
      case "check-out":
        return (
          <>
            <th>TICKET ID</th>
            <th>CATEGORY</th>
            <th>SUB-CATEGORY</th>
            <th>ASSET ID NUMBER</th>
            <th>LOCATION</th>
            <th>STATUS</th>
            <th>REQUEST DATE</th>
          </>
        );
      case "check-in":
        return (
          <>
            <th>TICKET ID</th>
            <th>CATEGORY</th>
            <th>SUB-CATEGORY</th>
            <th>ASSET ID NUMBER</th>
            <th>LOCATION</th>
            <th>STATUS</th>
            <th>CHECKIN DATE</th>
          </>
        );
      case "repair":
        return (
          <>
            <th>TICKET</th>
            <th>CATEGORY</th>
            <th>SUB-CATEGORY</th>
            <th>REPAIR NAME</th>
            <th>REPAIR TYPE</th>
            <th>START DATE</th>
            <th>END DATE</th>
          </>
        );
      case "incident":
        return (
          <>
            <th>TICKET ID</th>
            <th>CATEGORY</th>
            <th>SUB-CATEGORY</th>
            <th>ASSET ID NUMBER</th>
            <th>INCIDENT DATE</th>
            <th>EMPLOYEE NAME</th>
            <th>SCHEDULE AUDIT</th>
          </>
        );
      default:
        return (
          <>
            <th>TICKET ID</th>
            <th>TYPE</th>
            <th>CATEGORY</th>
            <th>SUBJECT</th>
            <th>REQUESTOR</th>
          </>
        );
    }
  };

  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onHeaderChange}
        />
      </th>
      {renderHeaders()}
      <th>ACTIONS</th>
    </tr>
  );
}

function TableItem({ ticket, isSelected, onRowChange, onDeleteClick, onViewClick, onCheckInOut, ticketType }) {
  const renderColumns = () => {
    switch (ticketType) {
      case "registration":
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subcategory || "-"}</td>
            <td>{ticket.assetModelName || "-"}</td>
            <td>{ticket.serialNumber || "-"}</td>
            <td>{ticket.purchasedDate || "-"}</td>
          </>
        );
      case "check-out":
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subcategory || "-"}</td>
            <td>{ticket.assetId || "-"}</td>
            <td>{ticket.requestorLocation || "-"}</td>
            <td>{ticket.status || "-"}</td>
            <td>{ticket.checkoutDate || "-"}</td>
          </>
        );
      case "check-in":
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subcategory || "-"}</td>
            <td>{ticket.assetId || "-"}</td>
            <td>{ticket.requestorLocation || "-"}</td>
            <td>{ticket.status || "-"}</td>
            <td>{ticket.checkinDate || "-"}</td>
          </>
        );
      case "repair":
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subcategory || "-"}</td>
            <td>{ticket.repairName || "-"}</td>
            <td>{ticket.repairType || "-"}</td>
            <td>{ticket.startDate || "-"}</td>
            <td>{ticket.endDate || "-"}</td>
          </>
        );
      case "incident":
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subcategory || "-"}</td>
            <td>{ticket.assetId || "-"}</td>
            <td>{ticket.incidentDate || "-"}</td>
            <td>{ticket.requestor || "-"}</td>
            <td>{ticket.scheduleAudit || "-"}</td>
          </>
        );
      default: // "all"
        return (
          <>
            <td>{ticket.id}</td>
            <td>{ticket.ticketType ? ticket.ticketType.charAt(0).toUpperCase() + ticket.ticketType.slice(1).toLowerCase() : "-"}</td>
            <td>{ticket.category || "-"}</td>
            <td>{ticket.subject || "-"}</td>
            <td>{ticket.requestor || "-"}</td>
          </>
        );
    }
  };

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(ticket.id, e.target.checked)}
        />
      </td>
      {renderColumns()}
      <td>
        <ActionButtons
          showEdit={false}
          showDelete={true}
          showView
          onViewClick={() => onViewClick(ticket)}
          onDeleteClick={() => onDeleteClick(ticket)}
        />
      </td>
    </tr>
  );
}

const Tickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleRef = useRef(null);

  const [ticketItems, setTicketItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
  const [currentTab, setCurrentTab] = useState(
    location.pathname.split("/")[2] || "all"
  );
  const [ticketCounts, setTicketCounts] = useState({});
  // Initialize ticketView from localStorage or default to "approved"
  const [ticketView, setTicketView] = useState(() => {
    return localStorage.getItem("ticketView") || "approved";
  });
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  
  // Store reference to original tickets for stable counts calculation
  const ticketItemsRef = useRef([]);

  // Map ticket categories to tab keys
  const categoryToTabKey = {
    "Registration": "registration",
    "Check-Out": "check-out",
    "Check-In": "check-in",
    "Repair": "repair",
    "Incident": "incident",
    "Disposal": "disposal",
    // Map existing categories to appropriate tabs
    "Hardware Issue": "repair",
    "Software Request": "registration",
    "Performance Issue": "incident",
  };

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

          // Determine ticket type based on category
          let ticketType = "all";
          if (ticket.category && categoryToTabKey[ticket.category]) {
            ticketType = categoryToTabKey[ticket.category];
          }

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
            checkinDate: ticket.checkin_date,
            image: DefaultImage,
            isResolved: ticket.is_resolved,
            isCheckInOrOut,
            category: ticket.category,
            status: ticket.status || "-",
            subcategory: ticket.subcategory || "-",
            assetModelName: ticket.assetModelName || "-",
            serialNumber: ticket.serialNumber || "-",
            purchasedDate: ticket.purchasedDate || "-",
            repairName: ticket.repairName || "-",
            repairType: ticket.repairType || "-",
            startDate: ticket.startDate || "-",
            endDate: ticket.endDate || "-",
            incidentDate: ticket.incidentDate || "-",
            scheduleAudit: ticket.scheduleAudit || "-",
            ticketType,
          };
        });

        // Calculate counts for each ticket type
        const counts = {
          all: mappedTickets.length,
          registration: mappedTickets.filter(t => t.ticketType === "registration").length,
          "check-out": mappedTickets.filter(t => t.ticketType === "check-out").length,
          "check-in": mappedTickets.filter(t => t.ticketType === "check-in").length,
          repair: mappedTickets.filter(t => t.ticketType === "repair").length,
          incident: mappedTickets.filter(t => t.ticketType === "incident").length,
          disposal: mappedTickets.filter(t => t.ticketType === "disposal").length,
        };
        setTicketCounts(counts);

        setTicketItems(mappedTickets);
        ticketItemsRef.current = mappedTickets;
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

  useEffect(() => {
    const tabFromPath = location.pathname.split("/")[2] || "all";
    setCurrentTab(tabFromPath);
  }, [location.pathname]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, [location]);

  const handleExport = () => {
    const dataToExport = filteredTickets.length > 0 ? filteredTickets : ticketItems;
    exportToExcel(dataToExport, "Tickets_Records.xlsx");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const titleSection = document.querySelector(".audit-title-page-section");
      if (titleSection && !titleSection.contains(event.target) && showViewDropdown) {
        setShowViewDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showViewDropdown]);

  useEffect(() => {
    let viewFilteredTickets = ticketItemsRef.current;
    
    // Filter by view (approved/resolved)
    viewFilteredTickets = viewFilteredTickets.filter(ticket => {
      if (ticketView === "approved" && ticket.isResolved) {
        return false;
      }
      if (ticketView === "resolved" && !ticket.isResolved) {
        return false;
      }
      return true;
    });

    const counts = {
      all: viewFilteredTickets.length,
      registration: viewFilteredTickets.filter(t => t.ticketType === "registration").length,
      "check-out": viewFilteredTickets.filter(t => t.ticketType === "check-out").length,
      "check-in": viewFilteredTickets.filter(t => t.ticketType === "check-in").length,
      repair: viewFilteredTickets.filter(t => t.ticketType === "repair").length,
      incident: viewFilteredTickets.filter(t => t.ticketType === "incident").length,
      disposal: viewFilteredTickets.filter(t => t.ticketType === "disposal").length,
    };
    setTicketCounts(counts);
  }, [ticketView]);

  useEffect(() => {
    localStorage.setItem("ticketView", ticketView);
  }, [ticketView]);

  const getColumnCount = () => {
    switch (currentTab) {
      case "registration":
        return 8;
      case "check-out":
        return 9;
      case "check-in":
        return 9;
      case "repair":
        return 9;
      case "incident":
        return 9;
      case "all":
        return 7;
      default:
        return 7;
    }
  };

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

  let filteredTickets = filteredData.filter(ticket => {
    // Filter by view
    if (ticketView === "approved" && ticket.isResolved) {
      return false;
    }
    if (ticketView === "resolved" && !ticket.isResolved) {
      return false;
    }
    // Filter by tab
    if (currentTab !== "all" && ticket.ticketType !== currentTab) {
      return false;
    }
    // Filter by search query
    return (
      ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requestor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
          <section className="audit-title-page-section">
            <div className="ticket-title-container">
              <h1>
                {ticketView === "approved" ? "Approved Tickets" : "Resolved Tickets"}
              </h1>
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="view-toggle-button"
              >
                <img
                  src={RightArrowIcon}
                  alt="dropdown"
                  className="view-toggle-icon"
                  style={{
                    transform: showViewDropdown ? "rotate(-90deg)" : "rotate(90deg)",
                  }}
                />
              </button>
              {showViewDropdown && (
                <div className="view-dropdown-menu">
                  <button
                    onClick={() => {
                      setTicketView("approved");
                      setShowViewDropdown(false);
                    }}
                    className={`dropdown-item ${ticketView === "approved" ? "active" : ""}`}
                  >
                    Approved Tickets
                  </button>
                  <button
                    onClick={() => {
                      setTicketView("resolved");
                      setShowViewDropdown(false);
                    }}
                    className={`dropdown-item ${ticketView === "resolved" ? "active" : ""}`}
                  >
                    Resolved Tickets
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <TicketTabNavBar ticketCounts={ticketCounts} />
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">
                {currentTab === "all" && `All`}
                {currentTab === "registration" && `Registration Tickets`}
                {currentTab === "check-out" && `Check-out Tickets`}
                {currentTab === "check-in" && `Check-in Tickets`}
                {currentTab === "repair" && `Repair Tickets`}
                {currentTab === "incident" && `Incident Tickets`}
                {currentTab === "disposal" && `Disposal Tickets`}
                {` (${filteredTickets.length})`}
              </h2>
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
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="tickets-table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                    ticketType={currentTab}
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
                        ticketType={currentTab}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={getColumnCount()} className="no-data-message">
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