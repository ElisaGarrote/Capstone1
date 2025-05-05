import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/ApprovedTickets.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";

const ApprovedTickets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  // Mock data for approved tickets
  const ticketItems = [
    {
      id: "10234-EMP",
      subject: "Laptop Not Booting",
      requestor: "Jane Dela Cruz",
      category: "Software Installation",
      lastUpdated: "April 2, 2025",
      creationDate: "April 2, 2025",
      status: "Resolved"
    },
    {
      id: "10235-EMP",
      subject: "Keyboard Replacement",
      requestor: "Mark Villanueva",
      category: "Hardware Replacement",
      lastUpdated: "April 4, 2025",
      creationDate: "April 3, 2025",
      status: "In Progress"
    },
    {
      id: "10236-EMP",
      subject: "New Mouse Request",
      requestor: "Carla Mendoza",
      category: "Peripheral Request",
      lastUpdated: "April 5, 2025",
      creationDate: "April 4, 2025",
      status: "Approved"
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
  const handleViewClick = (id) => {
    console.log(`View ticket ${id}`);
    // Navigate to view ticket page (to be implemented)
    // navigate(`/approved-tickets/view/${id}`);
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
                  <th>REQUESTOR</th>
                  <th>CATEGORY</th>
                  <th>LAST UPDATED</th>
                  <th>CREATION DATE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
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
                    <td>{item.requestor}</td>
                    <td>{item.category}</td>
                    <td>{item.lastUpdated}</td>
                    <td>{item.creationDate}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewClick(item.id)}
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
