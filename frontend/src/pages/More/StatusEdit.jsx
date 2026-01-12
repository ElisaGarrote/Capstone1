import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Status from "../../components/Status";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";

import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";

const StatusRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");

  // Retrieve the "status" data value passed from the navigation state.
  // If the "status" data is not exist, the default value for this is "undifiend".
  const status = location.state?.status;

  // Custom styles for react-select to match Registration inputs
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      minHeight: '48px',
      height: '48px',
      borderRadius: '25px',
      fontSize: '0.875rem',
      padding: '0 8px',
      border: state.isFocused ? '1px solid #007bff' : '1px solid #ccc',
      boxShadow: state.isFocused ? '0 0 0 1px #007bff' : 'none',
      cursor: 'pointer',
      '&:hover': { borderColor: '#007bff' },
    }),
    valueContainer: (provided) => ({ ...provided, height: '46px', padding: '0 8px' }),
    input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
    indicatorSeparator: (provided) => ({ ...provided, display: 'block', backgroundColor: '#ccc', width: '1px', marginTop: '10px', marginBottom: '10px' }),
    indicatorsContainer: (provided) => ({ ...provided, height: '46px' }),
    container: (provided) => ({ ...provided, width: '100%' }),
    menu: (provided) => ({ ...provided, zIndex: 9999, position: 'absolute', width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'white' : '#333',
      fontSize: '0.875rem',
      padding: '10px 16px',
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({ ...provided, color: '#333' }),
    placeholder: (provided) => ({ ...provided, color: '#999' }),
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      statusName: status.name,
      statusType: status.type,
      notes: status.notes,
    },
    mode: "all",
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
    navigate("/More/ViewStatus", { state: { updatedStatus: true } });
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}

      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          <section className="top">
            <TopSecFormPage
              root="Statuses"
              currentPage="Update Status"
              rootNavigatePage="/More/ViewStatus"
              title={status?.name || "Update Status"}
            />
          </section>
          <section className="status-registration-section">
            <section className="registration-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset>
                  <label htmlFor="statusName">
                    Status Name
                    <span className="required-asterisk">*</span>
                  </label>
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
                  <label htmlFor="statusType">
                    Status Type
                    <span className="required-asterisk">*</span>
                  </label>
                  <Controller
                    name="statusType"
                    control={control}
                    rules={{ required: "Status Type is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        inputId="statusType"
                        options={statusTypes.map(t => ({ value: t.toLowerCase(), label: t }))}
                        value={statusTypes.map(t => ({ value: t.toLowerCase(), label: t })).find(opt => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value ?? null)}
                        placeholder="Select Status Type"
                        isSearchable={true}
                        isClearable={true}
                        styles={customSelectStyles}
                        className={errors.statusType ? 'react-select-error' : ''}
                      />
                    )}
                  />
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
                  Use this for assets that can be checked out. Once you check
                  them out, they will automatically change status to{" "}
                  <span>
                    <Status type={"deployed"} name={"Deployed"} />.
                  </span>
                </p>
              </section>
              <section className="pending-section">
                <Status type={"pending"} name={"Pending"} />
                <p>
                  Use this for assets that can't be checked out. Useful for
                  assets that are being repaired, and are expected to return to
                  use.
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
                  historical assets and meanwhile keeping them out of daily
                  sight.
                </p>
              </section>
            </section>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
};

export default StatusRegistration;
