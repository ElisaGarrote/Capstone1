import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import { createComponentCheckin } from "../../services/assets-service";

const ComponentCheckin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // item is the checkout record with: id, remaining_quantity, checkout_date, etc.
  const item = location.state?.item || {};
  const componentName = location.state?.componentName || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  // Get minimum date (checkout date)
  const minDate = item.checkout_date || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      checkinDate: new Date().toISOString().split("T")[0],
      quantity: 1,
      notes: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        component_checkout: item.id,  // The checkout record ID
        checkin_date: data.checkinDate,
        quantity: data.quantity,
        notes: data.notes || "",
      };
      await createComponentCheckin(payload);
      navigate("/components", {
        state: { successMessage: `Component "${componentName}" checked in successfully!` },
      });
    } catch (error) {
      console.error("Error checking in component:", error);
      const errorMsg = error.response?.data?.quantity?.[0]
        || error.response?.data?.checkin_date?.[0]
        || error.response?.data?.detail
        || "Failed to checkin component";
      setAlert({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
        />
      )}
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Checkin Component"
            rootNavigatePage="/components"
            title={componentName}
          />
        </section>
        <section className="registration-form">
          {/* Checkout Info Card */}
          <div className="checkout-info-card">
            <div className="info-header">
              <div className="info-icon">📦</div>
              <h3>Checkout Details</h3>
              <span className="badge active">Active</span>
            </div>

            <div className="info-grid">
              <div className="info-item full-width">
                <span className="label">Checked Out To</span>
                <span className="value asset-id">
                  {item.asset_displayed_id || item.to_asset?.displayed_id || "N/A"}
                </span>
              </div>

              <div className="info-item">
                <span className="label">Checkout Date</span>
                <span className="value">{item.checkout_date || "N/A"}</span>
              </div>

              <div className="info-item">
                <span className="label">Original Quantity</span>
                <span className="value">{item.quantity || 0}</span>
              </div>

              <div className="info-item">
                <span className="label">Already Checked In</span>
                <span className="value">{item.total_checked_in || 0}</span>
              </div>

              <div className="info-item">
                <span className="label">Remaining</span>
                <span className="value highlight">{item.remaining_quantity || 0}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-section">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${item.quantity ? ((item.total_checked_in || 0) / item.quantity) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="progress-label">
                <span>Checked in: {item.total_checked_in || 0}</span>
                <span>Total: {item.quantity || 0}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Checkin Date */}
            <fieldset>
              <label htmlFor="checkinDate">Checkin Date<span className="required-asterisk">*</span></label>
              <input
                type="date"
                className={errors.checkinDate ? "input-error" : ""}
                min={minDate}
                {...register("checkinDate", {
                  required: "Checkin date is required",
                  validate: (value) => {
                    if (minDate && value < minDate) {
                      return `Checkin date cannot be before checkout date (${minDate})`;
                    }
                    return true;
                  }
                })}
              />
              {errors.checkinDate && (
                <span className="error-message">{errors.checkinDate.message}</span>
              )}
            </fieldset>

            {/* Quantity */}
            <fieldset>
              <label htmlFor="quantity">
                Quantity<span className="required-asterisk">*</span> (Remaining: {item.remaining_quantity})
              </label>
              <input
                className={errors.quantity ? "input-error" : ""}
                type="number"
                id="quantity"
                placeholder="Enter quantity to check in"
                min="1"
                step="1"
                max={item.remaining_quantity}
                {...register("quantity", {
                  valueAsNumber: true,
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                  validate: (value) =>
                    value <= item.remaining_quantity ||
                    `Cannot exceed remaining quantity (${item.remaining_quantity})`,
                })}
              />
              {errors.quantity && (
                <span className="error-message">{errors.quantity.message}</span>
              )}
            </fieldset>

            {/* Notes */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                placeholder="Enter notes"
                {...register("notes")}
                rows="3"
              ></textarea>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              className="primary-button"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ComponentCheckin;
