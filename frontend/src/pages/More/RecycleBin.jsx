import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";
import MediumButtons from "../../components/buttons/MediumButtons";
import RecycleBinFilterModal from "../../components/Modals/RecycleBinFilterModal";
import Pagination from "../../components/Pagination";
import { exportToExcel } from "../../utils/exportToExcel";
import "../../styles/Table.css";
import "../../styles/TabNavBar.css";
import "../../styles/RecycleBin.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import { fetchDeletedItems, recoverAsset, recoverComponent, deleteAsset, deleteComponent, bulkDeleteAssets, bulkDeleteComponents, fetchAllDropdowns } from "../../services/contexts-service";
import { fetchProductById } from "../../services/assets-service";
import { isEligible, daysUntilEligible } from "../../utils/retention";

const MS_90_DAYS = 90 * 24 * 60 * 60 * 1000;

// TableHeader
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
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>MANUFACTURER</th>
      <th>SUPPLIER</th>
      <th>LOCATION</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
// Helpers to resolve embedded names
function resolveCategoryName(item, categoriesMap = {}, productMap = {}) {
  return (
    item.category_name ||
    item.category_details?.name ||
    // product may be an object or an id mapped in productMap
    (item.product && typeof item.product === 'object' && item.product.category_details?.name) ||
    (item.product && typeof item.product === 'number' && productMap[String(item.product)]?.category_details?.name) ||
    item.product?.category_name ||
    item.product?.category ||
    // fallback to dropdown map id lookup
    (item.product && categoriesMap[String(item.product.category)]) ||
    (item.category && categoriesMap[String(item.category)]) ||
    null
  );
}

function resolveManufacturerName(item, manufacturersMap = {}, productMap = {}) {
  return (
    item.manufacturer_name ||
    item.manufacturer_details?.name ||
    // product may be an object or id mapped in productMap
    (item.product && typeof item.product === 'object' && item.product.manufacturer_details?.name) ||
    (item.product && typeof item.product === 'number' && productMap[String(item.product)]?.manufacturer_details?.name) ||
    item.product?.manufacturer_name ||
    item.product?.manufacturer ||
    // fallback to dropdown map id lookup
    (item.product && manufacturersMap[String(item.product.manufacturer)]) ||
    null
  );
}

function resolveSupplierName(item, suppliersMap = {}) {
  return (
    item.supplier_name ||
    item.supplier_details?.name ||
    item.product?.default_supplier_details?.name ||
    item.product?.default_supplier_name ||
    // if supplier is an id, map via suppliersMap
    (item.supplier && suppliersMap[String(item.supplier)]) ||
    item.supplier ||
    null
  );
}

function resolveLocationName(item, locationsMap = {}) {
  return (
    item.location_name ||
    item.location_details?.name ||
    item.location?.name ||
    // fallback to dropdown map id lookup
    (item.location && locationsMap[String(item.location)]) ||
    (item.location_id && locationsMap[String(item.location_id)]) ||
    null
  );
}

function TableItem({ item, isSelected, onRowChange, onDeleteClick, onRecoverClick, suppliersMap = {}, categoriesMap = {}, manufacturersMap = {}, locationsMap = {}, productMap = {} }) {
  // Determine permanent-delete eligibility using retention helpers
  let deleteDisabled = false;
  let deleteTitle = "";
  if (!item.deleted_at) {
    deleteDisabled = true;
    deleteTitle = "Deletion timestamp missing — cannot permanently delete.";
  } else if (!isEligible(item.deleted_at, 90)) {
    deleteDisabled = true;
    const daysLeft = daysUntilEligible(item.deleted_at, 90);
    deleteTitle = `Item is in retention. Eligible in ${daysLeft} day(s).`;
  }

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(item.id, e.target.checked)}
        />
      </td>
      <td>{item.name}</td>
      {(() => {
        const catName = resolveCategoryName(item, categoriesMap, productMap) ||
          (item.product && (item.product.category || item.product.category_id)) ||
          item.category_name || null;
        const manName = resolveManufacturerName(item, manufacturersMap, productMap) ||
          (item.product && (item.product.manufacturer || item.product.manufacturer_id)) ||
          item.manufacturer_name || null;
        const supName = resolveSupplierName(item, suppliersMap) ||
          (item.product && (item.product.default_supplier || item.product.default_supplier_id)) ||
          (item.supplier || null);
        const locName = resolveLocationName(item, locationsMap) || (item.location || item.location_id) || null;

        // If any still unresolved, log for debugging (helps identify API shape)
        if (!catName || !manName || !supName || !locName) {
          // eslint-disable-next-line no-console
          console.debug('RecycleBin unresolved names', { id: item.id, item, catName, manName, supName, locName });
        }

        return (
          <>
            <td>{catName || `#${item.product?.category || item.category || 'N/A'}`}</td>
            <td>{manName || `#${item.product?.manufacturer || item.manufacturer || 'N/A'}`}</td>
            <td>{supName || `#${item.product?.default_supplier || item.supplier || 'N/A'}`}</td>
            <td>{locName || `#${item.location || 'N/A'}`}</td>
          </>
        );
      })()}
      <td>
        <ActionButtons
          showRecover
          showDelete
          onRecoverClick={() => onRecoverClick(item.id)}
          onDeleteClick={() => onDeleteClick(item.id)}
          deleteDisabled={deleteDisabled}
          deleteTitle={deleteTitle}
        />
      </td>
    </tr>
  );
}

