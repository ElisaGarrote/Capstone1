import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import CloseIcon from "../../assets/icons/close.svg";
import { fetchComponentNames, bulkEditComponents } from "../../services/assets-service";
import { fetchAllDropdowns } from "../../services/contexts-service";
import { fetchAllLocations } from "../../services/integration-help-desk-service";
import "../../styles/Registration.css";
import "../../styles/components/BulkEditComponents.css";

export default function BulkEditComponents() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedIds } = location.state || { selectedIds: [] };

  const [currentSelectedIds, setCurrentSelectedIds] = useState(selectedIds || []);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        if (!selectedIds || selectedIds.length === 0) {
          setErrorMessage("No components selected for bulk edit");
          setTimeout(() => navigate("/components"), 2000);
          return;
        }

        // Fetch component names for display
        const componentsData = await fetchComponentNames({ ids: selectedIds });
        setSelectedComponents(componentsData || []);

        // Fetch dropdown options
        const dropdowns = await fetchAllDropdowns("component", { type: "component" });
        setCategories(dropdowns.categories || []);
        setManufacturers(dropdowns.manufacturers || []);
        setSuppliers(dropdowns.suppliers || []);

        // Fetch locations
        const locationsData = await fetchAllLocations();
        setLocations(locationsData || []);
      } catch (error) {
        console.error("Error initializing bulk edit:", error);
        setErrorMessage("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [selectedIds, navigate]);

  const handleRemoveComponent = (id) => {
    setCurrentSelectedIds((prev) => prev.filter((x) => x !== id));
    setSelectedComponents((prev) => prev.filter((x) => x.id !== id));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      category: "",
      manufacturer: "",
      supplier: "",
      location: "",
      purchase_cost: "",
      minimum_quantity: "",
      notes: "",
    },
  });

  const onSubmit = async (data) => {
    if (currentSelectedIds.length === 0) {
      setErrorMessage("Please select at least one component to update");
      return;
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) =>
        value !== "" && value !== null && value !== undefined && !Number.isNaN(value)
      )
    );

    if (Object.keys(updateData).length === 0) {
      setErrorMessage("Please select at least one field to update");
      return;
    }

    try {
      setIsSubmitting(true);
      await bulkEditComponents({ ids: currentSelectedIds, ...updateData });

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
    } catch (error) {
      console.error("Bulk edit error:", error);
      const errMsg = error.response?.data?.detail || "Failed to update components.";
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page-layout-with-table">
        <NavBar />
        <main className="main-with-table">
          <p>Loading...</p>
        </main>
      </section>
    );
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-with-table">
        <NavBar />
        <main className="main-with-table">
          <TopSecFormPage
            root="Components"
            currentPage="Bulk Edit Components"
            rootNavigatePage="/components"
            title="Bulk Edit Components"
          />

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

          <section className="components-bulk-form-section">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="components-bulk-form"
            >
              <fieldset className="form-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className={`form-input ${errors.category ? "input-error" : ""}`}
                  {...register("category")}
                >
                  <option value="">-- No Change --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="manufacturer">Manufacturer</label>
                <select
                  id="manufacturer"
                  className={`form-input ${errors.manufacturer ? "input-error" : ""}`}
                  {...register("manufacturer")}
                >
                  <option value="">-- No Change --</option>
                  {manufacturers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="supplier">Supplier</label>
                <select
                  id="supplier"
                  className={`form-input ${errors.supplier ? "input-error" : ""}`}
                  {...register("supplier")}
                >
                  <option value="">-- No Change --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  className={`form-input ${errors.location ? "input-error" : ""}`}
                  {...register("location")}
                >
                  <option value="">-- No Change --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="form-field cost-field">
                <label htmlFor="purchase_cost">Purchase Cost</label>
                <div className="cost-input-group">
                  <span className="cost-addon">PHP</span>
                  <input
                    id="purchase_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`form-input ${
                      errors.purchase_cost ? "input-error" : ""
                    }`}
                    {...register("purchase_cost", { valueAsNumber: true })}
                  />
                </div>
              </fieldset>

              <fieldset className="form-field">
                <label htmlFor="minimum_quantity">Minimum Quantity</label>
                <input
                  id="minimum_quantity"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Minimum Quantity"
                  className={`form-input ${
                    errors.minimum_quantity ? "input-error" : ""
                  }`}
                  {...register("minimum_quantity", { valueAsNumber: true })}
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
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Components"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </section>
    </>
  );
}

