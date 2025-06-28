import "../../styles/custom-colors.css";
import "../../styles/CheckedOutList.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/PageTable.css";
import React, { useState } from "react";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

const sampleItems = [
  {
    id: 1,
    checkOutDate: '2023-10-01',
    user: 'John Doe',
    asset: 'Dell XPS 13',
    notes: 'For software development',
    checkInDate: '',
  },
  {
    id: 2,
    checkOutDate: '2023-10-02',
    user: 'Jane Smith',
    asset: 'Logitech Mouse',
    notes: 'For testing purposes',
    checkInDate: '',
  },
];

export default function CheckOutList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name, category } = location.state || {};
  const [checkedItems, setCheckedItems] = useState([]);

  // Pagination logic
  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(sampleItems, 20);

  const allChecked = checkedItems.length === sampleItems.length;

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(sampleItems.map((item) => item.id));
    }
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleCheckIn = (itemId) => {
    console.log(`Check-in-out record id: ${itemId}`);
    navigate(`/components/check-in/${itemId}`, {
      state: { id: itemId }
    });
  };

  const handleBulkCheckIn = () => {
    if (checkedItems.length === 0) return; // optional guard
    console.log(`Bulk check-in for items: ${checkedItems.join(", ")}`);
    navigate("/components/check-in/0", {
      state: { ids: checkedItems }
    });
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="list-page">
        <TopSecFormPage
          root="Components"
          currentPage="Check-In Components"
          rootNavigatePage="/components"
          title={name}
        />
        <div className="container">
            <section className="top">
                <p>Please select which employee/location's "{name}" you would like to check-in.</p>
                <button onClick={handleBulkCheckIn}>Bulk Check-In</button>
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
                      <th>CHECK-OUT DATE</th>
                      <th>USER</th>
                      <th>CHECKED-OUT TO</th>
                      <th>NOTES</th>
                      <th>CHECKIN</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sampleItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-items-message">
                          <p>No check-out records found.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                          />
                        </td>
                        <td>{item.checkOutDate}</td>
                        <td>{item.user}</td>
                        <td>{item.asset}</td>
                        <td>{item.notes}</td>
                        <td>
                            <button
                              className="cmp-check-in-btn"
                              onClick={() => handleCheckIn(item.id)}
                            >
                              {"Check-In"}
                            </button>
                        </td>
                      </tr>
                      ))
                    )}
                    </tbody>
                </table>
              </div>
            </section>

            {/* Pagination */}
            {sampleItems.length > 0 && (
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
}