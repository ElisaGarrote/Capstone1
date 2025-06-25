import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/custom-colors.css";
import "../styles/AssetAudits.css";
import "../styles/AuditTablesGlobal.css";
import "../styles/UserManagement.css";
import NavBar from "../components/NavBar";
import MediumButtons from "../components/buttons/MediumButtons";
import Status from "../components/Status";
import RegisterUserModal from "../components/RegisterUserModal";
import DeleteModal from "../components/Modals/DeleteModal";
import DefaultProfile from "../assets/img/profile.jpg";
import Alert from "../components/Alert";
import { SkeletonLoadingTable } from "../components/Loading/LoadingSkeleton";
import authService from "../services/auth-service";

export default function UserManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
  }, [location]);

  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeactivate = (user) => {
    setSelectedUser(user);
    setDeactivateModalOpen(true);
  };

  const handleActivate = (user) => {
    // Handle user activation
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === user.id
          ? { ...u, status: { type: "deployable", name: "Active" } }
          : u
      )
    );

    setSuccessMessage(`${user.name} has been activated successfully!`);
    setTimeout(() => setSuccessMessage(""), 5000);
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
    } catch (error) {
      console.error("Deactivation failed:", error);
      throw error;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              setDeactivateModalOpen(false);
            } catch (error) {
              setErrorMessage("Deactivation failed. Please try again.");
              setTimeout(() => setErrorMessage(""), 5000);
              setDeactivateModalOpen(false);
            }
          }}
          onCancel={() => setDeactivateModalOpen(false)}
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${selectedUser?.name}? This user will no longer be able to access the system until reactivated.`}
        />
      )}

      <nav>
        <NavBar />
      </nav>

      <main className="asset-audits-page">
        <section className="main-top">
          <h1>Agent</h1>
          <div>
          </div>
        </section>
        <section className="main-middle">
          <section className="container">
            <section className="top">
              <h2>All Agents ({filteredUsers.length})</h2>
              <div>
                <form>
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <MediumButtons type="export" />
                <button
                  className="invite-agent-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Invite Agent
                </button>
              </div>
            </section>

            <section className="middle">
              {isLoading ? (
                <SkeletonLoadingTable />
              ) : filteredUsers.length === 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>PHOTO</th>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className="table-message">
                        <p>No agents found.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>PHOTO</th>
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <img
                            src={user.photo || DefaultProfile}
                            alt={`${user.name}`}
                            className="user-photo"
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
                              onClick={() => handleActivate(user)}
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              className="deactivate-agent-btn"
                              onClick={() => handleDeactivate(user)}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section></section>
          </section>
        </section>
      </main>

      <RegisterUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}