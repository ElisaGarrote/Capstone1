import React, { useState, useRef, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import "../../styles/Assets/Assets.css";
import Pagination from "../../components/Pagination";
import DeleteModal from "../../components/Modals/DeleteModal";
import DepreciationFilter from "../../components/FilterPanel";
import { useNavigate, useLocation } from "react-router-dom";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import AssetViewModal from "../../components/Modals/AssetViewModal";
import dtsService from "../../services/dts-integration-service";
import authService from "../../services/auth-service";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";

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
function TableHeader() {
  return (
    <tr>
      <th>IMAGE</th>
      <th>ASSET ID</th>
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>STATUS</th>
      <th>LOCATION</th>
      <th>CHECK-IN / CHECK-OUT</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each asset row
function TableItem({ asset, onView, onEdit, onDelete, onCheckInOut }) {
  const baseImage = asset.image
    ? `https://assets-service-production.up.railway.app${asset.image}`
    : DefaultImage;

  return (
    <tr>
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
          <button
            className={
              asset.isCheckInOrOut === "Check-In"
                ? "check-in-btn"
                : "check-out-btn"
            }
            onClick={() => onCheckInOut(asset)}
          >
            {asset.isCheckInOrOut}
          </button>
        )}
      </td>

      {/* ACTIONS Column (View, Edit, Delete) */}
      <td>
        <div className="action-buttons">
          {/* View Button - Always visible */}
          <TableBtn type="view" onClick={() => onView(asset.id)} />

          {/* Edit Button - Always visible */}
          <TableBtn type="edit" onClick={() => onEdit(asset.id)} />

          {/* Delete Button - Always visible */}
          <TableBtn type="delete" onClick={() => onDelete(asset)} />
        </div>
      </td>
    </tr>
  );
}

export default function Assets() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use mockup data for filtering and pagination
  const filteredAssets = MockupData.filter((asset) => {
    return (
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.displayed_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  // Handle export toggle click outside
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

    // Using mockup data instead of API fetch
    // Uncomment below to fetch from API
    /*
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assetsResponse, checkoutsResponse] = await Promise.all([
          assetsService.fetchAllAssets(),
          dtsService.fetchAssetCheckouts(),
        ]);
        const assetData = assetsResponse.assets || [];
        const checkouts = checkoutsResponse || [];

        const checkoutMap = {};
        checkouts.forEach((record) => {
          if (record.asset_id != null) {
            checkoutMap[record.asset_id] = record;
          }
        });

        const enrichedAssets = assetData.map((asset) => {
          const checkout = checkoutMap[asset.id];
          let isCheckInOrOut = null;

          if (checkout && !checkout.is_resolved) {
            isCheckInOrOut = checkout.checkin_date ? "Check-In" : "Check-Out";
          }

          return {
            ...asset,
            hasCheckoutRecord: checkout && !checkout.is_resolved,
            checkoutRecord: checkout || null,
            isCheckInOrOut,
          };
        });

        console.log("data:", enrichedAssets);
        setAssets(enrichedAssets);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setAssets([]);
        setErrorMessage("Failed to load assets.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    */
  }, [location]);

  // Using mockup data - fetchAssets function commented out
  // Uncomment below to fetch from API
  /*
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const [assetsResponse, checkoutsResponse] = await Promise.all([
        assetsService.fetchAllAssets(),
        dtsService.fetchAssetCheckouts(),
      ]);
      const assetData = assetsResponse.assets || [];
      const checkouts = checkoutsResponse || [];

      const checkoutMap = {};
      checkouts.forEach((record) => {
        if (record.asset_id != null) {
          checkoutMap[record.asset_id] = record;
        }
      });

      const enrichedAssets = assetData.map((asset) => {
        const checkout = checkoutMap[asset.id];
        let isCheckInOrOut = null;

        if (checkout && !checkout.is_resolved) {
          isCheckInOrOut = checkout.checkin_date ? "Check-In" : "Check-Out";
        }

        return {
          ...asset,
          hasCheckoutRecord: checkout && !checkout.is_resolved,
          checkoutRecord: checkout || null,
          isCheckInOrOut,
        };
      });

      setAssets(enrichedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };
  */

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

  const handleView = (assetId) => {
    // Navigate to the asset view page
    navigate(`/assets/view/${assetId}`);
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
            // Using mockup data - no need to fetch
            // await fetchAssets();
            setSuccessMessage("Asset Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      {isViewModalOpen && selectedAsset && (
        <AssetViewModal
          asset={selectedAsset}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Assets</h1>
            {authService.getUserInfo().role === "Admin" && (
              <MediumButtons type="new" navigatePage="/assets/registration" />
            )}
          </section>

          {/* Table Filter */}
          <DepreciationFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Assets ({filteredAssets.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
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
              {isLoading ? (
                <div className="loading-container">
                  <SkeletonLoadingTable />
                </div>
              ) : (
                <table>
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {paginatedAssets.length > 0 ? (
                      paginatedAssets.map((asset, index) => (
                        <TableItem
                          key={index}
                          asset={asset}
                          onView={handleView}
                          onEdit={(id) => navigate(`/assets/registration/${id}`)}
                          onDelete={(asset) => {
                            setEndPoint(
                              `https://assets-service-production.up.railway.app/assets/${asset.id}/delete/`
                            );
                            setDeleteModalOpen(true);
                          }}
                          onCheckInOut={handleCheckInOut}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="no-data-message">
                          No assets found.
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
                totalItems={filteredAssets.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </section>
          </section>
        </main>
      </section>
    </>
  );
}