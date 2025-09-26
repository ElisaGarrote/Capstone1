import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import "../../styles/ComponentsButtons.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import authService from "../../services/auth-service";
import DefaultImage from "../../assets/img/default-image.jpg";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import Alert from "../../components/Alert";
import DeleteModal from "../../components/Modals/DeleteModal";
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

  const navigate = useNavigate();

  // Page initialization
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const compRes = await assetsService.fetchAllComponents();
        setComponents(compRes);
      } catch (error) {
        console.error("Error fetching components:", error);
        setComponents([]);
        setErrorMessage("Failed to load components.");
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

  const handleCheckIn = (item) => {
    navigate(`/components/checked-out-list/${item.id}`);
  };

  const handleCheckOut = (item) => {
    const available = item.quantity - item.checked_out;
    navigate(`/components/check-out/${item.id}`, {
      state: {
        image: item.image,
        name: item.name,
        category: item.category || "N/A",
        available,
      },
    });
  };

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const response = await assetsService.fetchAllComponents();
      setComponents(response.components || []);
    } catch (error) {
      console.error("Error fetching components:", error);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (componentId) => {
    // handle view logic
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
            await fetchComponents();
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
      <main className="page components-page">
        <div className="container">
          {isLoading ? (
            <SkeletonLoadingTable />
          ) : (
            <>
              <section className="top">
                <h1>Components</h1>
                <div>
                  <form>
                    <input type="text" placeholder="Search..." />
                  </form>
                  <MediumButtons type="export" />
                  {authService.getUserInfo().role === "Admin" && (
                    <MediumButtons type="new" navigatePage="/components/registration" />
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
                      <th>AVAILABLE</th>
                      <th>CHECKIN</th>
                      <th>CHECKOUT</th>
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
                    {components.map((item) => {
                      const available = item.quantity - item.checked_out;

                      return (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(item.id)}
                              onChange={() => toggleItem(item.id)}
                            />
                          </td>
                          <td>
                            <img
                              src={item.image || DefaultImage}
                              alt={item.name}
                              width="50"
                            />
                          </td>
                          <td>{item.name}</td>
                          <td>{item.category || "N/A"}</td>
                          <td>
                            <span className="progress-container">
                              <span className="progress-text" style={{ color: "#34c759" }}>
                                {available}/{item.quantity}
                              </span>
                              <progress value={item.available_quantity} max={item.quantity}></progress>
                            </span>
                          </td>
                          <td>
                            <button
                              className="check-in-btn"
                              onClick={() => handleCheckIn(item)}
                              disabled={item.checked_out === 0}
                              title={item.checked_out === 0 ? "No items to check in" : "Check in component"}
                            >
                              Check-In
                            </button>
                          </td>
                          <td>
                            <button
                              className="check-out-btn"
                              onClick={() => handleCheckOut(item)}
                              disabled={available === 0}
                              title={available === 0 ? "No available components" : "Check out component"}
                            >
                              Check-Out
                            </button>
                          </td>
                          {authService.getUserInfo().role === "Admin" && (
                            <>
                              <td>
                                <TableBtn
                                  type="edit"
                                  navigatePage={`/components/registration/${item.id}`}
                                  data={item.id}
                                />
                              </td>
                              <td>
                                <TableBtn
                                  type="delete"
                                  showModal={() => {
                                    setEndPoint(
                                      `https://assets-service-production.up.railway.app/components/${item.id}/delete/`
                                    );
                                    setDeleteModalOpen(true);
                                  }}
                                  data={item.id}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <TableBtn
                              type="view"
                              onClick={() => handleView(item.id)}
                            />
                          </td>
                        </tr>
                      );
                    })}
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