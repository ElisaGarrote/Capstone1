import "../../styles/custom-colors.css";
import "../../styles/CheckedOutList.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/PageTable.css";
import React, { useEffect, useState } from "react";
import assetsService from "../../services/assets-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import Alert from "../../components/Alert";

export default function CheckOutList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name } = location.state || {};

  const [checkedItems, setCheckedItems] = useState([]);
  const [pendingCheckouts, setPendingCheckouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const allChecked = checkedItems.length === pendingCheckouts.length && pendingCheckouts.length > 0;

  useEffect(() => {
    const fetchPendingCheckouts = async () => {
      try {
        setIsLoading(true);
        const data = await assetsService.fetchPendingComponentCheckouts(id);
        setPendingCheckouts(data || []);
      } catch (error) {
        console.error("Error fetching pending checkouts:", error);
        setErrorMessage("Failed to load pending checkouts.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPendingCheckouts();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : pendingCheckouts.map((item) => item.id));
  };

  const toggleItem = (itemId) => {
    setCheckedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCheckIn = (itemId) => {
    navigate(`/components/check-in/${itemId}`, {
      state: { id: itemId },
    });
  };

  const handleBulkCheckIn = () => {
    if (checkedItems.length === 0) return;
    navigate("/components/check-in/0", {
      state: { ids: checkedItems },
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
          {errorMessage && <Alert message={errorMessage} type="danger" />}
          <section className="top">
            <p>
              Please select which component checkouts you want to check-in.
            </p>
            <button onClick={handleBulkCheckIn} disabled={checkedItems.length === 0}>
              Bulk Check-In
            </button>
          </section>
          <section className="middle">
            {isLoading ? (
              <SkeletonLoadingTable />
            ) : pendingCheckouts.length === 0 ? (
              <p className="no-data-message">No pending checkouts found.</p>
            ) : (
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
                    <th>ASSET</th>
                    <th>QUANTITY</th>
                    <th>NOTES</th>
                    <th>CHECK-IN</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCheckouts.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                      </td>
                      <td>{new Date(item.checkout_date).toLocaleString()}</td>
                      <td>{item.asset_displayed_id} - {item.asset_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.notes || "-"}</td>
                      <td>
                        <button
                          className="cmp-check-in-btn"
                          onClick={() => handleCheckIn(item.id)}
                        >
                          Check-In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
