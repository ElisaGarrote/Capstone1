import React from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import ViewPage from "../../components/View/Viewpage";
import Status from "../../components/Status";
import "../../styles/DetailedViewPage.css";
import "../../styles/UserManagement/UserManagement.css";

export default function UserManagementViewPage() {
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="view-page-layout">
          <section className="view-title-section">
            <h1>User not found</h1>
          </section>
        </main>
      </>
    );
  }

  const nameParts = (user.name || "").split(" ");
  const firstName = nameParts[0] || "—";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "—";
  
  return (
    <>
      <NavBar />
      <ViewPage
        breadcrumbRoot="User Management"
        breadcrumbCurrent="User Details"
        breadcrumbRootPath="/user-management"
        title={user.name || "User Details"}
      >
        <div className="user-management-view-content">
          <div className="asset-details-section">
            <h3 className="section-header">Personal Information</h3>
            <div className="asset-details-grid">
              <div className="detail-row">
                <label>First Name</label>
                <span>{firstName}</span>
              </div>
              <div className="detail-row">
                <label>Last Name</label>
                <span>{lastName}</span>
              </div>
              <div className="detail-row">
                <label>Email</label>
                <span>{user.email || "N/A"}</span>
              </div>
              <div className="detail-row">
                <label>Role</label>
                <span>{user.role || "N/A"}</span>
              </div>
              <div className="detail-row">
                <label>Status</label>
                <span>
                  <Status type={user.status?.type} name={user.status?.name} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </ViewPage>
    </>
  );
}

