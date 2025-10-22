<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
import { useNavigate } from "react-router-dom";
>>>>>>> ui-merge-area
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
import DeleteModal from "../../components/Modals/DeleteModal";
<<<<<<< HEAD
import { fetchAllCategories, deleteCategory, } from "../../services/contexts-service";
import DefaultImage from "../../assets/img/default-image.jpg";
=======
import Footer from "../../components/Footer";

import "../../styles/Category.css";
>>>>>>> ui-merge-area


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
function TableHeader( { allSelected, onSelectAll }) {
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
          <img
            src={category.logo || DefaultImage}
            alt={category.name}
            className="category-logo"
          />
          {category.name}
        </div>
      </td>
      <td>{category.type}</td>
      <td>{category.quantity}</td>
      <td>
        <section className="action-button-section">
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate("/More/CategoryEdit", { state: { category } })
            }
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title="Delete"
            className="action-button"
            onClick={() => onDeleteClick(category.id)}
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
      if (selectedCategoryId) {
        // Single delete
        await deleteCategory(selectedCategoryId);
      } else if (selectedIds.length > 0) {
        // Bulk delete
        await Promise.all(selectedIds.map((id) => deleteCategory(id)));
        setSelectedIds([]);
      }
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.log("Failed to delete category:", error);
    }
  };

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          onConfirm={handleDelete}
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
                    onClick={() => setDeleteModalOpen(true)}
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
                  <TableHeader allSelected={allSelected} onSelectAll={handleSelectAll} />
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((category, index) => (
                      <TableItem
                        key={index}
                        category={category}
                        onDeleteClick={(id) => {
                          setSelectedCategoryId(id);
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
