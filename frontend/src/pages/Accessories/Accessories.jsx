import "../../styles/custom-colors.css";
import "../../styles/PageTable.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import AccessoriesViewModal from "../../components/Modals/AccessoriesViewModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import ExportModal from "../../components/Modals/ExportModal";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import accessoriesService from "../../services/accessories-service";

export default function Accessories() {
  const location = useLocation();
  const [accessories, setAccessories] = useState([]);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isNewAccessoryAdded, setNewAccessoryAdded] = useState(false);
  const [isEditSuccess, setEditSuccess] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isDeleteFailed, setDeleteFailed] = useState(false);
  
  const [endPoint, setEndPoint] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const allChecked = checkedItems.length === accessories.length;

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
        // Fetch all accessories
        const accessoriesResponse = await accessoriesService.fetchAllAccessories();
        setAccessories(accessoriesResponse.accessories || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAccessories([]);
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
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  // Refresh accessories after deletion
  const fetchAccessories = async () => {
    try {
      const accessoriesResponse = await accessoriesService.fetchAllAccessories();
      setAccessories(accessoriesResponse.accessories || []);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      setAccessories([]);
    }
  };

  // TO BE CONFIGURED
  const handleView = (accessoryId) => {
    // Navigate to the product view page
    window.location.href = `/accessories/view/${accessoryId}`;
    // Or if you're using react-router:
    // navigate(`/products/view/${productId}`);
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
            <h1>Accessories</h1>
            <div>
              <form action="" method="post">
                <input type="text" placeholder="Search..." />
              </form>

              <MediumButtons
                type="export"
                deleteModalOpen={() => setExportModalOpen(true)}
              />
              <MediumButtons
                type="new"
                navigatePage="/accessories/registration"
              />
            </div>
          </section>
          <section className="middle">
            {/* Render loading skeleton while waiting for the API response */}
            {isLoading && <SkeletonLoadingTable />}

            {/* Render message if accessories array is empty */}
            {!isLoading && accessories.length === 0 && (
              <p className="table-message">
                No accessories found. Please add some accessory.
              </p>
            )}

            {accessories.length > 0 && (
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
                  {accessories.map((accessory) => (
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
                              ? `http://127.0.0.1:8004${accessory.image}`
                              : DefaultImage
                          }
                          alt="Accessory-Image"
                          width="50"
                        />
                      </td>
                      <td>{accessory.name}</td>
                      <td>
                        <span style={{ color: "#34c759" }}>
                          {availValue}/{accessory.quantity}{" "}
                          <progress
                            value={availValue}
                            max={accessory.quantity}
                          ></progress>
                        </span>
                      </td>

                      <td>
                        <TableBtn
                          type="checkout"
                          navigatePage={"/accessories/checkout"}
                          data={{
                            accessory_name: accessory.name,
                            accessory_id: accessory.id,
                          }}
                        />
                      </td>
                      <td>
                        <TableBtn
                          type="checkin"
                          navigatePage={"/accessories/checkout-list"}
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
                            setEndPoint(
                              `http://localhost:8004/accessories/${accessory.id}/delete`
                            );
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
