import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import SystemLoading from "../../components/Loading/SystemLoading";
import Alert from "../../components/Alert";
import "../../styles/Registration.css";
import { fetchProductNames, fetchProductById, createProduct, updateProduct } from "../../services/assets-service";
import { fetchAllDropdowns, createCategory, createManufacturer, createDepreciation, createSupplier } from "../../services/contexts-service";

export default function ProductsRegistration() {
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [product, setProduct] = useState(null);
  const [isClone, setIsClone] = useState(false);

  // Modal states for adding new entries
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentDate = new Date().toISOString().split("T")[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = id && !isClone;

  const { setValue, register, handleSubmit, trigger, formState: { errors, isValid } } = useForm({
    mode: "all",
    defaultValues: {
      productName: '',
      category: '',
      manufacturer: '',
      depreciation: '',
      modelNumber: '',
      endOfLife: '',
      defaultPurchaseCost: '',
      defaultSupplier: '',
      minimumQuantity: '',
      cpu: '',
      gpu: '',
      ram: '',
      screenSize: '',
      storageSize: '',
      operatingSystem: '',
      notes: '',
    }
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Determine mode: clone mode passed from AssetViewPage
  const cloneMode = location.state?.isClone === true;

  const generateCloneName = async (baseName) => {
    // 1. Fetch all existing product names that contain the base name
    const existing = await fetchProductNames({ search: baseName });
    const existingNames = existing.map(a => a.name);

    // 2. Pattern matches: "BaseName (clone)" or "BaseName (clone) (N)" - case insensitive
    const clonePattern = new RegExp(`^${escapeRegExp(baseName)} \\(clone\\)(?: \\((\\d+)\\))?$`, 'i');

    // 3. Find the highest existing clone index
    let maxIndex = -1; // -1 means no clones exist yet
    existingNames.forEach(name => {
      const match = name.match(clonePattern);
      if (match) {
        // If no number group, it's the first clone (index 0)
        // If number group exists, that's the index
        const index = match[1] ? parseInt(match[1], 10) : 0;
        if (index > maxIndex) maxIndex = index;
      }
    });

    // 4. Generate clone name
    if (maxIndex === -1) {
      // No clones exist, return first clone name
      return `${baseName} (clone)`;
    }
    // Clones exist, return next number
    return `${baseName} (clone) (${maxIndex + 1})`;
  };

  // Utility to escape regex special chars in base name
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setIsClone(cloneMode);

        // Fetch dropdown options for assets (filter statuses by asset category)
        const contextDropdowns = await fetchAllDropdowns("product");
        setCategories(contextDropdowns.categories || []);
        setManufacturers(contextDropdowns.manufacturers || []);
        setDepreciations(contextDropdowns.depreciations || []);
        setSuppliers(contextDropdowns.suppliers || []);

        // If editing or cloning, fetch the asset data
        if (id) {
          const productData = await fetchProductById(id);
          console.log("Fetched product:", productData);
          if (productData) {
            setProduct(productData);
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
  }, [id, cloneMode]);

  // Separate useEffect to populate form AFTER dropdowns and product are loaded
  useEffect(() => {
    const populateForm = async () => {
      // Wait for next tick to ensure dropdowns are rendered
      await new Promise(resolve => setTimeout(resolve, 0));

      // If we have product data (editing or cloning), populate the form
      if (product) {
        if (isClone) {
          const clonedName = await generateCloneName(product.name);
          setValue("productName", clonedName);
        } else {
          setValue("productName", product.name || "");
        }
        // Prefer explicit *_details ids from API payload, fall back to top-level id fields when present
        const categoryId = product.category ?? product.category_details?.id
        const manufacturerId = product.manufacturer ?? product.manufacturer_details?.id;
        const depreciationId = product.depreciation ?? product.depreciation_details?.id;
        const defaultSupplierId = product.defaultSupplier ?? product.default_supplier_details?.id;
        setValue("category", categoryId ? String(categoryId) : "");
        setValue("manufacturer", manufacturerId ? String(manufacturerId) : "");
        setValue("depreciation", depreciationId ? String(depreciationId) : "");
        setValue("defaultSupplier", defaultSupplierId ? String(defaultSupplierId) : "");
        setValue("modelNumber", product.model_number || "");
        setValue("endOfLife", product.end_of_life || "");
        setValue("defaultPurchaseCost", product.default_purchase_cost ?? "");
        setValue("minimumQuantity", product.minimum_quantity ?? "");
        setValue("cpu", product.cpu || "");
        setValue("gpu", product.gpu || "");
        setValue("ram", product.ram || "");
        setValue("screenSize", product.size || "");
        setValue("storageSize", product.storage || "");
        setValue("operatingSystem", product.os || "");
        setValue("notes", product.notes || "");

        if (product.image) {
          setPreviewImage(product.image);

          // For cloning, fetch the image as a file so it can be uploaded with the new asset
          if (isClone) {
            try {
              const response = await fetch(product.image);
              const blob = await response.blob();
              const fileName = product.image.split('/').pop() || 'cloned-image.jpg';
              const file = new File([blob], fileName, { type: blob.type });
              setSelectedImage(file);
            } catch (imgError) {
              console.error("Failed to fetch image for cloning:", imgError);
            }
          }
        }
      }
      
      // Trigger validation after all form values are set
      await trigger();
    };
    populateForm();
  }, [product, isClone, categories, manufacturers, depreciations, suppliers, setValue, trigger, id]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setErrorMessage("Please select a valid .xlsx file");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      console.log("Import file selected:", file.name);
    }
  };

  // Modal field configurations
  const categoryFields = [
    {
      name: 'name',
      label: 'Category Name',
      type: 'text',
      placeholder: 'Category Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Category Name is required' }
    }
  ];

  const manufacturerFields = [
    {
      name: 'name',
      label: 'Manufacturer Name',
      type: 'text',
      placeholder: 'Manufacturer Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Manufacturer Name is required' }
    }
  ];

  const depreciationFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Depreciation Method Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Name is required' }
    },
    {
      name: 'duration',
      label: 'Duration',
      type: 'number',
      placeholder: '0',
      required: true,
      validation: {
        required: 'Duration is required',
        min: { value: 1, message: 'Duration must be at least 1' }
      },
      suffix: 'months'
    },
    {
      name: 'minimum_value',
      label: 'Minimum Value',
      type: 'number',
      placeholder: '0.00',
      required: true,
      validation: {
        required: 'Minimum Value is required',
        min: { value: 0, message: 'Minimum Value must be at least 0' }
      },
      prefix: 'PHP',
      step: '0.01'
    }
  ];

  const supplierFields = [
    {
      name: "name",
      label: "Supplier Name",
      type: "text",
      placeholder: "Supplier Name",
      required: true,
      maxLength: 100,
      validation: { required: "Supplier Name is required" },
    },
  ];

  // Handle save for each modal
  const handleSaveCategory = async (data) => {
    try {
      const categoryData = {
        name: data.name,
        type: 'asset'
      };
      const newCategory = await createCategory(categoryData);
      setCategories([...categories, newCategory]);
      setShowCategoryModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating category:", error);
      setErrorMessage("Failed to create category");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveManufacturer = async (data) => {
    try {
      const newManufacturer = await createManufacturer(data);
      setManufacturers([...manufacturers, newManufacturer]);
      setShowManufacturerModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating manufacturer:", error);
      setErrorMessage("Failed to create manufacturer");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveDepreciation = async (data) => {
    try {
      const newDepreciation = await createDepreciation(data);
      setDepreciations([...depreciations, newDepreciation]);
      setShowDepreciationModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating depreciation:", error);
      setErrorMessage("Failed to create depreciation method");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveSupplier = async (data) => {
    try {
      const newSupplier = await createSupplier(data);
      setSuppliers([...suppliers, newSupplier]);
      setShowSupplierModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating supplier:", error);
      setErrorMessage("Failed to create supplier");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const onSubmit = async (data) => {
    setErrorMessage("");

    const isUpdate = id && !isClone;

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (data.productName) formData.append('name', data.productName);
      if (data.category) formData.append('category', data.category);
      if (data.manufacturer) formData.append('manufacturer', data.manufacturer);
      if (data.depreciation) formData.append('depreciation', data.depreciation);
      if (data.modelNumber) formData.append('model_number', data.modelNumber);
      if (data.endOfLife) formData.append('end_of_life', data.endOfLife);
      if (data.defaultPurchaseCost != null) formData.append('default_purchase_cost', data.defaultPurchaseCost);
      if (data.defaultSupplier) formData.append('default_supplier', data.defaultSupplier);
      if (data.minimumQuantity != null) formData.append('minimum_quantity', data.minimumQuantity);
      if (data.cpu) formData.append('cpu', data.cpu);
      if (data.gpu) formData.append('gpu', data.gpu);
      if (data.ram) formData.append('ram', data.ram);
      if (data.screenSize) formData.append('size', data.screenSize);
      if (data.storageSize) formData.append('storage', data.storageSize);
      if (data.operatingSystem) formData.append('os', data.operatingSystem);
      formData.append('notes', data.notes || '');

      // Handle image
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (removeImage && isUpdate) {
        formData.append('remove_image', 'true');
      }

      let result;
      if (isUpdate) {
        result = await updateProduct(id, formData);
        // Update frontend state to reflect backend removal
        setProduct(prev => ({
          ...prev,
          ...result, // merge any updated fields
          image: removeImage ? null : result.image || prev.image
        }));

        if (removeImage) {
          setPreviewImage(null);
          setSelectedImage(null);
        }
      } else {
        result = await createProduct(formData);
      }

      if (!result) throw new Error(`Failed to ${isUpdate ? "update" : "create"} product`);

      const action = isClone ? "cloned" : isUpdate ? "updated" : "created";
      setIsSubmitting(false);
      navigate("/products", { state: { successMessage: `Product ${action} successfully!` } });
    } catch (error) {
      console.error("Error submitting product:", error);
      let message = "An error occurred while saving the product";

      if (error.response?.data) {
        const firstKey = Object.keys(error.response.data)[0];
        if (Array.isArray(error.response.data[firstKey])) {
          message = error.response.data[firstKey][0];
        }
      }

      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
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
            root="Products"
            currentPage={isClone ? "Clone Product" : (id ? "Edit Product" : "New Product")}
            rootNavigatePage="/products"
            title={isClone 
              ? `Clone ${product?.name}`
              : id
                ? `Edit ${product?.name}`
                : 'New Product'
            }
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
            {/* Asset Model Name */}
            <fieldset>
              <label htmlFor='product-name'>Asset Model Name <span style={{color: 'red'}}>*</span></label>
              <input
                type='text'
                className={errors.productName ? 'input-error' : ''}
                {...register('productName', { required: 'Asset Model Name is required' })}
                maxLength='100'
                placeholder='Asset Model Name'
              />
              {errors.productName && <span className='error-message'>{errors.productName.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='category'>Category <span style={{color: 'red'}}>*</span></label>
              <div className="select-with-button">
                <select
                  id="category"
                  {...register("category", { required: "Category is required" })}
                  className={errors.category ? 'input-error' : ''}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowCategoryModal(true)}
                  title="Add new category"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.category && <span className='error-message'>{errors.category.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer <span style={{color: 'red'}}>*</span></label>
              <div className="select-with-button">
                <select
                  id="manufacturer"
                  {...register("manufacturer", { required: "Manufacturer is required" })}
                  className={errors.manufacturer ? 'input-error' : ''}
                >
                  <option value="">Select Manufacturer</option>
                  {manufacturers.map(manufacturer => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowManufacturerModal(true)}
                  title="Add new manufacturer"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.manufacturer && <span className='error-message'>{errors.manufacturer.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='depreciation'>Depreciation <span style={{color: 'red'}}>*</span></label>
              <div className="select-with-button">
                <select
                  id="depreciation"
                  {...register("depreciation", { required: "Depreciation is required" })}
                  className={errors.depreciation ? 'input-error' : ''}
                >
                  <option value="">Select Depreciation Method</option>
                  {depreciations.map(depreciation => (
                    <option key={depreciation.id} value={depreciation.id}>
                      {depreciation.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowDepreciationModal(true)}
                  title="Add new depreciation method"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.depreciation && <span className='error-message'>{errors.depreciation.message}</span>}
            </fieldset>

            {/* Model Number */}
            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input
                type='text'
                {...register('modelNumber')}
                maxLength='100'
                placeholder='Model Number'
              />
            </fieldset>

            {/* End of Life */}
            <fieldset>
              <label htmlFor='end-of-life'>End of Life</label>
              <input
                type='date'
                id='end-of-life'
                {...register('endOfLife')}
              />
            </fieldset>

            {/* Default Purchase Cost */}
            <fieldset className="cost-field">
              <label htmlFor="defaultPurchaseCost">Default Purchase Cost</label>
              <div className="cost-input-group">
                <span className="cost-addon">PHP</span>
                <input
                  type="number"
                  id="defaultPurchaseCost"
                  name="defaultPurchaseCost"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...register("defaultPurchaseCost", { valueAsNumber: true })}
                />
              </div>
            </fieldset>

            {/* Supplier (optional) */}
            <fieldset>
              <label htmlFor="defaultSupplier">Default Supplier</label>
              <div className="select-with-button">
                <select {...register("defaultSupplier")}>
                  <option value="">Select Default Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-entry-btn"
                  onClick={() => setShowSupplierModal(true)}
                  title="Add new supplier"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity</label>
              <input
                type='number'
                className={errors.minimumQuantity ? 'input-error' : ''}
                {...register('minimumQuantity', {
                  valueAsNumber: true,
                  validate: (value) => (
                    value === undefined ||
                    value === null ||
                    Number.isNaN(value) ||
                    value >= 0 ||
                    'Minimum Quantity must be at least 0'
                  ),
                })}
                placeholder='Minimum Quantity'
                min="0"
              />
              {errors.minimumQuantity && <span className='error-message'>{errors.minimumQuantity.message}</span>}
            </fieldset>

            {/* CPU */}
            <fieldset>
              <label htmlFor='cpu'>CPU</label>
              <select
                id="cpu"
                {...register("cpu")}
              >
                <option value="">Select CPU</option>
                <option value="intel-i3">Intel Core i3</option>
                <option value="intel-i5">Intel Core i5</option>
                <option value="intel-i7">Intel Core i7</option>
                <option value="intel-i9">Intel Core i9</option>
                <option value="amd-ryzen-5">AMD Ryzen 5</option>
                <option value="amd-ryzen-7">AMD Ryzen 7</option>
                <option value="amd-ryzen-9">AMD Ryzen 9</option>
                <option value="apple-m1">Apple M1</option>
                <option value="apple-m2">Apple M2</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            {/* GPU */}
            <fieldset>
              <label htmlFor='gpu'>GPU</label>
              <select
                id="gpu"
                {...register("gpu")}
              >
                <option value="">Select GPU</option>
                <option value="nvidia-gtx-1050">NVIDIA GTX 1050</option>
                <option value="nvidia-gtx-1650">NVIDIA GTX 1650</option>
                <option value="nvidia-rtx-2060">NVIDIA RTX 2060</option>
                <option value="nvidia-rtx-3060">NVIDIA RTX 3060</option>
                <option value="amd-radeon-rx-5500">AMD Radeon RX 5500</option>
                <option value="amd-radeon-rx-6600">AMD Radeon RX 6600</option>
                <option value="integrated">Integrated Graphics</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            {/* RAM */}
            <fieldset>
              <label htmlFor='ram'>RAM</label>
              <select
                id="ram"
                {...register("ram")}
              >
                <option value="">Select RAM</option>
                <option value="4gb">4 GB</option>
                <option value="8gb">8 GB</option>
                <option value="16gb">16 GB</option>
                <option value="32gb">32 GB</option>
                <option value="64gb">64 GB</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            {/* Screen Size */}
            <fieldset>
              <label htmlFor='screenSize'>Screen Size</label>
              <select
                id="screenSize"
                {...register("screenSize")}
              >
                <option value="">Select Screen Size</option>
                <option value="13-inch">13 inches</option>
                <option value="14-inch">14 inches</option>
                <option value="15-inch">15 inches</option>
                <option value="17-inch">17 inches</option>
                <option value="21-inch">21 inches</option>
                <option value="24-inch">24 inches</option>
                <option value="27-inch">27 inches</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            {/* Storage Size */}
            <fieldset>
              <label htmlFor='storageSize'>Storage Size</label>
              <select
                id="storageSize"
                {...register("storageSize")}
              >
                <option value="">Select Storage Size</option>
                <option value="128gb">128 GB</option>
                <option value="256gb">256 GB</option>
                <option value="512gb">512 GB</option>
                <option value="1tb">1 TB</option>
                <option value="2tb">2 TB</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor='operatingSystem'>Operating System</label>
              <select
                id="operatingSystem"
                {...register("operatingSystem")}
              >
                <option value="">Select Operating System</option>
                <option value="linux">Linux</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="ubuntu">Ubuntu</option>
                <option value="centos">CentOS</option>
                <option value="debian">Debian</option>
                <option value="fedora">Fedora</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea
                {...register('notes')}
                maxLength='500'
                placeholder='Notes...'
              />
            </fieldset>

            {/* Image Upload */}
            <fieldset>
              <label>Image</label>
              {previewImage ? (
                <div className="image-selected">
                  <img src={previewImage} alt="Selected image" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setPreviewImage(null);
                      setSelectedImage(null);
                      setRemoveImage(true);
                      console.log("Remove image flag set to:", true);
                    }}
                  >
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose Image
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelection}
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
            </fieldset>

            <button type="submit" className="primary-button" disabled={!isValid || isSubmitting}>
              {isEdit ? "Update Asset Model" : "Save"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
      </section>

      {/* Modals */}
      {/* Add Category Modal */}
      <AddEntryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
        title="New Category"
        fields={categoryFields}
        type="category"
      />

      {/* Add Manufacturer Modal */}
      <AddEntryModal
        isOpen={showManufacturerModal}
        onClose={() => setShowManufacturerModal(false)}
        onSave={handleSaveManufacturer}
        title="New Manufacturer"
        fields={manufacturerFields}
        type="manufacturer"
      />

      {/* Add Depreciation Modal */}
      <AddEntryModal
        isOpen={showDepreciationModal}
        onClose={() => setShowDepreciationModal(false)}
        onSave={handleSaveDepreciation}
        title="New Depreciation"
        fields={depreciationFields}
        type="depreciation"
      />

      {/* Add Supplier Modal */}
      <AddEntryModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        title="New Supplier"
        fields={supplierFields}
        type="supplier"
      />
    </>
  );
}