import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import CloseIcon from "../../assets/icons/close.svg";
import Footer from "../../components/Footer";

import "../../styles/Registration.css";
import "../../styles/CategoryRegistration.css";

import { createCategory, updateCategory, } from "../../services/contexts-service";


const CategoryRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editState = location.state?.category || null;
  const isEdit = !!editState;

  console.log("Edit state:", editState);

  const [errorMessage, setErrorMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState();
  const [existingImage, setExistingImage] = useState(() => editState?.logo || null);
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "all",
    defaultValues: {
      categoryName: editState?.name || "",
      categoryType: editState?.type || "",
    },
  });

  console.log("editState:", editState);

  const handleFileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("File size must be less than 5MB");
        setTimeout(() => setErrorMessage(""), 5000);
        e.target.value = "";
        return;
      }

      setAttachmentFile(file);
      setExistingImage(null);
    }
  };

  const onSubmit = async (data) => {
    setErrorMessage("");
    const formData = new FormData();
    formData.append("name", data.categoryName);
    formData.append("type", data.categoryType);

    if (attachmentFile) {
      formData.append("logo", attachmentFile);
    } else if (removeExistingLogo) {
      formData.append("remove_logo", true);
    }

    try {
      if (isEdit) {
        await updateCategory(editState.id, formData);
        navigate("/More/ViewCategories", { state: { success: "Category updated successfully!" } });
      } else {
        await createCategory(formData);
        navigate("/More/ViewCategories", { state: { success: "Category created successfully!" } });
      }
    } catch (err) {
      console.error("Submit error:", err);

      // Check for backend validation error
      if (err.response?.data?.name) {
        setErrorMessage(err.response.data.name[0]);
      } else {
        setErrorMessage("Something went wrong.");
      }
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      
      <section className="page-layout-registration">
        <NavBar />
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
                  <option value="asset">Asset</option>
                  <option value="component">Component</option>
                </select>
              </fieldset>

              <fieldset>
                <label>Icon</label>

                {existingImage && !attachmentFile && !removeExistingLogo ? (
                  <div className="image-selected">
                    <img src={existingImage} alt="Current logo" />
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveExistingLogo(true);
                        setExistingImage(null);
                      }}>
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ) : attachmentFile ? (
                  <div className="image-selected">
                    <img src={URL.createObjectURL(attachmentFile)} alt="Selected icon" />
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}>
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

                <small className="file-size-info">Maximum file size must be 5MB</small>
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
