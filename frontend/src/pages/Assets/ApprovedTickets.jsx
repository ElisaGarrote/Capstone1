import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/ApprovedTicketsTable.css";
import "../../styles/StandardizedButtons.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TicketViewModal from "../../components/Modals/TicketViewModal";
import Pagination from "../../components/Pagination";
import TableBtn from "../../components/buttons/TableButtons";

const ApprovedTickets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [itemStatuses, setItemStatuses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

    // Update the status to checked out
    setItemStatuses(prev => ({
      ...prev,
      [item.id]: 'checked-out'
    }));

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

  // Function to handle check-in button click
  const handleCheckin = (item) => {
    console.log(`Check-in ticket ${item.id}`);

    // Update the status to checked in
    setItemStatuses(prev => ({
      ...prev,
      [item.id]: 'checked-in'
    }));
  };

  // Filter items based on search query
  const filteredItems = ticketItems.filter(item =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.requestor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
      {isViewModalOpen && selectedTicket && (
        <TicketViewModal
          ticket={selectedTicket}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      <nav>
        <NavBar />
      </nav>
      <main className="page approved-tickets-page">
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
            <div className="table-wrapper">
              <table>
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
                    <th>SUBJECT</th>
                    <th>CATEGORY</th>
                    <th>REQUESTOR</th>
                    <th>CREATION DATE</th>
                    <th>LAST UPDATED</th>
                    <th>NOTES</th>
                    <th>CHECKIN/OUT</th>
                    <th>VIEW</th>
                  </tr>
                </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-tickets-message">
                      <p>No approved tickets found.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item.id)}
                          onChange={() => toggleItemCheck(item.id)}
                        />
                      </td>
                      <td>{item.id}</td>
                      <td>{item.subject}</td>
                      <td>{item.category}</td>
                      <td>{item.requestor}</td>
                      <td>{item.creationDate}</td>
                      <td>{item.lastUpdated}</td>
                      <td>{item.notes || 'No notes'}</td>
                      <td>
                        {itemStatuses[item.id] === 'checked-out' ? (
                          <button
                            className="check-in-btn"
                            onClick={() => handleCheckin(item)}
                          >
                            Check In
                          </button>
                        ) : (
                          <button
                            className="check-out-btn"
                            onClick={() => handleCheckout(item)}
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                      <td>
                        <TableBtn
                          type="view"
                          onClick={() => handleViewClick(item)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
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
