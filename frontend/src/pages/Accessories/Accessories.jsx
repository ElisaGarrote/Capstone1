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
import { useState,  useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Accessories() {
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isNewAccessoryAdded, setNewAccessoryAdde] = useState(false);
  const [isEditSuccess, setEditSuccess] = useState(false);
  const [isDeleteSuccess, setDeleteSucess] = useState(false);
  const [isDeleteFailed, setDeleteFailed] = useState(false);
  const [accessories, setAccessories] = useState ([]);
  const [endPoint, setEndPoint] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const allChecked = checkedItems.length === accessories.length;
  const location = useLocation();

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const response = await fetch("http://localhost:8004/accessories/");
      const data = await response.json();
      setAccessories(data);
      console.log("Accessories:", data);
    } catch (err) {
      console.log(err);
    }
  };

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

  // should fetch how many of that specific accesory is checked out and then minus to quantity
  let availValue = 7;

  // Retrieve the "isDeleteSuccessFromEdit" value passed from the navigation state.
  // If the "isDeleteSuccessFromEdit" is not exist, the default value for this is "undifiend".
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const newAccessoryAdded = location.state?.newAccessoryAdded;
  const editSuccess = location.state?.editSuccess;

  // Set the setDeleteSuccess to true when the isDeleteSuccessFromEdit is true.
  // And reset the setDeleteSucces to false after 5 seconds.
  useEffect(() => {
    if (isDeleteSuccessFromEdit) {
      setDeleteSucess(true);
      setTimeout(() => {
        setDeleteSucess(false);
      }, 5000);
    }
  }, [isDeleteSuccessFromEdit]); // This will be executed every time the isDeleteSucessFromEdit changes.

  useEffect(() => {
    if (newAccessoryAdded) {
      setNewAccessoryAdde(true);
      setTimeout(() => {
        setNewAccessoryAdde(false);
      }, 5000);
    }
  }, [newAccessoryAdded]);

  useEffect(() => {
    if (editSuccess) {
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
      }, 5000);
    }
  }, [editSuccess]);

  // For debugging only.
  console.log("modal delete: ", isDeleteModalOpen);
  console.log("modal view: ", isViewModalOpen);
  console.log("delete confirm: ", isDeleteSuccess);
  console.log("delete from edit: ", isDeleteSuccessFromEdit);

  return (
    <>
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
          setDeleteSucess(true);
          setTimeout(() => setDeleteSucess(false), 5000);
        }}
        onDeleteFail={() => {
          setDeleteFailed(true);
          setTimeout(() => setDeleteFailed(false), 5000);
        }}
      />      
      )}

      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

      {isDeleteFailed && (
        <Alert message="Delete failed. Please try again." type="error" />
      )}


      {isNewAccessoryAdded && (
        <Alert message="New accessory added!" type="success" />
      )}

      {isEditSuccess && <Alert message="Accessory updated!" type="success" />}

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
            {accessories.length === 0 ? (
                    <section className="no-products-message">
                      <p>No accessories found. Please add some accessory.</p>
                    </section>
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
                          <th>MODEL NUMBER</th>
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
                                src={accessory.image ? `http://127.0.0.1:8004${accessory.image}` : DefaultImage}
                                alt="Accessory-Image"
                                width="50"
                              />
                            </td>
                            <td>{accessory.name}</td>
                            <td>
                              <span style={{ color: '#34c759' }}>
                                {availValue}/{accessory.quantity} <progress value={availValue} max={accessory.quantity}></progress>
                              </span>
                            </td>
                            <td>
                              <TableBtn
                                type="checkout"
                                navigatePage={"/accessories/checkout"}
                                id={accessory.id}
                              />
                            </td>
                            <td>
                              <TableBtn
                                type="checkin"
                                navigatePage={"/accessories/checkin"}
                                id={accessory.id}
                              />
                            </td>
                            <td>{accessory.model_number}</td>
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
                                  setEndPoint(`http://localhost:8004/accessories/delete/${accessory.id}`)
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