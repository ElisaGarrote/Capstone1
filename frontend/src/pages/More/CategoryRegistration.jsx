import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import MediumButtons from "../../components/buttons/MediumButtons";
import CloseIcon from "../../assets/icons/close.svg";
import Footer from "../../components/Footer";
import PlusIcon from "../../assets/icons/plus.svg";

import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";

const CategoryRegistration = () => {
  const navigate = useNavigate();
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Import file state
  const [importFile, setImportFile] = useState(null);

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
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      categoryName: "",
      categoryType: null,
      customFields: "",
      skipCheckoutConfirmation: false,
    },
    mode: "all",
  });

  const categoryTypes = [
    "Asset",
    "Component",
  ];
  const customFieldOptions = [
    "Serial Number",
    "MAC Address",
    "Asset Tag",
    "Purchase Date",
    "Warranty",
  ];

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Check file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      setAttachmentFile(e.target.files[0]);
    }
  };

  const onSubmit = (data) => {
    // Here you would typically send the data to your API
    console.log("Form submitted:", data, attachmentFile);

    // Optional: navigate back to categories view after successful submission
    navigate("/More/ViewCategories", { state: { addedCategory: true } });
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setErrorMessage("Please select a valid .xlsx file");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      setImportFile(file);
      // Here you would typically process the Excel file
      console.log("Import file selected:", file.name);
    }
  };

  return (
    <>
      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          <section className="top">
            <TopSecFormPage
              root="Categories"
              currentPage="New Category"
              rootNavigatePage="/More/ViewCategories"
              title="New Category"
              rightComponent={
                <div className="import-section">
                  <label htmlFor="import-file" className="import-btn">
                    <img src={PlusIcon} alt="Import" />
                    Import
                    <input
                      type="file"
                      id="import-file"
                      accept=".xlsx"
                      onChange={handleImportFile}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              }
            />
          </section>
          <section className="registration-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label htmlFor="categoryName">
                  Category Name
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Category Name"
                  maxLength="100"
                  className={errors.categoryName ? "input-error" : ""}
                  {...register("categoryName", {
                    required: "Category Name is required",
                  })}
                />
                {errors.categoryName && (
                  <span className="error-message">
                    {errors.categoryName.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="categoryType">
                  Category Type
                  <span className="required-asterisk">*</span>
                </label>
                <Controller
                  name="categoryType"
                  control={control}
                  rules={{ required: "Category Type is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="categoryType"
                      options={categoryTypes.map(t => ({ value: t.toLowerCase(), label: t }))}
                      value={categoryTypes.map(t => ({ value: t.toLowerCase(), label: t })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Category Type"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.categoryType ? 'react-select-error' : ''}
                    />
                  )}
                />
                {errors.categoryType && (
                  <span className="error-message">
                    {errors.categoryType.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label>Image Upload</label>
                <div className="attachments-wrapper">
                  {/* Left column: Upload button & info */}
                  <div className="upload-left">
                    <label htmlFor="icon" className="upload-image-btn">
                      Choose File
                      <input
                        type="file"
                        id="icon"
                        accept="image/*"
                        onChange={handleFileSelection}
                        style={{ display: "none" }}
                      />
                    </label>
                    <small className="file-size-info">
                      Maximum file size must be 5MB
                    </small>
                  </div>

                  {/* Right column: Uploaded file */}
                  <div className="upload-right">
                    {attachmentFile && (
                      <div className="file-uploaded">
                        <span title={attachmentFile.name}>{attachmentFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachmentFile(null)}
                        >
                          <img src={CloseIcon} alt="Remove" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                className="primary-button"
                disabled={!isValid}
              >
                Save
              </button>
            </form>
          </section>
        </main>
        <Footer />
      </section>
    </>
  );
};

export default CategoryRegistration;
