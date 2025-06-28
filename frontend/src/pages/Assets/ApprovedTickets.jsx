import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/ApprovedTickets.css";
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

        const mappedTickets = (response || []).map(ticket => ({
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
        }));

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
      setCheckedItems([...checkedItems, id]);
      if (checkedItems.length + 1 === ticketItems.length) {
        setAllChecked(true);
      }
    }
  };

  const handleViewClick = (item) => {
    setSelectedTicket(item);
    setViewModalOpen(true);
  };

  const handleCheckout = (item) => {
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
  };

  const filteredItems = ticketItems.filter(item =>
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.assetName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    <th>ACTION</th>
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
                          <button
                            className="checkout-btn"
                            onClick={() => handleCheckout(item)}
                          >
                            Check-Out
                          </button>
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
        </div>
      </main>
    </>
  );
};

export default ApprovedTickets;
