import NavBar from "../../components/NavBar"
import "../../styles/MaintenanceRegistration.css"
import { useNavigate } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";
import CloseIcon from "../../assets/icons/close.svg"
import { useState } from "react";

export default function MaintenanceRegistration() {
    const navigate = useNavigate();
    const currentDate = new Date().toISOString().split("T")[0];
    const [attachmentFile, setAttachmentFile] = useState(null);

    const handleFileSelection = (event) => {
      const file = event.target.files[0];
      if (file) {
        setAttachmentFile(file);
      } else {
        setAttachmentFile(null);
      }
    }

    return (
      <div className="maintenance-page-container">
        <NavBar />

        <div className="maintenance-page-content">
          <div className="breadcrumb">
            <span className="root-link" onClick={() => navigate('/dashboard/Repair/Maintenance')}>Asset Repairs</span>
            <span className="separator">/</span>
            <span className="current-page">New Repair</span>
          </div>

          <h1 className="page-title">New Repair</h1>

          <div className="form-container">
            <form action="" method="post">
              <div className="form-field">
                <label htmlFor="asset">Asset *</label>
                <div className="select-wrapper">
                  <select name="asset" id="asset" required>
                    <option value="">Select an Asset</option>
                    <option value="asset1">Asset 1</option>
                    <option value="asset2">Asset 2</option>
                    <option value="asset3">Asset 3</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="supplier">Supplier</label>
                <div className="select-wrapper">
                  <select name="supplier" id="supplier">
                    <option value="">Search for Supplier</option>
                    <option value="supplier1">Supplier 1</option>
                    <option value="supplier2">Supplier 2</option>
                    <option value="supplier3">Supplier 3</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="maintenance-type">Maintenance Type *</label>
                <div className="select-wrapper">
                  <select name="maintenance-type" id="maintenance-type" required>
                    <option value="">Select Maintenance Type</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="calibration">Calibration</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="maintenance-name">Maintenance Name *</label>
                <input
                  type="text"
                  name="maintenance-name"
                  id="maintenance-name"
                  placeholder="Maintenance Name"
                  maxLength="100"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="start-date">Start Date *</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="start-date"
                    id="start-date"
                    max={currentDate}
                    required
                  />
                  <span className="calendar-icon"></span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="end-date">End Date</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="end-date"
                    id="end-date"
                    min={currentDate}
                  />
                  <span className="calendar-icon"></span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="cost">Cost</label>
                <div className="cost-input">
                  <span className="currency">PHP</span>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  maxLength="500"
                  rows="6"
                ></textarea>
              </div>

              <div className="form-field">
                <label>Attachments</label>
                <div className="attachments-container">
                  <button className="choose-file-btn" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("attachment").click();
                  }}>
                    Choose File
                  </button>
                  <input
                    type="file"
                    name="attachment"
                    id="attachment"
                    onChange={handleFileSelection}
                    style={{ display: "none" }}
                  />
                  {attachmentFile ? (
                    <div className="file-selected">
                      <p>{attachmentFile.name}</p>
                      <button
                        className="remove-file-btn"
                        onClick={(event) => {
                          event.preventDefault();
                          setAttachmentFile(null);
                          document.getElementById("attachment").value = "";
                        }}
                      >
                        <img src={CloseIcon} alt="Remove file" />
                      </button>
                    </div>
                  ) : (
                    <span className="no-file">No file chosen</span>
                  )}
                  <p className="file-size-limit">Maximum file size must be 5MB</p>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
}