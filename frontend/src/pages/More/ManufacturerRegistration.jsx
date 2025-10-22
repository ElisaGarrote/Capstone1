import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import Alert from "../../components/Alert";
import SystemLoading from "../../components/Loading/SystemLoading";
import Footer from "../../components/Footer";

import "../../styles/Registration.css";
import "../../styles/ManufacturerRegistration.css";
const ManufacturerRegistration = () => {
  const { id } = useParams();
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      manufacturerName: "",
      url: "",
      supportUrl: "",
      supportPhone: "",
      supportEmail: "",
      notes: "",
      logo: null,
    },
    mode: "all",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const contextServiceUrl =
    "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const manufacturerData = await contextsService.fetchManufacturerById(
            id
          );
          if (!manufacturerData) {
            setErrorMessage("Failed to fetch manufacturer details");
            setIsLoading(false);
            return;
          }
          console.log("Manufacturer Details:", manufacturerData);
          setValue("manufacturerName", manufacturerData.name || "");
          setValue("url", manufacturerData.manu_url || "");
          setValue("supportUrl", manufacturerData.support_url || "");
          setValue("supportPhone", manufacturerData.support_phone || "");
          setValue("supportEmail", manufacturerData.support_email || "");
          setValue("notes", manufacturerData.notes || "");
          if (manufacturerData.logo) {
            setPreviewImage(`${contextServiceUrl}${manufacturerData.logo}`);
            setSelectedImage(null);
          }
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setErrorMessage("Failed to initialize form data");
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [id, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(
          "Image size exceeds 5MB. Please choose a smaller file."
        );
        setTimeout(() => setErrorMessage(""), 5000);
        e.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (e.g., PNG, JPEG).");
        setTimeout(() => setErrorMessage(""), 5000);
        e.target.value = "";
        return;
      }

      setSelectedImage(file);
      setValue("logo", file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Duplicate name check for creation
      if (!id) {
        const existingManufacturers =
          await contextsService.fetchAllManufacturerNames();
        if (!existingManufacturers) {
          throw new Error(
            "Failed to fetch manufacturer names for duplicate check"
          );
        }
        const isDuplicate = existingManufacturers.manufacturers.some(
          (manufacturer) =>
            manufacturer.name.toLowerCase() ===
            data.manufacturerName.toLowerCase()
        );
        if (isDuplicate) {
          setErrorMessage(
            "A manufacturer with this name already exists. Please use a different name."
          );
          setTimeout(() => setErrorMessage(""), 5000);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", data.manufacturerName);
      formData.append("manu_url", data.url || "");
      formData.append("support_url", data.supportUrl || "");
      formData.append("support_phone", data.supportPhone || "");
      formData.append("support_email", data.supportEmail || "");
      formData.append("notes", data.notes || "");

      if (selectedImage) {
        formData.append("logo", selectedImage);
      }

      if (removeImage) {
        formData.append("remove_logo", "true");
        console.log("Removing logo: remove_logo flag set to true");
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("Form data before submission:");
        for (let pair of formData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      let result;
      if (id) {
        result = await contextsService.updateManufacturer(id, formData);
      } else {
        result = await contextsService.createManufacturer(formData);
      }

      if (!result) {
        throw new Error(`Failed to ${id ? "update" : "create"} manufacturer.`);
      }

      console.log(`${id ? "Updated" : "Created"} manufacturer:`, result);
      navigate("/More/ViewManufacturer", {
        state: {
          successMessage: `Manufacturer has been ${
            id ? "updated" : "created"
          } successfully!`,
        },
      });
    } catch (error) {
      console.error(
        `Error ${id ? "updating" : "creating"} manufacturer:`,
        error
      );
      setErrorMessage(
        error.message.includes("Failed to create manufacturer")
          ? "Failed to create manufacturer. Please check the server configuration or endpoint."
          : error.message ||
              `An error occurred while ${
                id ? "updating" : "creating"
              } the manufacturer`
      );
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  if (isLoading) {
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}

      <section className="page-layout-registration">
        <NavBar />
        <main className="registration">
          <section className="top">
            <TopSecFormPage
              root="Manufacturers"
              currentPage={id ? "Edit Manufacturer" : "New Manufacturer"}
              rootNavigatePage="/More/ViewManufacturer"
              title={id ? "Edit Manufacturer" : "New Manufacturer"}
            />
          </section>
          <section className="registration-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label htmlFor="manufacturerName">Manufacturer Name *</label>
                <input
                  type="text"
                  placeholder="Manufacturer Name"
                  maxLength="100"
                  className={errors.manufacturerName ? "input-error" : ""}
                  {...register("manufacturerName", {
                    required: "Manufacturer Name is required",
                  })}
                />
                {errors.manufacturerName && (
                  <span className="error-message">
                    {errors.manufacturerName.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  placeholder="URL"
                  className={errors.url ? "input-error" : ""}
                  {...register("url", {
                    pattern: {
                      value: /^(https?:\/\/).+/i,
                      message: "URL must start with http:// or https://",
                    },
                  })}
                />
                {errors.url && (
                  <span className="error-message">{errors.url.message}</span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="supportUrl">Support URL</label>
                <input
                  type="url"
                  placeholder="Support URL"
                  className={errors.supportUrl ? "input-error" : ""}
                  {...register("supportUrl", {
                    pattern: {
                      value: /^(https?:\/\/).+/i,
                      message:
                        "Support URL must start with http:// or https://",
                    },
                  })}
                />
                {errors.supportUrl && (
                  <span className="error-message">
                    {errors.supportUrl.message}
                  </span>
                )}
              </fieldset>

              <fieldset>
                <label htmlFor="supportPhone">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  {...register("supportPhone")}
                />
              </fieldset>

              <fieldset>
                <label htmlFor="supportEmail">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("supportEmail")}
                />
              </fieldset>

              <fieldset>
                <label htmlFor="notes">Notes</label>
                <textarea
                  placeholder="Notes"
                  rows="4"
                  maxLength="500"
                  {...register("notes")}
                />
              </fieldset>

              <fieldset>
                <label htmlFor="logo">Logo</label>
                <div>
                  {previewImage && (
                    <div className="image-selected">
                      <img src={previewImage} alt="Selected logo" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setSelectedImage(null);
                          setValue("logo", null);
                          document.getElementById("logo").value = "";
                          setRemoveImage(true);
                          console.log("Remove logo flag set to:", true);
                        }}
                      >
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  )}
                  <label htmlFor="logo" className="upload-image-btn">
                    {previewImage ? "Change Logo" : "Choose Logo"}
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleImageSelection}
                      style={{ display: "none" }}
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 5MB
                  </small>
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

export default ManufacturerRegistration;
