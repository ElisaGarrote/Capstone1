import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/SupplierRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';

const SupplierEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [logoFile, setLogoFile] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Sample Supplier',
    address: '123 Main St',
    city: 'Seattle',
    zip: '98109',
    contact: 'James Peterson',
    phone: '123-456-7890',
    email: 'contact@example.com',
    url: 'https://example.com',
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
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Suppliers"
            currentPage="Edit Supplier"
            rootNavigatePage="/More/ViewSupplier"
            title={`Edit Supplier - ${formData.name}`}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label htmlFor="name">Supplier Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Amazon"
                value={formData.name}
                onChange={handleInputChange}
                maxLength="100"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleInputChange}
                maxLength="200"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Seattle"
                value={formData.city}
                onChange={handleInputChange}
                maxLength="50"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="zip">Zip *</label>
              <input
                type="text"
                id="zip"
                name="zip"
                placeholder="98109"
                value={formData.zip}
                onChange={handleInputChange}
                maxLength="10"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="contact">Contact Name *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                placeholder="James Peterson"
                value={formData.contact}
                onChange={handleInputChange}
                maxLength="100"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="123-456-7890"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength="20"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="url">URL</label>
              <input
                type="text"
                id="url"
                name="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleInputChange}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={handleInputChange}
                maxLength="500"
              ></textarea>
            </fieldset>

            <fieldset>
              <label>Logo</label>
              {logoFile ? (
                <div className="image-selected">
                  <img src={URL.createObjectURL(logoFile)} alt="Selected logo" />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      document.getElementById('logo').value = '';
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose File
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/png, image/jpeg"
                    onChange={handleFileSelection}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
              <small className="file-size-info">Maximum file size must be 5MB</small>
            </fieldset>

            <button type="submit" className="save-btn">Save</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default SupplierEdit;
