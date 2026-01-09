import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import DetailedViewPage from "../../../components/DetailedViewPage/DetailedViewPage";
import MediumButtons from "../../../components/buttons/MediumButtons";
import { getSupplierDetails, getSupplierTabs } from "../../../data/mockData/more/supplierDetailsData";
import { fetchSupplierById } from '../../../services/contexts-service';
import AssetsMockupData from "../../../data/mockData/assets/assets-mockup-data.json";
import ComponentsMockupData from "../../../data/mockData/components/component-mockup-data.json";
import Status from "../../../components/Status";
import ActionButtons from "../../../components/ActionButtons";
import Pagination from "../../../components/Pagination";
import DefaultImage from "../../../assets/img/default-image.jpg";
import { exportToExcel } from "../../../utils/exportToExcel";
import ConfirmationModal from "../../../components/Modals/DeleteModal";
import AssetFilterModal from "../../../components/Modals/AssetFilterModal";
import Alert from "../../../components/Alert";
import ComponentFilterModal from "../../../components/Modals/ComponentFilterModal";
import "../../../styles/Assets/Assets.css";
import "../../../styles/components/Components.css";
import "../../../styles/more/supplier/SupplierDetails.css";
import dateRelated from '../../../utils/dateRelated';

function SupplierDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [assetsCurrentPage, setAssetsCurrentPage] = useState(1);
  const [assetsPageSize, setAssetsPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierAssets, setSupplierAssets] = useState(AssetsMockupData);
  const [componentsCurrentPage, setComponentsCurrentPage] = useState(1);
  const [componentsPageSize, setComponentsPageSize] = useState(5);
  const [componentsSearchTerm, setComponentsSearchTerm] = useState("");
  const [componentFilters, setComponentFilters] = useState({});
  const [isComponentFilterModalOpen, setIsComponentFilterModalOpen] = useState(false);
  const [supplierComponents, setSupplierComponents] = useState(() =>
    (ComponentsMockupData || []).map((component) => {
      const available = component.available_quantity ?? 0;
      const checkedOut = component.checked_out_quantity ?? 0;
      return {
        ...component,
        showCheckout: available > 0,
        showCheckin: checkedOut > 0,
      };
    })
  );
  const [selectedComponentIds, setSelectedComponentIds] = useState([]);
  const [isComponentDeleteModalOpen, setIsComponentDeleteModalOpen] = useState(false);
  const [componentDeleteTarget, setComponentDeleteTarget] = useState(null); // null = bulk, id = single
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isAssetDeleteModalOpen, setAssetDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [assetSuccessMessage, setAssetSuccessMessage] = useState("");
  const supplierDetails = location.state?.supplier;

  const [fullSupplier, setFullSupplier] = useState(null);

  // If the supplier object passed via navigation is missing notes/timestamps,
  // fetch the full supplier from the API and merge results.
  useEffect(() => {
    let mounted = true;
    if (supplierDetails && supplierDetails.id) {
      const missingNotes = !supplierDetails.notes && !supplierDetails.note;
      const missingCreated = !supplierDetails.createdAt && !supplierDetails.created_at;
      const missingUpdated = !supplierDetails.updatedAt && !supplierDetails.updated_at;

      if (missingNotes || missingCreated || missingUpdated) {
        fetchSupplierById(supplierDetails.id)
          .then((res) => {
            if (mounted) setFullSupplier(res);
          })
          .catch((err) => {
            console.error('Failed to fetch full supplier:', err);
          });
      }
    }
    return () => {
      mounted = false;
    };
  }, [supplierDetails]);

  const mergedSupplier = fullSupplier ? { ...supplierDetails, ...fullSupplier } : supplierDetails;

  // Mapped display-friendly fields (notes, createdAt, updatedAt, labels)
  const display = getSupplierDetails(mergedSupplier) || {};

  if (!supplierDetails) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>

          <h2>Supplier not found</h2>
        </div>
      </>
    );
  }
  const tabs = getSupplierTabs();
  const applyAssetFilters = (data, filters) => {
    let filtered = [...data];

    // Filter by Asset ID
    if (filters.assetId && filters.assetId.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.displayed_id?.toLowerCase().includes(filters.assetId.toLowerCase())
      );
    }

    // Filter by Asset Model
    if (filters.assetModel && filters.assetModel.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.product?.toLowerCase().includes(filters.assetModel.toLowerCase())
      );
    }

    // Filter by Status
    if (filters.status) {
      filtered = filtered.filter((asset) =>
        asset.status?.toLowerCase() === filters.status.value.toLowerCase()
      );
    }

    // Filter by Supplier
    if (filters.supplier) {
      filtered = filtered.filter((asset) =>
        asset.supplier?.toLowerCase().includes(filters.supplier.label.toLowerCase())
      );
    }

    // Filter by Location
    if (filters.location) {
      filtered = filtered.filter((asset) =>
        asset.location?.toLowerCase().includes(filters.location.label.toLowerCase())
      );
    }

    // Filter by Asset Name
    if (filters.assetName && filters.assetName.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.name?.toLowerCase().includes(filters.assetName.toLowerCase())
      );
    }

    // Filter by Serial Number
    if (filters.serialNumber && filters.serialNumber.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.serial_number?.toLowerCase().includes(filters.serialNumber.toLowerCase())
      );
    }

    // Filter by Warranty Expiration
    if (filters.warrantyExpiration && filters.warrantyExpiration.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.warranty_expiration_date === filters.warrantyExpiration
      );
    }

    // Filter by Order Number
    if (filters.orderNumber && filters.orderNumber.trim() !== "") {
      filtered = filtered.filter((asset) =>
        asset.order_number?.toLowerCase().includes(filters.orderNumber.toLowerCase())
      );
    }

    // Filter by Purchase Date
    if (filters.purchaseDate && filters.purchaseDate.trim() !== "") {
      filtered = filtered.filter(
        (asset) => asset.purchase_date === filters.purchaseDate
      );
    }

    // Filter by Purchase Cost
    if (filters.purchaseCost && filters.purchaseCost.trim() !== "") {
      const cost = parseFloat(filters.purchaseCost);
      filtered = filtered.filter((asset) => asset.purchase_cost === cost);
    }

    return filtered;
  };

  const filterAndSearchAssets = (data, filters, term) => {
    let filtered = applyAssetFilters(data, filters || {});

    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter((asset) =>
        (asset.name && asset.name.toLowerCase().includes(lowerTerm)) ||
        (asset.displayed_id &&
          asset.displayed_id.toLowerCase().includes(lowerTerm)) ||
        (asset.category && asset.category.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  };

  const filteredAssets = filterAndSearchAssets(
    supplierAssets,
    appliedFilters,
    searchTerm
  );

  const assetsStartIndex = (assetsCurrentPage - 1) * assetsPageSize;
  const assetsEndIndex = assetsStartIndex + assetsPageSize;
  const paginatedAssets = filteredAssets.slice(assetsStartIndex, assetsEndIndex);

  const handleViewAsset = (asset) => {
    navigate(`/assets/view/${asset.id}`, {
      state: { asset },
    });
  };

  const openAssetDeleteModal = (assetId) => {
    setAssetToDelete(assetId);
    setAssetDeleteModalOpen(true);
  };

  const closeAssetDeleteModal = () => {
    setAssetDeleteModalOpen(false);
    setAssetToDelete(null);
  };

  const confirmAssetDelete = () => {
    if (assetToDelete) {
      setSupplierAssets((prevAssets) =>
        prevAssets.filter((asset) => asset.id !== assetToDelete)
      );
      setAssetSuccessMessage("Asset deleted successfully.");
      setTimeout(() => setAssetSuccessMessage(""), 5000);
      console.log("Deleting asset:", assetToDelete);
    }
    closeAssetDeleteModal();
  };

  const handleCheckInOut = (asset, action) => {
    const baseImage = asset.image
      ? `https://assets-service-production.up.railway.app${asset.image}`
      : DefaultImage;

    const checkout = asset.checkoutRecord;
    const isCheckIn =
      action === "checkin" || asset.isCheckInOrOut === "Check-In";

    if (isCheckIn) {
      navigate(`/assets/check-in/${asset.id}`, {
        state: {
          id: asset.id,
          assetId: asset.displayed_id,
          product: asset.product,
          image: baseImage,
          employee: checkout?.requestor || "Not assigned",
          empLocation: checkout?.requestor_location || "Unknown",
          checkOutDate: checkout?.checkout_date || "Unknown",
          returnDate: checkout?.return_date || "Unknown",
          checkoutId: checkout?.checkout_ref_id || "Unknown",
          checkinDate: checkout?.checkin_date || "Unknown",
          condition: checkout?.condition || "Unknown",
          ticketId: checkout?.ticket_id,
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
          ticketId: checkout?.ticket_id,
          empId: checkout?.requestor_id,
          employee: checkout?.requestor || "Not assigned",
          empLocation: checkout?.requestor_location || "Unknown",
          checkoutDate: checkout?.checkout_date || "Unknown",
          returnDate: checkout?.return_date || "Unknown",
          fromAsset: true,
        },
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setAssetsCurrentPage(1);
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    setAssetsCurrentPage(1);
  };

  const handleExport = () => {
    const dataToExport = filteredAssets.length > 0 ? filteredAssets : [];
    exportToExcel(dataToExport, "Supplier_Assets.xlsx");
  };

  const applyComponentFilters = (data, filters) => {
    let filtered = [...data];

    if (filters.category && filters.category.label) {
      const categoryLabel = filters.category.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.category?.toLowerCase().includes(categoryLabel)
      );
    }

    if (filters.manufacturer && filters.manufacturer.label) {
      const manufacturerLabel = filters.manufacturer.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.manufacturer?.toLowerCase().includes(manufacturerLabel)
      );
    }

    if (filters.supplier && filters.supplier.label) {
      const supplierLabel = filters.supplier.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.supplier?.toLowerCase().includes(supplierLabel)
      );
    }

    if (filters.location && filters.location.label) {
      const locationLabel = filters.location.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.location?.toLowerCase().includes(locationLabel)
      );
    }

    return filtered;
  };

  const applyComponentsFiltersAndSearch = (filters, term) => {
    let filtered = applyComponentFilters(supplierComponents, filters || {});

    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter((component) =>
        (component.name && component.name.toLowerCase().includes(lowerTerm)) ||
        (component.category && component.category.toLowerCase().includes(lowerTerm)) ||
        (component.manufacturer && component.manufacturer.toLowerCase().includes(lowerTerm)) ||
        (component.supplier && component.supplier.toLowerCase().includes(lowerTerm)) ||
        (component.location && component.location.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  };

  const filteredComponents = applyComponentsFiltersAndSearch(
    componentFilters,
    componentsSearchTerm
  );

  const componentsStartIndex = (componentsCurrentPage - 1) * componentsPageSize;
  const componentsEndIndex = componentsStartIndex + componentsPageSize;
  const paginatedComponents = filteredComponents.slice(
    componentsStartIndex,
    componentsEndIndex
  );

  // Components selection logic (Supplier tab)
  const allComponentsSelected =
    paginatedComponents.length > 0 &&
    paginatedComponents.every((item) => selectedComponentIds.includes(item.id));

  const handleComponentsHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedComponentIds((prev) => [
        ...prev,
        ...paginatedComponents
          .map((item) => item.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedComponentIds((prev) =>
        prev.filter(
          (id) => !paginatedComponents.map((item) => item.id).includes(id)
        )
      );
    }
  };

  const handleComponentsRowChange = (id, checked) => {
    if (checked) {
      setSelectedComponentIds((prev) => [...prev, id]);
    } else {
      setSelectedComponentIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const openComponentDeleteModal = (id = null) => {
    setComponentDeleteTarget(id);
    setIsComponentDeleteModalOpen(true);
  };

  const closeComponentDeleteModal = () => {
    setIsComponentDeleteModalOpen(false);
    setComponentDeleteTarget(null);
  };

  const confirmComponentDelete = () => {
    if (componentDeleteTarget) {
      setSupplierComponents((prev) =>
        prev.filter((component) => component.id !== componentDeleteTarget)
      );
      setSelectedComponentIds((prev) =>
        prev.filter((id) => id !== componentDeleteTarget)
      );
    } else {
      setSupplierComponents((prev) =>
        prev.filter((component) => !selectedComponentIds.includes(component.id))
      );
      setSelectedComponentIds([]);
    }
    closeComponentDeleteModal();
  };

  const handleSearchComponents = (e) => {
    const term = e.target.value;
    setComponentsSearchTerm(term);
    setComponentsCurrentPage(1);
  };

  const handleApplyComponentFilter = (filters) => {
    setComponentFilters(filters);
    setComponentsCurrentPage(1);
  };

  const handleExportComponents = () => {
    const dataToExport = filteredComponents.length > 0 ? filteredComponents : [];
    exportToExcel(dataToExport, "Supplier_Components.xlsx");
  };

  const handleComponentCheckInOut = (component, action) => {
    const available_quantity = component.available_quantity ?? 0;
    const remaining_quantity = component.available_quantity ?? 0;

    const item = {
      id: component.id,
      name: component.name,
      available_quantity,
      remaining_quantity,
    };

    if (action === "checkin") {
      navigate(`/components/check-in/${component.id}`, {
        state: {
          item,
          componentName: component.name,
        },
      });
    } else {
      navigate(`/components/check-out/${component.id}`, {
        state: { item },
      });
    }
  };

  const handleViewComponent = (component) => {
    navigate(`/components/view/${component.id}`, {
      state: { component },
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle supplier deletion logic here
    console.log("Deleting supplier:", supplierDetails.id);
    closeDeleteModal();
    navigate("/More/ViewSupplier");
  };

  // Button action handlers
  const handleEditClick = () => {
    navigate(`/More/SupplierRegistration/${supplierDetails.id}`, {
      state: { supplier: supplierDetails }
    });
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Create action buttons with vertical layout
  const actionButtons = (
    <div className="vertical-action-buttons">
      <button
        type="button"
        className="action-btn edit-btn"
        onClick={handleEditClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginRight: '8px' }}
        >
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        Edit
      </button>
      <MediumButtons
        type="delete"
        onClick={handleDeleteClick}
      />
    </div>
  );

  // Render custom About section for suppliers
  const aboutContent = (
    <div className="about-section">
      {/* Details Section */}
          <div className="asset-details-section">
        <h3 className="section-header">Details</h3>
        <div className="asset-details-grid">
          <div className="detail-row">
            <label>Supplier Name</label>
            <span>{display.supplierName || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Address</label>
            <span>{display.address || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>City</label>
            <span>{display.city || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>State</label>
            <span>{display.state || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>ZIP</label>
            <span>{display.zip || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Country</label>
            <span>{display.country || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Contact Name</label>
            <span>{display.contactName || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Phone Number</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() =>
                window.open(`tel:${display.phoneNumber || ''}`, "_blank")
              }
            >
              {display.phoneNumber || 'N/A'}
            </span>
          </div>

          <div className="detail-row">
            <label>Email</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() =>
                window.open(`mailto:${display.email || ''}`, "_blank")
              }
            >
              {display.email || 'N/A'}
            </span>
          </div>

          <div className="detail-row">
            <label>URL</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() => window.open(display.url || '', "_blank")}
            >
              {display.url || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Fields: Notes, Created At, Updated At */}
      <div className="additional-fields-section">
        <h3 className="section-header">Additional Information</h3>
        <div className="asset-details-grid">
          <div className="detail-row">
            <label>Notes</label>
            <span style={{ whiteSpace: 'pre-wrap' }}>{display.notes || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Created At</label>
            <span>
              {(() => {
                const ts = display.createdAt;
                return ts && ts !== 'N/A' ? dateRelated.formatDateWithTime(ts) : 'N/A';
              })()}
            </span>
          </div>

          <div className="detail-row">
            <label>Updated At</label>
            <span>
              {(() => {
                const ts = display.updatedAt;
                return ts && ts !== 'N/A' ? dateRelated.formatDateWithTime(ts) : 'N/A';
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Custom Assets tab content: show Assets table instead of generic History table
  const assetsTabContent = (
    <div className="history-tab-wrapper">
      {/* Header with title and actions */}
      <section className="product-assets-header">
        <h2 className="product-assets-title">
          Assets ({filteredAssets.length})
        </h2>
        <section className="product-assets-actions">
          <input
            type="search"
            placeholder="Search..."
            className="product-assets-search"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button
            type="button"
            className="medium-button-filter"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </button>
          <MediumButtons
            type="export"
            onClick={handleExport}
          />
        </section>
      </section>

      {/* Table Section */}
      <section className="assets-table-section">
        <table>
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>ID</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>STATUS</th>
              <th>CHECK-IN / CHECK-OUT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.length > 0 ? (
              paginatedAssets.map((asset) => {
                const baseImage = asset.image
                  ? `https://assets-service-production.up.railway.app${asset.image}`
                  : DefaultImage;

                return (
                  <tr key={asset.id}>
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
                    <td>{asset.category || "N/A"}</td>
                    <td>
                      <Status
                        type={asset.status ? asset.status.toLowerCase() : "unknown"}
                        name={asset.status || "Unknown"}
                      />
                    </td>
                    <td>
                      <ActionButtons
                        showCheckout={
                          asset.status &&
                          (asset.status.toLowerCase() === "ready to deploy" ||
                            asset.status.toLowerCase() === "readytodeploy" ||
                            asset.status.toLowerCase() === "archived" ||
                            asset.status.toLowerCase() === "pending")
                        }
                        showCheckin={
                          asset.status &&
                          asset.status.toLowerCase() === "deployed"
                        }
                        onCheckoutClick={() =>
                          handleCheckInOut(asset, "checkout")
                        }
                        onCheckinClick={() =>
                          handleCheckInOut(asset, "checkin")
                        }
                      />
                    </td>
                    <td>
                      <ActionButtons
                        showEdit
                        showDelete
                        showView
                        editPath={`/assets/edit/${asset.id}`}
                        editState={{ asset }}
                        onDeleteClick={() => openAssetDeleteModal(asset.id)}
                        onViewClick={() => handleViewAsset(asset)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="no-data-message">
                  No Assets Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Pagination Section */}
      <section className="history-pagination-section">
        <Pagination
          currentPage={assetsCurrentPage}
          pageSize={assetsPageSize}
          totalItems={filteredAssets.length}
          onPageChange={setAssetsCurrentPage}
          onPageSizeChange={setAssetsPageSize}
        />
      </section>
    </div>
  );

  const componentsTabContent = (
    <div className="history-tab-wrapper supplier-components-tab-wrapper">
      <section className="product-assets-header">
        <h2 className="product-assets-title">Components ({filteredComponents.length})</h2>
        <section className="product-assets-actions">
          {selectedComponentIds.length > 0 && (
            <>
              <MediumButtons
                type="edit"
                onClick={() =>
                  navigate("/components/bulk-edit", { state: { selectedIds: selectedComponentIds } })
                }
              />
              <MediumButtons type="delete" onClick={() => openComponentDeleteModal(null)} />
            </>
          )}
          <input
            type="search"
            placeholder="Search..."
            className="product-assets-search"
            value={componentsSearchTerm}
            onChange={handleSearchComponents}
          />
          <button
            type="button"
            className="medium-button-filter"
            onClick={() => setIsComponentFilterModalOpen(true)}
          >
            Filter
          </button>
          <MediumButtons type="export" onClick={handleExportComponents} />
          <MediumButtons type="new" navigatePage="/components/registration" />
        </section>
      </section>

      <section className="assets-table-section">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allComponentsSelected}
                  onChange={handleComponentsHeaderChange}
                />
              </th>
              <th>IMAGE</th>
              <th>NAME</th>
              <th>
                <a
                  className="category-link"
                  onClick={() => navigate("/More/ViewCategories")}
                  role="button"
                >
                  CATEGORY
                </a>
              </th>
              <th>MANUFACTURER</th>
              <th>DEPRECIATION</th>
              <th>CHECK-OUT / CHECK-IN</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComponents.length > 0 ? (
              paginatedComponents.map((component) => (
                <tr key={component.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedComponentIds.includes(component.id)}
                      onChange={(e) =>
                        handleComponentsRowChange(component.id, e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    {(() => {
                      const baseImage = component.image
                        ? `https://assets-service-production.up.railway.app${component.image}`
                        : DefaultImage;

                      return (
                        <img
                          src={baseImage}
                          alt={component.name}
                          className="table-img"
                          onError={(e) => {
                            e.target.src = DefaultImage;
                          }}
                        />
                      );
                    })()}
                  </td>
                  <td>{component.name || "N/A"}</td>
                  <td>
                    <a
                      className="category-link"
                      onClick={() =>
                        navigate("/More/ViewCategories", {
                          state: { selectedCategory: component.category },
                        })
                      }
                      role="button"
                    >
                      {component.category || "N/A"}
                    </a>
                  </td>
                  <td>{component.manufacturer || "N/A"}</td>
                  <td>{component.depreciation || "N/A"}</td>
                  <td>
                    <ActionButtons
                      showCheckout={component.showCheckout}
                      showCheckin={component.showCheckin}
                      onCheckoutClick={() => handleComponentCheckInOut(component, "checkout")}
                      onCheckinClick={() => handleComponentCheckInOut(component, "checkin")}
                    />
                  </td>
                  <td>
                    <ActionButtons
                      showEdit
                      showDelete
                      showView
                      editPath={`/components/edit/${component.id}`}
                      editState={{ item: component }}
                      onDeleteClick={() => openComponentDeleteModal(component.id)}
                      onViewClick={() => handleViewComponent(component)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data-message">
                  No Components Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="table-pagination">
        <Pagination
          currentPage={componentsCurrentPage}
          pageSize={componentsPageSize}
          totalItems={filteredComponents.length}
          onPageChange={setComponentsCurrentPage}
          onPageSizeChange={setComponentsPageSize}
        />
      </section>
    </div>
  );


  return (
    <>
      {assetSuccessMessage && (
        <Alert message={assetSuccessMessage} type="success" />
      )}
      <NavBar />
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
          isOpen={isDeleteModalOpen}
        />
      )}
      {isAssetDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeAssetDeleteModal}
          actionType="delete"
          onConfirm={confirmAssetDelete}
          isOpen={isAssetDeleteModalOpen}
        />
      )}
      {isComponentDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeComponentDeleteModal}
          actionType="delete"
          onConfirm={confirmComponentDelete}
          isOpen={isComponentDeleteModalOpen}
        />
      )}
      <AssetFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />
      <ComponentFilterModal
        isOpen={isComponentFilterModalOpen}
        onClose={() => setIsComponentFilterModalOpen(false)}
        onApplyFilter={handleApplyComponentFilter}
        initialFilters={componentFilters}
      />
      <DetailedViewPage
        {...getSupplierDetails(supplierDetails)}
        hideAdditionalFields={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
        customTabContent={
          activeTab === 1
            ? assetsTabContent
            : activeTab === 2
              ? componentsTabContent
              : null
        }
      >
        {activeTab === 0 && aboutContent}
      </DetailedViewPage>
    </>
  );
}

export default SupplierDetails;
