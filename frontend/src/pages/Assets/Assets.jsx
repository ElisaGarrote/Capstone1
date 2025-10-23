import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth-service";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import AssetFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";

import "../../styles/Assets/Assets.css";

// Filter configuration for assets
const filterConfig = [
  {
    type: "select",
    name: "status",
    label: "Status",
    options: [
      { value: "archived", label: "Archived" },
      { value: "beingrepaired", label: "Being Repaired" },
      { value: "broken", label: "Broken" },
      { value: "deployed", label: "Deployed" },
      { value: "lostorstolen", label: "Lost or Stolen" },
      { value: "pending", label: "Pending" },
      { value: "readytodeploy", label: "Ready to Deploy" },
    ],
  },
  {
    type: "text",
    name: "category",
    label: "Category",
  },
  {
    type: "text",
    name: "location",
    label: "Location",
  },
];

// TableHeader component to render the table header
function TableHeader({ allSelected, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onHeaderChange}
        />
      </th>
      <th>IMAGE</th>
      <th>ASSET ID</th>
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>STATUS</th>
      <th>LOCATION</th>
      <th>CHECK-IN / CHECK-OUT</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each asset row
function TableItem({ asset, isSelected, onRowChange, onDeleteClick, onViewClick, onCheckInOut }) {
  const baseImage = asset.image
    ? `https://assets-service-production.up.railway.app${asset.image}`
    : DefaultImage;

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(asset.id, e.target.checked)}
        />
      </td>
      <td>
        <img
          src={baseImage}
          alt={asset.name}
          className="table-img"
          onError={(e) => {
            e.target.src = DefaultImage;
          }}
        />
      </td>
      <td>{asset.displayed_id}</td>
      <td>{asset.name}</td>
      <td>{asset.category}</td>
      <td>
        <Status type={asset.status.toLowerCase()} name={asset.status} />
      </td>
      <td>{asset.location || "-"}</td>

      {/* CHECK-IN / CHECK-OUT Column */}
      <td>
        {asset.hasCheckoutRecord && asset.isCheckInOrOut && (
          <ActionButtons
            showCheckout={asset.isCheckInOrOut === "Check-Out"}
            showCheckin={asset.isCheckInOrOut === "Check-In"}
            onCheckoutClick={() => onCheckInOut(asset)}
            onCheckinClick={() => onCheckInOut(asset)}
          />
        )}
      </td>

      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`/assets/registration/${asset.id}`}
          editState={{ asset }}
          onDeleteClick={() => onDeleteClick(asset.id)}
          onViewClick={() => onViewClick(asset)}
        />
      </td>
    </tr>
  );
}

export default function Assets() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssets = MockupData.slice(startIndex, endIndex);

  // selection logic
  const allSelected =
    paginatedAssets.length > 0 &&
    paginatedAssets.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedAssets.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedAssets.map((item) => item.id).includes(id))
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, id = single

  const openDeleteModal = (id = null) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      console.log("Deleting single id:", deleteTarget);
      // remove from mock data / API call
    } else {
      console.log("Deleting multiple ids:", selectedIds);
      // remove multiple
      setSelectedIds([]); // clear selection
    }
    closeDeleteModal();
  };


  const handleViewClick = (asset) => {
    navigate(`/assets/view/${asset.id}`);
  };

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportToggle &&
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setExportToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportToggle]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, [location]);

  const handleCheckInOut = (asset) => {
    const baseImage = asset.image
      ? `https://assets-service-production.up.railway.app${asset.image}`
      : DefaultImage;

    const checkout = asset.checkoutRecord;
    console.log("checkout:", checkout);

    if (asset.isCheckInOrOut === "Check-In") {
      navigate(`/assets/check-in/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.product,
          image: baseImage,
          employee: checkout.requestor || "Not assigned",
          empLocation: checkout.requestor_location || "Unknown",
          checkOutDate: checkout.checkout_date || "Unknown",
          returnDate: checkout.return_date || "Unknown",
          checkoutId: checkout.checkout_ref_id || "Unknown",
          checkinDate: checkout.checkin_date || "Unknown",
          condition: checkout.condition || "Unknown",
          ticketId: checkout.ticket_id,
          fromAsset: true,
        },
      });
    } else {
      navigate(`/assets/check-out/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.product,
          image: baseImage,
          ticketId: checkout.ticket_id,
          empId: checkout.requestor_id,
          employee: checkout.requestor || "Not assigned",
          empLocation: checkout.requestor_location || "Unknown",
          checkoutDate: checkout.checkout_date || "Unknown",
          returnDate: checkout.return_date || "Unknown",
          fromAsset: true,
        },
      });
    }
  };



  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Assets</h1>
          </section>

          {/* Table Filter */}
          <AssetFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Assets ({MockupData.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input type="search" placeholder="Search..." className="search" />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
                {authService.getUserInfo().role === "Admin" && (
                  <MediumButtons
                    type="new"
                    navigatePage="/assets/registration"
                  />
                )}
              </section>
            </section>

            {/* Table Structure */}
            <section className="assets-table-section">
              {exportToggle && (
                <section className="export-button-section" ref={exportRef}>
                  <button>Download as Excel</button>
                  <button>Download as PDF</button>
                  <button>Download as CSV</button>
                </section>
              )}
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
                      <TableItem
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedIds.includes(asset.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onViewClick={handleViewClick}
                        onCheckInOut={handleCheckInOut}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Assets Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Table pagination */}
            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={MockupData.length}
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