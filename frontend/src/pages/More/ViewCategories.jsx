import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
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
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState(location.state?.error || "");
  const [successMessage, setSuccessMessage] = useState(location.state?.success || "");


  const allSelected = selectedIds.length === categories.length && categories.length > 0;

  const handleCheckboxChange = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(categories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };


  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await fetchAllCategories();
      setCategories(data);
      console.log("Categories:", data);
    } catch (error) {
      console.log("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handel Delete
  const handleDelete = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      if (selectedIds.length > 0) {
        await Promise.all(selectedIds.map(id => deleteCategory(id)));
        setSelectedIds([]);
        fetchCategories();
        setSuccessMessage(
          selectedIds.length > 1
            ? "Categories successfully deleted."
            : "Category successfully deleted."
        );
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.log("Failed to delete category:", error);
      setErrorMessage("Failed to delete category. Please try again.");
    }
  };

  // Clear success/error messages after 4 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Table Filter */}
          <CategoryFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Categories ({categories.length})</h2>
              <section className="table-actions">
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => {
                      if (selectedIds.length > 0) {
                        setDeleteModalOpen(true);
                      }
                    }}
                  />
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
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
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((category, index) => (
                      <TableItem
                        key={index}
                        category={category}
                        onDeleteClick={(id) => {
                          setSelectedIds([id]);
                          setDeleteModalOpen(true);
                        }}
                        onCheckboxChange={handleCheckboxChange}
                        isChecked={selectedIds.includes(category.id)}
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
                totalItems={categories.length}
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
