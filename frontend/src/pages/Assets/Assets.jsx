import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/Assets.css";
import "../../styles/StandardizedButtons.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import MediumButtons from "../../components/buttons/MediumButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import AssetViewModal from "../../components/Modals/AssetViewModal";
import dtsService from "../../services/dts-integration-service";
import authService from "../../services/auth-service";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

export default function Assets() {
  const location = useLocation();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const allChecked = checkedItems.length === assets.length && assets.length > 0;

  // Filter assets based on search query
  const filteredAssets = assets.filter(asset => {
    return asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           asset.displayed_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           asset.status.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredAssets, 20);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

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
          return {
            ...asset,
            hasCheckoutRecord: !!checkout,
            checkoutRecord: checkout || null,
            isCheckInOrOut: checkout
              ? (checkout.checkin_date ? "Check-In" : "Check-Out")
              : null,
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
  }, [location]);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : assets.map((asset) => asset.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetsService.fetchAllAssets();
      setAssets(response.assets || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

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
          ticketId: checkout.id,
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
          ticketId: checkout.id,
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

  const handleView = async (assetId) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const assetData = await assetsService.fetchAssetById(assetId);
      if (!assetData) {
        setErrorMessage("Asset details not found.");
        setLoading(false);
        return;
      }

      let supplierName = "-";
      if (assetData.supplier_id) {
        try {
          const supplierResponse = await contextsService.fetchSuppNameById(
            assetData.supplier_id
          );
          supplierName = supplierResponse?.name || supplierName;
        } catch (err) {
          console.warn("Supplier fetch failed:", err);
        }
      }

      const assetWithSupplier = {
        ...assetData,
        supplier: supplierName,
      };

      setSelectedAsset(assetWithSupplier);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching asset or supplier details:", error);
      setErrorMessage("Failed to load asset details.");
    } finally {
      setLoading(false);
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

      <nav>
        <NavBar />
      </nav>

      <main className="assets-page">
        <div className="container">
          <section className="top">
            <h1>Assets</h1>
            <div>
              <form>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <MediumButtons type="export" />
              {authService.getUserInfo().role === "Admin" && (
                <MediumButtons type="new" navigatePage="/assets/registration" />
              )}
            </div>
          </section>

          {isLoading ? (
            <SkeletonLoadingTable />
          ) : (
            <>
              <section className="middle">
                <div className="table-wrapper">
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
                    <th>ID</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>STATUS</th>
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
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-assets-message">
                        <p>No assets found. Please add some assets.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(asset.id)}
                            onChange={() => toggleItem(asset.id)}
                          />
                        </td>
                        <td>
                          <img
                            className="table-img"
                            src={
                              asset.image
                                ? `https://assets-service-production.up.railway.app${asset.image}`
                                : DefaultImage
                            }
                            alt={`Asset-${asset.name}`}
                            onError={(e) => {
                              e.target.src = DefaultImage;
                            }}
                          />
                        </td>
                        <td>{asset.displayed_id}</td>
                        <td>{asset.name}</td>
                        <td>{asset.category}</td>
                        <td>{asset.status}</td>
                        <td>
                          {asset.hasCheckoutRecord ? (
                            asset.isCheckedOut ? (
                              <button
                                className="check-in-btn"
                                onClick={() => handleCheckInOut(asset)}
                              >
                                Check In
                              </button>
                            ) : (
                              <button
                                className="check-out-btn"
                                onClick={() => handleCheckInOut(asset)}
                              >
                                Check Out
                              </button>
                            )
                          ) : null}
                        </td>
                        {authService.getUserInfo().role === "Admin" && (
                          <>
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
                                  setEndPoint(
                                    `https://assets-service-production.up.railway.app/assets/${asset.id}/delete/`
                                  );
                                  setDeleteModalOpen(true);
                                }}
                                data={asset.id}
                              />
                            </td>
                          </>
                        )}
                        <td>
                          <TableBtn
                            type="view"
                            onClick={() => handleView(asset.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </section>

              {/* Pagination */}
              {filteredAssets.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 20, 50, 100]}
                />
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
