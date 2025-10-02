import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";

const RepairEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Get repair data from navigation state
  const repairData = location.state?.repair || null;

  // Log what's being passed from Repairs page
  console.log("RepairEdit - Received data:", location.state);
  console.log("RepairEdit - Repair data:", repairData);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
  });

  // Populate form with existing repair data
  useEffect(() => {
    if (repairData) {
      setValue("asset", repairData.asset || "");
      setValue("supplier", repairData.supplier || "");
      setValue("repairType", repairData.type || "");
      setValue("repairName", repairData.name || "");
      setValue("startDate", repairData.start_date || "");
      setValue("endDate", repairData.end_date || "");
      setValue("cost", repairData.cost || "");
      setValue("notes", repairData.notes || "");
    }
  }, [repairData, setValue]);

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // Changed to 10MB

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 10MB and was not added.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = (data) => {
    console.log("Form submitted:", data, attachmentFiles);
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
            currentPage="Edit Repair"
            rootNavigatePage="/repairs"
            title="Edit Repair"
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
                    <option value="">Select Asset</option>
                    <option value="Laptop A123">Laptop A123</option>
                    <option value="Printer B456">Printer B456</option>
                    <option value="Aircon C789">Aircon C789</option>
                    <option value="Vehicle D321">Vehicle D321</option>
                    <option value="Projector E654">Projector E654</option>
                    <option value="Laptop F987">Laptop F987</option>
                    <option value="Server G111">Server G111</option>
                    <option value="Router H222">Router H222</option>
                    <option value="Vehicle I333">Vehicle I333</option>
                    <option value="Laptop J444">Laptop J444</option>
                </select>
                {errors.asset && (
                    <span className="error-message">{errors.asset.message}</span>
                )}
                </fieldset>

            {/* Supplier */}
            <fieldset>
                <label htmlFor="supplier">Supplier</label>
                <select
                    className={errors.supplier ? "input-error" : ""}
                    {...register("supplier")}
                >
                    <option value="">Select Supplier</option>
                    <option value="Apple">Apple</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Google">Google</option>
                    <option value="HP">HP</option>
                    <option value="Samsung">Samsung</option>
                </select>
            </fieldset>

            {/* Repair Type */}
            <fieldset>
              <label htmlFor="repairType">Repair Type *</label>
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
              <label htmlFor="repairName">Repair Name *</label>
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
              <label htmlFor="startDate">Start Date *</label>
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
            <fieldset className="cost-field">
              <label htmlFor="cost">Cost</label>
              <div className="cost-input-group">
                <span className="cost-addon">PHP</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...register("cost")}
                />
              </div>
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
                    Maximum file size must be 10MB
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
            <button type="submit" className="primary-button" disabled={!isValid}>
              Update
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default RepairEdit;
