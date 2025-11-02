import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
import DeleteModal from "../../components/Modals/DeleteModal";
import DefaultImage from "../../assets/img/default-image.jpg";
import Alert from "../../components/Alert";
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
              navigate(`/More/CategoryEdit/${category.id}`, {
                state: { category },
              })
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

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = categories.slice(startIndex, endIndex);

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
