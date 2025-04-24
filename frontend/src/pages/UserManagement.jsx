import { useState } from "react";
import NavBar from "../components/NavBar";
import RegisterUserModal from "../components/RegisterUserModal";
import "../styles/UserManagement.css";
import ProfileImage from "../assets/img/profile.jpg";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data for users - replace with actual data later
  const users = [
    { id: 1, name: "Pia Piattos-Lim", role: "Operator", status: "Active" },
    { id: 2, name: "Miggy Mango", role: "Admin", status: "Active" },
    { id: 3, name: "Gloiza Ranger", role: "Operator", status: "Inactive" },
    { id: 4, name: "Renan Piatos", role: "Operator", status: "Active" },
    { id: 5, name: "Pia Piatos-Lim", role: "Operator", status: "Active" },
    { id: 6, name: "May Pamana", role: "Operator", status: "Active" },
    { id: 7, name: "Miggy Mango", role: "Operator", status: "Inactive" },
    { id: 8, name: "Renan Piatos", role: "Operator", status: "Active" }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <NavBar />
      <main className="user-management-page">
        <div className="user-management-container">
          <div className="header">
            <h1>User Management</h1>
          </div>

          <div className="user-section">
            <div className="user-header">
              <h2>All users ({users.length})</h2>
              <div className="user-actions">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="filter-btn">Filter</button>
                <button 
                  className="add-user-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Add User
                </button>
              </div>
            </div>

            <div className="user-grid">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img src={ProfileImage} alt={user.name} />
                    </div>
                    <div className="user-details">
                      <h3>{user.name}</h3>
                      <div className="user-badges">
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="action-btn primary">Make Changes</button>
                    <button 
                      className={`action-btn ${user.status === 'Active' ? 'danger' : 'success'}`}
                    >
                      {user.status === 'Active' ? 'Make Inactive' : 'Make Active'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <RegisterUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 