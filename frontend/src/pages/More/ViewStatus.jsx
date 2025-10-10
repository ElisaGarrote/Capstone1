import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
import DeleteModal from "../../components/Modals/DeleteModal";
import Status from "../../components/Status";
import Footer from "../../components/Footer";
import assetsService from "../../services/assets-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import Alert from "../../components/Alert";

import "../../styles/Category.css";

const filterConfig = [
  {
    type: "select",
    name: "type",
    label: "Type",
    options: [
      { value: "archived", label: "Archived" },
      { value: "deployable", label: "Deployable" },
      { value: "deployed", label: "Deployed" },
      { value: "pending", label: "Pending" },
      { value: "undeployable", label: "Undeployable" },
    ],
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>
        <input type="checkbox" name="checkbox-status" id="checkbox-status" />
      </th>
      <th>NAME</th>
      <th>TYPE</th>
      <th>NOTES</th>
      <th>TAG</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ status, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const systemDefaultStatus = [
    "Archived",
    "Being Repaired",
    "Broken",
    "Deployed",
    "Lost or Stolen",
    "Pending",
    "Ready to Deploy",
  ];

  const isDefaultStatus = (status) => {
    // Check if the status is a system default
    const isDefault = systemDefaultStatus.some(
      (defaultStatus) =>
        defaultStatus.toLowerCase() === status.name.toLowerCase()
    );

    return isDefault || status.tag > 0;
  };

  const getTitle = (actionType, status) => {
    // Check if the status is a system default
    const isDefault = systemDefaultStatus.some(
      (defaultStatus) =>
        defaultStatus.toLowerCase() === status.name.toLowerCase()
    );

    if (isDefault) {
      return `This is a system default status label, and cannot be ${
        actionType === "delete" ? "deleted" : "edited"
      }`;
    } else if (status.tag > 0) {
      return `This status is currently in use and cannot be ${
        actionType === "delete" ? "deleted" : "edited"
      }`;
    } else {
      return actionType === "delete" ? "Delete" : "Edit";
    }
  };

  return (
    <tr>
      <td>
        <div className="checkbox-status">
          <input type="checkbox" name="" id="" />
        </div>
      </td>
      <td>{status.name}</td>
      <td>
        <Status
          type={status.type}
          name={status.type[0].toUpperCase() + status.type.slice(1)}
        />
      </td>
      <td>{status.notes || "-"}</td>
      <td>{status.tag}</td>
      <td>
        <section className="action-button-section">
          <button
            title={getTitle("edit", status)}
            className="action-button"
            onClick={() =>
              navigate(`/More/StatusEdit/${status.id}`, { state: { status } })
            }
            disabled={isDefaultStatus(status)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title={getTitle("delete", status)}
            className="action-button"
            onClick={onDeleteClick}
            disabled={isDefaultStatus(status)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
      </td>
    </tr>
  );
}

export default function Category() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [isLoading, setLoading] = useState(null);
  const [isAddStatusSuccess, setAddStatusSuccess] = useState(false);
  const [isUpdateStatusSuccess, setUpdateStatusSuccess] = useState(false);
  const [endPoint, setEndPoint] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = statusData.slice(startIndex, endIndex);

  // Retrieve the "addesStatus" value passed from the navigation state.
  // If the "addesStatus" is not exist, the default value for this is "undifiend".
  const addedStatus = location.state?.addedStatus;
  const updatedStatus = location.state?.updatedStatus;

  // Fetch All Asset Status
  const fetchAssetStatus = async () => {
    setLoading(true);
    try {
      const fetchedData = await assetsService.fetchAllAssetsStatus();
      setStatusData(Array.from(fetchedData));
    } catch (error) {
      console.error("Error fetching asset status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion
  const handleDelete = (status) => {
    setEndPoint(`http://127.0.0.1:8002/status/${status.id}/delete/`);
    setDeleteModalOpen(true);
  };

  // Fetch the asset status data when the component is mounted.
  useEffect(() => {
    fetchAssetStatus();
  }, []);

  // Set the setAddStatusSucess state to true when the addedStatus is true then set it to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    if (addedStatus == true) {
      // show the alert once
      setAddStatusSuccess(true);

      // clear the navigation/history state so a full page refresh won't re-show the alert
      // replace the current history entry with an empty state
      navigate(location.pathname, { replace: true, state: {} });

      timeoutId = setTimeout(() => {
        setAddStatusSuccess(false);
      }, 5000);
    }

    // cleanup the timeout on unmount or when addedStatus changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [addedStatus, navigate, location.pathname]);

  // Set the setUpdateStatusSuccess state to true when the updatedStatus is true then set it to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    if (updatedStatus == true) {
      // show the alert once
      setUpdateStatusSuccess(true);

      // clear the navigation/history state so a full page refresh won't re-show the alert
      // replace the current history entry with an empty state
      navigate(location.pathname, { replace: true, state: {} });

      timeoutId = setTimeout(() => {
        setUpdateStatusSuccess(false);
      }, 5000);
    }

    // cleanup the timeout on unmount or when updatedStatus changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updatedStatus, navigate, location.pathname]);

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          confirmDelete={async () => {
            await fetchAssetStatus();
            setSuccessMessage("Status Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      {isAddStatusSuccess && (
        <Alert message="Status added successfully!" type="success" />
      )}

      {isUpdateStatusSuccess && (
        <Alert message="Status updated successfully!" type="success" />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Table Filter */}
          <CategoryFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Statuses ({statusData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
                <MediumButtons
                  type="new"
                  navigatePage="/More/StatusRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="table-section">
              {/* Render loading skeleton while waiting to the response from the API request*/}
              {isLoading && <SkeletonLoadingTable />}

              {/* Render message if the statusData is empty */}
              {!isLoading && statusData.length == 0 && (
                <p className="table-message">No status found.</p>
              )}

              {/* Render table if the statusData is not empty */}
              {statusData.length > 0 && (
                <table>
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {paginatedCategories.length > 0 ? (
                      paginatedCategories.map((status, index) => (
                        <TableItem
                          key={index}
                          status={status}
                          onDeleteClick={() => handleDelete(status)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="no-data-message">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </section>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={statusData.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
}
