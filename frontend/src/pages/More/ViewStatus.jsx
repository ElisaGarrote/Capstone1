import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import StatusFilterModal from "../../components/Modals/StatusFilterModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import Status from "../../components/Status";
import MockupData from "../../data/mockData/more/status-mockup-data.json";
import Footer from "../../components/Footer";

import "../../styles/Category.css";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>
        <input type="checkbox" name="checkbox-status" id="checkbox-status" />
      </th>
      <th>NAME</th>
      <th>TYPE</th>
      <th>NOTES</th>
      <th>TAG</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ status, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const systemDefaultStatus = [
    "Archived",
    "Being Repaired",
    "Broken",
    "Deployed",
    "Lost or Stolen",
    "Pending",
    "Ready to Deploy",
  ];

  const isDefaultStatus = (status) => {
    // Check if the status is a system default
    const isDefault = systemDefaultStatus.some(
      (defaultStatus) =>
        defaultStatus.toLowerCase() === status.name.toLowerCase()
    );

    return isDefault || status.tag > 0;
  };

  const getTitle = (actionType, status) => {
    // Check if the status is a system default
    const isDefault = systemDefaultStatus.some(
      (defaultStatus) =>
        defaultStatus.toLowerCase() === status.name.toLowerCase()
    );

    if (isDefault) {
      return `This is a system default status label, and cannot be ${
        actionType === "delete" ? "deleted" : "edited"
      }`;
    } else if (status.tag > 0) {
      return `This status is currently in use and cannot be ${
        actionType === "delete" ? "deleted" : "edited"
      }`;
    } else {
      return actionType === "delete" ? "Delete" : "Edit";
    }
  };

  return (
    <tr>
      <td>
        <div className="checkbox-status">
          <input type="checkbox" name="" id="" />
        </div>
      </td>
      <td>{status.name}</td>
      <td>
        <Status
          type={status.type}
          name={status.type[0].toUpperCase() + status.type.slice(1)}
        />
      </td>
      <td>{status.notes || "-"}</td>
      <td>{status.tag}</td>
      <td>
        <section className="action-button-section">
          <button
            title={getTitle("edit", status)}
            className="action-button"
            onClick={() =>
              navigate(`/More/StatusEdit/${status.id}`, { state: { status } })
            }
            disabled={isDefaultStatus(status)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title={getTitle("delete", status)}
            className="action-button"
            onClick={onDeleteClick}
            disabled={isDefaultStatus(status)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
      </td>
    </tr>
  );
}

export default function Category() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(MockupData);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((status) =>
        status.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Type
    if (filters.type && filters.type.value) {
      filtered = filtered.filter((status) =>
        status.type?.toLowerCase() === filters.type.value.toLowerCase()
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

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = filteredData.slice(startIndex, endIndex);

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
        />
      )}

      <StatusFilterModal
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
              <h2 className="h2">Statuses ({filteredData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => {
                    setIsFilterModalOpen(true);
                  }}
                >
                  Filter
                </button>
                <MediumButtons
                  type="new"
                  navigatePage="/More/StatusRegistration"
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
                    paginatedCategories.map((status, index) => (
                      <TableItem
                        key={index}
                        status={status}
                        onDeleteClick={() => setDeleteModalOpen(true)}
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
                totalItems={filteredData.length}
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
