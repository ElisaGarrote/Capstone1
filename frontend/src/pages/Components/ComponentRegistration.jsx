import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import SystemLoading from "../../components/Loading/SystemLoading";
import Alert from "../../components/Alert";
import "../../styles/Registration.css";
import { fetchComponentNames, fetchComponentById, createComponent, updateComponent } from "../../services/assets-service";
import { fetchAllDropdowns, createCategory, createManufacturer, createSupplier } from "../../services/contexts-service";
import { fetchAllLocations } from "../../services/integration-help-desk-service";

export default function ProductsRegistration() {
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [component, setComponent] = useState(null);
  const [isClone, setIsClone] = useState(false);

  // Modal states for adding new entries
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentDate = new Date().toISOString().split("T")[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = id && !isClone;

  const { setValue, register, handleSubmit, trigger, formState: { errors, isValid } } = useForm({
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
    }
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Determine mode: clone mode passed from AssetViewPage
  const cloneMode = location.state?.isClone === true;

  const generateCloneName = async (baseName) => {
    // 1. Fetch all existing component names that contain the base name
    const existing = await fetchComponentNames({ search: baseName });
    const existingNames = existing.map(a => a.name);

    // 2. Pattern matches: "BaseName (clone)" or "BaseName (clone) (N)" - case insensitive
    const clonePattern = new RegExp(`^${escapeRegExp(baseName)} \\(clone\\)(?: \\((\\d+)\\))?$`, 'i');

    // 3. Find the highest existing clone index
    let maxIndex = -1; // -1 means no clones exist yet
    existingNames.forEach(name => {
      const match = name.match(clonePattern);
      if (match) {
        // If no number group, it's the first clone (index 0)
        // If number group exists, that's the index
        const index = match[1] ? parseInt(match[1], 10) : 0;
        if (index > maxIndex) maxIndex = index;
      }
    });

    // 4. Generate clone name
    if (maxIndex === -1) {
      // No clones exist, return first clone name
      return `${baseName} (clone)`;
    }
    // Clones exist, return next number
    return `${baseName} (clone) (${maxIndex + 1})`;
  };

  // Utility to escape regex special chars in base name
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setIsClone(cloneMode);

        // Fetch dropdown options for assets (filter statuses by asset category)
        const contextDropdowns = await fetchAllDropdowns("component");
        setCategories(contextDropdowns.categories || []);
        setManufacturers(contextDropdowns.manufacturers || []);
        setSuppliers(contextDropdowns.suppliers || []);

        const helpDeskDropdowns = await fetchAllLocations();
        setLocations(helpDeskDropdowns || []);

        // If editing or cloning, fetch the asset data
        if (id) {
          const componentData = await fetchComponentById(id);
          console.log("Fetched product:", componentData);
          if (componentData) {
            setComponent(componentData);
          }
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setErrorMessage("Failed to initialize form data");
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [id, cloneMode]);

  // Separate useEffect to populate form AFTER dropdowns and component are loaded
  useEffect(() => {
    const populateForm = async () => {
      // Wait for next tick to ensure dropdowns are rendered
      await new Promise(resolve => setTimeout(resolve, 0));

      // If we have component data (editing or cloning), populate the form
      if (component) {
        if (isClone) {
          const clonedName = await generateCloneName(component.name);
          setValue("componentName", clonedName);
        } else {
          setValue("componentName", component.name || "");
        }
        // Prefer explicit *_details ids from API payload, fall back to top-level id fields when present
        const categoryId = component.category ?? component.category_details?.id
        const manufacturerId = component.manufacturer ?? component.manufacturer_details?.id;
        const supplierId = component.supplier ?? component.supplier_details?.id;
        const locationId = component.location ?? component.location_details?.id;
        setValue("category", categoryId ? String(categoryId) : "");
        setValue("manufacturer", manufacturerId ? String(manufacturerId) : "");
        setValue("supplier", supplierId ? String(supplierId) : "");
        setValue("location", locationId ? String(locationId) : "");
        setValue("modelNumber", component.model_number || "");
        setValue("orderNumber", component.order_number || "");
        setValue("purchaseDate", component.purchase_date || "");
        setValue("purchaseCost", component.purchase_cost ?? "");
        setValue("quantity", component.quantity ?? "");
        setValue("minimumQuantity", component.minimum_quantity ?? "");
        setValue("notes", component.notes || "");

        if (component.image) {
          setPreviewImage(component.image);

          // For cloning, fetch the image as a file so it can be uploaded with the new asset
          if (isClone) {
            try {
              const response = await fetch(component.image);
              const blob = await response.blob();
              const fileName = component.image.split('/').pop() || 'cloned-image.jpg';
              const file = new File([blob], fileName, { type: blob.type });
              setSelectedImage(file);
            } catch (imgError) {
              console.error("Failed to fetch image for cloning:", imgError);
            }
          }
        }
      }
      
      // Trigger validation after all form values are set
      await trigger();
    };
    populateForm();
  }, [component, isClone, categories, manufacturers, suppliers, locations, setValue, trigger, id]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setErrorMessage("Please select a valid .xlsx file");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      console.log("Import file selected:", file.name);
    }
  };

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

  const onSubmit = async (data) => {
    setErrorMessage("");
    const isUpdate = id && !isClone;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      
      if (data.componentName) formData.append("name", data.componentName);
      if (data.category) formData.append("category", data.category);
      if (data.manufacturer) formData.append("manufacturer", data.manufacturer);
      if (data.supplier) formData.append("supplier", data.supplier);
      if (data.location) formData.append("location", data.location);
      if (data.modelNumber) formData.append("model_number", data.modelNumber);
      if (data.orderNumber) formData.append("order_number", data.orderNumber);
      if (data.purchaseDate) formData.append("purchase_date", data.purchaseDate);
      if (data.purchaseCost != null) formData.append("purchase_cost", data.purchaseCost);
      if (data.quantity != null) formData.append("quantity", data.quantity);
      if (data.minimumQuantity != null) formData.append("minimum_quantity", data.minimumQuantity);
      formData.append("notes", data.notes || "");

      // Handle image
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      if (removeImage && isUpdate) {
        formData.append("remove_image", "true");
      }

      let result;
      if (isUpdate) {
        // Update existing component
        result = await updateComponent(id, formData);
      } else {
        // Create new component (or clone)
        result = await createComponent(formData);
      }

      if (!result) throw new Error(`Failed to ${isUpdate ? "update" : "create"} component`);

      const action = isClone ? "cloned" : isUpdate ? "updated" : "created";
      setIsSubmitting(false);

      navigate("/products", { state: { successMessage: `Component ${action} successfully!` } });
    } catch (error) {
      console.error("Error submitting component:", error);
      let message = "An error occurred while saving the component";

      if (error.response?.data) {
        const firstKey = Object.keys(error.response.data)[0];
        if (Array.isArray(error.response.data[firstKey])) {
          message = error.response.data[firstKey][0];
        }
      }

      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage={isClone ? "Clone Component" : (id ? "Edit Component" : "New Component")}
            rootNavigatePage="/products"
            title={isClone 
              ? `Clone ${component?.name}`
              : id
                ? `Edit ${component?.name}`
                : 'New Component'
            }

            rightComponent={
              <div className="import-section">
                <label htmlFor="import-file" className="import-btn">
                  <img src={PlusIcon} alt="Import" />
                  Import
                  <input
                    type="file"
                    id="import-file"
                    accept=".xlsx"
                    onChange={handleImportFile}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            }
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
              <select {...register("location")}>
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
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

            {/* Image Upload */}
            <fieldset>
              <label>Image</label>
              {previewImage ? (
                <div className="image-selected">
                  <img src={previewImage} alt="Selected image" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setPreviewImage(null);
                      setSelectedImage(null);
                      document.getElementById('image').value = '';
                      setRemoveImage(true);
                      console.log("Remove image flag set to:", true);
                    }}
                  >
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose Image
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelection}
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
            </fieldset>

            <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
              {isEdit ? "Update Component" : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
      </section>

      {/* Modals */}
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
    </>
  );
}