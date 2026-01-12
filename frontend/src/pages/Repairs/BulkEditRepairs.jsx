import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import MockupData from "../../data/mockData/repairs/asset-repair-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import "../../styles/Registration.css";
import "../../styles/Repairs/BulkEditRepairs.css";

export default function BulkEditRepairs() {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const idsQuery = qs.get("ids");
  const parsedIdsFromQuery = idsQuery && idsQuery.length > 0 ? idsQuery.split(",").map((v) => Number(v)).filter((n) => !Number.isNaN(n)) : [];
  const selectedIdsFromState = (location.state && Array.isArray(location.state.selectedIds)) ? location.state.selectedIds : [];
  const initialSelectedIds = (selectedIdsFromState && selectedIdsFromState.length > 0) ? selectedIdsFromState : parsedIdsFromQuery;
  const [currentSelectedIds, setCurrentSelectedIds] = useState(initialSelectedIds || []);
  const selectedRepairs = MockupData.filter((r) => currentSelectedIds.includes(r.id));
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [assets, setAssets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [repairTypes, setRepairTypes] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showRepairTypeModal, setShowRepairTypeModal] = useState(false);

  useEffect(() => {
    if (!initialSelectedIds || initialSelectedIds.length === 0) {
      setErrorMessage("No repairs selected for bulk edit");
      setTimeout(() => navigate("/repairs"), 2000);
    }
  }, []);

  const handleRemoveRepair = (id) => {
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
      type: null,
      name: "",
      start_date: "",
      end_date: "",
      cost: "",
      supplier: null,
      asset: null,
      notes: "",
    },
  });

  // Get custom select styles from utility
  const customSelectStyles = getCustomSelectStyles();

  useEffect(() => {
    const mockAssets = Array.from(new Set(MockupData.map(a => a.asset).filter(Boolean)));
    const mockSuppliers = Array.from(new Set(MockupData.map(s => s.supplier).filter(Boolean)));
    const mockRepairTypes = Array.from(new Set(MockupData.map(t => t.type).filter(Boolean)));

    setAssets(mockAssets);
    setSuppliers(mockSuppliers);
    setRepairTypes(mockRepairTypes);
  }, []);

  const handleSaveAsset = (data) => {
    try {
      const newAsset = data.name?.trim() || '';
      if (newAsset && !assets.includes(newAsset)) {
        setAssets((prev) => [...prev, newAsset]);
      }
      setShowAssetModal(false);
    } catch (error) {
      console.error('Error creating asset:', error);
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

  const handleSaveRepairType = (data) => {
    try {
      const newRepairType = data.name?.trim() || '';
      if (newRepairType && !repairTypes.includes(newRepairType)) {
        setRepairTypes((prev) => [...prev, newRepairType]);
      }
      setShowRepairTypeModal(false);
    } catch (error) {
      console.error('Error creating repair type:', error);
    }
  };

  const onSubmit = (data) => {
    try {
      if (currentSelectedIds.length === 0) {
        setErrorMessage("Please select at least one repair to update");
        return;
      }

      const updateData = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      );

      if (Object.keys(updateData).length === 0) {
        setErrorMessage("Please select at least one field to update");
        return;
      }

      console.log("Updating repairs:", currentSelectedIds, "with", updateData);

      setSuccessMessage(`Successfully updated ${currentSelectedIds.length} repair(s)`);
      setTimeout(() => {
        navigate("/repairs", { state: { successMessage: `Updated ${currentSelectedIds.length} repair(s)` } });
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update repairs");
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />

        <main className="registration bulk-edit-repairs-page">
          <section className="top">
            <TopSecFormPage
              root="Repairs"
              currentPage="Bulk Edit Repairs"
              rootNavigatePage="/repairs"
              title="Bulk Edit Repairs"
              rightComponent={
                <div className="import-section">
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {currentSelectedIds.length} Repair{currentSelectedIds.length !== 1 ? 's' : ''} Selected
                  </span>
                </div>
              }
            />
          </section>

          <section className="repairs-selected-section">
            <h3>Selected Repairs ({currentSelectedIds.length})</h3>
            <div className="repairs-selected-tags">
              {selectedRepairs.length > 0 ? (
                selectedRepairs.map((r) => (
                  <div key={r.id} className="repair-tag">
                    <span className="repair-tag-name">{r.name}</span>
                    <span className="repair-tag-id">#{r.id}</span>
                    <button
                      type="button"
                      className="repair-tag-remove"
                      onClick={() => handleRemoveRepair(r.id)}
                      title="Remove from selection"
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="repairs-no-selection">No repairs selected</p>
              )}
            </div>
          </section>

          <p className="repairs-selected-note">
            Note: Fill in only the fields you want to change. Fields left empty will stay unchanged. Use the Remove toggle to clear existing values.
          </p>

          <section className="repairs-bulk-form-section">
            <form onSubmit={handleSubmit(onSubmit)} className="repairs-bulk-form">
              <fieldset className="form-field">
                <label htmlFor="type">Repair Type</label>
                <div className="select-with-button">
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="type"
                        options={repairTypes.map(t => ({ value: t, label: t }))}
                        value={repairTypes.map(t => ({ value: t, label: t })).find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value ?? null)}
                        placeholder="Select Repair Type"
                        isSearchable={true}
                        isClearable={true}
                        styles={customSelectStyles}
                      />
                    )}
                  />
                  <button
                    type="button"
                    className="add-entry-btn"
                    onClick={() => setShowRepairTypeModal(true)}
                    title="Add new repair type"
                  >
                    <img src={PlusIcon} alt="Add" />
                  </button>
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="asset">Asset</label>
                <div className="select-with-button">
                  <Controller
                    name="asset"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="asset"
                        options={assets.map(a => ({ value: a, label: a }))}
                        value={assets.map(a => ({ value: a, label: a })).find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value ?? null)}
                        placeholder="Select Asset"
                        isSearchable={true}
                        isClearable={true}
                        styles={customSelectStyles}
                      />
                    )}
                  />
                  <button
                    type="button"
                    className="add-entry-btn"
                    onClick={() => setShowAssetModal(true)}
                    title="Add new asset"
                  >
                    <img src={PlusIcon} alt="Add" />
                  </button>
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="name">Repair Name</label>
                <input id="name" className={`form-input ${errors.name ? 'input-error' : ''}`} {...register('name')} placeholder="Repair Name" />
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="start_date">Start Date</label>
                <input id="start_date" type="date" className={`form-input ${errors.start_date ? 'input-error' : ''}`} {...register('start_date')} />
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="end_date">End Date</label>
                <input id="end_date" type="date" className={`form-input ${errors.end_date ? 'input-error' : ''}`} {...register('end_date')} />
              </fieldset>

              <fieldset className="form-field cost-field">
                <label htmlFor="cost">Cost</label>
                <div className="cost-input-group">
                  <span className="cost-addon">PHP</span>
                  <input id="cost" type="number" step="0.01" min="0" className={`form-input ${errors.cost ? 'input-error' : ''}`} {...register('cost', { valueAsNumber: true })} placeholder="0.00" />
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

              <fieldset className="form-field notes-field">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" rows="4" className={`form-input ${errors.notes ? 'input-error' : ''}`} {...register('notes')} placeholder="Notes" />
              </fieldset>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => navigate('/repairs')}>Cancel</button>
                <button type="submit" className="submit-btn">Update Repairs</button>
              </div>
            </form>
          </section>
        </main>
      </section>

      <Footer />

      {/* Asset Modal */}
      {showAssetModal && (
        <AddEntryModal
          title="Add New Asset"
          fields={[
            {
              name: "name",
              label: "Asset Name",
              type: "text",
              required: true,
              placeholder: "Enter asset name"
            }
          ]}
          onSubmit={handleSaveAsset}
          onClose={() => setShowAssetModal(false)}
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

      {/* Repair Type Modal */}
      {showRepairTypeModal && (
        <AddEntryModal
          title="Add New Repair Type"
          fields={[
            {
              name: "name",
              label: "Repair Type Name",
              type: "text",
              required: true,
              placeholder: "Enter repair type name"
            }
          ]}
          onSubmit={handleSaveRepairType}
          onClose={() => setShowRepairTypeModal(false)}
        />
      )}
    </>
  );
}
