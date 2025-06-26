import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/ComponentsButtons.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import ComponentsTableBtn from "../../components/buttons/ComponentsTableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import authService from "../../services/auth-service";
import DefaultImage from "../../assets/img/default-image.jpg";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";

export default function Components() {
  const [components, setComponents] = useState([]);

  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === components.length && components.length > 0;

  const [isLoading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  
  // Page initialization
  useEffect(() => {
    // Check for passed states (success component CRUD)
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    // Initialize page data
    const fetchData = async () => {
      try {
        setLoading(true);
        const compRes = await assetsService.fetchAllComponents();
        setComponents(compRes);
      } catch (error) {
        console.error("Error fetching components:", error);
        setComponents([]);
        setErrorMessage("Failed to load components.");
        setError
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location]);

  // Checkbox toggling
  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : components.map((component) => component.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const res = await assetsService.fetchAllComponents();
      setComponents(res.components || []);
    } catch (error) {
      console.error("Error refreshing components:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (componentId) => {
    // handle view
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
            await fetchProducts();
            setSuccessMessage("Product Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      {isViewModalOpen && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          closeModal={() => setViewModalOpen(false)}
        />
      )}
      <nav>
        <NavBar />
      </nav>
      <main className="page components-page">
        <div className="container">
          {isLoading? (
            <SkeletonLoadingTable />
          ) : (
            <>
              <section className="top">
                <h1>Components</h1>
                <div>
                  <form action="" method="post">
                    <input type="text" placeholder="Search..." />
                  </form>
                  <MediumButtons type="export" />

                  {authService.getUserInfo().role === "Admin" && (
                    <MediumButtons
                      type="new"
                      navigatePage="/components/registration"
                    />
                  )}
                </div>
              </section>
              <section className="middle">
                <table className="components-table">
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
                      <th>NAME</th>
                      <th>CATEGORY</th>
                      <th>MODEL NUMBER</th>
                      <th>AVAILABLE</th>
                      <th>CHECKIN/CHECKOUT</th>
                      {authService.getUserInfo().role === "Admin" && (
                        <>
                          <th>EDIT</th>
                          <th>DELETE</th>
                        </>
                      )}
                      <th>VIEW</th>
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
                        <td>
                          <img src={item.image} alt={item.product} width="50" />
                        </td>
                        <td>{item.componentName}</td>
                        <td>
                          <button
                            className={
                              item.status === "Deployed"
                                ? "check-in-btn"
                                : "check-out-btn"
                            }
                            onClick={() => handleCheckInOut(item)}
                          >
                            {item.status === "Deployed" ? "Check-In" : "Check-Out"}
                          </button>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{item.modelNumber}</td>
                        {authService.getUserInfo().role === "Admin" && (
                          <>
                            <td>
                              <ComponentsTableBtn
                                type="edit"
                                navigatePage={`/components/registration/${item.id}`}
                              />
                            </td>
                            <td>
                              <ComponentsTableBtn
                                type="delete"
                                onClick={() => handleDelete(item.id)}
                              />
                            </td>
                          </>
                        )}
                        <td>
                          <ComponentsTableBtn
                            type="view"
                            navigatePage={`/assets/view/${item.id}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}   
          <section className="bottom"></section>
        </div>
      </main>
    </>
  );
}
