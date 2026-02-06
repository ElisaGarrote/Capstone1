import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";
import Footer from "../../components/Footer";
import { fetchDueAudits, fetchOverdueAudits, fetchScheduledAudits, createAudit, createAuditSchedule } from "../../services/assets-service";
import { fetchAllLocations } from "../../services/integration-help-desk-service";
import authService from "../../services/auth-service";
import Alert from "../../components/Alert";
import { getUserFromToken } from "../../api/TokenUtils";

const PerformAudits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // TableBtn passes 'data', ActionButtons passes 'item'
  const item = location.state?.item || location.state?.data || null;
  const previousPage = location.state?.previousPage || null;
  const user = getUserFromToken();

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [auditSchedules, setAuditSchedules] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch audit schedules and locations on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [due, overdue, scheduled, locs] = await Promise.all([
          fetchDueAudits(),
          fetchOverdueAudits(),
          fetchScheduledAudits(),
          fetchAllLocations(),
        ]);
        // Combine all pending audit schedules
        const allSchedules = [...due, ...overdue, ...scheduled];
        setAuditSchedules(allSchedules);
        setLocations(locs);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      auditSchedule: item?.id ? String(item.id) : "",
      location: "",
      auditDate: new Date().toISOString().split("T")[0],
      nextAuditDate: "",
      notes: "",
    },
  });

  // Pre-fill form if item is passed (after data is loaded)
  useEffect(() => {
    if (item?.id && !loading) {
      setValue("auditSchedule", String(item.id));
    }
  }, [item, setValue, loading]);

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 5MB and was not added.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(""); // Clear previous error
    try {
      // Create the audit
      const auditPayload = {
        audit_schedule: parseInt(data.auditSchedule),
        location: parseInt(data.location),
        user_id: parseInt(user.user_id),
        audit_date: data.auditDate,
        notes: data.notes || "",
      };

      console.log("Audit payload:", auditPayload);
      await createAudit(auditPayload);

      // If next audit date is provided, create a new schedule
      if (data.nextAuditDate) {
        const selectedSchedule = auditSchedules.find(
          (s) => s.id === parseInt(data.auditSchedule)
        );
        if (selectedSchedule) {
          await createAuditSchedule({
            asset: selectedSchedule.asset,
            date: data.nextAuditDate,
            notes: "Auto-scheduled from previous audit",
          });
        }
      }

      // Redirect to completed audits section
      const redirectPage =
        previousPage === "/asset-view"
          ? "/audits/completed"
          : "/audits/completed";
      navigate(redirectPage);
    } catch (err) {
      console.error("Error performing audit:", err);
      // Extract error message from API response
      let message = "Failed to save audit. Please try again.";
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          // Format validation errors - only show the message, not the field name
          const messages = Object.values(errorData)
            .map((errors) =>
              Array.isArray(errors) ? errors.join(", ") : errors
            )
            .join(" | ");
          message = messages || message;
        } else if (typeof errorData === "string") {
          message = errorData;
        }
      }
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={getRootPage()}
            currentPage="Perform Audit"
            rootNavigatePage={
              previousPage === "/asset-view"
                ? "/audits/completed"
                : previousPage
            }
            title="Perform Audit"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Audit Schedule (Asset) */}
            <fieldset>
              <label htmlFor="auditSchedule">
                Select Scheduled Audit
                <span className="required-asterisk">*</span>
              </label>
              <select
                className={errors.auditSchedule ? "input-error" : ""}
                disabled={loading}
                {...register("auditSchedule", {
                  required: "Audit schedule is required",
                })}
              >
                <option value="">
                  {loading ? "Loading..." : "Select Scheduled Audit"}
                </option>
                {auditSchedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.asset_details?.asset_id || "N/A"} -{" "}
                    {schedule.asset_details?.name || "Unknown"} (Due:{" "}
                    {schedule.date})
                  </option>
                ))}
              </select>
              {errors.auditSchedule && (
                <span className="error-message">
                  {errors.auditSchedule.message}
                </span>
              )}
            </fieldset>

            {/* Location */}
            <fieldset>
              <label htmlFor="location">
                Location<span className="required-asterisk">*</span>
              </label>
              <select
                className={errors.location ? "input-error" : ""}
                disabled={loading}
                {...register("location", {
                  required: "Location is required",
                })}
              >
                <option value="">
                  {loading ? "Loading..." : "Select Location"}
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.location && (
                <span className="error-message">{errors.location.message}</span>
              )}
            </fieldset>

            {/* Performed By */}
            <fieldset className="readonly-input">
              <label htmlFor="performBy">Performed By</label>
              <input
                type="text"
                value={
                  `${user.first_name || ""} ${
                    user.last_name || ""
                  }`.trim() || user.email
                }
                readOnly
              />
            </fieldset>

            {/* Audit Date */}
            <fieldset>
              <label htmlFor="auditDate">
                Audit Date<span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                className={errors.auditDate ? "input-error" : ""}
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("auditDate", {
                  required: "Audit date is required",
                })}
              />
              {errors.auditDate && (
                <span className="error-message">
                  {errors.auditDate.message}
                </span>
              )}
            </fieldset>

            {/* Next Audit Date */}
            <fieldset>
              <label htmlFor="nextAuditDate">Next Audit Date</label>
              <input
                type="date"
                className={errors.nextAuditDate ? "input-error" : ""}
                {...register("nextAuditDate")}
              />
              {errors.nextAuditDate && (
                <span className="error-message">
                  {errors.nextAuditDate.message}
                </span>
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

            {/* Attachments */}
            <fieldset>
              <label htmlFor="attachments">Attachments</label>

              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="attachments" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="attachments"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                      multiple
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 5MB
                  </small>
                </div>

                {/* Right column: Uploaded files */}
                <div className="upload-right">
                  {attachmentFiles.map((file, index) => (
                    <div className="file-uploaded" key={index}>
                      <span title={file.name}>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              className="primary-button"
              disabled={!isValid || submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PerformAudits;
