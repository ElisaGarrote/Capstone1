import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/CategoryRegistration.css';

const CategoryRegistration = () => {
  const navigate = useNavigate();
  const [attachmentFile, setAttachmentFile] = useState(null);
  
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryType: '',
    customFields: '',
    skipCheckoutConfirmation: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
      setAttachmentFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log('Form submitted:', formData, attachmentFile);
    
    // Optional: navigate back to categories view after successful submission
    navigate('/More/ViewCategories');
  };

  return (
    <div className="category-page-container">
      <NavBar />

      <div className="category-page-content">
        <div className="breadcrumb">
          <span className="root-link" onClick={() => navigate('/More/ViewCategories')}>Categories</span>
          <span className="separator">/</span>
          <span className="current-page">New Category</span>
        </div>

        <h1 className="page-title">New Category</h1>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="categoryName">Category Name *</label>
              <input
                type="text"
                name="categoryName"
                id="categoryName"
                placeholder="Category Name"
                maxLength="100"
                value={formData.categoryName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="categoryType">Category Type *</label>
              <div className="select-wrapper">
                <select 
                  name="categoryType" 
                  id="categoryType" 
                  value={formData.categoryType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category Type</option>
                  <option value="Asset">Asset</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Accessory">Accessory</option>
                  <option value="License">License</option>
                </select>
                <span className="dropdown-arrow"></span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="customFields">Custom Fields</label>
              <div className="select-wrapper">
                <select 
                  name="customFields" 
                  id="customFields"
                  value={formData.customFields}
                  onChange={handleInputChange}
                >
                  <option value="">Select Custom Fields</option>
                  <option value="Field1">Field 1</option>
                  <option value="Field2">Field 2</option>
                  <option value="Field3">Field 3</option>
                </select>
                <span className="dropdown-arrow"></span>
              </div>
            </div>

            <div className="form-field checkbox-field">
              <input
                type="checkbox"
                name="skipCheckoutConfirmation"
                id="skipCheckoutConfirmation"
                checked={formData.skipCheckoutConfirmation}
                onChange={handleInputChange}
              />
              <label htmlFor="skipCheckoutConfirmation">Skip Checkout Confirmation Emails</label>
            </div>

            <div className="form-field">
              <label>Icon</label>
              <div className="attachments-container">
                <button className="choose-file-btn" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("icon").click();
                }}>
                  Choose File
                </button>
                <input
                  type="file"
                  name="icon"
                  id="icon"
                  accept="image/*"
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
                        document.getElementById("icon").value = "";
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
              <button type="submit" className="save-btn" >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryRegistration;