import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import CategoryFilter from "../../components/FilterPanel";
import DeleteModal from "../../components/Modals/DeleteModal";
import Status from "../../components/Status";
import MockupData from "../../data/mockData/more/status-mockup-data.json";
import Footer from "../../components/Footer";

import "../../styles/Category.css";

const filterConfig = [
  {
    type: "select",
    name: "type",
    label: "Type",
    options: [
      { value: "archived", label: "Archived" },
      { value: "deployable", label: "Deployable" },
      { value: "deployed", label: "Deployed" },
      { value: "pending", label: "Pending" },
      { value: "undeployable", label: "Undeployable" },
    ],
  },
];

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

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = MockupData.slice(startIndex, endIndex);

  return (
    <>
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
              <h2 className="h2">Statuses ({MockupData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
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
                totalItems={MockupData.length}
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
