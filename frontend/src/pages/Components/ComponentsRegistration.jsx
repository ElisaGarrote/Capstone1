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

export default function ComponentsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const categoryList = ["RAM", "Storage", "Motherboard", "Networking"];
  const manufacturerList = ["Corsair", "Intel", "Samsung", "Kingston"];
  const supplierList = ["TechStore", "NetSupplies", "HardwareHub"];
  const locationList = ["Main Warehouse", "Storage Room A", "Storage Room B"];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchComponent = async () => {
      if (!id) return;
      try {
        const data = await assetsService.fetchComponentById(id);
        Object.entries(data).forEach(([key, value]) => setValue(key, value));
        if (data.image) setPreviewImage(data.image);
      } catch (error) {
        setErrorMessage("Failed to fetch component details.");
      }
    };
    fetchComponent();
  }, [id, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (selectedImage) formData.append("image", selectedImage);
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
      setErrorMessage("Failed to submit the form. Please try again.");
    }
  };

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
            title={id ? "Edit Component" : "New Component"}
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
                placeholder='Component Name'
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </fieldset>

            <fieldset>
              <label>Category *</label>
              <select {...register("category", { required: "Category is required" })}>
                <option value="">Select Category</option>
                {categoryList.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category.message}</span>}
            </fieldset>

            <fieldset>
              <label>Manufacturer</label>
              <select {...register("manufacturer_id")}> {/* assuming manufacturer ID */}
                <option value="">Select Manufacturer</option>
                {manufacturerList.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label>Supplier</label>
              <select {...register("supplier")}> {/* optional */}
                <option value="">Select Supplier</option>
                {supplierList.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label>Location</label>
              <select {...register("location")}> {/* optional */}
                <option value="">Select Location</option>
                {locationList.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label>Model Number</label>
              <input type="text" {...register("model_number")} maxLength="50" placeholder='Model Number' />
            </fieldset>

            <fieldset>
              <label>Order Number</label>
              <input type="text" {...register("order_number")} maxLength="30" placeholder='Order Number' />
            </fieldset>

            <fieldset>
              <label>Purchase Date</label>
              <input type="date" {...register("purchase_date")} max={currentDate} />
            </fieldset>

            <fieldset>
              <label> Default Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchase_cost", { valueAsNumber: true })}
                  placeholder='Purchase Cost'
                />
              </div>
            </fieldset>

            <fieldset>
              <label>Quantity</label>
              <input type="number" min="1" {...register("quantity")} placeholder='Quantity' />
            </fieldset>

            <fieldset>
              <label>Minimum Quantity</label>
              <input type="number" min="0" {...register("minimum_quantity")} placeholder='Minimum Quantity' />
            </fieldset>

            <fieldset>
              <label>Notes</label>
              <textarea {...register("notes")} maxLength="500" placeholder='Notes...'/>
            </fieldset>

            <fieldset>
              <label>Image</label>
              {previewImage && (
                <div className="image-selected">
                  <img src={previewImage} alt="Preview" />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPreviewImage(null);
                      setSelectedImage(null);
                      setValue("image", null);
                      document.getElementById("image").value = "";
                    }}
                  >
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
