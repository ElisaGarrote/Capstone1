import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/SupplierRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";

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
    setFormData(prev => ({ ...prev, [name]: value }));
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

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate fields again before sending (optional)
  for (const [key, value] of Object.entries(formData)) {
    if ((key !== 'notes' && key !== 'url') && !validateField(key, value)) {
      alert(`Please correct the field: ${key}`);
      return;
    }
  }

  // Prepare form data for backend (Django expects these keys)
  const dataToSend = new FormData();
  dataToSend.append('name', formData.name);
  dataToSend.append('address', formData.address);
  dataToSend.append('city', formData.city);
  dataToSend.append('zip', formData.zip);
  dataToSend.append('contact_name', formData.contact);
  dataToSend.append('phone_number', formData.phone);
  dataToSend.append('email', formData.email);
  dataToSend.append('URL', formData.url);
  dataToSend.append('notes', formData.notes);
  if (logoFile) dataToSend.append('logo', logoFile);

  try {
    const response = await fetch('http://127.0.0.1:8000/contexts/supplier/registration/', {
      method: 'POST',
      body: dataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      alert('Failed to submit. Please check input fields.');
      return;
    }

    const result = await response.json();
    console.log('Success:', result);
    alert('Supplier added successfully!');
    navigate('/More/ViewSupplier');
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to connect to the server.');
  }
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
            currentPage="New Supplier"
            rootNavigatePage="/More/ViewSupplier"
            title="New Supplier"
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
                placeholder="Supplier Name"
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
                placeholder="Supplier Address"
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
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
                maxLength="50"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="zip">Zip Code*</label>
              <input
                type="text"
                id="zip"
                name="zip"
                placeholder="Enter Zip Code"
                value={formData.zip}
                onChange={handleInputChange}
                maxLength="5"
                required
              />
            </fieldset>

            <fieldset>
              <label htmlFor="contact">Contact Name *</label>
              <input
                type="text"
                id="contact"
                name="contact"
                placeholder="Enter Contact Name"
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
                placeholder="XXXX-XXX-XXXX"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength="13"
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

export default SupplierRegistration;
