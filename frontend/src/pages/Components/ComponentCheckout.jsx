import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import SystemLoading from "../../components/Loading/SystemLoading";
import { createComponentCheckout, fetchAssetNames } from "../../services/assets-service";

const ComponentCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // item is the component being checked out: { id, name, available_quantity }
  const item = location.state?.item || {};

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      asset: "",
      quantity: 1,
      checkoutDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // Fetch assets on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch assets for dropdown
        const assetsData = await fetchAssetNames();
        setAssets(assetsData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setAlert({ message: "Failed to load form data", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        component: item.id,
        asset: parseInt(data.asset),
        quantity: data.quantity,
        checkout_date: data.checkoutDate,
        notes: data.notes || "",
      };
      await createComponentCheckout(payload);
      navigate("/components", {
        state: { successMessage: `Component "${item.name}" checked out successfully!` },
      });
    } catch (error) {
      console.error("Error checking out component:", error);
      const errorMsg = error.response?.data?.quantity?.[0]
        || error.response?.data?.detail
        || "Failed to checkout component";
      setAlert({ message: errorMsg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <SystemLoading />;

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
            currentPage="Checkout Component"
            rootNavigatePage="/components"
            title={item.name}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">Check-out To<span className="required-asterisk">*</span></label>
              <select
                className={errors.asset ? "input-error" : ""}
                {...register("asset", {
                  required: "Asset is required",
                })}
              >
                <option value="">Select Asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_id} - {asset.name}
                  </option>
                ))}
              </select>
              {errors.asset && (
                <span className="error-message">
                  {errors.asset.message}
                </span>
              )}
            </fieldset>

            {/* Quantity */}
            <fieldset>
              <label htmlFor="quantity">
                Quantity<span className="required-asterisk">*</span> (Available: {item.available_quantity})
              </label>
              <input
                className={errors.quantity ? "input-error" : ""}
                type="number"
                id="quantity"
                placeholder="Enter quantity"
                min="1"
                step="1"
                max={item.available_quantity}
                {...register("quantity", {
                  valueAsNumber: true,
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                  validate: (value) =>
                    value <= item.available_quantity ||
                    `Cannot exceed available quantity (${item.available_quantity})`,
                })}
              />
              {errors.quantity && (
                <span className="error-message">{errors.quantity.message}</span>
              )}
            </fieldset>

            {/* Checkout Date */}
            <fieldset>
              <label htmlFor="checkoutDate">Checkout Date<span className="required-asterisk">*</span></label>
              <input
                type="date"
                className={errors.checkoutDate ? "input-error" : ""}
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("checkoutDate", {
                  required: "Checkout date is required",
                })}
              />
              {errors.checkoutDate && (
                <span className="error-message">{errors.checkoutDate.message}</span>
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

export default ComponentCheckout;
