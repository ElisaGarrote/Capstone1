import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function CheckOutComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();
  
  // Try to get state from navigation, fallback
  const { image, name, category } = location.state || {};

  const currentDate = new Date().toISOString().split("T")[0];

  // Dropdown options for assets
  const assetList = ['XPS 13', 'Mouse', 'Keyboard', 'Monitor', 'Laptop'];

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      componentId: routeId,
      asset: '',
      quantity: '',
      checkOutDate: currentDate,
      expectedReturnDate: '',
      notes: '',
    }
  });

  const onSubmit = (data) => {
    console.log("Check-Out submitted:", data);
    navigate("/components", {
      state: { successMessage: `Component "${name}" checked out successfully!` },
    });
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Check-Out Component"
            rootNavigatePage="/components"
            title={name || "Check-Out"}
          />
        </section>

        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Component Information</h2>
            <fieldset>
              <img
                src={image || DefaultImage}
                alt={name || "Component Image"}
                className="item-info-image"
              />
            </fieldset>
            <fieldset>
              <label>Name:</label>
              <p>{name || "N/A"}</p>
            </fieldset>
            <fieldset>
              <label>Category:</label>
              <p>{category || "N/A"}</p>
            </fieldset>
          </section>

          <section className="checkin-form">
            <h2>Check-Out Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Check-Out To *</label>
                <select
                  className={errors.asset ? 'input-error' : ''}
                  {...register("asset", { required: 'Asset is required' })}
                >
                  <option value="">Select an Asset</option>
                  {assetList.map((asset, idx) => (
                    <option key={idx} value={asset}>{asset}</option>
                  ))}
                </select>
                {errors.asset && <span className="error-message">{errors.asset.message}</span>}
              </fieldset>

              <fieldset>
                <label htmlFor="component-quantity">Quantity *</label>
                <input
                  type="number"
                  className={errors.quantity ? 'input-error' : ''}
                  {...register("quantity", { required: 'Quantity is required', min: 1 })}
                  placeholder="Enter quantity"
                />
                {errors.quantity && <span className="error-message">{errors.quantity.message}</span>}
              </fieldset>

              <fieldset>
                <label>Check-Out Date *</label>
                <input
                  type="text"
                  readOnly
                  value={currentDate}
                  {...register("checkOutDate")}
                />
              </fieldset>

              <fieldset>
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  className={errors.expectedReturnDate ? 'input-error' : ''}
                  min={currentDate}
                  {...register("expectedReturnDate", { required: 'Expected return date is required' })}
                />
                {errors.expectedReturnDate && <span className="error-message">{errors.expectedReturnDate.message}</span>}
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea
                  {...register("notes")}
                  maxLength="500"
                  placeholder="Additional notes..."
                />
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}
