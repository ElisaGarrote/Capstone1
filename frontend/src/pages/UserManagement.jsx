import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import MediumButtons from "../components/buttons/MediumButtons";
import Status from "../components/Status";
import RegisterUserModal from "../components/RegisterUserModal";
import DeleteModal from "../components/Modals/DeleteModal";
import DefaultProfile from "../assets/img/profile.jpg";
import Alert from "../components/Alert";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";
import { exportToExcel } from "../utils/exportToExcel";

import "../styles/UserManagement/UserManagement.css";

// TableHeader component to render the table header
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
      <th>PHOTO</th>
      <th>NAME</th>
      <th>EMAIL</th>
      <th>ROLE</th>
      <th>STATUS</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each user row
function TableItem({ user, isSelected, onRowChange, onDeactivateClick, onActivateClick }) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(user.id, e.target.checked)}
        />
      </td>
      <td>
        <img
          src={user.photo || DefaultProfile}
          alt={user.name}
          className="table-img"
          onError={(e) => {
            e.target.src = DefaultProfile;
          }}
        />
      </td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <Status
          type={user.status.type}
          name={user.status.name}
        />
      </td>
      <td>
        {user.status.type === "archived" || user.status.name === "Inactive" ? (
          <button
            className="activate-agent-btn"
            onClick={() => onActivateClick(user)}
          >
            Activate
          </button>
        ) : (
          <button
            className="deactivate-agent-btn"
            onClick={() => onDeactivateClick(user)}
          >
            Deactivate
          </button>
        )}
      </td>
    </tr>
  );
}

export default function UserManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // User data state
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [isActivateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search and alert state
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");



  // Mock data for users - replace with actual data later
  const mockUsers = [
    {
      id: 1,
      name: "John Ronald Smith",
      email: "johnsmith@example.net",
      role: "Employee",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Mark Mayer",
      email: "mark7@example.com",
      role: "Admin",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-02-20T14:15:00Z"
    },
    {
      id: 3,
      name: "Jerry Jasmine Tran",
      email: "catherinetran@example.net",
      role: "Employee",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-03-10T09:45:00Z"
    },
    {
      id: 4,
      name: "Stephanie Lindsey Miranda",
      email: "heather@example.org",
      role: "Manager",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-01-25T16:20:00Z"
    },
    {
      id: 5,
      name: "Douglas Harmon",
      email: "johnnyray@example.com",
      role: "Employee",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-04-05T11:30:00Z"
    },
    {
      id: 6,
      name: "Brittany Phillips",
      email: "brownmichael@example.net",
      role: "Employee",
      status: {
        type: "deployable",
        name: "Active"
      },
      photo: DefaultProfile,
      created_at: "2024-02-28T13:10:00Z"
    }
  ];

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredData.slice(startIndex, endIndex);

  // Selection logic
  const allSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedUsers.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedUsers.map((item) => item.id).includes(id))
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
      console.log("Deleting single user id:", deleteTarget);
      // remove from mock data / API call
    } else {
      console.log("Deleting multiple user ids:", selectedIds);
      // remove multiple
      setSelectedIds([]); // clear selection
    }
    closeDeleteModal();
  };

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    // Initialize with mock data
    setUsers(mockUsers);
    setFilteredData(mockUsers);
  }, [location]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user => {
      return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             user.role.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, users]);

  const handleDeactivate = (user) => {
    setSelectedUser(user);
    setDeactivateModalOpen(true);
  };

  const handleActivate = (user) => {
    setSelectedUser(user);
    setActivateModalOpen(true);
  };

  const confirmActivate = async (user) => {
    try {
      console.log("Activating user:", user.id);

      // Update the user's status in the local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, status: { type: "deployable", name: "Active" } }
            : u
        )
      );

      setSuccessMessage(`${user.name} has been activated successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      setActivateModalOpen(false);
    } catch (error) {
      console.error("Activation failed:", error);
      throw error;
    }
  };

  const confirmDeactivate = async (user) => {
    try {
      console.log("Deactivating user:", user.id);

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, status: { type: "archived", name: "Inactive" } }
            : u
        )
      );

      setSuccessMessage(`${user.name} has been deactivated successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
      setDeactivateModalOpen(false);
    } catch (error) {
      console.error("Deactivation failed:", error);
      throw error;
    }
  };

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : users;
    exportToExcel(dataToExport, "Users_Records.xlsx");
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeactivateModalOpen && selectedUser && (
        <DeleteModal
          isOpen={isDeactivateModalOpen}
          onConfirm={async () => {
            try {
              await confirmDeactivate(selectedUser);
            } catch (error) {
              setErrorMessage("Deactivation failed. Please try again.");
              setTimeout(() => setErrorMessage(""), 5000);
            }
          }}
          onCancel={() => setDeactivateModalOpen(false)}
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${selectedUser?.name}? This user will no longer be able to access the system until reactivated.`}
        />
      )}

      {isActivateModalOpen && selectedUser && (
        <DeleteModal
          isOpen={isActivateModalOpen}
          onConfirm={async () => {
            try {
              await confirmActivate(selectedUser);
            } catch (error) {
              setErrorMessage("Activation failed. Please try again.");
              setTimeout(() => setErrorMessage(""), 5000);
            }
          }}
          onCancel={() => setActivateModalOpen(false)}
          title="Activate User"
          message={`Are you sure you want to activate ${selectedUser?.name}? This user will be able to access the system again.`}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          title="Delete User"
          message={deleteTarget ? "Are you sure you want to delete this user?" : "Are you sure you want to delete the selected users?"}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">All Agents ({filteredData.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => {
                    console.log("🔘 FILTER BUTTON CLICKED!");
                  }}
                >
                  Filter
                </button>
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
                <MediumButtons
                  type="new"
                  onClick={() => setIsModalOpen(true)}
                  label="Invite Agent"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="users-table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableItem
                        key={user.id}
                        user={user}
                        isSelected={selectedIds.includes(user.id)}
                        onRowChange={handleRowChange}
                        onDeactivateClick={handleDeactivate}
                        onActivateClick={handleActivate}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data-message">
                        No Agents Found.
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

      <RegisterUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}