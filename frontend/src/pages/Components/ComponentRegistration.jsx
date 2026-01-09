import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { fetchComponentById, createComponent, updateComponent } from "../../services/assets-service";
import { fetchAllDropdowns, createCategory, createManufacturer, createSupplier } from "../../services/contexts-service";
import { fetchAllLocations, createLocation } from "../../services/integration-help-desk-service";
import SystemLoading from "../../components/Loading/SystemLoading";

const ASSETS_API_URL = import.meta.env.VITE_ASSETS_API_URL || "";

const ComponentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      componentName: "",
      category: "",
      manufacturer: "",
      supplier: "",
      location: "",
      modelNumber: "",
      orderNumber: "",
      purchaseCost: "",
      quantity: "",
      minimumQuantity: "",
      purchaseDate: "",
      notes: "",
    },
  });

  // Dropdown options from API
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  // Initialize form with dropdown options and component data (if editing)
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Fetch dropdown options for components
        const dropdowns = await fetchAllDropdowns("component", { type: "component" });
        let categoriesList = dropdowns.categories || [];
        setManufacturers(dropdowns.manufacturers || []);
        setSuppliers(dropdowns.suppliers || []);

        // Fetch locations from Help Desk service
        const locationsData = await fetchAllLocations();
        setLocations(locationsData || []);

        // Fetch component data if editing
        if (id) {
          const componentData = await fetchComponentById(id);
          if (componentData) {
            // If component has a category that's not in the dropdown list, add it
            // (handles case where component was created with an asset category)
            if (componentData.category && componentData.category_details) {
              const existingCategoryId = componentData.category;
              const categoryExists = categoriesList.some(cat => cat.id === existingCategoryId);
              if (!categoryExists) {
                categoriesList = [
                  { id: existingCategoryId, name: componentData.category_details.name },
                  ...categoriesList
                ];
              }
            }

            setValue("componentName", componentData.name || "");
            // Convert IDs to strings to match select option values
            setValue("category", componentData.category ? String(componentData.category) : "");
            setValue("manufacturer", componentData.manufacturer ? String(componentData.manufacturer) : "");
            setValue("supplier", componentData.supplier ? String(componentData.supplier) : "");
            setValue("location", componentData.location ? String(componentData.location) : "");
            setValue("modelNumber", componentData.model_number || "");
            setValue("orderNumber", componentData.order_number || "");
            setValue("purchaseCost", componentData.purchase_cost || "");
            setValue("quantity", componentData.quantity || "");
            setValue("minimumQuantity", componentData.minimum_quantity || "");
            setValue("purchaseDate", componentData.purchase_date || "");
            setValue("notes", componentData.notes || "");
            if (componentData.image) {
              setExistingImage(componentData.image);
            }
          }
        }

        setCategories(categoriesList);
      } catch (error) {
        console.error("Error initializing form:", error);
        setErrorMessage("Failed to load form data.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [id, setValue]);

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
    try {
      const result = await createCategory({ name: data.name?.trim(), type: "component" });
      if (result) {
        setCategories((prev) => [...prev, { id: result.id, name: result.name }]);
        setValue("category", result.id);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleSaveManufacturer = async (data) => {
    try {
      const result = await createManufacturer({ name: data.name?.trim() });
      if (result) {
        setManufacturers((prev) => [...prev, { id: result.id, name: result.name }]);
        setValue("manufacturer", result.id);
      }
    } catch (error) {
      console.error("Error creating manufacturer:", error);
    }
  };

  const handleSaveSupplier = async (data) => {
    try {
      const result = await createSupplier({ name: data.name?.trim() });
      if (result) {
        setSuppliers((prev) => [...prev, { id: result.id, name: result.name }]);
        setValue("supplier", result.id);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  const handleSaveLocation = async (data) => {
    try {
      const result = await createLocation({ name: data.name?.trim() });
      if (result) {
        setLocations((prev) => [...prev, { id: result.id, name: result.name }]);
        setValue("location", result.id);
      }
    } catch (error) {
      console.error("Error creating location:", error);
    }
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
      setExistingImage(null); // Clear existing image when new file is selected
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("name", data.componentName);
      formData.append("category", data.category);
      if (data.manufacturer) formData.append("manufacturer", data.manufacturer);
      if (data.supplier) formData.append("supplier", data.supplier);
      if (data.location) formData.append("location", data.location);
      if (data.modelNumber) formData.append("model_number", data.modelNumber);
      if (data.orderNumber) formData.append("order_number", data.orderNumber);
      if (data.purchaseCost) formData.append("purchase_cost", data.purchaseCost);
      formData.append("quantity", data.quantity || 1);
      if (data.minimumQuantity) formData.append("minimum_quantity", data.minimumQuantity);
      if (data.purchaseDate) formData.append("purchase_date", data.purchaseDate);
      if (data.notes) formData.append("notes", data.notes);
      if (attachmentFile) formData.append("image", attachmentFile);

      if (isEdit) {
        await updateComponent(id, formData);
        navigate("/components", { state: { successMessage: "Component updated successfully!" } });
      } else {
        await createComponent(formData);
        navigate("/components", { state: { successMessage: "Component created successfully!" } });
      }
    } catch (error) {
      console.error("Error saving component:", error);
      const errMsg = error.response?.data?.name?.[0] || error.response?.data?.detail || "Failed to save component.";
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
    return <SystemLoading />;
  }

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
                <select
                  className={errors.category ? "input-error" : ""}
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                <select {...register("manufacturer")}>
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </option>
                  ))}
                </select>
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
                <select {...register("supplier")}>
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
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
                <select {...register("location")}>
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
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
              <label>Image</label>
              {attachmentFile ? (
                <div className="image-selected">
                  <img
                    src={URL.createObjectURL(attachmentFile)}
                    alt="Selected icon"
                  />
                  <button type="button" onClick={() => setAttachmentFile(null)}>
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : existingImage ? (
                <div className="image-selected">
                  <img
                    src={`${ASSETS_API_URL.replace(/\/$/, "")}${existingImage}`}
                    alt="Existing component image"
                  />
                  <button type="button" onClick={() => setExistingImage(null)}>
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose File
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileSelection}
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
            </fieldset>

            {errorMessage && (
              <div className="error-message" style={{ marginBottom: "1rem" }}>
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
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


    </>
  );
};

export default ComponentRegistration;