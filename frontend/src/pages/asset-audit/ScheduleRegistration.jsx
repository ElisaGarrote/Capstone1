import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Footer from "../../components/Footer";
import { fetchAssetNames, fetchAuditScheduleById, createAuditSchedule, updateAuditSchedule } from "../../services/assets-service";
import Alert from "../../components/Alert";

const ScheduleRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const previousPage = location.state?.previousPage || null;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      asset: "",
      auditDueDate: "",
      notes: "",
    },
  });

  // Fetch assets and schedule data (if editing) on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch assets
        const assetsResult = await fetchAssetNames();
        setAssets(assetsResult);

        // If editing, fetch the audit schedule by ID
        if (id) {
          const scheduleResult = await fetchAuditScheduleById(id);
          setScheduleData(scheduleResult);

          // Populate form with fetched data
          setValue("asset", scheduleResult.asset || "");
          setValue("auditDueDate", scheduleResult.date || "");
          setValue("notes", scheduleResult.notes || "");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const payload = {
        asset: parseInt(data.asset),
        date: data.auditDueDate,
        notes: data.notes || "",
      };

      let message = "";
      if (id) {
        await updateAuditSchedule(id, payload);
        message = "Audit schedule updated successfully.";
      } else {
        await createAuditSchedule(payload);
        message = "Audit schedule created successfully.";
      }

      // Redirect to scheduled audits (or previous) and show success message there
      const redirectPage = previousPage === "/asset-view" ? "/audits/scheduled" : previousPage;
      navigate(redirectPage || "/audits/scheduled", {
        state: { successMessage: message },
      });
    } catch (err) {
      console.error("Error saving audit schedule:", err);
      setErrorMessage("Failed to save audit schedule. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(id);

  const getRootPage = () => {
    switch (previousPage) {
      case "/audits":
        return "Audits";
      case "/audits/overdue":
        return "Overdue for Audits";
      case "/audits/scheduled":
        return "Scheduled Audits";
      case "/audits/completed":
        return "Completed Audits";
      case "/asset-view":
        return "Audits";
      default:
        return "Audits";
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        {errorMessage && <Alert message={errorMessage} type="danger" />}
        <section className="top">
          <TopSecFormPage
            root={getRootPage()}
            currentPage={isEdit ? "Edit Schedule" : "Schedule Audit"}
            rootNavigatePage={previousPage === "/asset-view" ? "/audits/scheduled" : (previousPage || "/audits/scheduled")}
            title={isEdit ? "Edit Schedule" : "Schedule Audit"}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">Asset<span className="required-asterisk">*</span></label>
              <select
                className={errors.asset ? "input-error" : ""}
                disabled={loading}
                {...register("asset", {
                  required: "Asset is required",
                })}
              >
                <option value="">{loading ? "Loading assets..." : "Select Asset"}</option>
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

            {/* Audit Due Date */}
            <fieldset>
              <label htmlFor="auditDueDate">Audit Due Date<span className="required-asterisk">*</span></label>
              <input
                type="date"
                className={errors.auditDueDate ? "input-error" : ""}
                min={new Date().toISOString().split("T")[0]}
                {...register("auditDueDate", {
                  required: "Audit due date is required",
                })}
              />
              {errors.auditDueDate && (
                <span className="error-message">{errors.auditDueDate.message}</span>
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
            <button type="submit" className="primary-button" disabled={!isValid || submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ScheduleRegistration;
