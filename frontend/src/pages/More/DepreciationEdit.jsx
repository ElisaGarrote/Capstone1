import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";

const DepreciationEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get depreciation data from navigation state
  const depreciationData = location.state?.depreciation || null;

  // Log what's being passed from Depreciations page
  console.log("DepreciationEdit - Received data:", location.state);
  console.log("DepreciationEdit - Depreciation data:", depreciationData);

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

  // Populate form with existing depreciation data
  useEffect(() => {
    if (depreciationData) {
      setValue("depreciationName", depreciationData.name || "");
      setValue("duration", depreciationData.duration || "");
      setValue("minimumValue", depreciationData.minimum_value || "");
    }
  }, [depreciationData, setValue]);


  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    navigate("/More/Depreciations");
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="More / Depreciations"
            currentPage="Edit Depreciation"
            rootNavigatePage="/more/depreciations"
            title="Edit Depreciation"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Depreciation Name */}
            <fieldset>
              <label htmlFor="depreciationName">Name *</label>
              <input
                type="text"
                placeholder="Enter depreciation name"
                maxLength="100"
                className={errors.depreciationName ? "input-error" : ""}
                {...register("depreciationName", {
                  required: "Depreciation name is required",
                })}
              />
              {errors.depreciationName && (
                <span className="error-message">
                  {errors.depreciationName.message}
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
                id="minimumValue"
                placeholder="Enter  minimum value"
                min="1"
                step="1"
                {...register("minimumValue", {
                  required: "Minimum value is required",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number.isInteger(value) && value > 0 || "Must be a positive integer",
                })}
                className={errors.minimumValue ? "input-error" : ""}
              />
              {errors.minimumValue && (
                <span className="error-message">{errors.minimumValue.message}</span>
              )}
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

export default DepreciationEdit;
