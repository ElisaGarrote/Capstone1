import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
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
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      productName: "",
      category: "",
      manufacturer: "",
      depreciation: "",
      endOfLifeDate: "",
      defaultPurchaseCost: "",
      defaultSupplier: "",
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

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <TopSecFormPage
            root="Asset Models"
            currentPage="Bulk Edit Asset Models"
            rootNavigatePage="/products"
            title="Bulk Edit Asset Models"
          />

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
                <input
                  type="text"
                  id="category"
                  className={`form-input ${errors.category ? "input-error" : ""}`}
                  {...register("category")}
                  maxLength="100"
                  placeholder="Category"
                />
              </fieldset>

              {/* Manufacturer */}
              <fieldset className="form-field">
                <label htmlFor="manufacturer">Manufacturer</label>
                <input
                  type="text"
                  id="manufacturer"
                  className={`form-input ${errors.manufacturer ? "input-error" : ""}`}
                  {...register("manufacturer")}
                  maxLength="100"
                  placeholder="Manufacturer"
                />
              </fieldset>

              {/* Depreciation */}
              <fieldset className="form-field">
                <label htmlFor="depreciation">Depreciation</label>
                <input
                  type="text"
                  id="depreciation"
                  className={`form-input ${errors.depreciation ? "input-error" : ""}`}
                  {...register("depreciation")}
                  maxLength="100"
                  placeholder="Depreciation"
                />
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
                <input
                  type="text"
                  id="defaultSupplier"
                  className={`form-input ${
                    errors.defaultSupplier ? "input-error" : ""
                  }`}
                  {...register("defaultSupplier")}
                  maxLength="100"
                  placeholder="Default Supplier"
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
    </>
  );
}

