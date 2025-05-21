import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/SupplierRegistration.css';

const SupplierRegistration = () => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    contact: '',
    phone: '',
    email: '',
    url: '',
    notes: '',
  });

  const validateField = (name, value) => {
    const regexMap = {
      name: /^[A-Za-z0-9\s\-']{1,100}$/,
      address: /^[A-Za-z0-9\s.,'-]{1,200}$/,
      city: /^[A-Za-z\s]{1,50}$/,
      zip: /^[0-9]{4,10}$/,
      contact: /^[A-Za-z\s]{1,100}$/,
      phone: /^[0-9()+\-\s]{7,20}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      url: /^(https?:\/\/[^\s]+)$/,
      notes: /^.{0,500}$/,
    };

    return regexMap[name] ? regexMap[name].test(value) : true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (validateField(name, value) || value === '') {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileSelection = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        alert('Only PNG, JPG, or JPEG files are allowed.');
        return;
      }

      if (!isValidSize) {
        alert('File size must be less than 5MB.');
        return;
      }

      setLogoFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const [key, value] of Object.entries(formData)) {
      if ((key !== 'notes' && key !== 'url') && !validateField(key, value)) {
        alert(`Please correct the field: ${key}`);
        return;
      }
    }

    console.log('Form submitted:', formData, logoFile);
    navigate('/More/ViewSupplier');
  };

  return (
    <div className="supplier-page-container">
      <NavBar />
      <div className="supplier-page-content">
        <div className="breadcrumb">
          <span className="root-link" onClick={() => navigate('/More/ViewSupplier')}>Suppliers</span>
          <span className="separator">/</span>
          <span className="current-page">New Supplier</span>
        </div>

        <h1 className="page-title">New Supplier</h1>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Supplier Name *', name: 'name', placeholder: 'Amazon' },
              { label: 'Address *', name: 'address', placeholder: '123 Main St' },
              { label: 'City *', name: 'city', placeholder: 'Seattle' },
              { label: 'Zip *', name: 'zip', placeholder: '98109' },
              { label: 'Contact Name *', name: 'contact', placeholder: 'James Peterson' },
              { label: 'Phone Number *', name: 'phone', placeholder: '123-456-7890' },
              { label: 'Email *', name: 'email', placeholder: 'example@email.com' },
              { label: 'URL', name: 'url', placeholder: 'https://example.com' },
              { label: 'Notes', name: 'notes', placeholder: 'Optional notes...' },
            ].map((field) => (
              <div className="form-field" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  required={!['notes', 'url'].includes(field.name)}
                />
              </div>
            ))}

            <div className="form-field">
              <label>Logo</label>
              <div className="attachments-container">
                <button
                  className="choose-file-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('logo').click();
                  }}
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/png, image/jpeg"
                  style={{ display: 'none' }}
                  onChange={handleFileSelection}
                />
                {logoFile ? (
                  <div className="file-selected">
                    <p>{logoFile.name}</p>
                    <button
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setLogoFile(null);
                        document.getElementById('logo').value = '';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span className="no-file">No file chosen</span>
                )}
                <p className="file-size-limit">Maximum file size is 5MB</p>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegistration;
