import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate from react-router-dom
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/Assets.css"; // Import Assets-specific styles
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";

export default function Assets() {
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === assets.length;

  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check for success messages passed from other components
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      
      // Clear the success message from location state after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
    
    const fetchData = async () => {
      try {
        // Fetch all assets
        const assetsResponse = await assetsService.fetchAllAssets();
        console.log("Assets response:", assetsResponse);
        setAssets(assetsResponse.assets || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAssets([]);
      }
    };

    fetchData();
  }, [location]);

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(assets.map((asset) => asset.id));
    }
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((assets) => asset.id !== id) : [...prev, id]
    );
  };

  // Refresh assets after deletion
  const fetchAssets = async () => {
    try {
      const assetsResponse = await assetsService.fetchAllAssets();
      setAssets(assetsResponse.assets || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    }
  };

  const handleCheckInOut = (asset) => {
    if (asset.status === 'Deployed') {
      // Navigate to check-in page
      navigate(`/assets/check-in/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.name,
          image: asset.image ? `https://assets-service-production.up.railway.app${asset.image}` : DefaultImage,
          employee: asset.assigned_to || 'Not assigned',
          checkOutDate: asset.checkout_date || 'Unknown',
          returnDate: asset.expected_return_date || 'Unknown',
          condition: asset.condition || 'Unknown'
        }
      });
    } else if (asset.status === 'Ready to Deploy') {
      // Navigate to check-out page
      navigate(`/assets/check-out/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.product,
          image: asset.image ? `https://assets-service-production.up.railway.app${asset.image}` : DefaultImage
        }
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
            setErrorMessage("");
            
            setTimeout(() => {
              setSuccessMessage("");
            }, 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again."); // Show error message immediately
            setSuccessMessage(""); // Clear any success messages
            
            // Auto-hide the error message after 5 seconds
            setTimeout(() => {
              setErrorMessage("");
            }, 5000);
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
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" />
              <MediumButtons type="new" navigatePage="/assets/registration" />
            </div>
          </section>
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
                {assets.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan="9" className="no-products-message">
                        <p>No assets found. Please add some assets.</p>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(asset.id)}
                            onChange={() => toggleItem(asset.id)}
                          />
                        </td>
                        <td>
                          {asset.image ? (
                            <img
                              src={`https://assets-service-production.up.railway.app${asset.image}`}
                              alt={`Asset-${asset.name}`}
                              width="50"
                              key={`img-${asset.id}`}
                              onError={(e) => {
                                console.log(`Error loading image for asset ${asset.id}`);
                                e.target.src = DefaultImage;
                              }}
                            />
                          ) : (
                            <img
                              src={DefaultImage}
                              alt={`Asset-${asset.name}`}
                              width="50"
                              key={`img-${asset.id}`}
                            />
                          )}
                        </td>
                        <td>{asset.displayed_id}</td>
                        <td>{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>
                          {asset.status === 'Deployed' ? (
                            <button
                              className="check-in-btn"
                              onClick={() => handleCheckInOut(asset)}
                            >
                              Check-In
                            </button>
                          ) : asset.status === 'Ready to Deploy' ? (
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
                              setEndPoint(`https://assets-service-production.up.railway.app/assets/${asset.id}/delete/`)
                              setDeleteModalOpen(true);
                            }}
                            data={asset.id}
                          />
                        </td>
                        <td>
                          <TableBtn type="view" navigatePage={`/assets/view/${asset.id}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
            </table>
          </section>
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
