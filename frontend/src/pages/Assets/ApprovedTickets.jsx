import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/ApprovedTickets.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TicketViewModal from "../../components/Modals/TicketViewModal";

const ApprovedTickets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Import images for tickets
  const laptopImage = "/src/assets/img/laptop.png";
  const keyboardImage = "/src/assets/img/keyboard.png";
  const mouseImage = "/src/assets/img/mouse.png";
  const dviImage = "/src/assets/img/dvi.jpeg";

  // Mock data for approved tickets
  const ticketItems = [
    {
      id: "10234-EMP",
      subject: "Laptop Not Booting",
      requestor: "Jane Dela Cruz",
      category: "Software Installation",
      lastUpdated: "April 2, 2025",
      creationDate: "April 2, 2025",
      status: "Resolved",
      notes: "Laptop won't boot past the BIOS screen. User needs this fixed urgently as they have a presentation tomorrow.",
      image: laptopImage
    },
    {
      id: "10235-EMP",
      subject: "Keyboard Replacement",
      requestor: "Mark Villanueva",
      category: "Hardware Replacement",
      lastUpdated: "April 4, 2025",
      creationDate: "April 3, 2025",
      status: "In Progress",
      notes: "Several keys on the keyboard are not working. User needs a replacement as soon as possible.",
      image: keyboardImage
    },
    {
      id: "10236-EMP",
      subject: "New Mouse Request",
      requestor: "Carla Mendoza",
      category: "Peripheral Request",
      lastUpdated: "April 5, 2025",
      creationDate: "April 4, 2025",
      status: "Approved",
      notes: "User needs a new mouse for their workstation. Current one is not working properly.",
      image: mouseImage
    }
  ];

  // Function to toggle select all
  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(ticketItems.map(item => item.id));
    }
    setAllChecked(!allChecked);
  };

  // Function to toggle individual item selection
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

  // Function to handle view button click
  const handleViewClick = (item) => {
    console.log(`View ticket ${item.id}`);
    setSelectedTicket(item);
    setViewModalOpen(true);
  };

  // Function to handle checkout button click
  const handleCheckout = (item) => {
    console.log(`Checkout ticket ${item.id}`);

    // Map ticket categories to asset types for demonstration
    const assetTypeMap = {
      "Software Installation": "Laptop",
      "Hardware Replacement": "Keyboard",
      "Peripheral Request": "Mouse"
    };

    // Create a mock asset based on the ticket information
    const mockAsset = {
      id: item.id,
      image: dviImage, // Always use dvi.jpeg image
      assetId: `ASSET-${item.id}`,
      product: assetTypeMap[item.category] || "Generic Asset",
    };

    // Navigate to the asset checkout page with the mock asset information
    navigate(`/assets/check-out/${item.id}`, {
      state: {
        id: item.id,
        image: mockAsset.image,
        assetId: mockAsset.assetId,
        product: mockAsset.product,
        ticketId: item.id,
        ticketSubject: item.subject,
        ticketRequestor: item.requestor
      },
    });
  };

  // Filter items based on search query
  const filteredItems = ticketItems.filter(item =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
              <form action="" method="post">
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
            <table style={{ borderSpacing: '0', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={{ textAlign: 'left', paddingRight: '0', width: '120px' }}>TICKET NUMBER</th>
                  <th style={{ textAlign: 'center', paddingLeft: '0', paddingRight: '0', width: '90px' }}>CHECKOUT</th>
                  <th style={{ textAlign: 'left' }}>SUBJECT</th>
                  <th style={{ textAlign: 'left' }}>REQUESTOR</th>
                  <th style={{ textAlign: 'left' }}>CATEGORY</th>
                  <th style={{ textAlign: 'center', width: '130px', whiteSpace: 'nowrap', paddingRight: '15px' }}>LAST UPDATED</th>
                  <th style={{ textAlign: 'center', width: '130px', whiteSpace: 'nowrap', paddingRight: '15px' }}>CREATION DATE</th>
                  <th style={{ textAlign: 'center', width: '80px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(item.id)}
                        onChange={() => toggleItemCheck(item.id)}
                      />
                    </td>
                    <td style={{ textAlign: 'left', paddingRight: '0', width: '120px' }}>{item.id}</td>
                    <td style={{ textAlign: 'center', paddingLeft: '0', paddingRight: '0', width: '90px' }}>
                      <button
                        className="checkout-btn"
                        onClick={() => handleCheckout(item)}
                      >
                        Check-Out
                      </button>
                    </td>
                    <td style={{ textAlign: 'left' }}>{item.subject}</td>
                    <td style={{ textAlign: 'left' }}>{item.requestor}</td>
                    <td style={{ textAlign: 'left' }}>{item.category}</td>
                    <td style={{ textAlign: 'center', width: '130px', whiteSpace: 'nowrap', paddingRight: '15px' }}>{item.lastUpdated}</td>
                    <td style={{ textAlign: 'center', width: '130px', whiteSpace: 'nowrap', paddingRight: '15px' }}>{item.creationDate}</td>
                    <td style={{ textAlign: 'center', width: '80px', padding: '8px' }}>
                      <button
                        className="view-btn"
                        onClick={() => handleViewClick(item)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          minWidth: '50px',
                          textAlign: 'center',
                          display: 'block',
                          margin: '0 auto',
                          height: '26px'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
};

export default ApprovedTickets;
