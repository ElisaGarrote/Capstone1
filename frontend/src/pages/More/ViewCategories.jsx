import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import "../../styles/Category.css";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/Modals/DeleteModal";
import { fetchAllCategories, deleteCategory, } from "../../services/contexts-service";
import DefaultImage from "../../assets/img/default-image.jpg";


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
function TableHeader() {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-category"
          id="checkbox-category"
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
function TableItem({ category, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <tr>
      <td>
        <div className="checkbox-category">
          <input type="checkbox" name="" id="" />
        </div>
      </td>
      <td>
        <div className="category-name">
          <img
            src={category.logo ? category.logo : DefaultImage}
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
              navigate("/Repair/CategoryEdit", { state: { category } })
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
  const handleDelete =  async () => {
    try {
      await deleteCategory(selectedCategoryId);
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.log("Failed to delete category:", error);
    }
  }

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          onConfirm={handleDelete}
        />
      )}

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          {/* Table Filter */}
          <CategoryFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Categories ({categories.length})</h2>
              <section className="table-actions">
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
                          setSelectedCategoryId(id);
                          setDeleteModalOpen(true);
                        }}
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
      </section>
    </>
  );
}
