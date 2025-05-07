import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import "../../styles/AccessoriesRegistration.css";
import { useNavigate } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import CloseIcon from "../../assets/icons/close.svg";
import NewAccessoryModal from "../../components/Modals/NewAccessoryModal";
import { useEffect, useState } from "react";
import Select from "react-select";
import Alert from "../../components/Alert";

export default function AccessoriesRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accessory, setAccessory] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchContexts();
      await fetchCategories();

      if (id) {
        try {
          const response = await fetch(`http://localhost:8004/accessories/${id}`);
          if (!response.ok) throw new Error("Failed to fetch accessory details");

          const data = await response.json();
          setAccessory(data);
          console.log("Accessory Details:", data);

          // Set form values
          setValue('accessoryName', data.name);
          setValue('category', data.category);
          setValue('manufacturer', data.manufacturer || '');
          setValue('supplier', data.supplier || '');
          setValue('location', data.location || '');
          setValue('modelNumber', data.model_number || '');
          setValue('orderNumber', data.order_number || '');
          setValue('purchaseDate', data.purchase_date || '');
          setValue('purchaseCost', data.purchase_cost || '');
          setValue('quantity', data.quantity || '');
          setValue('minimumQuantity', data.minimum_quantity || '');
          setValue('Notes', data.notes || '');
          
          if (data.image) {
            setPreviewImage(`http://localhost:8004${data.image}`);
          }
        } catch (err) {
          console.log(err);
        }
      }
    };

    initialize();
  }, [id, setValue]);

  const fetchContexts = async () => {
    try {
      const response = await fetch("http://localhost:8002/contexts/names/");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch contexts. Status: ${response.status}`);
      }

      setSuppliers(data.suppliers);
      setManufacturers(data.manufacturers);
      console.log("Contexts:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8004/accessories/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch categories. Status: ${response.status}`);
      }

      setCategories(data)
      console.log("Categories:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // store the actual file
      setValue('image', file); // optional: sync with react-hook-form
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // this is only for display
      };
      reader.readAsDataURL(file);
    }
  };

  



  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [isPurchaseCostValid, setPurchaseCostValid] = useState(false);
  const [isQuantityNegative, setQuantityNegative] = useState(false);
  const [isMinQuantityValid, setMinQuantityValid] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isNewCategoryAdded, setNewCategoryAdded] = useState(false);
  const [isFirstRender, setFirstRender] = useState(true);
  // const [countRequiredInput, setCountRequiredInput] = useState(0);

  console.log("new category: ", isNewCategoryAdded);


  const [categoryOptions, setCategoryOptions] = useState([
    { value: "cable", label: "Cable" },
    { value: "charger", label: "Charger" },
    { value: "keyboard", label: "Keyboard" },
  ]);

  useEffect(() => {
    if (isFirstRender) {
      setFirstRender(false);
      return;
    }

    if (!isNewCategoryAdded) {
      setNewCategoryAdded(true);
      setTimeout(() => {
        setNewCategoryAdded(false);
      }, 5000);
    }
  }, [categoryOptions]);

  const manufacturerOptions = [
    { value: "apple", label: "Apple" },
    { value: "lenovo", label: "Lenovo" },
    { value: "asus", label: "Asus" },
  ];

  const supplierOptions = [
    { value: "amazon", label: "Amazon" },
    { value: "wsi", label: "WSI" },
    { value: "iontech inc.", label: "Iontech Inc." },
  ];

  const locationOptions = [
    { value: "makati", label: "Makati" },
    { value: "pasig", label: "Pasig" },
    { value: "marikina", label: "Marikina" },
  ];

  const customStylesDropdown = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderRadius: "10px",
      fontSize: "0.875rem",
      padding: "3px 8px",
    }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "grey",
      fontSize: "0.875rem",
    }),
  };

  // Validations
  const handlePurchaseCostInput = (event) => {
    const value = event.target.value;

    // Check if input value contains a decimal point
    if (value.includes(".")) {
      // Split the value into integer and decimal parts
      const [integerPart, decimalPart] = value.split(".");

      // Restrict the decimal part to 2 digits
      if (decimalPart.length > 2) {
        // Update the value to only allow 2 decimal places
        event.target.value = `${integerPart}.${decimalPart.slice(0, 2)}`;
      }
    }

    setPurchaseCostValid(value < 0);
  };

  const handleQuantityInput = (event) => {
    const value = event.target.value;
    setQuantityNegative(value < 0);

    if (value > 9999) {
      event.target.value = value.slice(0, 4);
    }
  };

  const handleMinQuantityInput = (event) => {
    const value = event.target.value;
    setMinQuantityValid(value < 0 || value.includes("."));

    if (value > 9999) {
      event.target.value = value.slice(0, 4);
    }
  };

  return (
    <>
      {isModalOpen && (
        <NewAccessoryModal
          save={(name) => {
            setCategoryOptions((prev) => [
              ...prev,
              { value: name.toLowerCase(), label: name },
            ]);
            setModalOpen(false);
          }}
          closeModal={() => setModalOpen(false)}
        />
      )}

      {isNewCategoryAdded && (
        <Alert message="New category added!" type="success" />
      )}

      <nav>
        <NavBar />
      </nav>
      <main
        className={`accessories-registration ${
          isModalOpen ? "hide-scroll" : ""
        }`}
      >
        <section className="top">
          <TopSecFormPage
            root="Accessories"
            currentPage="New Accessory"
            rootNavigatePage="/accessories"
            title="New Accessory"
          />
        </section>
        <section className="registration-form">
          <form action="" method="post">
            <fieldset>
              <label htmlFor="accessory-name">Accessory Name *</label>
              <input
                type="text"
                placeholder="Accessory Name"
                maxLength="100"
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="category">Category *</label>
              <div className="dropdown-container">
                <Select
                  options={categoryOptions}
                  styles={customStylesDropdown}
                  placeholder="Select category..."
                  required
                />
                <MediumButtons
                  type="new"
                  deleteModalOpen={() => setModalOpen(true)}
                />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="manufacturer">Manufacturer *</label>
              <Select
                options={manufacturerOptions}
                styles={customStylesDropdown}
                placeholder="Select manufacturer..."
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <Select
                options={supplierOptions}
                styles={customStylesDropdown}
                placeholder="Select supplier..."
              />
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location *</label>
              <Select
                options={locationOptions}
                styles={customStylesDropdown}
                placeholder="Select location..."
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="model-number">Model Number</label>
              <input
                type="text"
                name="model-number"
                id="model-number"
                placeholder="Model Number"
                maxLength="50"
              />
            </fieldset>
            <fieldset>
              <label htmlFor="order-number">Order Number</label>
              <input
                type="text"
                name="order-number"
                id="order-number"
                placeholder="Order Number"
                maxLength="30"
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-date">Purchase Date *</label>
              <input
                type="date"
                name="purchase-date"
                id="purchase-date"
                max={currentDate}
                defaultValue={currentDate}
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-cost">Purchase Cost *</label>

              {isPurchaseCostValid && <span>Must not a negative value.</span>}

              <div className="purchase-cost-container">
                <p>PHP</p>
                <input
                  type="number"
                  name="purchase-cost"
                  id="purchase-cost"
                  step="0.01"
                  min="0"
                  required
                  onChange={handlePurchaseCostInput}
                />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="quantity">Quantity *</label>

              {isQuantityNegative && <span>Must not be a negative value.</span>}

              <input
                type="number"
                name="quantity"
                id="quantity"
                min="1"
                max="9999"
                defaultValue="1"
                required
                onChange={handleQuantityInput}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="minimum-quantity">Min Quantity *</label>

              {isMinQuantityValid && (
                <span>Must not be a negative value or has decimal.</span>
              )}

              <input
                type="number"
                name="min-quantity"
                id="min-quantity"
                min="0"
                max="9999"
                defaultValue="0"
                required
                onChange={handleMinQuantityInput}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                id="notes"
                maxLength="500"
                rows="3"
              ></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="upload-image">Image</label>
              <div>
                {previewImage && (
                  <div className="image-selected">
                    <img src={previewImage} alt="" />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        document.getElementById("image").value = "";
                      }}
                    >
                      <img src={CloseIcon} alt="" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageSelection}
                  style={{ display: "none" }}
                />
              </div>
              <label htmlFor="image" className="upload-image-btn">
                {!previewImage ? "Choose Image" : "Change Image"}
              </label>
            </fieldset>
          </form>
          {/* Place this button inside the form when working on the backend. */}
          <button
            type="submit"
            className="save-btn"
            onClick={() =>
              navigate("/accessories", { state: { newAccessoryAdded: true } })
            }
          >
            Save
          </button>
        </section>
      </main>
    </>
  );
}
