import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import MockupData from "../../data/mockData/repairs/asset-repair-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Registration.css";
import "../../styles/Repairs/BulkEditRepairs.css";

export default function BulkEditRepairs() {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to read selected IDs from location state first, then fall back to query string `?ids=1,2,3`
  const qs = new URLSearchParams(location.search);
  const idsQuery = qs.get("ids");
  const parsedIdsFromQuery = idsQuery && idsQuery.length > 0 ? idsQuery.split(",").map((v) => Number(v)).filter((n) => !Number.isNaN(n)) : [];

  const selectedIdsFromState = (location.state && Array.isArray(location.state.selectedIds)) ? location.state.selectedIds : [];
  const initialSelectedIds = (selectedIdsFromState && selectedIdsFromState.length > 0) ? selectedIdsFromState : parsedIdsFromQuery;

  const [currentSelectedIds, setCurrentSelectedIds] = useState(initialSelectedIds || []);
  const selectedRepairs = MockupData.filter((r) => currentSelectedIds.includes(r.id));

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!initialSelectedIds || initialSelectedIds.length === 0) {
      setErrorMessage("No repairs selected for bulk edit");
      setTimeout(() => navigate("/repairs"), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveRepair = (id) => {
    setCurrentSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      type: "",
      name: "",
      start_date: "",
      end_date: "",
      cost: "",
      supplier: "",
      notes: "",
    },
  });

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
                <input id="type" className={`form-input ${errors.type ? 'input-error' : ''}`} {...register('type')} placeholder="Type" />
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
                <input id="supplier" className={`form-input ${errors.supplier ? 'input-error' : ''}`} {...register('supplier')} placeholder="Supplier" />
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
    </>
  );
}
