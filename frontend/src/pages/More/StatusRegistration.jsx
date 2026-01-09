import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import api from "../../api";
import TopSecFormPage from "../../components/TopSecFormPage";
import Status from "../../components/Status";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import PlusIcon from "../../assets/icons/plus.svg";

import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";

const StatusRegistration = () => {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      statusName: "",
      statusCategory: "",
      statusType: "",
      notes: "",
      showInList: true,
      defaultStatus: false,
    },
    mode: "all",
  });

  const statusCategory = watch("statusCategory");

  const statusCategories = [
    { value: "asset", label: "Asset Status" },
    { value: "repair", label: "Repair Status" },
  ];

  const assetStatusTypes = [
    "Archived",
    "Deployable",
    "Deployed",
    "Pending",
    "Undeployable",
  ];

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    setErrorMessage("");
    setSuccessMessage("");
    if (!file) return;

    // Validate size (max 5MB) and extension/type
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ];

    const name = (file.name || "").toLowerCase();
    const extOk = name.endsWith(".xlsx");
    const typeOk = !!file.type ? allowedTypes.includes(file.type) : true;

    if (file.size > maxSize) {
      setErrorMessage("Please select a file smaller than 5MB");
      setTimeout(() => setErrorMessage(""), 6000);
      e.target.value = "";
      return;
    }

    if (!extOk && !typeOk) {
      setErrorMessage("Please select a valid .xlsx file");
      setTimeout(() => setErrorMessage(""), 6000);
      e.target.value = "";
      return;
    }

    // Upload immediately
    setIsImporting(true);
    setImportFile(file);
    (async () => {
      try {
        const contextsBase = import.meta.env.VITE_CONTEXTS_API_URL || import.meta.env.VITE_API_URL || "/api/contexts/";
        const form = new FormData();
        form.append("file", file);

        const res = await api.post(`${contextsBase}import/statuses/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const created = res?.data?.created ?? 0;
        const updated = res?.data?.updated ?? 0;
        const errors = res?.data?.errors ?? [];
        let msg = `Import complete. Created ${created}. Updated ${updated}.`;
        if (Array.isArray(errors) && errors.length) {
          msg += ` ${errors.length} rows failed.`;
        }
        setSuccessMessage(msg);
      } catch (err) {
        console.error("Import failed", err);
        const detail = err?.response?.data?.detail || err?.message || "Import failed";
        setErrorMessage(detail);
      } finally {
        setIsImporting(false);
        e.target.value = "";
        setImportFile(null);
        setTimeout(() => setSuccessMessage("") , 8000);
        setTimeout(() => setErrorMessage("") , 8000);
      }
    })();
  };

  const onSubmit = async (data) => {
    // Send the form to the contexts service
    try {
      setIsSubmitting(true);
      const contextsBase = import.meta.env.VITE_CONTEXTS_API_URL || import.meta.env.VITE_API_URL || "/api/contexts/";
      const payload = {
        name: data.statusName,
        category: data.statusCategory,
        type: data.statusCategory === "asset" ? data.statusType : null,
        notes: data.notes,
      };

      await api.post(`${contextsBase}statuses/`, payload);

      navigate("/More/ViewStatus", { state: { addedStatus: true } });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data || err.message || "Failed to create status";
      setErrorMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
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
              currentPage="New Status"
              rootNavigatePage="/More/ViewStatus"
              title="New Status Label"
              rightComponent={
                <div className="import-section">
                  <label htmlFor="status-import-file" className="import-btn">
                    <img src={PlusIcon} alt="Import" />
                    Import
                    <input
                      type="file"
                      id="status-import-file"
                      accept=".xlsx"
                      onChange={handleImportFile}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              }
            />
          </section>
          {/* Left-side import status: shows uploading first, then result messages */}
          <div style={{ padding: '0 24px', marginTop: 8 }}>
            <div className="import-status-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isImporting && <span style={{ fontSize: 13, fontWeight: 500 }}>Uploading...</span>}
              {!isImporting && successMessage && (
                <div className="success-message" style={{ fontSize: 13, color: 'green' }}>{successMessage}</div>
              )}
              {!isImporting && errorMessage && (
                <div className="error-message" style={{ fontSize: 13, color: '#d32f2f' }}>{errorMessage}</div>
              )}
            </div>
          </div>
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
                  <label htmlFor="statusCategory">
                    Status Category
                    <span className="required-asterisk">*</span>
                  </label>
                  <select
                    className={errors.statusCategory ? "input-error" : ""}
                    {...register("statusCategory", {
                      required: "Status Category is required",
                    })}
                  >
                    <option value="">Select Status Category</option>
                    {statusCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.statusCategory && (
                    <span className="error-message">
                      {errors.statusCategory.message}
                    </span>
                  )}
                </fieldset>

                {statusCategory === "asset" && (
                  <fieldset>
                    <label htmlFor="statusType">
                      Status Type
                      <span className="required-asterisk">*</span>
                    </label>
                    <select
                      className={errors.statusType ? "input-error" : ""}
                      {...register("statusType", {
                        required: statusCategory === "asset" ? "Status Type is required for asset statuses" : false,
                      })}
                    >
                      <option value="">Select Status Type</option>
                      {assetStatusTypes.map((type, idx) => (
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
                )}

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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
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
