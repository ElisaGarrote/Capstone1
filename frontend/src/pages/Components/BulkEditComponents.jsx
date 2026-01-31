import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import SystemLoading from "../../components/Loading/SystemLoading";
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

  // Image handling
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

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

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false); // Clear remove flag when uploading new image

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

    // Validate mutual exclusion of upload and remove
    if (selectedImage && removeImage) {
      setErrorMessage("Cannot upload and remove images simultaneously. Choose one action.");
      return;
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) =>
        value !== "" && value !== null && value !== undefined && !Number.isNaN(value)
      )
    );

    const hasFieldUpdates = Object.keys(updateData).length > 0;
    const hasImageUpdate = selectedImage !== null || removeImage;

    if (!hasFieldUpdates && !hasImageUpdate) {
      setErrorMessage("Please select at least one field to update");
      return;
    }

    try {
      setIsSubmitting(true);

      let result;

      // If image is selected, we need to use FormData
      if (hasImageUpdate) {
        const formData = new FormData();
        formData.append('ids', JSON.stringify(currentSelectedIds));
        formData.append('data', JSON.stringify(updateData));

        if (selectedImage) {
          formData.append('image', selectedImage);
        }
        if (removeImage) {
          formData.append('remove_image', 'true');
        }

        result = await bulkEditComponents(formData, true); // true = use FormData
      } else {
        result = await bulkEditComponents({
          ids: currentSelectedIds,
          data: updateData,
        });
      }

      if (result.failed && result.failed.length > 0) {
        setErrorMessage(
          `Updated ${result.updated?.length || 0} component(s), but ${result.failed.length} failed.`
        );
      } else {
        setSuccessMessage(
          `Successfully updated ${result.updated?.length || currentSelectedIds.length} component(s)`
        );
        setTimeout(() => {
          navigate("/components", {
            state: {
              successMessage: `Updated ${result.updated?.length || currentSelectedIds.length} component(s)`,
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Bulk edit error:", error);
      const errMsg = error.response?.data?.detail || "Failed to update components.";
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Bulk Edit Components"
            rootNavigatePage="/components"
            title="Bulk Edit Components"
          />
        </section>

          {/* Selected Components */}
          <section className="selected-assets-section">
            <h3>Selected Components ({selectedComponents.filter(c => currentSelectedIds.includes(c.id)).length})</h3>
            <div className="selected-assets-tags">
              {selectedComponents.filter(c => currentSelectedIds.includes(c.id)).length > 0 ? (
                selectedComponents
                  .filter(c => currentSelectedIds.includes(c.id))
                  .map((item) => (
                    <div key={item.id} className="asset-tag">
                      <span className="asset-tag-name">{item.name}</span>
                      <span className="asset-tag-id">#{item.id}</span>
                      <button
                        type="button"
                        className="asset-tag-remove"
                        onClick={() => handleRemoveComponent(item.id)}
                        title="Remove from selection"
                      >
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))
              ) : (
                <p className="no-assets-message">No components selected</p>
              )}
            </div>
          </section>

          {/* Bulk Edit Form */}
          <section className="bulk-edit-form-section registration">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bulk-edit-form"
            >
              <fieldset className="form-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className={`form-input ${errors.category ? "input-error" : ""}`}
                  {...register("category")}
                >
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

              {/* Image */}
              <fieldset>
                <label>Image Management</label>
                <div className="image-management-section">
                  <label 
                    className={`upload-image-btn ${selectedImage || removeImage ? 'disabled' : ''}`}
                    title={selectedImage ? "File selected" : removeImage ? "Cannot upload while image removal is selected" : ""}
                  >
                    {selectedImage ? `✓ ${selectedImage.name}` : 'Choose File'}
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageSelection}
                      disabled={removeImage}
                      style={{ display: "none" }}
                    />
                  </label>
                  {selectedImage && (
                    <button
                      type="button"
                      className="clear-file-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(null);
                        setPreviewImage(null);
                        if (document.getElementById('image')) {
                          document.getElementById('image').value = '';
                        }
                      }}
                      title="Clear file selection"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="checkbox-group">
                  <label htmlFor="removeImage" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="removeImage"
                      checked={removeImage}
                      onChange={(e) => {
                        setRemoveImage(e.target.checked);
                        if (e.target.checked) {
                          setSelectedImage(null);
                          setPreviewImage(null);
                          if (document.getElementById('image')) {
                            document.getElementById('image').value = '';
                          }
                        }
                      }}
                      disabled={selectedImage !== null}
                    />
                    Remove images from all items
                  </label>
                </div>
                <small className="file-size-info">
                  Maximum file size must be 5MB
                </small>
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

