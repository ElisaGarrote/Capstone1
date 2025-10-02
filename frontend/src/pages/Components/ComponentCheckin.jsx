import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import assetsService from "../../services/assets-service";

export default function CheckInComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state || {};
  const params = useParams();
  const id = params.id; // this is the ComponentCheckout ID

  const currentDate = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      checkInDate: currentDate,
      notes: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = {
        component_checkout: id,
        checkin_date: data.checkInDate,
        notes: data.notes,
      };

      console.log("Submitting formData:", formData);
      await assetsService.createComponentCheckin(formData);

      // Go back to list page for this component's pending checkouts
      navigate(`/components/checked-out-list/${item.component}`);
    } catch (error) {
      console.error("Error submitting check-in:", error);
      alert(
        error?.detail || error?.message || "Failed to submit check-in. Please try again."
      );
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Checkin List"
            currentPage="Check-In Component"
            rootNavigatePage={`/components/checked-out-list/${item.component}`}
            title={item.componentName}
          />
        </section>

        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Check-Out Info</h2>
            <div>
              <fieldset>
                <label>Check-Out Date:</label>
                <p>{item.checkout_date ? new Date(item.checkout_date).toLocaleString() : "-"}</p>
              </fieldset>
              <fieldset>
                <label>Checked-Out To:</label>
                <p>{item.asset_displayed_id} - {item.asset_name}</p>
              </fieldset>
              <fieldset>
                <label>Quantity:</label>
                <p>{item.quantity || "-"}</p>
              </fieldset>
              <fieldset>
                <label>Notes:</label>
                <p>{item.notes || "-"}</p>
              </fieldset>
            </div>
          </section>

          <section className="checkin-form">
            <h2>Check-In Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Check-In Date *</label>
                <input
                  type="text"
                  readOnly
                  className={errors.checkInDate ? 'input-error' : ''}
                  {...register("checkInDate", { required: true })}
                />
                {errors.checkInDate && <span className="error">Check-In Date is required</span>}
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea {...register("notes")} maxLength="500" />
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}
