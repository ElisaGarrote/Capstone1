import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import "../../styles/Registration.css";
import "../../styles/Assets/BulkEditAssetModels.css";

export default function BulkEditAssetModels() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedIds } = location.state || { selectedIds: [] };

  const [currentSelectedIds, setCurrentSelectedIds] = useState(selectedIds || []);
  const selectedModels = ProductsMockupData.filter((product) =>
    currentSelectedIds.includes(product.id)
  );

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      setErrorMessage("No asset models selected for bulk edit");
      setTimeout(() => navigate("/products"), 2000);
    }
  }, [selectedIds, navigate]);

  const handleRemoveModel = (modelId) => {
    setCurrentSelectedIds((prev) => prev.filter((id) => id !== modelId));
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      productName: "",
      category: null,
      manufacturer: null,
      depreciation: null,
      endOfLifeDate: "",
      defaultPurchaseCost: "",
      defaultSupplier: null,
      minimumQuantity: "",
      cpu: "",
      gpu: "",
      ram: "",
      screenSize: "",
      storageSize: "",
      operatingSystem: "",
      notes: "",
    },
  });

  // Get custom select styles from utility
  const customSelectStyles = getCustomSelectStyles();

  useEffect(() => {
    // Initialize mock data for dropdowns
    const mockCategories = Array.from(new Set(ProductsMockupData.map(p => p.category).filter(Boolean)));
    const mockManufacturers = Array.from(new Set(ProductsMockupData.map(p => p.manufacturer).filter(Boolean)));
    const mockDepreciations = [{ id: 1, name: 'Linear' }, { id: 2, name: 'Declining Balance' }];
    const mockSuppliers = Array.from(new Set(ProductsMockupData.map(p => p.supplier).filter(Boolean)));

    setCategories(mockCategories.map((name, index) => ({ id: index + 1, name })));
    setManufacturers(mockManufacturers.map((name, index) => ({ id: index + 1, name })));
    setDepreciations(mockDepreciations);
    setSuppliers(mockSuppliers.map((name, index) => ({ id: index + 1, name })));
  }, []);

  const handleSaveCategory = (data) => {
    try {
      const newCategory = {
        id: (categories[categories.length - 1]?.id || 0) + 1,
        name: data.name?.trim() || '',
      };
      setCategories((prev) => [...prev, newCategory]);
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleSaveManufacturer = (data) => {
    try {
      const newManufacturer = {
        id: (manufacturers[manufacturers.length - 1]?.id || 0) + 1,
        name: data.name?.trim() || '',
      };
      setManufacturers((prev) => [...prev, newManufacturer]);
      setShowManufacturerModal(false);
    } catch (error) {
      console.error('Error creating manufacturer:', error);
    }
  };

  const handleSaveDepreciation = (data) => {
    try {
      const newDepreciation = {
        id: (depreciations[depreciations.length - 1]?.id || 0) + 1,
        name: data.name?.trim() || '',
      };
      setDepreciations((prev) => [...prev, newDepreciation]);
      setShowDepreciationModal(false);
    } catch (error) {
      console.error('Error creating depreciation:', error);
    }
  };

  const onSubmit = (data) => {
    try {
      if (currentSelectedIds.length === 0) {
        setErrorMessage("Please select at least one asset model to update");
        return;
      }

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) =>
          value !== "" && value !== null && value !== undefined
        )
      );

      if (Object.keys(updateData).length === 0) {
        setErrorMessage("Please select at least one field to update");
        return;
      }

      // TODO: Hook up to real API when backend is ready
      console.log("Updating asset models:", currentSelectedIds, "with data:", updateData);

      setSuccessMessage(
        `Successfully updated ${currentSelectedIds.length} asset model(s)`
      );
      setTimeout(() => {
        navigate("/products", {
          state: {
            successMessage: `Updated ${currentSelectedIds.length} asset model(s)`,
          },
        });
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update asset models");
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />

        <main className="registration bulk-edit-models-page">
          <section className="top">
            <TopSecFormPage
              root="Asset Models"
              currentPage="Bulk Edit Asset Models"
              rootNavigatePage="/products"
              title="Bulk Edit Asset Models"
              rightComponent={
                <div className="import-section">
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {currentSelectedIds.length} Model{currentSelectedIds.length !== 1 ? 's' : ''} Selected
                  </span>
                </div>
              }
            />
          </section>

          {/* Selected Asset Models */}
          <section className="asset-models-selected-section">
            <h3>Selected Asset Models ({currentSelectedIds.length})</h3>
            <div className="asset-models-selected-tags">
              {selectedModels.length > 0 ? (
                selectedModels.map((model) => (
                  <div key={model.id} className="asset-model-tag">
                    <span className="asset-model-tag-name">{model.name}</span>
                    <span className="asset-model-tag-id">#{model.id}</span>
                    <button
                      type="button"
                      className="asset-model-tag-remove"
                      onClick={() => handleRemoveModel(model.id)}
                      title="Remove from selection"
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="asset-models-no-selection-message">
                  No asset models selected
                </p>
              )}
            </div>
          </section>

          <p className="asset-models-note">
            Note: Fill in only the fields you want to change. Fields left empty will stay unchanged. Use the Remove toggle to clear existing values.
          </p>

          {/* Bulk Edit Form */}
          <section className="asset-models-bulk-form-section">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="asset-models-bulk-form"
            >
              {/* Asset Model Name */}
              <fieldset className="form-field">
                <label htmlFor="productName">Asset Model Name</label>
                <input
                  type="text"
                  id="productName"
                  className={`form-input ${errors.productName ? "input-error" : ""}`}
                  {...register("productName")}
                  maxLength="100"
                  placeholder="Asset Model Name"
                />
              </fieldset>

              {/* Category */}
              <fieldset className="form-field">
                <label htmlFor="category">Category</label>
                <div className="select-with-button">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="category"
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        value={categories.map(c => ({ value: c.id, label: c.name })).find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value ?? null)}
                        placeholder="Select Category"
                        isSearchable={true}
                        isClearable={true}
                        styles={customSelectStyles}
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
              </fieldset>

              {/* Manufacturer */}
              <fieldset className="form-field">
                <label htmlFor="manufacturer">Manufacturer</label>
                <div className="select-with-button">
                  <Controller
                    name="manufacturer"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="manufacturer"
                        options={manufacturers.map(m => ({ value: m.id, label: m.name }))}
                        value={manufacturers.map(m => ({ value: m.id, label: m.name })).find(opt => opt.value === field.value) || null}
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

              {/* Depreciation */}
              <fieldset className="form-field">
                <label htmlFor="depreciation">Depreciation</label>
                <div className="select-with-button">
                  <Controller
                    name="depreciation"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="depreciation"
                        options={depreciations.map(d => ({ value: d.id, label: d.name }))}
                        value={depreciations.map(d => ({ value: d.id, label: d.name })).find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value ?? null)}
                        placeholder="Select Depreciation Method"
                        isSearchable={true}
                        isClearable={true}
                        styles={customSelectStyles}
                      />
                    )}
                  />
                  <button
                    type="button"
                    className="add-entry-btn"
                    onClick={() => setShowDepreciationModal(true)}
                    title="Add new depreciation method"
                  >
                    <img src={PlusIcon} alt="Add" />
                  </button>
                </div>
              </fieldset>

              {/* End of Life Date */}
              <fieldset className="form-field">
                <label htmlFor="endOfLifeDate">End of Life Date</label>
                <input
                  type="date"
                  id="endOfLifeDate"
                  className={`form-input ${errors.endOfLifeDate ? "input-error" : ""}`}
                  {...register("endOfLifeDate")}
                />
              </fieldset>

              {/* Default Purchase Cost */}
              <fieldset className="form-field cost-field">
                <label htmlFor="defaultPurchaseCost">Default Purchase Cost</label>
                <div className="cost-input-group">
                  <span className="cost-addon">PHP</span>
                  <input
                    type="number"
                    id="defaultPurchaseCost"
                    name="defaultPurchaseCost"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`form-input ${
                      errors.defaultPurchaseCost ? "input-error" : ""
                    }`}
                    {...register("defaultPurchaseCost", { valueAsNumber: true })}
                  />
                </div>
              </fieldset>

              {/* Default Supplier */}
              <fieldset className="form-field">
                <label htmlFor="defaultSupplier">Default Supplier</label>
                <Controller
                  name="defaultSupplier"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="defaultSupplier"
                      options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                      value={suppliers.map(s => ({ value: s.id, label: s.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Supplier"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                    />
                  )}
                />
              </fieldset>

              {/* Minimum Quantity */}
              <fieldset className="form-field">
                <label htmlFor="minimumQuantity">Minimum Quantity</label>
                <input
                  type="number"
                  id="minimumQuantity"
                  className={`form-input ${
                    errors.minimumQuantity ? "input-error" : ""
                  }`}
                  {...register("minimumQuantity", { valueAsNumber: true })}
                  placeholder="Minimum Quantity"
                  min="0"
                />
              </fieldset>

              {/* Notes */}
              <fieldset className="form-field notes-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className={`form-input ${errors.notes ? "input-error" : ""}`}
                  {...register("notes")}
                  maxLength="500"
                  placeholder="Notes"
                  rows="4"
                />
              </fieldset>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Asset Models
                </button>
              </div>
            </form>
          </section>
        </main>
      </section>

      <Footer />

      {/* Category Modal */}
      {showCategoryModal && (
        <AddEntryModal
          title="Add New Category"
          fields={[
            {
              name: "name",
              label: "Category Name",
              type: "text",
              required: true,
              placeholder: "Enter category name"
            }
          ]}
          onSubmit={handleSaveCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {/* Manufacturer Modal */}
      {showManufacturerModal && (
        <AddEntryModal
          title="Add New Manufacturer"
          fields={[
            {
              name: "name",
              label: "Manufacturer Name",
              type: "text",
              required: true,
              placeholder: "Enter manufacturer name"
            }
          ]}
          onSubmit={handleSaveManufacturer}
          onClose={() => setShowManufacturerModal(false)}
        />
      )}

      {/* Depreciation Modal */}
      {showDepreciationModal && (
        <AddEntryModal
          title="Add New Depreciation Method"
          fields={[
            {
              name: "name",
              label: "Depreciation Method Name",
              type: "text",
              required: true,
              placeholder: "Enter depreciation method name"
            }
          ]}
          onSubmit={handleSaveDepreciation}
          onClose={() => setShowDepreciationModal(false)}
        />
      )}
    </>
  );
}

