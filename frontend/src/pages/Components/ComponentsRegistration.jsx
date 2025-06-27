import "../../styles/custom-colors.css";
import "../../styles/Registration.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";
import SystemLoading from '../../components/Loading/SystemLoading';

export default function ComponentsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

  const [componentName, setComponentName] = useState("");
 
  // State for dropdown options
  const [manufacturerList, setManufacturerList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  // UI state
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        const [manufacturers, locations, categories] = await Promise.all([
          contextsService.fetchAllManufacturers(),
          contextsService.fetchAllLocations(),
          assetsService.fetchAllComponentContexts(),
        ]);

        setManufacturerList(manufacturers || []);
        setLocationList(locations || []);
        setCategoryList(categories || []);

        if (id) {
          const data = await assetsService.fetchComponentById(id);
          if (data) {
            Object.entries(data).forEach(([key, value]) => setValue(key, value));
            if (data.image) setPreviewImage(data.image);
            if (data.name) setComponentName(data.name);  
          } else {
            setErrorMessage("Failed to fetch component details.");
          }
        }

      } catch (error) {
        console.error("Initialization error:", error);
        setErrorMessage("Failed to load form data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [id, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setRemoveImage(false);
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setPreviewImage(null);
    setSelectedImage(null);
    setRemoveImage(true);
    setValue("image", null);
    const input = document.getElementById("image");
    if (input) input.value = "";
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      if (removeImage) {
        formData.append("remove_image", "true");
      }

      if (id) {
        await assetsService.updateComponent(id, formData);
      } else {
        await assetsService.createComponent(formData);
      }

      navigate("/components", {
        state: {
          successMessage: `Component ${id ? "updated" : "created"} successfully!`,
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage("Failed to submit the form. Please try again.");
    }
  };

  if (isLoading) {
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage={id ? "Edit Component" : "New Component"}
            rootNavigatePage="/components"
            title={id ? `${componentName}` : "New Component"}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label>Component Name *</label>
              <input
                type="text"
                className={errors.name ? "input-error" : ""}
                {...register("name", { required: "Component Name is required" })}
                maxLength="100"
                placeholder="Component Name"
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </fieldset>

            <fieldset>
              <label>Category *</label>
              <select {...register("category", { required: "Category is required" })}>
                <option value="">Select Category</option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category.message}</span>}
            </fieldset>

            <fieldset>
              <label>Manufacturer *</label>
              <select {...register("manufacturer", { required: "Manufacturer is required" })}>
                <option value="">Select Manufacturer</option>
                {manufacturerList.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {errors.manufacturer && <span className="error-message">{errors.manufacturer.message}</span>}
            </fieldset>

            <fieldset>
              <label>Location *</label>
              <select {...register("location", { required: "Location is required" })}>
                <option value="">Select Location</option>
                {locationList.map((loc) => (
                  <option key={loc.id} value={loc.city}>{loc.city}</option>
                ))}
              </select>
              {errors.location && <span className="error-message">{errors.location.message}</span>}
            </fieldset>

            <fieldset>
              <label>Model Number</label>
              <input type="text" {...register("model_number")} maxLength="50" placeholder="Model Number" />
            </fieldset>

            <fieldset>
              <label>Order Number</label>
              <input type="text" {...register("order_number")} maxLength="30" placeholder="Order Number" />
            </fieldset>

            <fieldset>
              <label>Purchase Date</label>
              <input type="date" {...register("purchase_date")} max={currentDate} />
            </fieldset>

            <fieldset>
              <label>Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchase_cost", {
                    required: "Purchase Cost is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Purchase Cost"
                />
              </div>
              {errors.purchase_cost && <span className="error-message">{errors.purchase_cost.message}</span>}
            </fieldset>

            <fieldset>
              <label>Quantity</label>
              <input type="number" min="1" {...register("quantity")} placeholder="Quantity" />
            </fieldset>

            <fieldset>
              <label>Minimum Quantity</label>
              <input type="number" min="0" {...register("minimum_quantity")} placeholder="Minimum Quantity" />
            </fieldset>

            <fieldset>
              <label>Notes</label>
              <textarea {...register("notes")} maxLength="500" placeholder="Notes..." />
            </fieldset>

            <fieldset>
              <label>Image</label>
              {previewImage && (
                <div className="image-selected">
                  <img src={previewImage} alt="Preview" />
                  <button onClick={handleRemoveImage}>
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageSelection}
                style={{ display: "none" }}
              />
              <label htmlFor="image" className="upload-image-btn">
                {!previewImage ? "Choose Image" : "Change Image"}
              </label>
            </fieldset>

            <button type="submit" className="save-btn">
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
