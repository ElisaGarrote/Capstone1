import "../../styles/custom-colors.css";
import "../../styles/CheckedOutList.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/PageTable.css";
import React, { useEffect, useState } from "react";
import assetsService from "../../services/assets-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import Alert from "../../components/Alert";

export default function ComponentCheckedoutList() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Store both the component metadata and the pending checkouts
  const [componentInfo, setComponentInfo] = useState({});
  const [pendingCheckouts, setPendingCheckouts] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const allChecked = checkedItems.length === pendingCheckouts.length && pendingCheckouts.length > 0;

  useEffect(() => {
    const fetchPendingCheckouts = async () => {
      try {
        setIsLoading(true);
        const data = await assetsService.fetchPendingComponentCheckouts(id);
        console.log("Fetched component and pending checkouts:", data);

        // Defensive fallback
        if (data) {
          setComponentInfo({
            id: data.id,
            name: data.name,
            image: data.image
          });
          setPendingCheckouts(data.pending_checkouts || []);
        } else {
          setComponentInfo({});
          setPendingCheckouts([]);
        }
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

  const handleCheckIn = (item) => {
    navigate(`/components/check-in/${item.id}`, {
      state: {
        ...item,
        componentName: componentInfo.name,
      }
    });
  };

  const handleBulkCheckIn = () => {
    if (checkedItems.length === 0) return;
    navigate("/components/check-in/0", {
      state: {
        ids: checkedItems,
        component: componentInfo.id,
        componentName: componentInfo.name,
        componentImage: componentInfo.image
      }
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
            title={componentInfo.name || "Component"}
          />
        </section>
        <div className="container">
          {errorMessage && <Alert message={errorMessage} type="danger" />}

          <section className="top">
            <p>Please select which component checkouts you want to check-in.</p>
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
                          onClick={() => handleCheckIn(item)}
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