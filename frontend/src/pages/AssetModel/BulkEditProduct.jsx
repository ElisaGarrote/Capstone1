import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import DepreciationMockData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import ManufacturerMockData from "../../data/mockData/more/manufacturer-mockup-data.json";
import SupplierMockData from "../../data/mockData/more/supplier-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import "../../styles/Registration.css";
import "../../styles/Products/BulkEditProduct.css";

export default function BulkEditProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const idsQuery = qs.get("ids");
  const parsedIdsFromQuery = idsQuery && idsQuery.length > 0 ? idsQuery.split(",").map((v) => Number(v)).filter((n) => !Number.isNaN(n)) : [];
  const selectedIdsFromState = (location.state && Array.isArray(location.state.selectedIds)) ? location.state.selectedIds : [];
  const initialSelectedIds = (selectedIdsFromState && selectedIdsFromState.length > 0) ? selectedIdsFromState : parsedIdsFromQuery;
  const [currentSelectedIds, setCurrentSelectedIds] = useState(initialSelectedIds || []);
  const selectedProducts = ProductsMockupData.filter((p) => currentSelectedIds.includes(p.id));
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
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
      depreciation: null,
      supplier: null,
      modelNumber: "",
      endOfLifeDate: "",
      defaultPurchaseCost: "",
      minimumQuantity: "",
      archiveModel: false,
      notes: "",
    },
  });

  // Get custom select styles from utility
  const customSelectStyles = getCustomSelectStyles();

  useEffect(() => {
    // Initialize mock data for dropdowns
    const mockCategories = Array.from(new Set(ProductsMockupData.map(p => p.category).filter(Boolean))).map((name, idx) => ({
      id: idx + 1,
      name: name,
    }));
    const mockDepreciations = DepreciationMockData.map(d => ({ id: d.id, name: d.name }));
    const mockManufacturers = ManufacturerMockData.map(m => ({ id: m.id, name: m.name }));
    const mockSuppliers = SupplierMockData.map(s => ({ id: s.id, name: s.name }));

    setCategories(mockCategories);
    setDepreciations(mockDepreciations);
    setManufacturers(mockManufacturers);
    setSuppliers(mockSuppliers);
  }, []);

  const handleSaveCategory = (data) => {
    try {
      const newCategory = {
        id: (categories[categories.length - 1]?.id || 0) + 1,
        name: data.name?.trim() || '',
      };
      if (newCategory.name && !categories.find(c => c.name === newCategory.name)) {
        setCategories((prev) => [...prev, newCategory]);
      }
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
      if (newManufacturer.name && !manufacturers.find(m => m.name === newManufacturer.name)) {
        setManufacturers((prev) => [...prev, newManufacturer]);
      }
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
      if (newDepreciation.name && !depreciations.find(d => d.name === newDepreciation.name)) {
        setDepreciations((prev) => [...prev, newDepreciation]);
      }
      setShowDepreciationModal(false);
    } catch (error) {
      console.error('Error creating depreciation:', error);
    }
  };

  const handleSaveSupplier = (data) => {
    try {
      const newSupplier = {
        id: (suppliers[suppliers.length - 1]?.id || 0) + 1,
        name: data.name?.trim() || '',
      };
      if (newSupplier.name && !suppliers.find(s => s.name === newSupplier.name)) {
        setSuppliers((prev) => [...prev, newSupplier]);
      }
      setShowSupplierModal(false);
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  useEffect(() => {
    if (!initialSelectedIds || initialSelectedIds.length === 0) {
      setErrorMessage("No products selected for bulk edit");
      setTimeout(() => navigate("/products"), 2000);
    }
  }, []);

  const handleRemoveProduct = (id) => {
    setCurrentSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const onSubmit = (data) => {
    try {
      if (currentSelectedIds.length === 0) {
        setErrorMessage("Please select at least one product to update");
        return;
      }

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      );

      if (Object.keys(updateData).length === 0) {
        setErrorMessage("Please select at least one field to update");
        return;
      }

      console.log("Updating products:", currentSelectedIds, "with", updateData);

      setSuccessMessage(`Successfully updated ${currentSelectedIds.length} product(s)`);
      setTimeout(() => {
        navigate("/products", { state: { successMessage: `Updated ${currentSelectedIds.length} product(s)` } });
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update products");
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />

        <main className="registration bulk-edit-product-page">
          <section className="top">
            <TopSecFormPage
              root="Asset Models"
              currentPage="Bulk Edit Products"
              rootNavigatePage="/products"
              title="Bulk Edit Products"
              rightComponent={
                <div className="products-selected-count">
                  {currentSelectedIds.length} Product{currentSelectedIds.length !== 1 ? 's' : ''} Selected
                </div>
              }
            />
          </section>

          <section className="products-selected-section">
            <h3>Selected Products ({currentSelectedIds.length})</h3>
            <div className="products-selected-tags">
              {selectedProducts.length > 0 ? (
                selectedProducts.map((p) => (
                  <div key={p.id} className="product-tag">
                    <span className="product-tag-name">{p.name}</span>
                    <span className="product-tag-id">#{p.id}</span>
                    <button
                      type="button"
                      className="product-tag-remove"
                      onClick={() => handleRemoveProduct(p.id)}
                      title="Remove from selection"
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="products-no-selection">No products selected</p>
              )}
            </div>
          </section>

          <p className="products-selected-note">
            Note: Fill in only the fields you want to change. Fields left empty will stay unchanged.
          </p>

          <section className="products-bulk-form-section">
            <form onSubmit={handleSubmit(onSubmit)} className="products-bulk-form">
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
                        placeholder="Select Depreciation"
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
                    title="Add new depreciation"
                  >
                    <img src={PlusIcon} alt="Add" />
                  </button>
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="supplier">Default Supplier</label>
                <div className="select-with-button">
                  <Controller
                    name="supplier"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="supplier"
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
                <label htmlFor="modelNumber">Model Number</label>
                <input id="modelNumber" className={`form-input ${errors.modelNumber ? 'input-error' : ''}`} {...register('modelNumber')} placeholder="Model Number" />
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="endOfLifeDate">End Of Life Date</label>
                <input id="endOfLifeDate" type="date" className={`form-input ${errors.endOfLifeDate ? 'input-error' : ''}`} {...register('endOfLifeDate')} />
              </fieldset>

              <fieldset className="form-field cost-field">
                <label htmlFor="defaultPurchaseCost">Default Purchase Cost</label>
                <div className="cost-input-group">
                  <span className="cost-addon">PHP</span>
                  <input id="defaultPurchaseCost" type="number" step="0.01" min="0" className={`form-input ${errors.defaultPurchaseCost ? 'input-error' : ''}`} {...register('defaultPurchaseCost', { valueAsNumber: true })} placeholder="0.00" />
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="minimumQuantity">Minimum Quantity</label>
                <input id="minimumQuantity" type="number" min="0" className={`form-input ${errors.minimumQuantity ? 'input-error' : ''}`} {...register('minimumQuantity', { valueAsNumber: true })} placeholder="0" />
              </fieldset>

              <fieldset className="form-field notes-field">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" rows="4" className={`form-input ${errors.notes ? 'input-error' : ''}`} {...register('notes')} placeholder="Notes" />
              </fieldset>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => navigate('/products')}>Cancel</button>
                <button type="submit" className="submit-btn">Update Products</button>
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
    </>
  );
}
