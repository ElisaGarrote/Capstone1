import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/ManufacturerRegistration.css';

const ManufacturerRegistration = () => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  
  const [formData, setFormData] = useState({
    manufacturerName: '',
    url: '',
    supportUrl: '',
    supportPhone: '',
    supportEmail: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log('Form submitted:', formData, logoFile);
    
    // Optional: navigate back to manufacturers view after successful submission
    navigate('/More/ViewManufacturer');
  };

  return (
    <div className="manufacturer-page-container">
      <NavBar />

      <div className="manufacturer-page-content">
        <div className="breadcrumb">
          <span className="root-link" onClick={() => navigate('/More/ViewManufacturer')}>Manufacturers</span>
          <span className="separator">/</span>
          <span className="current-page">New Manufacturer</span>
        </div>

        <h1 className="page-title">New Manufacturer</h1>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="manufacturerName">Manufacturer Name *</label>
              <input
                type="text"
                name="manufacturerName"
                id="manufacturerName"
                placeholder="Manufacturer Name"
                value={formData.manufacturerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="url">URL</label>
              <input
                type="url"
                name="url"
                id="url"
                placeholder="URL"
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="supportUrl">Support URL</label>
              <input
                type="url"
                name="supportUrl"
                id="supportUrl"
                placeholder="Support URL"
                value={formData.supportUrl}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="supportPhone">Support Phone</label>
              <input
                type="tel"
                name="supportPhone"
                id="supportPhone"
                placeholder="Support Phone"
                value={formData.supportPhone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="supportEmail">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                id="supportEmail"
                placeholder="Support Email"
                value={formData.supportEmail}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                id="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-field">
              <label>Logo</label>
              <div className="attachments-container">
                <button className="choose-file-btn" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("logo").click();
                }}>
                  Choose File
                </button>
                <input
                  type="file"
                  name="logo"
                  id="logo"
                  accept="image/*"
                  onChange={handleFileSelection}
                  style={{ display: "none" }}
                />
                {logoFile ? (
                  <div className="file-selected">
                    <p>{logoFile.name}</p>
                    <button
                      className="remove-file-btn"
                      onClick={(event) => {
                        event.preventDefault();
                        setLogoFile(null);
                        document.getElementById("logo").value = "";
                      }}
                    >
                      <span>×</span>
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
};
export default ManufacturerRegistration;