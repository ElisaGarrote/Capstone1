import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CloseIcon from "../../assets/icons/close.svg";
import overdueAudits from "../../data/mockData/audits/overdue-audit-mockup-data.json";
import dueAudits from "../../data/mockData/audits/due-audit-mockup-data.json";
import scheduledAudits from "../../data/mockData/audits/scheduled-audit-mockup-data.json";
import completedAudits from "../../data/mockData/audits/completed-audit-mockup-data.json";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";

const PerformAudits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item || null;
  const previousPage = location.state?.previousPage || null;
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const extractAssets = (auditArray) => auditArray.map(a => a.asset.name);
  const allAssets = [
    ...extractAssets(overdueAudits),
    ...extractAssets(dueAudits),
    ...extractAssets(scheduledAudits),
  ];
  const uniqueAssets = Array.from(new Set(allAssets));
  const locations = Array.from(new Set(completedAudits.map(item => item.location)));
  const users = Array.from(new Set(completedAudits.map(item => item.performed_by)));

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
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      asset: null,
      location: null,
      performBy: "John Doe" || "",
      auditDate: new Date().toISOString().split("T")[0],
      nextAuditDate: "",
      notes: "",
    },
  });

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 5MB and was not added.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data, attachmentFiles);
    const redirectPage = previousPage === "/asset-view" ? "/audits/completed" : previousPage;
    navigate(redirectPage);
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
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={getRootPage()}
            currentPage="Perform Audit"
            rootNavigatePage={previousPage === "/asset-view" ? "/audits/completed" : previousPage}
            title="Perform Audit"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">Select Asset<span className="required-asterisk">*</span></label>
              <Controller
                name="asset"
                control={control}
                rules={{ required: "Asset is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="asset"
                    options={uniqueAssets.map(a => ({ value: a, label: a }))}
                    value={uniqueAssets.map(a => ({ value: a, label: a })).find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Asset"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                    className={errors.asset ? 'react-select-error' : ''}
                  />
                )}
              />
              {errors.asset && (
                <span className="error-message">
                  {errors.asset.message}
                </span>
              )}
            </fieldset>

            {/* Location */}
            <fieldset>
              <label htmlFor="location">Location<span className="required-asterisk">*</span></label>
              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="location"
                    options={locations.map(l => ({ value: l, label: l }))}
                    value={locations.map(l => ({ value: l, label: l })).find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Location"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                    className={errors.location ? 'react-select-error' : ''}
                  />
                )}
              />
              {errors.location && (
                <span className="error-message">
                  {errors.location.message}
                </span>
              )}
            </fieldset>

            {/* Performed By */}
            <fieldset className="readonly-input">
              <label htmlFor="performBy">Performed By</label>
              <input
                type="text"
                value="John Doe"
                readOnly
              />
            </fieldset>

            {/* Audit Date */}
            <fieldset>
              <label htmlFor="auditDate">Audit Date<span className="required-asterisk">*</span></label>
              <input
                type="date"
                className={errors.checkoutDate ? "input-error" : ""}
                defaultValue={new Date().toISOString().split("T")[0]}
                {...register("auditDate", {
                  required: "Audit date is required",
                })}
              />
              {errors.auditDate && (
                <span className="error-message">{errors.auditDate.message}</span>
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
                <span className="error-message">{errors.nextAuditDate.message}</span>
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
            <button type="submit" className="primary-button" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PerformAudits;
