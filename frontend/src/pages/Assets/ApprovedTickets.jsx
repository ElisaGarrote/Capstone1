import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/ApprovedTicketsTable.css";
import "../../styles/StandardizedButtons.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TicketViewModal from "../../components/Modals/TicketViewModal";
import dtsService from "../../services/dts-integration-service";
import Alert from "../../components/Alert";
import DefaultImage from "../../assets/img/default-image.jpg";

const ApprovedTickets = () => {
  const navigate = useNavigate();

  const [ticketItems, setTicketItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(ticketItems.map(item => item.id));
    }
    setAllChecked(!allChecked);
  };

  const toggleItemCheck = (id) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(item => item !== id));
      setAllChecked(false);
    } else {
      const updated = [...checkedItems, id];
      setCheckedItems(updated);
      if (updated.length === ticketItems.length) {
        setAllChecked(true);
      }
    }
  };

  const handleViewClick = (item) => {
    setSelectedTicket(item);
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

  const filteredItems = ticketItems.filter(item =>
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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

      <nav>
        <NavBar />
      </nav>

      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Approved Tickets</h1>
            <div>
              <form>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <MediumButtons type="export" />
            </div>
          </section>

          <section className="middle">
            {isLoading ? (
              <p>Loading tickets...</p>
            ) : (
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>TICKET NUMBER</th>
                    <th>ASSET</th>
                    <th>REQUESTOR</th>
                    <th>SUBJECT</th>
                    <th>LOCATION</th>
                    <th>CHECKIN/OUT</th>
                    <th>VIEW</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center' }}>
                        No tickets found.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(item.id)}
                            onChange={() => toggleItemCheck(item.id)}
                          />
                        </td>
                        <td>{item.id}</td>
                        <td>{item.assetName}</td>
                        <td>{item.requestor}</td>
                        <td>{item.subject}</td>
                        <td>{item.requestorLocation}</td>
                        <td>
                          {item.isCheckInOrOut && (
                            <button
                              className={item.isCheckInOrOut === "Check-In" ? "check-in-btn" : "check-out-btn"}
                              onClick={() => handleCheckInOut(item)}
                            >
                              {item.isCheckInOrOut}
                            </button>
                          )}
                        </td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => handleViewClick(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </section>

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default ApprovedTickets;
