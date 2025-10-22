import "./DetailedViewPage.css";
import Status from "../Status";
import MediumButtons from "../buttons/MediumButtons";
import DefaultProfile from "../../assets/img/default-profile.svg";

export default function DetailedViewPage({
  breadcrumbRoot,
  breadcrumbCurrent,
  breadcrumbRootPath,
  title,
  subtitle,
  assetTag,
  status,
  statusType = "ready-to-deploy",
  company,
  checkoutDate,
  nextAuditDate,
  manufacturer,
  manufacturerUrl,
  supportUrl,
  supportPhone,
  category,
  model,
  modelNo,
  tabs = [],
  activeTab = 0,
  actionButtons,
  checkedOutTo,
  onTabChange,
  onEditClick,
  onCheckInClick,
  onAddNoteClick,
  onAuditClick,
  onDeleteClick,
  onUploadClick,
  children
}) {
  return (
    <main className="detailed-view-layout">
      {/* Breadcrumb Navigation */}
      <section className="detailed-breadcrumb">
        <ul>
          <li>
            <a href={breadcrumbRootPath}>{breadcrumbRoot}</a>
          </li>
          <li>{breadcrumbCurrent}</li>
        </ul>
      </section>

      {/* Page Title */}
      <section className="detailed-title-section">
        <h1>{title}</h1>
        {subtitle && <span className="detailed-subtitle">{subtitle}</span>}
      </section>

      {/* Navigation Tabs */}
      <section className="detailed-tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange(index)}
          >
            {tab.label}
          </button>
        ))}
        <div className="tab-actions">
          <MediumButtons
            type="export"
            onClick={onUploadClick || (() => console.log("Upload clicked"))}
          />
        </div>
      </section>

      {/* Main Content Area */}
      <section className="detailed-content-wrapper">
        {/* Left Content - Asset Details */}
        <section className="detailed-main-content">
          <div className="asset-details-grid">
            <div className="detail-row">
              <label>Asset Tag</label>
              <span>{assetTag}</span>
            </div>

            <div className="detail-row">
              <label>Status</label>
              <div className="status-with-actions">
                <Status
                  type={statusType === "ready-to-deploy" ? "deployable" : statusType}
                  name={status}
                />
              </div>
            </div>

            <div className="detail-row">
              <label>Company</label>
              <span>{company}</span>
            </div>

            <div className="detail-row">
              <label>Checkout Date</label>
              <span>{checkoutDate}</span>
            </div>

            <div className="detail-row">
              <label>Next Audit Date</label>
              <span>{nextAuditDate}</span>
            </div>

            <div className="detail-row">
              <label>Manufacturer</label>
              <div className="manufacturer-links">
                <div>
                  <span>{manufacturer}</span>
                </div>
                <div>
                  <a href={manufacturerUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-external-link-alt"></i> {manufacturerUrl}
                  </a>
                </div>
                <div>
                  <a href={supportUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-external-link-alt"></i> {supportUrl}
                  </a>
                </div>
                <div>
                  <a href={`tel:${supportPhone}`}>
                    <i className="fas fa-phone"></i> {supportPhone}
                  </a>
                </div>
              </div>
            </div>

            <div className="detail-row">
              <label>Category</label>
              <span>{category}</span>
            </div>

            <div className="detail-row">
              <label>Model</label>
              <span>{model}</span>
            </div>

            <div className="detail-row">
              <label>Model No.</label>
              <span>{modelNo}</span>
            </div>
          </div>

          {/* Custom Children Content */}
          {children}
        </section>

        {/* Right Sidebar - Action Buttons */}
        <aside className="detailed-sidebar">
          <div className="action-buttons-section">
            <button
              className="action-btn blue-btn"
              onClick={onEditClick || (() => console.log("Edit clicked"))}
            >
              Edit Asset
            </button>

            <button
              className="action-btn blue-btn"
              onClick={onCheckInClick || (() => console.log("Check-in clicked"))}
            >
              Check-in Asset
            </button>

            <button
              className="action-btn blue-btn"
              onClick={onAddNoteClick || (() => console.log("Add note clicked"))}
            >
              Add Note
            </button>

            <button
              className="action-btn blue-btn"
              onClick={onAuditClick || (() => console.log("Audit clicked"))}
            >
              Audit
            </button>

            <button
              className="action-btn red-btn"
              onClick={onDeleteClick || (() => console.log("Delete clicked"))}
            >
              Check-in and Delete
            </button>
          </div>

          {/* Checked Out To Section */}
          {checkedOutTo && (
            <div className="checked-out-section">
              <h3>Checked Out To</h3>
              <div className="checked-out-info">
                <div className="user-avatar">
                  <img
                    src={DefaultProfile}
                    alt="User Profile"
                    className="profile-icon"
                  />
                </div>
                <div className="user-details">
                  <div className="user-name">{checkedOutTo.name}</div>
                  <div className="user-email">{checkedOutTo.email}</div>
                  <div className="checkout-date">Checkout Date: {checkedOutTo.checkoutDate}</div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Action Buttons */}
          {actionButtons && (
            <div className="custom-action-buttons">
              {actionButtons}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
