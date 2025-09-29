import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Status from "../../components/Status";

const StatusRegistration = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      statusName: "",
      statusType: "",
      notes: "",
      showInList: true,
      defaultStatus: false,
    },
  });

  const statusTypes = [
    "Archived",
    "Deployable",
    "Deployed",
    "Pending",
    "Undeployable",
  ];

  const onSubmit = (data) => {
    // Here you would typically send the data to your API
    console.log("Form submitted:", data);

    // Optional: navigate back to status view after successful submission
    navigate("/More/ViewStatus");
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Statuses"
            currentPage="New Status"
            rootNavigatePage="/More/ViewStatus"
            title="New Status Label"
          />
        </section>
        <section className="status-registration-section">
          <section className="registration-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label htmlFor="statusName">Status Name *</label>
                <input
                  type="text"
                  placeholder="Status Name"
                  maxLength="100"
                  className={errors.statusName ? "input-error" : ""}
                  {...register("statusName", {
                    required: "Status Name is required",
                  })}
                />
                {errors.statusName && (
                  <span className="error-message">
                    {errors.statusName.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="statusType">Status Type *</label>
                <select
                  className={errors.statusType ? "input-error" : ""}
                  {...register("statusType", {
                    required: "Status Type is required",
                  })}
                >
                  <option value="">Select Status Type</option>
                  {statusTypes.map((type, idx) => (
                    <option key={idx} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.statusType && (
                  <span className="error-message">
                    {errors.statusType.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="notes">Notes</label>
                <textarea
                  placeholder="Enter any additional notes about this status..."
                  rows="4"
                  maxLength="500"
                  {...register("notes")}
                />
              </fieldset>

              <button
                type="submit"
                className="primary-button"
                disabled={!isValid}
              >
                Save
              </button>
            </form>
          </section>
          <section className="status-info-section">
            <h2>About Status Types</h2>
            <section className="deployable-section">
              <Status type={"deployable"} name={"Deployable"} />
              <p>
                Use this for assets that can be checked out. Once you check them
                out, they will automatically change status to{" "}
                <span>
                  <Status type={"deployed"} name={"Deployed"} />.
                </span>
              </p>
            </section>
            <section className="pending-section">
              <Status type={"pending"} name={"Pending"} />
              <p>
                Use this for assets that can't be checked out. Useful for assets
                that are being repaired, and are expected to return to use.
              </p>
            </section>
            <section className="undeployable-section">
              <Status type={"undeployable"} name={"Undeployable"} />
              <p>Use this for assets that can't be checked out to anyone.</p>
            </section>
            <section className="archived-section">
              <Status type={"archived"} name={"Archived"} />
              <p>
                Use this for assets that can't be checked out to anyone, and
                have been archived. Useful for keeping information about
                historical assets and meanwhile keeping them out of daily sight.
              </p>
            </section>
          </section>
        </section>
      </main>
    </>
  );
};

export default StatusRegistration;
