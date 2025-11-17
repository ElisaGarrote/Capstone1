import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";

const DepraciationRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.depreciation || null;
  const isEdit = !!editState;

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
      name: editState?.name || "",
      duration: editState?.duration || "",
      minimumValue: editState?.minimum_value || "",
    },
  });

  useEffect(() => {
    if (editState) {
      setValue("name", editState.name || "");
      setValue("duration", editState.duration || "");
      setValue("minimumValue", editState.minimumValue || "");
    }
  }, [editState, setValue]);

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
            root="Depreciations"
            currentPage={isEdit ? "Update Depreciation" : "New Depreciation"}
            rootNavigatePage="/More/Depreciations"
            title={isEdit ? editState?.name || "Update Depreciation" : "New Depreciation"}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <fieldset>
              <label htmlFor="name">
                Name<span className="required-asterisk">*</span>
              </label>
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
              <label htmlFor="duration">
                Duration<span className="required-asterisk">*</span>
              </label>
              <div
                className={`cost-input-group ${
                  errors.duration ? "input-error" : ""
                }`}
              >
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
                      (Number.isInteger(value) && value > 0) ||
                      "Must be a positive integer",
                  })}
                />
                <span className="duration-addon">Months</span>
              </div>
              {errors.duration && (
                <span className="error-message">{errors.duration.message}</span>
              )}
            </fieldset>

            {/* Minimum Value */}
            <fieldset>
              <label htmlFor="minimumValue">
                Minimum Value<span className="required-asterisk">*</span>
              </label>
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
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default DepraciationRegistration;
