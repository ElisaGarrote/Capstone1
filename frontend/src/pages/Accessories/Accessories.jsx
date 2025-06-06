import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import AccessoriesViewModal from "../../components/Modals/AccessoriesViewModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import ExportModal from "../../components/Modals/ExportModal";
import Alert from "../../components/Alert";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import accessoriesService from "../../services/accessories-service";

export default function Accessories() {
  const location = useLocation();
  const navigate = useNavigate();

  const [accessories, setAccessories] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [endPoint, setEndPoint] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const allChecked = checkedItems.length === accessories.length && accessories.length > 0;

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
        const response = await accessoriesService.fetchAllAccessories();
        setAccessories(response.accessories || []);
      } catch (error) {
        console.error("Error fetching accessories:", error);
        setAccessories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const toggleSelectAll = () => {
    if (allChecked) {
      setCheckedItems([]);
    } else {
      setCheckedItems(accessories.map((item) => item.id));
    }
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const fetchAccessories = async () => {
    try {
      const response = await accessoriesService.fetchAllAccessories();
      setAccessories(response.accessories || []);
    } catch (error) {
      console.error("Error fetching accessories:", error);
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isViewModalOpen && (
        <AccessoriesViewModal
          id={selectedRowId}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchAccessories();
            setSuccessMessage("Accessory Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      {isExportModalOpen && (
        <ExportModal closeModal={() => setExportModalOpen(false)} />
      )}

      <nav>
        <NavBar />
      </nav>

      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Accessories</h1>
            <div>
              <form>
                <input type="text" placeholder="Search..." />
              </form>
              <MediumButtons type="export" deleteModalOpen={() => setExportModalOpen(true)} />
              <MediumButtons type="new" navigatePage="/accessories/registration" />
            </div>
          </section>

          <section className="middle">
            {isLoading ? (
              <SkeletonLoadingTable />
            ) : accessories.length === 0 ? (
              <p className="table-message">
                No accessories found. Please add some accessory.
              </p>
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
                    <th>IMAGE</th>
                    <th>NAME</th>
                    <th>AVAILABLE</th>
                    <th>CHECKOUT</th>
                    <th>CHECKIN</th>
                    <th>CATEGORY</th>
                    <th>LOCATION</th>
                    <th>EDIT</th>
                    <th>DELETE</th>
                    <th>VIEW</th>
                  </tr>
                </thead>
                <tbody>
                  {accessories.map((accessory) => {
                    const available = accessory.available_quantity || 0;
                    const quantity = accessory.quantity || 0;

                    return (
                      <tr key={accessory.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(accessory.id)}
                            onChange={() => toggleItem(accessory.id)}
                          />
                        </td>
                        <td>
                          <img
                            src={
                              accessory.image
                                ? `https://accessories-service-production.up.railway.app${accessory.image}`
                                : DefaultImage
                            }
                            alt={`Accessory-${accessory.name}`}
                            width="50"
                            onError={(e) => {
                              e.target.src = DefaultImage;
                            }}
                          />
                        </td>
                        <td>{accessory.name}</td>
                        <td>
                          <span className="progress-container">
                            <span className="progress-text" style={{ color: "#34c759" }}>
                              {available}/{quantity}
                            </span>
                            <progress value={available} max={quantity}></progress>
                          </span>
                        </td>
                        <td>
                          <TableBtn
                            type="checkout"
                            navigatePage="/accessories/checkout"
                            data={{
                              accessory_name: accessory.name,
                              accessory_id: accessory.id,
                            }}
                          />
                        </td>
                        <td>
                          <TableBtn
                            type="checkin"
                            navigatePage="/accessories/checkout-list"
                            data={accessory.name}
                          />
                        </td>
                        <td>{accessory.category_name}</td>
                        <td>{accessory.location}</td>
                        <td>
                          <TableBtn
                            type="edit"
                            navigatePage={`/accessories/${accessory.id}`}
                          />
                        </td>
                        <td>
                          <TableBtn
                            type="delete"
                            showModal={() => {
                              setEndPoint(`http://localhost:8004/accessories/${accessory.id}/delete`);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </td>
                        <td>
                          <TableBtn
                            type="view"
                            showModal={() => {
                              setViewModalOpen(true);
                              setSelectedRowId(accessory.id);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
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