import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";

export default function Assets() {
  const location = useLocation();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const allChecked = checkedItems.length === assets.length && assets.length > 0;

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await assetsService.fetchAllAssets();
        setAssets(response.assets || []);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setAssets([]);
        setErrorMessage("Failed to load assets.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : assets.map((asset) => asset.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetsService.fetchAllAssets();
      setAssets(response.assets || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = (asset) => {
    const baseImage = asset.image
      ? `https://assets-service-production.up.railway.app${asset.image}`
      : DefaultImage;

    if (asset.status === "Deployed") {
      navigate(`/assets/check-in/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.name,
          image: baseImage,
          employee: asset.assigned_to || "Not assigned",
          checkOutDate: asset.checkout_date || "Unknown",
          returnDate: asset.expected_return_date || "Unknown",
          condition: asset.condition || "Unknown",
        },
      });
    } else if (asset.status === "Ready to Deploy") {
      navigate(`/assets/check-out/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.product,
          image: baseImage,
        },
      });
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchAssets();
            setSuccessMessage("Asset Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      <nav>
        <NavBar />
      </nav>

      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Assets</h1>
            <div>
              <form>
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/assets/registration" />
            </div>
          </section>

          {isLoading ? (
            <SkeletonLoadingTable />
          ) : (
            <section className="middle">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>IMAGE</th>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>CHECKIN/CHECKOUT</th>
                    <th>STATUS</th>
                    <th>EDIT</th>
                    <th>DELETE</th>
                    <th>VIEW</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-products-message">
                        <p>No assets found. Please add some assets.</p>
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(asset.id)}
                            onChange={() => toggleItem(asset.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={
                              asset.image
                                ? `https://assets-service-production.up.railway.app${asset.image}`
                                : DefaultImage
                            }
                            alt={`Asset-${asset.name}`}
                            onError={(e) => {
                              e.target.src = DefaultImage;
                            }}
                          />
                        </td>
                        <td>{asset.displayed_id}</td>
                        <td>{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>
                          {asset.status === "Deployed" ? (
                            <button
                              className="check-in-btn"
                              onClick={() => handleCheckInOut(asset)}
                            >
                              Check-In
                            </button>
                          ) : asset.status === "Ready to Deploy" ? (
                            <button
                              className="check-out-btn"
                              onClick={() => handleCheckInOut(asset)}
                            >
                              Check-Out
                            </button>
                          ) : null}
                        </td>
                        <td>{asset.status}</td>
                        <td>
                          <TableBtn
                            type="edit"
                            navigatePage={`/assets/registration/${asset.id}`}
                            data={asset.id}
                          />
                        </td>
                        <td>
                          <TableBtn
                            type="delete"
                            showModal={() => {
                              setEndPoint(
                                `https://assets-service-production.up.railway.app/assets/${asset.id}/delete/`
                              );
                              setDeleteModalOpen(true);
                            }}
                            data={asset.id}
                          />
                        </td>
                        <td>
                          <TableBtn
                            type="view"
                            navigatePage={`/assets/view/${asset.id}`}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </>
  );
}