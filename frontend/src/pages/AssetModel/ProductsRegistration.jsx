import NavBar from '../../components/NavBar';
import Footer from "../../components/Footer";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import CloseIcon from '../../assets/icons/close.svg';
import PlusIcon from '../../assets/icons/plus.svg';
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import { fetchAllCategories } from "../../services/contexts-service";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import ProductsMockData from "../../data/mockData/products/products-mockup-data.json";
import DepreciationMockData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import ManufacturerMockData from "../../data/mockData/more/manufacturer-mockup-data.json";
import SupplierMockData from "../../data/mockData/more/supplier-mockup-data.json";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import '../../styles/Registration.css';

export default function ProductsRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [product, setProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showDepreciationModal, setShowDepreciationModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const { id } = useParams();
  const location = useLocation();
  const { setValue, register, handleSubmit, watch, control, formState: { errors, isValid } } = useForm({
    mode: "all",
    defaultValues: {
      productName: '',
      category: null,
      manufacturer: null,
      depreciation: null,
      modelNumber: '',
      endOfLifeDate: '',
      defaultPurchaseCost: '',
      supplier: null,
      minimumQuantity: '',
      cpu: null,
      gpu: null,
      operatingSystem: null,
      ram: null,
      screenSize: null,
      storageSize: null,
      archiveModel: false,
      notes: ''
    }
  });

  const currentDate = new Date().toISOString().split('T')[0];
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Get custom select styles from utility
  const customSelectStyles = getCustomSelectStyles();
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Try to fetch live contexts first
        let productContextsData = { categories: [], depreciations: [] };
        let contextsData = { suppliers: [], manufacturers: [] };

        try {
          const [productContexts, contextResponse] = await Promise.all([
            assetsService.fetchProductContexts(),
            fetchAllCategories(),
          ]);

          if (productContexts) {
            productContextsData = productContexts;
          }

          if (contextResponse) {
            contextsData = contextResponse;
          }
        } catch (fetchError) {
          console.warn(
            "Failed to fetch product/contexts data, falling back to mock data:",
            fetchError
          );
        }

        const apiCategories = productContextsData.categories || [];
        const apiDepreciations = productContextsData.depreciations || [];
        const apiSuppliers = contextsData.suppliers || [];
        const apiManufacturers = contextsData.manufacturers || [];
        const mockCategoryNames = Array.from(
          new Set(
            (ProductsMockData || [])
              .map((item) => item.category)
              .filter(Boolean)
          )
        );
        const mockCategories = mockCategoryNames.map((name, index) => ({
          id: index + 1,
          name,
        }));

        setCategories(apiCategories.length ? apiCategories : mockCategories);
        setDepreciations(
          apiDepreciations.length ? apiDepreciations : DepreciationMockData
        );
        setSuppliers(apiSuppliers.length ? apiSuppliers : SupplierMockData);
        setManufacturers(
          apiManufacturers.length ? apiManufacturers : ManufacturerMockData
        );

        console.log(
          "Categories:",
          apiCategories.length ? apiCategories : mockCategories
        );
        console.log(
          "Depreciations:",
          apiDepreciations.length ? apiDepreciations : DepreciationMockData
        );
        console.log(
          "Suppliers:",
          apiSuppliers.length ? apiSuppliers : SupplierMockData
        );
        console.log(
          "Manufacturers:",
          apiManufacturers.length ? apiManufacturers : ManufacturerMockData
        );

        // If ID is present, fetch the product details
        if (id) {
          const productData = await assetsService.fetchProductById(id);
          if (!productData) {
            setErrorMessage("Failed to fetch product details");
            setIsLoading(false);
            return;
          }

          setProduct(productData);
          console.log("Product Details:", productData);

          // Set form values from retrieved product data
          setValue("productName", productData.name);

          setValue("category", productData.category_id ?? null);
          setValue("depreciation", productData.depreciation_id ?? null);
          setValue("manufacturer", productData.manufacturer_id ?? null);
          setValue("modelNumber", productData.model_number || "");
          setValue("endOfLifeDate", productData.end_of_life || "");
          setValue(
            "defaultPurchaseCost",
            productData.default_purchase_cost || ""
          );
          setValue("supplier", productData.default_supplier_id ?? null);
          setValue("minimumQuantity", productData.minimum_quantity || "");
          setValue("operatingSystem", productData.operating_system || "");
          setValue("notes", productData.notes || "");

          if (productData.image) {
            setPreviewImage(
              `https://assets-service-production.up.railway.app${productData.image}`
            );
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
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file);
      setValue('image', file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedImage(null);
    setValue('image', null);
    const imgInput = document.getElementById('image');
    if (imgInput) imgInput.value = '';
    setRemoveImage(true);
  };

  const handleImageClick = () => {
    if (previewImage) setSelectedImageForModal(previewImage);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setErrorMessage("Please select a valid .xlsx file");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      setImportFile(file);
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

  // Handle save for each modal
  const handleSaveCategory = async (data) => {
    try {
      const newCategory = await assetsService.createCategory(data);
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
      const newManufacturer = await assetsService.createManufacturer(data);
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
      const newDepreciation = await assetsService.createDepreciation(data);
      setDepreciations([...depreciations, newDepreciation]);
      setShowDepreciationModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating depreciation:", error);
      setErrorMessage("Failed to create depreciation method");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Only check for duplicate names when creating a new product (not when updating)
      if (!id) {
        // Fetch all existing product names
        const existingProducts = await assetsService.fetchProductNames();

        // Check if a product with the same name already exists
        const isDuplicate = existingProducts.products.some(
          product => product.name.toLowerCase() === data.productName.toLowerCase()
        );

        if (isDuplicate) {
          setErrorMessage("A product with this name already exists. Please use a different name.");
          setTimeout(() => {
            setErrorMessage("");
          }, 5000);
          return; // Stop the submission process
        }
      }

      const formData = new FormData();

      // Append all form data to FormData object
      formData.append('name', data.productName);
      formData.append('category', data.category || '');
      formData.append('manufacturer_id', data.manufacturer || '');
      formData.append('depreciation', data.depreciation || '');
      formData.append('model_number', data.modelNumber || '');
      formData.append('end_of_life', data.endOfLifeDate || '');
      formData.append('default_purchase_cost', data.defaultPurchaseCost || '');
      formData.append('default_supplier_id', data.supplier || '');
      formData.append(
        'minimum_quantity',
        data.minimumQuantity === undefined || data.minimumQuantity === null || Number.isNaN(data.minimumQuantity)
          ? ''
          : data.minimumQuantity,
      );
      formData.append('cpu', data.cpu || '');
      formData.append('gpu', data.gpu || '');
      formData.append('operating_system', data.operatingSystem || '');
      formData.append('ram', data.ram || '');
      formData.append('screen_size', data.screenSize || '');
      formData.append('storage_size', data.storageSize || '');
      formData.append('archive_model', data.archiveModel || false);
      formData.append('notes', data.notes || '');

      // Handle image upload
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Handle image removal
      if (removeImage) {
        formData.append('remove_image', 'true');
        console.log("Removing image: remove_image flag set to true");
      }

      console.log("Form data before submission:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let result;

      if (id) {
        // Update existing product
        result = await assetsService.updateProduct(id, formData);
      } else {
        // Create new product
        result = await assetsService.createProduct(formData);
      }

      if (!result) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} product.`);
      }

      console.log(`${id ? 'Updated' : 'Created'} product:`, result);
      navigate('/products', {
        state: {
          successMessage: `Product has been ${id ? 'updated' : 'created'} successfully!`
        }
      });
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'creating'} product:`, error);
      setErrorMessage(error.message || `An error occurred while ${id ? 'updating' : 'creating'} the product`);
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
            root="Asset Models"
            currentPage={id ? "Update Asset Model" : "New Asset Model"}
            rootNavigatePage="/products"
            title={id ? (product?.name || location.state?.product?.name || 'Asset Model') : 'New Asset Model'}
            rightComponent={
              !id && (
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
              )
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
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="category"
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      value={categories.map(c => ({ value: c.id, label: c.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Category"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.category ? 'react-select-error' : ''}
                    />
                  )}
                />
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
                <Controller
                  name="manufacturer"
                  control={control}
                  rules={{ required: 'Manufacturer is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="manufacturer"
                      options={manufacturers.map(m => ({ value: m.id, label: m.name }))}
                      value={manufacturers.map(m => ({ value: m.id, label: m.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Manufacturer"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.manufacturer ? 'react-select-error' : ''}
                    />
                  )}
                />
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
                <Controller
                  name="depreciation"
                  control={control}
                  rules={{ required: 'Depreciation is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="depreciation"
                      options={depreciations.map(d => ({ value: d.id, label: d.name }))}
                      value={depreciations.map(d => ({ value: d.id, label: d.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Depreciation Method"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.depreciation ? 'react-select-error' : ''}
                    />
                  )}
                />
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

            <fieldset>
              <label htmlFor='supplier'>Default Supplier</label>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="supplier"
                    options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                    value={suppliers.map(s => ({ value: s.id, label: s.name })).find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Supplier"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                    className={errors.supplier ? 'react-select-error' : ''}
                  />
                )}
              />
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
              <label htmlFor='end-of-life-date'>End of Life</label>
              <div className={`cost-input-group ${errors.endOfLifeDate ? 'input-error' : ''}`}>
                <input
                  type='number'
                  id='end-of-life-date'
                  placeholder='Enter end of life duration'
                  min='1'
                  step='1'
                  {...register('endOfLifeDate', {
                    valueAsNumber: true,
                    validate: (value) => (
                      value === undefined ||
                      value === null ||
                      Number.isNaN(value) ||
                      (Number.isInteger(value) && value > 0) ||
                      'Must be a positive integer'
                    ),
                  })}
                />
                <span className="duration-addon">Months</span>
              </div>
              {errors.endOfLifeDate && (
                <span className='error-message'>{errors.endOfLifeDate.message}</span>
              )}
            </fieldset>

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
              <Controller
                name="cpu"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="cpu"
                    options={[
                      { value: '', label: 'Select CPU' },
                      { value: 'intel-i3', label: 'Intel Core i3' },
                      { value: 'intel-i5', label: 'Intel Core i5' },
                      { value: 'intel-i7', label: 'Intel Core i7' },
                      { value: 'intel-i9', label: 'Intel Core i9' },
                      { value: 'amd-ryzen-5', label: 'AMD Ryzen 5' },
                      { value: 'amd-ryzen-7', label: 'AMD Ryzen 7' },
                      { value: 'amd-ryzen-9', label: 'AMD Ryzen 9' },
                      { value: 'apple-m1', label: 'Apple M1' },
                      { value: 'apple-m2', label: 'Apple M2' },
                      { value: 'other', label: 'Other' },
                    ].map(o => ({ value: o.value, label: o.label }))}
                    value={[
                      { value: '', label: 'Select CPU' },
                      { value: 'intel-i3', label: 'Intel Core i3' },
                      { value: 'intel-i5', label: 'Intel Core i5' },
                      { value: 'intel-i7', label: 'Intel Core i7' },
                      { value: 'intel-i9', label: 'Intel Core i9' },
                      { value: 'amd-ryzen-5', label: 'AMD Ryzen 5' },
                      { value: 'amd-ryzen-7', label: 'AMD Ryzen 7' },
                      { value: 'amd-ryzen-9', label: 'AMD Ryzen 9' },
                      { value: 'apple-m1', label: 'Apple M1' },
                      { value: 'apple-m2', label: 'Apple M2' },
                      { value: 'other', label: 'Other' },
                    ].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select CPU"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* GPU */}
            <fieldset>
              <label htmlFor='gpu'>GPU</label>
              <Controller
                name="gpu"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="gpu"
                    options={[
                      { value: '', label: 'Select GPU' },
                      { value: 'nvidia-gtx-1050', label: 'NVIDIA GTX 1050' },
                      { value: 'nvidia-gtx-1650', label: 'NVIDIA GTX 1650' },
                      { value: 'nvidia-rtx-2060', label: 'NVIDIA RTX 2060' },
                      { value: 'nvidia-rtx-3060', label: 'NVIDIA RTX 3060' },
                      { value: 'amd-radeon-rx-5500', label: 'AMD Radeon RX 5500' },
                      { value: 'amd-radeon-rx-6600', label: 'AMD Radeon RX 6600' },
                      { value: 'integrated', label: 'Integrated Graphics' },
                      { value: 'other', label: 'Other' },
                    ].map(o => ({ value: o.value, label: o.label }))}
                    value={[
                      { value: '', label: 'Select GPU' },
                      { value: 'nvidia-gtx-1050', label: 'NVIDIA GTX 1050' },
                      { value: 'nvidia-gtx-1650', label: 'NVIDIA GTX 1650' },
                      { value: 'nvidia-rtx-2060', label: 'NVIDIA RTX 2060' },
                      { value: 'nvidia-rtx-3060', label: 'NVIDIA RTX 3060' },
                      { value: 'amd-radeon-rx-5500', label: 'AMD Radeon RX 5500' },
                      { value: 'amd-radeon-rx-6600', label: 'AMD Radeon RX 6600' },
                      { value: 'integrated', label: 'Integrated Graphics' },
                      { value: 'other', label: 'Other' },
                    ].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select GPU"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* Operating System */}
            <fieldset>
              <label htmlFor='operatingSystem'>Operating System</label>
              <Controller
                name="operatingSystem"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="operatingSystem"
                    options={[
                      { value: '', label: 'Select Operating System' },
                      { value: 'Windows 10', label: 'Windows 10' },
                      { value: 'Windows 11', label: 'Windows 11' },
                      { value: 'macOS', label: 'macOS' },
                      { value: 'Linux', label: 'Linux' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[{ value: '', label: 'Select Operating System' },{ value: 'Windows 10', label: 'Windows 10' },{ value: 'Windows 11', label: 'Windows 11' },{ value: 'macOS', label: 'macOS' },{ value: 'Linux', label: 'Linux' },{ value: 'other', label: 'Other' }].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Operating System"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* RAM */}
            <fieldset>
              <label htmlFor='ram'>RAM</label>
              <Controller
                name="ram"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="ram"
                    options={[
                      { value: '', label: 'Select RAM' },
                      { value: '4gb', label: '4 GB' },
                      { value: '8gb', label: '8 GB' },
                      { value: '16gb', label: '16 GB' },
                      { value: '32gb', label: '32 GB' },
                      { value: '64gb', label: '64 GB' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[{ value: '', label: 'Select RAM' },{ value: '4gb', label: '4 GB' },{ value: '8gb', label: '8 GB' },{ value: '16gb', label: '16 GB' },{ value: '32gb', label: '32 GB' },{ value: '64gb', label: '64 GB' },{ value: 'other', label: 'Other' }].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select RAM"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* Screen Size */}
            <fieldset>
              <label htmlFor='screenSize'>Screen Size</label>
              <Controller
                name="screenSize"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="screenSize"
                    options={[
                      { value: '', label: 'Select Screen Size' },
                      { value: '13-inch', label: '13 inches' },
                      { value: '14-inch', label: '14 inches' },
                      { value: '15-inch', label: '15 inches' },
                      { value: '17-inch', label: '17 inches' },
                      { value: '21-inch', label: '21 inches' },
                      { value: '24-inch', label: '24 inches' },
                      { value: '27-inch', label: '27 inches' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[{ value: '', label: 'Select Screen Size' },{ value: '13-inch', label: '13 inches' },{ value: '14-inch', label: '14 inches' },{ value: '15-inch', label: '15 inches' },{ value: '17-inch', label: '17 inches' },{ value: '21-inch', label: '21 inches' },{ value: '24-inch', label: '24 inches' },{ value: '27-inch', label: '27 inches' },{ value: 'other', label: 'Other' }].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Screen Size"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* Storage Size */}
            <fieldset>
              <label htmlFor='storageSize'>Storage Size</label>
              <Controller
                name="storageSize"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="storageSize"
                    options={[
                      { value: '', label: 'Select Storage Size' },
                      { value: '128GB', label: '128 GB' },
                      { value: '256GB', label: '256 GB' },
                      { value: '512GB', label: '512 GB' },
                      { value: '1TB', label: '1 TB' },
                      { value: '2TB', label: '2 TB' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={[{ value: '', label: 'Select Storage Size' },{ value: '128GB', label: '128 GB' },{ value: '256GB', label: '256 GB' },{ value: '512GB', label: '512 GB' },{ value: '1TB', label: '1 TB' },{ value: '2TB', label: '2 TB' },{ value: 'other', label: 'Other' }].find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value || '')}
                    placeholder="Select Storage Size"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                  />
                )}
              />
            </fieldset>

            {/* Archive Model Toggle */}
            <fieldset>
              <label htmlFor='archiveModel'>Archive Model</label>
              <div className="toggle-switch">
                <input
                  type='checkbox'
                  id='archiveModel'
                  {...register('archiveModel')}
                />
                <label htmlFor='archiveModel' className="toggle-label"></label>
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea
                {...register('notes')}
                maxLength='500'
                placeholder='Notes...'
              />
            </fieldset>

            <fieldset>
              <label>Image Upload</label>
              <div className="attachments-wrapper">
                <div className="upload-left">
                  <label htmlFor="image" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageSelection}
                      style={{ display: "none" }}
                    />
                  </label>
                  <small className="file-size-info">Maximum file size must be 5MB</small>
                </div>

                <div className="upload-right">
                  {(previewImage || selectedImage) && (
                    <div className="file-uploaded">
                      <span
                        title={selectedImage?.name || 'Uploaded Image'}
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007bff' }}
                      >
                        {selectedImage?.name || 'Uploaded Image'}
                      </span>
                      <button type="button" onClick={handleRemoveImage}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            <button type='submit' className='primary-button' disabled={!isValid}>
              Save
            </button>
          </form>
        </section>

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
        {/* Image Preview Modal */}
        {selectedImageForModal && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedImageForModal(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '40px 20px 20px 20px',
                width: '600px',
                maxWidth: '80%',
                maxHeight: '70vh',
                overflow: 'auto',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedImageForModal(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#333',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
              <img
                src={selectedImageForModal}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
      </section>

    </>
  );
}
