import "../../styles/custom-colors.css";
import "../../styles/AssetRepairs.css";
import "../../styles/AssetRepairsButtons.css";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import TableBtn from "../../components/buttons/TableButtons";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import { useState, useEffect } from "react";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import dateRelated from "../../utils/dateRelated";

export default function AssetRepairs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [isUpdated, setUpdated] = useState(false);
  const [isAddSuccess, setAddSuccess] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [endPoint, setEndPoint] = useState(null);
  const [repairIdToDelete, setRepairIdToDelete] = useState(null);

  // Retrieve success states from navigation
  const isDeleteSuccessFromEdit = location.state?.isDeleteSuccessFromEdit;
  const isUpdateFromEdit = location.state?.isUpdateFromEdit;
  const isAddSuccessFromRegistration = location.state?.isAddSuccess;

  // Handle delete success message
  useEffect(() => {
    if (isDeleteSuccessFromEdit === true) {
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 5000);
    }
  }, [isDeleteSuccessFromEdit]);

  // Handle update success message
  useEffect(() => {
    if (isUpdateFromEdit === true) {
      setUpdated(true);
      setTimeout(() => {
        setUpdated(false);
      }, 5000);
    }
  }, [isUpdateFromEdit]);

  // Handle search functionality
  const filteredItems = maintenanceItems.filter((item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.asset_info.displayed_id &&
        item.asset_info.displayed_id.toLowerCase().includes(searchLower)) ||
      (item.asset_info.name &&
        item.asset_info.name.toLowerCase().includes(searchLower)) ||
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.type && item.type.toLowerCase().includes(searchLower)) ||
      (item.maintenanceName &&
        item.maintenanceName.toLowerCase().includes(searchLower))
      // (item.supplier && item.supplier.toLowerCase().includes(searchLower))
    );
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedRowId) {
      // Remove the selected item from maintenanceItems
      const updatedItems = maintenanceItems.filter(
        (item) => item.id !== selectedRowId
      );
      setMaintenanceItems(updatedItems);

      // Update localStorage - only remove from stored records
      const storedRecords =
        JSON.parse(localStorage.getItem("maintenanceRecords")) || [];
      const updatedRecords = storedRecords.filter(
        (item) => item.id !== selectedRowId
      );
      localStorage.setItem(
        "maintenanceRecords",
        JSON.stringify(updatedRecords)
      );
    }

    setDeleteModalOpen(false);
    setDeleteSuccess(true);
    setTimeout(() => {
      setDeleteSuccess(false);
    }, 5000);
  };

  // Fetch all repair
  useEffect(() => {
    const fetchAllRepairsAndSuppliers = async () => {
      // Fetch all repairs
      const repairResponse = await assetsService.fetchAllRepairs();
      setMaintenanceItems(repairResponse || []);

      // Fetch all suppliers
      const suppliersResponse = await contextsService.fetchAllSuppliers();
      setAllSuppliers(suppliersResponse || []);

      setIsLoading(false);
    };

    fetchAllRepairsAndSuppliers();
  }, []);

  // Clear isAddSuccess state
  useEffect(() => {
    if (isAddSuccessFromRegistration === true) {
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
      }, 5000);
    }
  }, [isAddSuccessFromRegistration]);

  const setSupplier = (id) => {
    const supplier = allSuppliers.find((item) => id === item.id);
    return supplier ? supplier.name : "";
  };

  console.log("maintenance items:", maintenanceItems);
  console.log("suppliers:", allSuppliers);

  return (
    <div className="app-container">
      {/* Delete modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            // Refresh the data
            const refreshData = await assetsService.fetchAllRepairs();
            setMaintenanceItems(Array.from(refreshData));

            // Delete all repair files
            await assetsService.softDeleteRepairFileByRepairId(
              repairIdToDelete
            );

            setDeleteSuccess(true);

            setTimeout(() => {
              setDeleteSuccess(false);
            }, 5000);
          }}
          onDeleteFail={() => {
            setDeleteFailed(true);

            setTimeout(() => {
              setDeleteFailed(false);
            }, 5000);
          }}
        />
      )}

      {/* Success alerts */}
      {isDeleteSuccess && (
        <Alert message="Deleted Successfully!" type="success" />
      )}

      {deleteFailed && <Alert message="Deletion failed!" type="danger" />}

      {isUpdated && <Alert message="Updated Successfully!" type="success" />}

      {isAddSuccess && <Alert message="Added Successfully!" type="success" />}

      <nav>
        <NavBar />
      </nav>

      <main className="page">
        <div className="container">
          <section className="top">
            <h1>Asset Repairs</h1>
            <div>
              <form action="" method="post">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <MediumButtons type="export" />
              <MediumButtons
                type="new"
                navigatePage="/dashboard/Repair/MaintenanceRegistration"
              />
            </div>
          </section>
          <section className="middle">
            {isLoading && <SkeletonLoadingTable />}

            {!isLoading && Array.from(maintenanceItems).length === 0 && (
              <p className="table-message">No maintenance records found.</p>
            )}

            {!isLoading && Array.from(maintenanceItems).length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" onChange={() => {}} />
                    </th>
                    <th title="ASSET">ASSET</th>
                    <th title="TYPE">TYPE</th>
                    <th title="NAME">NAME</th>
                    <th title="START DATE">START DATE</th>
                    <th title="END DATE">END DATE</th>
                    <th title="COST">COST</th>
                    <th title="SUPPLIER">SUPPLIER</th>
                    <th title="NOTES">NOTES</th>
                    <th title="ATTACHMENTS">ATTACHMENTS</th>
                    <th title="EDIT" className="action-column">
                      EDIT
                    </th>
                    <th title="DELETE" className="action-column">
                      DELETE
                    </th>
                    <th title="VIEW" className="action-column">
                      VIEW
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input type="checkbox" onChange={() => {}} />
                      </td>
                      <td className="asset-column">
                        <span
                          title={`${item.asset_info.displayed_id} - ${item.asset_info.name}`}
                          style={{ color: "#007bff", textAlign: "left" }}
                        >
                          {item.asset_info.displayed_id} -{" "}
                          {item.asset_info.name}
                        </span>
                      </td>
                      <td title={item.type}>
                        {item.type[0].toUpperCase() + item.type.slice(1)}
                      </td>
                      <td title={item.name}>{item.name}</td>
                      <td title={item.start_date}>
                        {dateRelated.formatDate(item.start_date)}
                      </td>
                      <td title={item.end_date}>
                        {(item.end_date &&
                          dateRelated.formatDate(item.end_date)) ||
                          "-"}
                      </td>
                      <td title={item.cost}>
                        {(item.cost > 0 && item.cost) || "-"}
                      </td>
                      <td title={item.supplier}>
                        {setSupplier(item.asset_info.supplier_id)}
                      </td>
                      <td title={item.notes}>{item.notes || "-"}</td>
                      <td
                        title={
                          item.repair_files.length > 0
                            ? "Click view to see attachments"
                            : "No attachment file"
                        }
                      >
                        {item.repair_files.length > 0
                          ? item.repair_files.length
                          : "-"}
                      </td>
                      <td className="action-column">
                        <TableBtn
                          type="edit"
                          navigatePage="/dashboard/Repair/EditMaintenance"
                          id={`${item.id} - ${item.name}`}
                          previousPage={location.pathname}
                        />
                      </td>
                      <td className="action-column">
                        <TableBtn
                          type="delete"
                          showModal={() => {
                            setEndPoint(
                              assetsService.softDeleteRepairEndpoint(item.id)
                            );
                            setDeleteModalOpen(true);
                            setRepairIdToDelete(item.id);
                          }}
                        />
                      </td>
                      <td className="action-column">
                        <TableBtn
                          type="view"
                          navigatePage="/dashboard/Repair/ViewMaintenance"
                          id={`${item.id} - ${item.name}`}
                          previousPage={location.pathname}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* We'll remove the pagination for consistency with other pages */}
          <section className="bottom"></section>
        </div>
      </main>
    </div>
  );
}
