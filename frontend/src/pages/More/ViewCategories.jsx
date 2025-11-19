import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilterModal from "../../components/Modals/CategoryFilterModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import DefaultImage from "../../assets/img/default-image.jpg";
import Alert from "../../components/Alert";

import Footer from "../../components/Footer";

import "../../styles/Category.css";

// icons
import keyboardIcon from "../../assets/img/keyboard_Icon.png";
import chargerIcon from "../../assets/img/charger_Icon.png";
import cablesIcon from "../../assets/img/cables_Icon.png";
import paperprinterIcon from "../../assets/img/paperprinter_Icon.png";
import printerinkIcon from "../../assets/img/printerink_Icon.png";

// mock data
const categories = [
  {
    id: 1,
    icon: cablesIcon,
    name: "Cables",
    type: "Accessory",
    quantity: 2,
  },
  {
    id: 2,
    icon: chargerIcon,
    name: "Charger",
    type: "Accessory",
    quantity: 1,
  },
  {
    id: 3,
    icon: keyboardIcon,
    name: "Keyboards",
    type: "Accessory",
    quantity: 2,
  },
  {
    id: 4,
    icon: paperprinterIcon,
    name: "Printer Paper",
    type: "Consumable",
    quantity: 262,
  },
  {
    id: 5,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 6,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 7,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 8,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 9,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 10,
    icon: printerinkIcon,
    name: "Printer Ink",
    type: "Consumable",
    quantity: 95,
  },
  {
    id: 11,
    icon: printerinkIcon,
    name: "Printer",
    type: "Consumable",
    quantity: 95,
  },
];

const filterConfig = [
  {
    type: "select",
    name: "type",
    label: "Type",
    options: [
      { value: "accessory", label: "Accessory" },
      { value: "consumable", label: "Consumable" },
      { value: "component", label: "Component" },
    ],
  },
  {
    type: "number",
    name: "quantity",
    label: "Quantity",
  },
];

// TableHeader component to render the table header
function TableHeader({ allSelected, onSelectAll }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
      </th>
      <th>NAME</th>
      <th>TYPE</th>
      <th>QUANTITY</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ category, onDeleteClick, onCheckboxChange, isChecked }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckboxChange(category.id, e.target.checked)}
        />
      </td>
      <td>
        <div className="category-name">
          <img src={category.icon} alt={category.name} />
          {category.name}
        </div>
      </td>
      <td>{category.type_display}</td>
      <td>{category.quantity}</td>
      <td>
        <section className="action-button-section">
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate(`/More/CategoryEdit/${category.id}`, { state: { category } })
            }
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title="Delete"
            className="action-button"
            onClick={onDeleteClick}
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
  const [isAddRecordSuccess, setAddRecordSuccess] = useState(false);
  const [isUpdateRecordSuccess, setUpdateRecordSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(categories);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...categories];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((category) =>
        category.name?.toLowerCase().includes(filters.name.toLowerCase())
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
      : filteredData.filter((category) => {
          const name = category.name?.toLowerCase() || "";
          const type = category.type?.toLowerCase() || "";
          return name.includes(normalizedQuery) || type.includes(normalizedQuery);
        });

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = searchedData.slice(startIndex, endIndex);

  const allSelected =
    paginatedCategories.length > 0 &&
    paginatedCategories.every((category) => selectedIds.includes(category.id));

  const handleHeaderChange = (checked) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedCategories
          .map((item) => item.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter(
          (id) => !paginatedCategories.map((item) => item.id).includes(id)
        )
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Retrieve the "addCategory" value passed from the navigation state.
  // If the "addCategory" is not exist, the default value for this is "undifiend".
  const addedCategory = location.state?.addedCategory;
  const updatedCategory = location.state?.updatedCategory;

  const actionStatus = (action, status) => {
    let timeoutId;

    if (action === "create" && status === true) {
      setAddRecordSuccess(true);
    }

    if (action === "update" && status === true) {
      setUpdateRecordSuccess(true);
    }

    // clear the navigation/history state so a full page refresh won't re-show the alert
    // replace the current history entry with an empty state
    navigate(location.pathname, { replace: true, state: {} });

    return (timeoutId = setTimeout(() => {
      if (action === "create") {
        setAddRecordSuccess(false);
      } else {
        setUpdateRecordSuccess(false);
      }
    }, 5000));
  };

  const getAction = () => {
    if (addedCategory == true) {
      return "create";
    }

    if (updatedCategory == true) {
      return "update";
    }

    return null;
  };

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
      console.log("Deleting single category id:", deleteTarget);
      setSuccessMessage("Category deleted successfully!");
    } else {
      console.log("Deleting multiple category ids:", selectedIds);
      if (selectedIds.length > 0) {
        setSuccessMessage("Categories deleted successfully!");
      }
      setSelectedIds([]);
    }
    setTimeout(() => setSuccessMessage(""), 5000);
    closeDeleteModal();
  };

  // Set the setAddRecordSuccess or setUpdateRecordSuccess state to true when trigger, then reset to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    timeoutId = actionStatus(getAction(), true);

    // cleanup the timeout on unmount or when addedCategory or updatedCategory changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [addedCategory, updatedCategory, navigate, location.pathname]);

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isAddRecordSuccess && (
        <Alert message="Category added successfully!" type="success" />
      )}

      {isUpdateRecordSuccess && (
        <Alert message="Category updated successfully!" type="success" />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      <CategoryFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Categories ({searchedData.length})</h2>
              <section className="table-actions">
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
<<<<<<< HEAD
                    onClick={() => {
                      if (selectedIds.length > 0) {
                        setDeleteModalOpen(true);
                      }
                    }}
=======
                    onClick={() => openDeleteModal(null)}
>>>>>>> Sillano
                  />
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MediumButtons
                  type="new"
                  navigatePage="/More/CategoryRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onSelectAll={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((category, index) => (
                      <TableItem
                        key={index}
                        category={category}
                        isChecked={selectedIds.includes(category.id)}
                        onCheckboxChange={handleRowChange}
                        onDeleteClick={() => openDeleteModal(category.id)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-data-message">
                        No categories found.
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
