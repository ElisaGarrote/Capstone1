import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import MockupData from "../../data/mockData/components/component-mockup-data.json";

const ComponentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.item || null;
  const isEdit = !!editState;

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      componentName: editState?.name || "",
      category: editState?.category ?? null,
      manufacturer: editState?.manufacturer ?? null,
      supplier: editState?.supplier ?? null,
      location: editState?.location ?? null,
      modelNumber: editState?.model_number || "",
      orderNumber: editState?.order_number || "",
      purchaseCost: editState?.purchase_cost || "",
      quantity: editState?.quantity || "",
      minimumQuantity: editState?.minimum_quantity || "",
      purchaseDate: editState?.purchase_date || "",
      notes: editState?.notes || "",
    },
  });

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      minHeight: '48px',
      height: '48px',
      borderRadius: '25px',
      fontSize: '0.875rem',
      padding: '0 8px',
      border: state.isFocused ? '1px solid #007bff' : '1px solid #ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #007bff' : 'none',
      cursor: 'pointer',
      '&:hover': { borderColor: '#007bff' },
    }),
    valueContainer: (provided) => ({ ...provided, height: '46px', padding: '0 8px' }),
    input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
    indicatorSeparator: (provided) => ({ ...provided, display: 'block', backgroundColor: '#ccc', width: '1px', marginTop: '10px', marginBottom: '10px' }),
    indicatorsContainer: (provided) => ({ ...provided, height: '46px' }),
    container: (provided) => ({ ...provided, width: '100%' }),
    menu: (provided) => ({ ...provided, zIndex: 9999, position: 'absolute', width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : '#333',
      fontSize: '0.875rem',
      padding: '10px 16px',
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({ ...provided, color: '#333' }),
    placeholder: (provided) => ({ ...provided, color: '#999' }),
  };

  useEffect(() => {
    if (isEdit && editState) {
      setValue("componentName", editState.name || "");
      setValue("category", editState.category ?? null);
      setValue("manufacturer", editState.manufacturer ?? null);
      setValue("supplier", editState.supplier ?? null);
      setValue("location", editState.location ?? null);
      setValue("modelNumber", editState.model_number || "");
      setValue("orderNumber", editState.order_number || "");
      setValue("purchaseCost", editState.purchase_cost || "");
      setValue("quantity", editState.quantity || "");
      setValue("minimumQuantity", editState.minimum_quantity || "");
      setValue("purchaseDate", editState.purchase_date || "");
      setValue("notes", editState.notes || "");
    }
  }, [editState, isEdit, setValue]);

  // Base option lists derived from mock data
  const [categories, setCategories] = useState(
    () => Array.from(new Set(MockupData.map((item) => item.category).filter(Boolean)))
  );
  const [manufacturers, setManufacturers] = useState(
    () => Array.from(new Set(MockupData.map((item) => item.manufacturer).filter(Boolean)))
  );
  const [suppliers, setSuppliers] = useState(
    () => Array.from(new Set(MockupData.map((item) => item.supplier).filter(Boolean)))
  );
  const [locations, setLocations] = useState(
    () => Array.from(new Set(MockupData.map((item) => item.location).filter(Boolean)))
  );

  // Quick-add modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Modal field configurations for quick-add
  const categoryFields = [
    {
      name: "name",
      label: "Category Name",
      type: "text",
      placeholder: "Category Name",
      required: true,
      maxLength: 100,
      validation: { required: "Category Name is required" },
    },
  ];

  const manufacturerFields = [
    {
      name: "name",
      label: "Manufacturer Name",
      type: "text",
      placeholder: "Manufacturer Name",
      required: true,
      maxLength: 100,
      validation: { required: "Manufacturer Name is required" },
    },
  ];

  const supplierFields = [
    {
      name: "name",
      label: "Supplier Name",
      type: "text",
      placeholder: "Supplier Name",
      required: true,
      maxLength: 100,
      validation: { required: "Supplier Name is required" },
    },
  ];

  const locationFields = [
    {
      name: "name",
      label: "Location Name",
      type: "text",
      placeholder: "Location Name",
      required: true,
      maxLength: 100,
      validation: { required: "Location Name is required" },
    },
  ];

  const handleSaveCategory = async (data) => {
    const name = data.name?.trim();
    if (!name) return;
    setCategories((prev) =>
      prev.includes(name) ? prev : [...prev, name].sort()
    );
  };

  const handleSaveManufacturer = async (data) => {
    const name = data.name?.trim();
    if (!name) return;
    setManufacturers((prev) =>
      prev.includes(name) ? prev : [...prev, name].sort()
    );
  };

  const handleSaveSupplier = async (data) => {
    const name = data.name?.trim();
    if (!name) return;
    setSuppliers((prev) =>
      prev.includes(name) ? prev : [...prev, name].sort()
    );
  };

  const handleSaveLocation = async (data) => {
    const name = data.name?.trim();
    if (!name) return;
    setLocations((prev) =>
      prev.includes(name) ? prev : [...prev, name].sort()
    );
  };

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!["image/png", "image/jpeg"].includes(file.type)) {
        alert("Only PNG and JPEG images are allowed.");
        e.target.value = "";
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }

      setAttachmentFile(file);
    }
  };

  const handleImageClick = () => {
    if (attachmentFile) {
      const url = URL.createObjectURL(attachmentFile);
      setSelectedImageForModal(url);
    }
  };

  const handleRemoveImage = () => {
    if (selectedImageForModal) {
      URL.revokeObjectURL(selectedImageForModal);
      setSelectedImageForModal(null);
    }
    setAttachmentFile(null);
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data, attachmentFile);
    navigate("/components");
  };

  return (
    <>
      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage={isEdit ? "Edit Component" : "New Component"}
            rootNavigatePage="/components"
            title={isEdit ? "Edit Component" : "New Component"}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Component Name */}
            <fieldset>
              <label htmlFor="componentName">
                Component Name<span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter component name"
                maxLength="100"
                className={errors.componentName ? "input-error" : ""}
                {...register("componentName", {
                  required: "Component name is required",
                })}
              />
              {errors.componentName && (
                <span className="error-message">
                  {errors.componentName.message}
                </span>
              )}
            </fieldset>

            {/* Category (required) */}
            <fieldset>
              <label htmlFor="category">
                Category<span className="required-asterisk">*</span>
              </label>
              <div className="select-with-button">
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="category"
                      options={categories.map(c => ({ value: c, label: c }))}
                      value={categories.map(c => ({ value: c, label: c })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Category"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.category ? 'react-select-error' : ''}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowCategoryModal(true)}
                  title="Add new category"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </fieldset>

            {/* Manufacturer (optional) */}
            <fieldset>
              <label htmlFor="manufacturer">Manufacturer</label>
              <div className="select-with-button">
                <Controller
                  name="manufacturer"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="manufacturer"
                      options={manufacturers.map(m => ({ value: m, label: m }))}
                      value={manufacturers.map(m => ({ value: m, label: m })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Manufacturer"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowManufacturerModal(true)}
                  title="Add new manufacturer"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
            </fieldset>

            {/* Supplier (optional) */}
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <div className="select-with-button">
                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="supplier"
                      options={suppliers.map(s => ({ value: s, label: s }))}
                      value={suppliers.map(s => ({ value: s, label: s })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Supplier"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowSupplierModal(true)}
                  title="Add new supplier"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
            </fieldset>

            {/* Location (optional) */}
            <fieldset>
              <label htmlFor="location">Location</label>
              <div className="select-with-button">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="location"
                      options={locations.map(l => ({ value: l, label: l }))}
                      value={locations.map(l => ({ value: l, label: l })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Location"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowLocationModal(true)}
                  title="Add new location"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
            </fieldset>

            {/* Model Number (optional) */}
            <fieldset>
              <label htmlFor="modelNumber">Model Number</label>
              <input
                type="text"
                placeholder="Enter model number"
                maxLength="50"
                {...register("modelNumber")}
              />
            </fieldset>

            {/* Order Number (optional) */}
            <fieldset>
              <label htmlFor="orderNumber">Order Number</label>
              <input
                type="text"
                placeholder="Enter order number"
                maxLength="50"
                {...register("orderNumber")}
              />
            </fieldset>

            {/* Purchased Cost */}
            <fieldset className="cost-field">
              <label htmlFor="purchaseCost">Purchased Cost</label>
              <div className="cost-input-group">
                <span className="cost-addon">PHP</span>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...register("purchaseCost", { valueAsNumber: true })}
                />
              </div>
            </fieldset>

            {/* Quantity (required) */}
            <fieldset>
              <label htmlFor="quantity">
                Quantity<span className="required-asterisk">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                min="0"
                step="1"
                className={errors.quantity ? "input-error" : ""}
                {...register("quantity", {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
              />
              {errors.quantity && (
                <span className="error-message">{errors.quantity.message}</span>
              )}
            </fieldset>

            {/* Minimum Quantity (optional) */}
            <fieldset>
              <label htmlFor="minimumQuantity">Minimum Quantity</label>
              <input
                type="number"
                id="minimumQuantity"
                placeholder="Enter minimum quantity"
                min="0"
                step="1"
                {...register("minimumQuantity", { valueAsNumber: true })}
              />
            </fieldset>

            {/* Purchased Date (optional, past to current date only) */}
            <fieldset>
              <label htmlFor="purchaseDate">Purchased Date</label>
              <input
                type="date"
                className={errors.purchaseDate ? "input-error" : ""}
                max={new Date().toISOString().split("T")[0]} // limits to today or earlier
                {...register("purchaseDate")}
              />
              {errors.purchaseDate && (
                <span className="error-message">{errors.purchaseDate.message}</span>
              )}
            </fieldset>

            {/* Notes (optional, max 500 characters) */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter notes"
                maxLength={500}
                {...register("notes")}
                rows="3"
              ></textarea>
            </fieldset>

            <fieldset>
              <label>Image Upload</label>
              <div className="attachments-wrapper">
                <div className="upload-left">
                  <label htmlFor="component-image" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="component-image"
                      accept="image/png,image/jpeg"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                    />
                  </label>
                  <small className="file-size-info">Maximum file size must be 5MB</small>
                </div>

                <div className="upload-right">
                  {attachmentFile && (
                    <div className="file-uploaded">
                      <span
                        title={attachmentFile.name}
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007bff' }}
                      >
                        {attachmentFile.name}
                      </span>
                      <button type="button" onClick={handleRemoveImage}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              {isEdit ? "Update Component" : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
      </section>

      <AddEntryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        title="New Category"
        fields={categoryFields}
        type="category"
      />

      <AddEntryModal
        isOpen={showManufacturerModal}
        onClose={() => setShowManufacturerModal(false)}
        onSave={handleSaveManufacturer}
        title="New Manufacturer"
        fields={manufacturerFields}
        type="manufacturer"
      />

      <AddEntryModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        title="New Supplier"
        fields={supplierFields}
        type="supplier"
      />

      <AddEntryModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleSaveLocation}
        title="New Location"
        fields={locationFields}
        type="location"
      />

      {/* Image Preview Modal */}
      {selectedImageForModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            URL.revokeObjectURL(selectedImageForModal);
            setSelectedImageForModal(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '40px 20px 20px 20px',
              width: '600px',
              maxWidth: '80%',
              maxHeight: '70vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            <button
              onClick={() => {
                URL.revokeObjectURL(selectedImageForModal);
                setSelectedImageForModal(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#333',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <img
              src={selectedImageForModal}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        </div>
      )}


    </>
  );
};

export default ComponentRegistration;