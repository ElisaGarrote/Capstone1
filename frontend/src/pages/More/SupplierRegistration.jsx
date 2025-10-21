import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/SupplierRegistration.css';
import TopSecFormPage from '../../components/TopSecFormPage';
import Alert from '../../components/Alert';
import SystemLoading from '../../components/Loading/SystemLoading';

const SupplierRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      city: '',
      zip: '',
      contact_name: '',
      phone_number: '',
      email: '',
      URL: '',
      notes: '',
    },
  });

  const contextServiceUrl = 'https://contexts-service-production.up.railway.app';

  useEffect(() => {
    const initialize = async () => {
      try {
        if (id) {
          const supplierData = await fetchAllCategories();
          if (!supplierData) throw new Error('Failed to fetch supplier details');

          setValue('name', supplierData.name || '');
          setValue('address', supplierData.address || '');
          setValue('city', supplierData.city || '');
          setValue('zip', supplierData.zip || '');
          setValue('contact_name', supplierData.contact_name || '');
          setValue('phone_number', supplierData.phone_number || '');
          setValue('email', supplierData.email || '');
          setValue('URL', supplierData.URL || '');
          setValue('notes', supplierData.notes || '');

          if (supplierData.logo) {
            setPreviewImage(`${contextServiceUrl}${supplierData.logo}`);
          }
        }
      } catch (error) {
        setErrorMessage(error.message || 'Failed to initialize form');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [id, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image exceeds 5MB.');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Only image files are allowed.');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!id) {
      const existingSuppliers = await contextsService.fetchAllSupplierNames();
      if (!existingSuppliers) throw new Error('Failed to fetch supplier names for duplicate check');

      const isDuplicate = existingSuppliers.suppliers.some(
        (supplier) => supplier.name.toLowerCase() === data.name.toLowerCase()
      );
      if (isDuplicate) {
        setErrorMessage('A supplier with this name already exists. Please use a different name.');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
        }
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('zip', data.zip);
      formData.append('contact_name', data.contact_name);
      formData.append('phone_number', data.phone_number);
      formData.append('email', data.email);
      formData.append('URL', data.URL || '');
      formData.append('notes', data.notes || '');

      if (selectedImage) formData.append('logo', selectedImage);
      if (removeImage) formData.append('remove_logo', 'true');

      let result;
      if (id) {
        result = await contextsService.updateSupplier(id, formData);
      } else {
        result = await contextsService.createSupplier(formData);
      }

      if (!result) throw new Error('Failed to save supplier');

      navigate('/More/ViewSupplier', {
        state: { successMessage: `Supplier successfully ${id ? 'updated' : 'created'}` },
      });
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error?.error || error?.message || 'An unexpected error occurred';
      
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    }

  };

  if (isLoading) return <SystemLoading />;

  return (
    <>
      <NavBar />
      <main className="registration">
        <TopSecFormPage
          root="Suppliers"
          currentPage={id ? 'Edit Supplier' : 'New Supplier'}
          rootNavigatePage="/More/ViewSupplier"
          title={id ? 'Edit Supplier' : 'New Supplier'}
        />
        {errorMessage && <Alert type="danger" message={errorMessage} />}
        <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
          <fieldset>
            <label>Supplier Name *</label>
            <input placeholder="Supplier Name" {...register('name', { required: true })} maxLength={100} />
          </fieldset>

          <fieldset>
            <label>Address</label>
            <input placeholder="Address" {...register('address')} maxLength={200} />
          </fieldset>

          <fieldset>
            <label>City</label>
            <input placeholder="City" {...register('city')} maxLength={50} />
          </fieldset>

          <fieldset>
            <label>Zip Code</label>
            <input placeholder="ZIP" {...register('zip')} maxLength={5} />
          </fieldset>

          <fieldset>
            <label>Contact Name</label>
            <input placeholder="Supplier's Contact Name" {...register('contact_name')} maxLength={100} />
          </fieldset>

          <fieldset>
            <label>Phone Number</label>
            <input placeholder="Contact's Phone Number" {...register('phone_number')} maxLength={13} />
          </fieldset>

          <fieldset>
            <label>Email</label>
            <input type="email" placeholder="Contact's Email" {...register('email')} />
          </fieldset>

          <fieldset>
            <label>URL</label>
            <input placeholder="URL" {...register('URL')} />
          </fieldset>

          <fieldset>
            <label>Notes</label>
            <textarea placeholder="Notes..." {...register('notes')} maxLength={500} />
          </fieldset>

          <fieldset>
            <label>Logo</label>
            {previewImage ? (
              <div className="image-selected">
                <img src={previewImage} alt="Logo preview" />
                <button type="button" onClick={() => { setPreviewImage(null); setSelectedImage(null); setRemoveImage(true); }}>
                  ×
                </button>
              </div>
            ) : (
              <label className="upload-image-btn">
                Choose File
                <input type="file" accept="image/*" onChange={handleImageSelection} hidden />
              </label>
            )}
            <small className="file-size-info">Max file size: 5MB</small>
          </fieldset>

          <button type="submit" className="save-btn">Save</button>
        </form>
      </main>
    </>
  );
};

export default SupplierRegistration;