export default function RecycleBin() {
  // export toggle
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // active tab (assets | components)
  const [activeTab, setActiveTab] = useState("assets");
  
  // data state
  const [deletedAssets, setDeletedAssets] = useState([]);
  const [deletedComponents, setDeletedComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // dropdown maps (id -> name) for resolving ids returned by assets service
  const [suppliersMap, setSuppliersMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});
  const [manufacturersMap, setManufacturersMap] = useState({});
  const [locationsMap, setLocationsMap] = useState({});
  const [productMap, setProductMap] = useState({});
  
  // choose dataset depending on tab
  const data = activeTab === "assets" ? deletedAssets : deletedComponents;

  // If deleted items include location ids not present in locationsMap, try reloading locations
  useEffect(() => {
    const missingLocationIds = new Set();
    const items = [...deletedAssets, ...deletedComponents];
    for (const it of items) {
      const loc = it?.location || it?.location_id;
      if (loc && !locationsMap[String(loc)]) missingLocationIds.add(loc);
    }

          if (missingLocationIds.size > 0) {
      (async () => {
        try {
          const locDd = await fetchAllDropdowns("location");
          const locs = locDd.locations || [];
          if (locs.length > 0) {
            setLocationsMap(locs.reduce((acc, l) => ({ ...acc, [String(l.id)]: (l.name || l.city) }), {}));
          }
        } catch (e) {
          console.debug('Retry load locations failed:', e);
        }
      })();
    }
  }, [deletedAssets, deletedComponents]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch deleted items from API
  useEffect(() => {
    let mounted = true;
    
    const loadDeletedItems = async () => {
      setIsLoading(true);
      try {
        const resp = await fetchDeletedItems();
        if (mounted) {
          const assets = resp.deleted_assets || [];
          const components = resp.deleted_components || [];
          setDeletedAssets(assets);
          setDeletedComponents(components);

          // Fetch product details for any product ids referenced by the returned items
          const allItems = [...assets, ...components];
          const productIds = new Set();
          allItems.forEach(it => {
            const p = it?.product;
            if (p && typeof p === 'number') productIds.add(p);
          });
          if (productIds.size > 0) {
            const map = {};
            await Promise.all(Array.from(productIds).map(async (id) => {
              try {
                const prod = await fetchProductById(id);
                map[String(id)] = prod;
              } catch (e) {
                // ignore per-id failures
              }
            }));
            if (mounted) setProductMap(prev => ({ ...prev, ...map }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch deleted items:', error);
        if (mounted) {
          setErrorMessage('Failed to load deleted items.');
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDeletedItems();
    // also load dropdowns to resolve ids -> names
    const loadDropdowns = async () => {
      try {
        const dd = await fetchAllDropdowns("product");
        if (!mounted) return;
        const suppliers = dd.suppliers || [];
        const categories = dd.categories || [];
        const manufacturers = dd.manufacturers || [];
        setSuppliersMap(suppliers.reduce((acc, s) => ({ ...acc, [String(s.id)]: s.name }), {}));
        setCategoriesMap(categories.reduce((acc, c) => ({ ...acc, [String(c.id)]: c.name }), {}));
        setManufacturersMap(manufacturers.reduce((acc, m) => ({ ...acc, [String(m.id)]: m.name }), {}));
        // load locations separately
        try {
          const locDd = await fetchAllDropdowns("location");
          if (mounted && locDd.locations) {
            setLocationsMap(locDd.locations.reduce((acc, l) => ({ ...acc, [String(l.id)]: (l.name || l.city) }), {}));
          }
        } catch (e) {
          // ignore location dropdown errors
          console.debug('Failed to load locations for recycle bin:', e);
        }
      } catch (err) {
        // ignore dropdown errors, keep maps empty
        console.error('Failed to load dropdowns for recycle bin:', err);
      }
    };
    loadDropdowns();
    // product details are fetched right after loading deleted items
    
    return () => {
      mounted = false;
    };
  }, []);

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...data];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Category
    if (filters.category && filters.category.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.category_name?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Filter by Manufacturer
    if (filters.manufacturer && filters.manufacturer.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.manufacturer_name?.toLowerCase().includes(filters.manufacturer.toLowerCase())
      );
    }

    // Filter by Supplier
    if (filters.supplier && filters.supplier.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.supplier_name?.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    // Filter by Location
    if (filters.location && filters.location.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.location_name?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFilters(filters);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedData =
    normalizedQuery === ""
      ? filteredData
      : filteredData.filter((item) => {
          const name = item.name?.toLowerCase() || "";
          const category = item.category_name?.toLowerCase() || "";
          const manufacturer = item.manufacturer_name?.toLowerCase() || "";
          const supplier = item.supplier_name?.toLowerCase() || "";
          const location = item.location_name?.toLowerCase() || "";
          return (
            name.includes(normalizedQuery) ||
            category.includes(normalizedQuery) ||
            manufacturer.includes(normalizedQuery) ||
            supplier.includes(normalizedQuery) ||
            location.includes(normalizedQuery)
          );
        });

  // Handle export
  const handleExport = () => {
    const dataToExport = searchedData.length > 0 ? searchedData : filteredData;
    exportToExcel(dataToExport, "RecycleBin_Records.xlsx");
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = searchedData.slice(startIndex, endIndex);

  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected =
    paginatedActivity.length > 0 &&
    paginatedActivity.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedActivity.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedActivity.map((item) => item.id).includes(id))
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

  // delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
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
    (async () => {
      try {
        if (deleteTarget) {
          if (activeTab === "assets") {
            await deleteAsset(deleteTarget);
            setDeletedAssets(prev => prev.filter(item => item.id !== deleteTarget));
          } else {
            await deleteComponent(deleteTarget);
            setDeletedComponents(prev => prev.filter(item => item.id !== deleteTarget));
          }
          setSuccessMessage('Item deleted successfully from Recycle Bin.');
        } else {
          if (selectedIds.length === 0) {
            setErrorMessage('No items selected.');
            setTimeout(() => setErrorMessage(''), 3000);
            closeDeleteModal();
            return;
          }
          // Filter selected ids to only those eligible for permanent deletion (90-day retention)
          const eligibleIds = selectedIds.filter(id => {
            const item = data.find(d => d.id === id);
            if (!item || !item.deleted_at) return false;
            return (Date.now() - new Date(item.deleted_at).getTime()) >= MS_90_DAYS;
          });

          if (eligibleIds.length === 0) {
            setErrorMessage('None of the selected items are yet eligible for permanent deletion.');
            setTimeout(() => setErrorMessage(''), 5000);
            closeDeleteModal();
            return;
          }

          if (activeTab === "assets") {
            await bulkDeleteAssets(eligibleIds);
            setDeletedAssets(prev => prev.filter(item => !eligibleIds.includes(item.id)));
          } else {
            await bulkDeleteComponents(eligibleIds);
            setDeletedComponents(prev => prev.filter(item => !eligibleIds.includes(item.id)));
          }

          const skipped = selectedIds.length - eligibleIds.length;
          setSuccessMessage(`${eligibleIds.length} item(s) deleted successfully.${skipped > 0 ? ` (${skipped} skipped - still in retention)` : ''}`);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error('Failed to delete item(s):', err);
        const msg = err?.response?.data?.detail || err?.message || 'Please try again.';
        setErrorMessage('Failed to delete item(s): ' + msg);
        setTimeout(() => setErrorMessage(''), 5000);
      } finally {
        setTimeout(() => setSuccessMessage(''), 5000);
        closeDeleteModal();
      }
    })();
  };

  // recover modal state
  const [isRecoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recoverTarget, setRecoverTarget] = useState(null);

  const openRecoverModal = (id = null) => {
    setRecoverTarget(id);
    setRecoverModalOpen(true);
  };

  const closeRecoverModal = () => {
    setRecoverModalOpen(false);
    setRecoverTarget(null);
  };

  const confirmRecover = async () => {
    try {
      if (recoverTarget) {
        // Single recover
        if (activeTab === "assets") {
          await recoverAsset(recoverTarget);
          setDeletedAssets(prev => prev.filter(item => item.id !== recoverTarget));
          setSuccessMessage('Asset recovered successfully!');
        } else {
          await recoverComponent(recoverTarget);
          setDeletedComponents(prev => prev.filter(item => item.id !== recoverTarget));
          setSuccessMessage('Component recovered successfully!');
        }
      } else {
        // Bulk recover
        if (selectedIds.length === 0) {
          setErrorMessage('No items selected.');
          setTimeout(() => setErrorMessage(''), 3000);
          closeRecoverModal();
          return;
        }
        
        const recoverPromises = selectedIds.map(id => 
          activeTab === "assets" ? recoverAsset(id) : recoverComponent(id)
        );
        
        await Promise.all(recoverPromises);
        
        if (activeTab === "assets") {
          setDeletedAssets(prev => prev.filter(item => !selectedIds.includes(item.id)));
        } else {
          setDeletedComponents(prev => prev.filter(item => !selectedIds.includes(item.id)));
        }
        
        setSuccessMessage(`${selectedIds.length} item(s) recovered successfully!`);
        setSelectedIds([]);
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Failed to recover item(s):', error);
      setErrorMessage('Failed to recover item(s). Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      closeRecoverModal();
    }
  };

  // Update filteredData when tab changes or data changes
  useEffect(() => {
    setFilteredData(data);
    setAppliedFilters({});
    setSearchQuery('');
    setSelectedIds([]);
  }, [activeTab, data]);

  // outside click for export toggle
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

      {isRecoverModalOpen && (
        <ConfirmationModal
          closeModal={closeRecoverModal}
          actionType="recover"
          onConfirm={confirmRecover}
        />
      )}

      <RecycleBinFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
        activeTab={activeTab}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="page-header">
            <h1 className="page-title">Recycle Bin</h1>
          </section>

          { /* Tab Navigation */}
          <div className="tab-nav">
            <ul>
              <li className={activeTab === "assets" ? "active" : ""}>
                <a
                  className={activeTab === "assets" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("assets");
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  Assets ({deletedAssets.length})
                </a>
              </li>
              <li className={activeTab === "components" ? "active" : ""}>
                <a
                  className={activeTab === "components" ? "active" : ""}
                  onClick={() => {
                    setActiveTab("components");
                    setCurrentPage(1);
                    setSelectedIds([]);
                  }}
                >
                  Components ({deletedComponents.length})
                </a>
              </li>
            </ul>
          </div>

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">
                {activeTab === "assets"
                  ? `Deleted Assets (${searchedData.length})`
                  : `Deleted Components (${searchedData.length})`}
              </h2>
              <section className="table-actions">
                {/* Bulk recover button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="recover"
                    onClick={() => openRecoverModal(null)}
                  />
                )}

                {/* Bulk delete button only when checkboxes selected; disable if none eligible */}
                {selectedIds.length > 0 && (() => {
                  const eligibleSelected = selectedIds.filter(id => {
                    const item = data.find(d => d.id === id);
                    return !!item && isEligible(item.deleted_at, 90);
                  });

                  const disabled = eligibleSelected.length === 0;
                  let title = '';
                  if (disabled) {
                    // compute soonest days left among selected that have deleted_at
                    const daysList = selectedIds
                      .map(id => data.find(d => d.id === id))
                      .filter(it => it && it.deleted_at)
                      .map(it => daysUntilEligible(it.deleted_at, 90))
                      .filter(v => v !== null && v !== undefined);

                    if (daysList.length === 0) {
                      title = 'No deletion timestamps found for selected items.';
                    } else {
                      const soonest = Math.min(...daysList);
                      title = `No selected items are eligible yet. Soonest eligible in ${soonest} day(s).`;
                    }
                  } else {
                    title = eligibleSelected.length < selectedIds.length
                      ? `${eligibleSelected.length} of ${selectedIds.length} selected will be permanently deleted; others are in retention.`
                      : `Permanently delete ${eligibleSelected.length} selected item(s)`;
                  }

                  return (
                    <MediumButtons
                      type="delete"
                      onClick={() => openDeleteModal(null)}
                      disabled={disabled}
                      title={title}
                    />
                  );
                })()}

                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
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

            <section className="recycle-bin-table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedActivity.length > 0 ? (
                    paginatedActivity.map((item) => (
                      <TableItem
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.includes(item.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onRecoverClick={openRecoverModal}
                        suppliersMap={suppliersMap}
                        categoriesMap={categoriesMap}
                        manufacturersMap={manufacturersMap}
                        locationsMap={locationsMap}
                        productMap={productMap}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No Deleted Items Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={searchedData.length}
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