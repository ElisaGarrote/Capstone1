import "../../styles/custom-colors.css";
import "../../styles/CheckedOutList.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/PageTable.css";
import React, { useState } from "react";

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
        <section className="table-header">
          <TopSecFormPage
            root="Components"
            currentPage="Check-In Components"
            rootNavigatePage="/components"
            title={name}
          />
        </section>
        <div className="container">
            <section className="top">
                <p>Please select which employee/location's "{name}" you would like to check-in.</p>
                <button onClick={handleBulkCheckIn}>Bulk Check-In</button>
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
                      <th>CHECK-OUT DATE</th>
                      <th>USER</th>
                      <th>CHECKED-OUT TO</th>
                      <th>NOTES</th>
                      <th>CHECKIN</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sampleItems.map((item) => (
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
                    ))}
                    </tbody>
                </table>
            </section>
            <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}