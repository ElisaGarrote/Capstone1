import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import overdueAudits from "../../data/mockData/audits/overdue-audit-mockup-data.json";
import dueAudits from "../../data/mockData/audits/due-audit-mockup-data.json";
import scheduledAudits from "../../data/mockData/audits/scheduled-audit-mockup-data.json";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";

const ScheduleRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item || {};
  const previousPage = location.state?.previousPage || null;

  const extractAssets = (auditArray) => auditArray.map(a => a.asset.name);
  const allAssets = [
    ...extractAssets(overdueAudits),
    ...extractAssets(dueAudits),
    ...extractAssets(scheduledAudits),
  ];
  const uniqueAssets = Array.from(new Set(allAssets));

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
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      asset: item.asset?.name || null,
      auditDueDate: item.date || "",
      notes: item.notes || "",
      },
  });

  useEffect(() => {
  if (item) {
    setValue("asset", item.asset?.name || "");
    setValue("auditDueDate", item.date || "");
    setValue("notes", item.notes || "");
  }
}, [item, setValue]);


  const onSubmit = (data) => {
    if (item?.id) {
      console.log("Updating audit:", { id: item.id, ...data });
    } else {
      console.log("Creating new audit:", data);
    }
    const redirectPage = previousPage === "/asset-view" ? "/audits/scheduled" : previousPage;
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
            currentPage="Schedule Audit"
            rootNavigatePage={previousPage === "/asset-view" ? "/audits/scheduled" : previousPage}
            title="Schedule Audit"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset */}
            <fieldset>
              <label htmlFor="asset">Check-out To<span className="required-asterisk">*</span></label>
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

export default ScheduleRegistration;
