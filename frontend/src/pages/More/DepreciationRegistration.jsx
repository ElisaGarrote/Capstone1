import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";

const DepraciationRegistration = () => {
  const navigate = useNavigate();
  const [attachmentFiles, setAttachmentFiles] = useState([]);

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
            currentPage="New Depreciation"
            rootNavigatePage="/More/Depreciations"
            title="New Depreciation"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <fieldset>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                placeholder="Enter depreciation name"
                maxLength="100"
                className={errors.name ? "input-error" : ""}
                {...register("name", {
                  required: "Depreciation name is required",
                })}
              />
              {errors.name && (
                <span className="error-message">
                  {errors.name.message}
                </span>
              )}
            </fieldset>

            {/* Duration */}
            <fieldset>
              <label htmlFor="duration">Duration *</label>
              <input
                type="number"
                id="duration"
                placeholder="Enter depreciation duration"
                min="1"
                step="1"
                {...register("duration", {
                  required: "Duration is required",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number.isInteger(value) && value > 0 || "Must be a positive integer",
                })}
                className={errors.duration ? "input-error" : ""}
              />
              {errors.duration && (
                <span className="error-message">{errors.duration.message}</span>
              )}
            </fieldset>

            {/* Minimum Value */}
            <fieldset>
              <label htmlFor="minimumValue">Minimum Value *</label>
              <input
                type="number"
                id="minimum_value"
                placeholder="Enter  minimum value"
                min="1"
                step="1"
                {...register("minimum_value", {
                  required: "Minimum value is required",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number.isInteger(value) && value > 0 || "Must be a positive integer",
                })}
                className={errors.minimum_value ? "input-error" : ""}
              />
              {errors.minimum_value && (
                <span className="error-message">{errors.minimum_value.message}</span>
              )}
            </fieldset>

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

export default DepraciationRegistration;
