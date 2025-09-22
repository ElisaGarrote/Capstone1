import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import MediumButtons from "../../components/buttons/MediumButtons";
import { useForm } from "react-hook-form";
import CloseIcon from "../../assets/icons/close.svg";

const CategoryRegistration = () => {
  const navigate = useNavigate();
  const [attachmentFile, setAttachmentFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryName: "",
      categoryType: "",
      customFields: "",
      skipCheckoutConfirmation: false,
    },
  });

  const categoryTypes = [
    "Asset",
    "Accessory",
    "Consumable",
    "Component",
    "License",
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
    navigate("/More/ViewCategories");
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Categories"
            currentPage="New Category"
            rootNavigatePage="/More/ViewCategories"
            title="New Category"
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor="categoryName">Category Name *</label>
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
              <label htmlFor="categoryType">Category Type *</label>
              <select
                className={errors.categoryType ? "input-error" : ""}
                {...register("categoryType", {
                  required: "Category Type is required",
                })}
              >
                <option value="">Select Category Type</option>
                {categoryTypes.map((type, idx) => (
                  <option key={idx} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.categoryType && (
                <span className="error-message">
                  {errors.categoryType.message}
                </span>
              )}
            </fieldset>

            <fieldset>
              <label>Icon</label>
              {attachmentFile ? (
                <div className="image-selected">
                  <img
                    src={URL.createObjectURL(attachmentFile)}
                    alt="Selected icon"
                  />
                  <button type="button" onClick={() => setAttachmentFile(null)}>
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

            <button type="submit" className="save-btn">
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default CategoryRegistration;
