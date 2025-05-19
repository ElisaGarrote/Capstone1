import NavBar from "../../components/NavBar"
import "../../styles/MaintenanceRegistration.css"
import { useNavigate } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";
import CloseIcon from "../../assets/icons/close.svg"
import { useState, useEffect } from "react";

export default function MaintenanceRegistration() {
    const navigate = useNavigate();
    const currentDate = new Date().toISOString().split("T")[0];
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [formData, setFormData] = useState({
        asset: "",
        supplier: "",
        type: "",  // Changed to match your Maintenance.jsx naming
        maintenanceName: "",
        startDate: "",
        endDate: "",
        cost: "",
        notes: ""
    });

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileSelection = (event) => {
      const file = event.target.files[0];
      if (file) {
        setAttachmentFile(file);
      } else {
        setAttachmentFile(null);
      }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format the date to match your existing format (e.g., "May 2, 2025")
        const formatDate = (dateString) => {
            if (!dateString) return "-";
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        };
        
        // Generate a unique 6-digit ID
        const generateId = () => {
            return Math.floor(100000 + Math.random() * 900000).toString();
        };
        
        // Format cost with currency
        const formatCost = (cost) => {
            if (!cost) return "USD 0.0";
            return `USD ${parseFloat(cost).toFixed(1)}`;
        };
        
        // Parse the asset selection to get just the name
        const assetName = formData.asset;
        
        // Create maintenance record object matching your existing schema
        const newMaintenance = {
            id: generateId(),
            name: assetName,
            type: formData.type,
            maintenanceName: formData.maintenanceName,
            startDate: formatDate(formData.startDate),
            endDate: formData.endDate ? formatDate(formData.endDate) : "-",
            cost: formatCost(formData.cost),
            supplier: formData.supplier || "-",
            notes: formData.notes || "-",
            attachments: attachmentFile ? attachmentFile.name : "-"
        };

        // Get existing records from localStorage or initialize empty array
        const existingRecords = JSON.parse(localStorage.getItem('maintenanceRecords')) || [];
        
        // Add new record to the array
        const updatedRecords = [...existingRecords, newMaintenance];
        
        // Save to localStorage
        localStorage.setItem('maintenanceRecords', JSON.stringify(updatedRecords));
        
        // Redirect to maintenance list page with success state
        navigate('/dashboard/Repair/Maintenance', { 
            state: { isAddSuccess: true }
        });
    };

    return (
      <div className="maintenance-page-container">
        <NavBar />
        
        <div className="maintenance-page-content">
          <div className="breadcrumb">
            <span className="root-link" onClick={() => navigate('/dashboard/Repair/Maintenance')}>Maintenance</span>
            <span className="separator">/</span>
            <span className="current-page">New Maintenance</span>
          </div>
          
          <h1 className="page-title">New Maintenance</h1>
          
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="asset">Asset *</label>
                <div className="select-wrapper">
                  <select 
                    name="asset" 
                    id="asset" 
                    value={formData.asset}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select an Asset</option>
                    <option value="iPad Pro">iPad Pro</option>
                    <option value="Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                    <option value="Surface Laptop 5">Surface Laptop 5</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="supplier">Supplier</label>
                <div className="select-wrapper">
                  <select 
                    name="supplier" 
                    id="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                  >
                    <option value="">Search for Supplier</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Staples">Staples</option>
                    <option value="WHSmith">WHSmith</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="type">Maintenance Type *</label>
                <div className="select-wrapper">
                  <select 
                    name="type" 
                    id="type" 
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Maintenance Type</option>
                    <option value="Software">Software</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Upgrade">Upgrade</option>
                  </select>
                  <span className="dropdown-arrow"></span>
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="maintenanceName">Maintenance Name *</label>
                <input
                  type="text"
                  name="maintenanceName"
                  id="maintenanceName"
                  placeholder="Maintenance Name"
                  maxLength="100"
                  value={formData.maintenanceName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="startDate">Start Date *</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    max={currentDate}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="calendar-icon"></span>
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="endDate">End Date</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    min={formData.startDate || currentDate}
                    value={formData.endDate}
                    onChange={handleInputChange}
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
                    value={formData.cost}
                    onChange={handleInputChange}
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
                  value={formData.notes}
                  onChange={handleInputChange}
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