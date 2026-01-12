import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import ComponentData from "../../data/mockData/components/component-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import "../../styles/Registration.css";
import "../../styles/components/BulkEditComponents.css";

export default function BulkEditComponents() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedIds } = location.state || { selectedIds: [] };

  const [currentSelectedIds, setCurrentSelectedIds] = useState(selectedIds || []);
  const selectedComponents = ComponentData.filter((item) =>
    currentSelectedIds.includes(item.id)
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      setErrorMessage("No components selected for bulk edit");
      setTimeout(() => navigate("/components"), 2000);
    }
  }, [selectedIds, navigate]);

  const handleRemoveComponent = (id) => {
    setCurrentSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      category: null,
      manufacturer: null,
      supplier: null,
      location: null,
      purchaseCost: "",
      minimumQuantity: "",
      notes: "",
    },
  });

  // Get custom select styles from utility
  const customSelectStyles = getCustomSelectStyles();

  useEffect(() => {
    const mockCategories = Array.from(new Set(ComponentData.map(c => c.category).filter(Boolean)));
    const mockManufacturers = Array.from(new Set(ComponentData.map(m => m.manufacturer).filter(Boolean)));
    const mockSuppliers = Array.from(new Set(ComponentData.map(s => s.supplier).filter(Boolean)));
    const mockLocations = Array.from(new Set(ComponentData.map(l => l.location).filter(Boolean)));

    setCategories(mockCategories);
    setManufacturers(mockManufacturers);
    setSuppliers(mockSuppliers);
    setLocations(mockLocations);
  }, []);

  const handleSaveCategory = (data) => {
    try {
      const newCategory = data.name?.trim() || '';
      if (newCategory && !categories.includes(newCategory)) {
        setCategories((prev) => [...prev, newCategory]);
      }
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleSaveManufacturer = (data) => {
    try {
      const newManufacturer = data.name?.trim() || '';
      if (newManufacturer && !manufacturers.includes(newManufacturer)) {
        setManufacturers((prev) => [...prev, newManufacturer]);
      }
      setShowManufacturerModal(false);
    } catch (error) {
      console.error('Error creating manufacturer:', error);
    }
  };

  const handleSaveSupplier = (data) => {
    try {
      const newSupplier = data.name?.trim() || '';
      if (newSupplier && !suppliers.includes(newSupplier)) {
        setSuppliers((prev) => [...prev, newSupplier]);
      }
      setShowSupplierModal(false);
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleSaveLocation = (data) => {
    try {
      const newLocation = data.name?.trim() || '';
      if (newLocation && !locations.includes(newLocation)) {
        setLocations((prev) => [...prev, newLocation]);
      }
      setShowLocationModal(false);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const onSubmit = (data) => {
    if (currentSelectedIds.length === 0) {
      setErrorMessage("Please select at least one component to update");
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

    // Placeholder for API integration
    console.log("Updating components:", currentSelectedIds, "with:", updateData);

    setSuccessMessage(
      `Successfully updated ${currentSelectedIds.length} component(s)`
    );
    setTimeout(() => {
      navigate("/components", {
        state: {
          successMessage: `Updated ${currentSelectedIds.length} component(s)`,
        },
      });
    }, 2000);
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />

        <main className="registration bulk-edit-components-page">
          <section className="top">
            <TopSecFormPage
              root="Components"
              currentPage="Bulk Edit Components"
              rootNavigatePage="/components"
              title="Bulk Edit Components"
              rightComponent={
                <div className="import-section">
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {currentSelectedIds.length} Component{currentSelectedIds.length !== 1 ? 's' : ''} Selected
                  </span>
                </div>
              }
            />
          </section>

          <section className="components-bulk-selected">
            <h3>Selected Components ({currentSelectedIds.length})</h3>
            <div className="components-bulk-tags">
              {selectedComponents.length > 0 ? (
                selectedComponents.map((item) => (
                  <div key={item.id} className="component-bulk-tag">
                    <span className="component-bulk-name">{item.name}</span>
                    <span className="component-bulk-id">#{item.id}</span>
                    <button
                      type="button"
                      className="component-bulk-remove"
                      onClick={() => handleRemoveComponent(item.id)}
                      title="Remove from selection"
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="components-bulk-empty">No components selected</p>
              )}
            </div>
          </section>

          <p className="components-bulk-note">
            Note: Fill in only the fields you want to change. Fields left empty will stay unchanged. Use the Remove toggle to clear existing values.
          </p>

          <section className="components-bulk-form-section">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="components-bulk-form"
            >
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
                        options={categories.map(c => ({ value: c, label: c }))}
                        value={categories.map(c => ({ value: c, label: c })).find(opt => opt.value === field.value) || null}
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

              <fieldset className="form-field">
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

              <fieldset className="form-field">
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

              <fieldset className="form-field cost-field">
                <label htmlFor="purchaseCost">Purchase Cost</label>
                <div className="cost-input-group">
                  <span className="cost-addon">PHP</span>
                  <input
                    id="purchaseCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`form-input ${
                      errors.purchaseCost ? "input-error" : ""
                    }`}
                    {...register("purchaseCost", { valueAsNumber: true })}
                  />
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="minimumQuantity">Minimum Quantity</label>
                <input
                  id="minimumQuantity"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Minimum Quantity"
                  className={`form-input ${
                    errors.minimumQuantity ? "input-error" : ""
                  }`}
                  {...register("minimumQuantity", { valueAsNumber: true })}
                />
              </fieldset>

              <fieldset className="form-field notes-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows="4"
                  maxLength={500}
                  className={`form-input ${errors.notes ? "input-error" : ""}`}
                  {...register("notes")}
                  placeholder="Notes"
                />
              </fieldset>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/components")}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Components
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

      {/* Supplier Modal */}
      {showSupplierModal && (
        <AddEntryModal
          title="Add New Supplier"
          fields={[
            {
              name: "name",
              label: "Supplier Name",
              type: "text",
              required: true,
              placeholder: "Enter supplier name"
            }
          ]}
          onSubmit={handleSaveSupplier}
          onClose={() => setShowSupplierModal(false)}
        />
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <AddEntryModal
          title="Add New Location"
          fields={[
            {
              name: "name",
              label: "Location Name",
              type: "text",
              required: true,
              placeholder: "Enter location name"
            }
          ]}
          onSubmit={handleSaveLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </>
  );
}

