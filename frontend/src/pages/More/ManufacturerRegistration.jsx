import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/ManufacturerRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useForm } from 'react-hook-form';
import CloseIcon from '../../assets/icons/close.svg';

const ManufacturerRegistration = () => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      manufacturerName: '',
      url: '',
      supportUrl: '',
      supportPhone: '',
      supportEmail: '',
      notes: ''
    }
  });

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

  const onSubmit = (data) => {
    // Here you would typically send the data to your API
    console.log('Form submitted:', data, logoFile);

    // Optional: navigate back to manufacturers view after successful submission
    navigate('/More/ViewManufacturer');
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Manufacturers"
            currentPage="New Manufacturer"
            rootNavigatePage="/More/ViewManufacturer"
            title="New Manufacturer"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor="manufacturerName">Manufacturer Name *</label>
              <input
                type="text"
                placeholder="Manufacturer Name"
                className={errors.manufacturerName ? 'input-error' : ''}
                {...register("manufacturerName", { required: 'Manufacturer Name is required' })}
              />
              {errors.manufacturerName && <span className='error-message'>{errors.manufacturerName.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor="url">URL</label>
              <input
                type="url"
                placeholder="URL"
                {...register("url")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="supportUrl">Support URL</label>
              <input
                type="url"
                placeholder="Support URL"
                {...register("supportUrl")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="supportPhone">Support Phone</label>
              <input
                type="tel"
                placeholder="Support Phone"
                {...register("supportPhone")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="supportEmail">Support Email</label>
              <input
                type="email"
                placeholder="Support Email"
                {...register("supportEmail")}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Notes"
                rows="4"
                {...register("notes")}
              />
            </fieldset>

            <fieldset>
              <label>Logo</label>
              {logoFile ? (
                <div className="image-selected">
                  <img src={URL.createObjectURL(logoFile)} alt="Selected logo" />
                  <button type="button" onClick={() => setLogoFile(null)}>
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
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
export default ManufacturerRegistration;