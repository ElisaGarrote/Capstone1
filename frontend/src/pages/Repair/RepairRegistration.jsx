import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";

const RepairRegistration = () => {
  const navigate = useNavigate();
  const [attachmentFile, setAttachmentFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
  });

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        e.target.value = "";
        return;
      }
      setAttachmentFile(e.target.files[0]);
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data, attachmentFile);
    navigate("/Repairs");
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Repairs"
            currentPage="New Repair"
            rootNavigatePage="/Repairs"
            title="New Repair"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">Asset *</label>
              <select
                className={errors.asset ? "input-error" : ""}
                {...register("asset", {
                  required: "Asset is required",
                })}
              >
                <option value="">Select Type</option>
                <option value="Iphone 16 Pro Max">Hardware</option>
                <option value="Ideapad 3">Software</option>
                <option value="Google Pixelbook 2">Other</option>
              </select>
              {errors.repairType && (
                <span className="error-message">
                  {errors.asset.message}
                </span>
              )}
            </fieldset>

            {/* Supplier */}
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <select
                className={errors.supplier ? "input-error" : ""}
                {...register("supplier")}
              >
                <option value="">Select Type</option>
                <option value="Apple">Hardware</option>
                <option value="Lenovo">Software</option>
                <option value="Google">Other</option>
              </select>
            </fieldset>

            {/* Repair Type */}
            <fieldset>
              <label htmlFor="repairType">Repair Type*</label>
              <select
                className={errors.repairType ? "input-error" : ""}
                {...register("repairType", {
                  required: "Repair type is required",
                })}
              >
                <option value="">Select Type</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="other">Other</option>
              </select>
              {errors.repairType && (
                <span className="error-message">
                  {errors.repairType.message}
                </span>
              )}
            </fieldset>

            {/* Repair Name */}
            <fieldset>
              <label htmlFor="repairName">Repair Name*</label>
              <input
                type="text"
                placeholder="Enter repair name"
                maxLength="100"
                className={errors.repairName ? "input-error" : ""}
                {...register("repairName", {
                  required: "Repair name is required",
                })}
              />
              {errors.repairName && (
                <span className="error-message">
                  {errors.repairName.message}
                </span>
              )}
            </fieldset>

            {/* Start Date */}
            <fieldset>
              <label htmlFor="startDate">Start Date*</label>
              <input
                type="date"
                className={errors.startDate ? "input-error" : ""}
                {...register("startDate", {
                  required: "Start date is required",
                })}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate.message}</span>
              )}
            </fieldset>

            {/* End Date (Optional) */}
            <fieldset>
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                {...register("endDate", {
                  validate: (value, formValues) => {
                    if (value && formValues.startDate && value < formValues.startDate) {
                      return "End date cannot be earlier than start date";
                    }
                    return true;
                  },
                })}
                min={watch("startDate") || ""}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate.message}</span>
              )}
            </fieldset>

            {/* Cost */}
            <div className="form-field">
                <label htmlFor="cost">Cost *</label>
                <div className="cost-input">
                  <span className="currency">PHP</span>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    step="0.01"
                    defaultValue={null}
                    onInput={(e) => {
                      // Prevent entering more than 2 decimal places
                      const value = e.target.value;
                      const parts = value.split(".");
                      if (parts[1] && parts[1].length > 2) {
                        e.target.value =
                          parts[0] + "." + parts[1].substring(0, 2);
                      }
                    }}
                    {...register("cost", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Cost must be a non-negative number",
                      },
                      required: "Cost is required",
                    })}
                  />
                </div>

                {errors.cost && (
                  <span className="error-message">{errors.cost.message}</span>
                )}
              </div>

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
            <div className="form-field">
              <label>Attachments</label>
              <div className="attachments-container">
                <button
                  className="choose-file-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("attachment").click();
                  }}
                >
                  Choose File
                </button>
                <Controller
                  name="attachment"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (
                        value &&
                        value[0] &&
                        value[0].size > 10 * 1024 * 1024
                      ) {
                        return "File size must be less than 10MB";
                      }
                      return true;
                    },
                  }}
                  render={({ field: { onChange, ...field } }) => (
                    <input
                      type="file"
                      id="attachment"
                      style={{ display: "none" }}
                      accept=".pdf, .docx, .xlsx, .jpg, .jpeg, .png"
                      onChange={(e) => {
                        onChange(e.target.files);
                        handleFileSelection(e);
                      }}
                      {...field}
                    />
                  )}
                />
                {attachmentFile ? (
                  <div className="file-selected">
                    <p>{attachmentFile.name}</p>
                    <button
                      className="remove-file-btn"
                      onClick={(event) => {
                        event.preventDefault();
                        setAttachmentFile(null);
                        document.getElementById("attachment").value = "";
                      }}
                    >
                      <img
                        src={CloseIcon}
                        alt="Remove file"
                        style={{ background: "red" }}
                      />
                    </button>
                  </div>
                ) : (
                  <span className="no-file">No file chosen</span>
                )}

                {errors.attachment && (
                  <span className="error-message">
                    {errors.attachment.message}
                  </span>
                )}

                {!attachmentFile && !errors.attachment && (
                  <p className="file-size-limit">
                    Maximum file size must be 10MB
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default RepairRegistration;
