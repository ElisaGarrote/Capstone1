import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import Footer from "../../components/Footer";
import DeleteModal from "../../components/Modals/DeleteModal";

import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";

const CategoryEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [initialAttachment, setInitialAttachment] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Retrieve the "category" data value passed from the navigation state.
  // If the "category" data is not exist, the default value for this is "undifiend".
  const category = location.state?.category;

  console.log("attachment:", attachmentFile);

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
      categoryName: category.name,
      categoryType: category.type.toLowerCase(),
    },
    mode: "all",
  });

  const categoryTypes = [
    "Asset",
    "Component",
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
    navigate("/More/ViewCategories", { state: { updatedCategory: true } });
  };

  console.log("initial:", initialAttachment);

  const handleDeleteConfirm = () => {
    // Handle category deletion logic here
    console.log("Deleting category:", category.id);
    navigate("/More/ViewCategories");
  };

  return (
    <>
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          onConfirm={handleDeleteConfirm}
        />
      )}
      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          <section className="top">
            <TopSecFormPage
              root="Categories"
              currentPage="Update Category"
              rootNavigatePage="/More/ViewCategories"
              title={category?.name || "Update Category"}
              buttonType="delete"
              deleteModalOpen={() => setDeleteModalOpen(true)}
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
                      isDisabled={true}
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
                <label>Icon</label>
                {attachmentFile || initialAttachment ? (
                  <div className="image-selected">
                    <img
                      // src={category.icon}
                      src={
                        initialAttachment
                          ? category.icon
                          : URL.createObjectURL(attachmentFile)
                      }
                      alt="Selected icon"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        setInitialAttachment(false);
                      }}
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ) : (
                  <label className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
                <small className="file-size-info">
                  Maximum file size must be 5MB
                </small>
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
      {/* <nav>
        <NavBar />
      </nav> */}
    </>
  );
};

export default CategoryEdit;
