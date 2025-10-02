import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";
import MockupData from "../../data/mockData/components/component-mockup-data.json";

const ComponentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.item || null;
  const isEdit = !!editState;

  const [attachmentFile, setAttachmentFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      componentName: editState?.name || "",
      category: editState?.category || "",
      manufacturer: editState?.manufacturer || "",
      supplier: editState?.supplier || "",
      location: editState?.location || "",
      modelNumber: editState?.model_number || "",
      orderNumber: editState?.order_number || "",
      purchaseCost: editState?.purchase_cost || "",
      quantity: editState?.quantity || "",
      minimumQuantity: editState?.minimum_quantity || "",
      purchaseDate: editState?.purchase_date || "",
      notes: editState?.notes || "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      setValue("name", editState.name || "");
      setValue("duration", editState.duration || "");
      setValue("minimumValue", editState.minimumValue || "");
    }
  }, [editState, isEdit, setValue]);
  
  const categories = Array.from(new Set(MockupData.map((item) => item.category)));
  const manufacturers = Array.from(new Set(MockupData.map((item) => item.manufacturer)));
  const suppliers = Array.from(new Set(MockupData.map((item) => item.supplier)));
  const locations = Array.from(new Set(MockupData.map((item) => item.location)));

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      setAttachmentFile(e.target.files[0]);
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data, attachmentFile);
    navigate("/components");
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
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
              <label htmlFor="componentName">Name *</label>
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
              <label htmlFor="category">Category *</label>
              <select
                className={errors.category ? "input-error" : ""}
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category.message}</span>}
            </fieldset>

            {/* Manufacturer (optional) */}
            <fieldset>
              <label htmlFor="manufacturer">Manufacturer</label>
              <select
                {...register("manufacturer")}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map((manu) => (
                  <option key={manu} value={manu}>{manu}</option>
                ))}
              </select>
            </fieldset>

            {/* Supplier (optional) */}
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <select
                {...register("supplier")}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </fieldset>

            {/* Location (optional) */}
            <fieldset>
              <label htmlFor="location">Location</label>
              <select
                {...register("location")}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
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

            {/* Purchase Cost */}
            <fieldset className="cost-field">
              <label htmlFor="purchaseCost">Purchase Cost</label>
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

            {/* Quantity (optional) */}
            <fieldset>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                min="0"
                step="1"
                {...register("quantity", { valueAsNumber: true })}
              />
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

            {/* Purchase Date (optional, past to current date only) */}
            <fieldset>
              <label htmlFor="purchaseDate">Purchase Date</label>
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

            {/* Notes (optional) */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter notes"
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
              ) : (
                <label className="upload-image-btn">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelection}
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
            </fieldset>

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              {isEdit ? "Update Component" : "Save"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default ComponentRegistration;
