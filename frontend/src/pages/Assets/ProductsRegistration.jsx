import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/PerformAudits.css';
import { useNavigate, useParams } from 'react-router-dom';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CloseIcon from '../../assets/icons/close.svg';
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import Select from "react-select";
import makeAnimated from "react-select/animated";


export default function ProductsRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [product, setProduct] = useState(null);

  // Animated components for react-select
  const animatedComponents = makeAnimated();

  // Custom styles for dropdowns to match Asset form
  const customStylesDropdown = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderRadius: "25px",
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

  const { id } = useParams();
  const { setValue, register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm({
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
      operatingSystem: null,
      notes: ''
    }
  });

  const currentDate = new Date().toISOString().split('T')[0];
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all necessary data in parallel
        const [productContextsData, contextsData] = await Promise.all([
          assetsService.fetchProductContexts(),
          fetchAllCategories()
        ]);
        
        // Set categories and depreciations from product contexts
        setCategories(productContextsData.categories || []);
        setDepreciations(productContextsData.depreciations || []);
        
        // Set suppliers and manufacturers from contexts
        setSuppliers(contextsData.suppliers || []);
        setManufacturers(contextsData.manufacturers || []);
        
        console.log("Categories:", productContextsData.categories);
        console.log("Depreciations:", productContextsData.depreciations);
        console.log("Suppliers:", contextsData.suppliers);
        console.log("Manufacturers:", contextsData.manufacturers);

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

          // Create options arrays for react-select dropdowns
          const currentCategoryOptions = productContextsData.categories?.map(category => ({
            value: category.id,
            label: category.name
          })) || [];

          const currentDepreciationOptions = productContextsData.depreciations?.map(depreciation => ({
            value: depreciation.id,
            label: depreciation.name
          })) || [];

          const currentManufacturerOptions = contextsData.manufacturers?.map(manufacturer => ({
            value: manufacturer.id,
            label: manufacturer.name
          })) || [];

          const currentSupplierOptions = contextsData.suppliers?.map(supplier => ({
            value: supplier.id,
            label: supplier.name
          })) || [];

          // Set form values from retrieved product data
          setValue('productName', productData.name);

          // For dropdowns, find the matching option objects
          const categoryOption = currentCategoryOptions.find(option => option.value === productData.category);
          const depreciationOption = currentDepreciationOptions.find(option => option.value === productData.depreciation);
          const manufacturerOption = currentManufacturerOptions.find(option => option.value === productData.manufacturer_id);
          const supplierOption = currentSupplierOptions.find(option => option.value === productData.default_supplier_id);

          setValue('category', categoryOption || null);
          setValue('depreciation', depreciationOption || null);
          setValue('manufacturer', manufacturerOption || null);
          setValue('modelNumber', productData.model_number || '');
          setValue('endOfLifeDate', productData.end_of_life || '');
          setValue('defaultPurchaseCost', productData.default_purchase_cost || '');
          setValue('supplier', supplierOption || null);
          setValue('minimumQuantity', productData.minimum_quantity || '');

          // Handle operating system
          const osOption = productData.operating_system ? {
            value: productData.operating_system,
            label: productData.operating_system.charAt(0).toUpperCase() + productData.operating_system.slice(1)
          } : null;
          setValue('operatingSystem', osOption);
          setValue('notes', productData.notes || '');
          
          if (productData.image) {
            setPreviewImage(`https://assets-service-production.up.railway.app${productData.image}`);
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

  // Create options arrays for react-select dropdowns
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const depreciationOptions = depreciations.map(depreciation => ({
    value: depreciation.id,
    label: depreciation.name
  }));

  const manufacturerOptions = manufacturers.map(manufacturer => ({
    value: manufacturer.id,
    label: manufacturer.name
  }));

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  }));

  const operatingSystemOptions = [
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
    { value: 'ubuntu', label: 'Ubuntu' },
    { value: 'centos', label: 'CentOS' },
    { value: 'debian', label: 'Debian' },
    { value: 'fedora', label: 'Fedora' },
    { value: 'other', label: 'Other' }
  ];

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }
      
      setSelectedImage(file); // store the actual file
      setValue('image', file); // optional: sync with react-hook-form
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // for display only
      };
      reader.readAsDataURL(file);
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
      formData.append('category', data.category?.value || '');
      formData.append('manufacturer_id', data.manufacturer?.value || '');
      formData.append('depreciation', data.depreciation?.value || '');
      formData.append('model_number', data.modelNumber || '');
      formData.append('end_of_life', data.endOfLifeDate || '');
      formData.append('default_purchase_cost', data.defaultPurchaseCost || '');
      formData.append('default_supplier_id', data.supplier?.value || '');
      formData.append('minimum_quantity', data.minimumQuantity);
      formData.append('operating_system', data.operatingSystem?.value || '');
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
      
      // Navigate to products page with success message
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
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Products"
            currentPage={id ? "Edit Product" : "New Product"}
            rootNavigatePage="/products"
            title={id ? 'Edit' + ' ' + (product?.name || 'Product') : 'New Product'}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Product Name */}
            <fieldset>
              <label htmlFor='product-name'>Product Name <span style={{color: 'red'}}>*</span></label>
              <input
                type='text'
                className={errors.productName ? 'input-error' : ''}
                {...register('productName', { required: 'Product Name is required' })}
                maxLength='100'
                placeholder='Product Name'
              />
              {errors.productName && <span className='error-message'>{errors.productName.message}</span>}
            </fieldset>

            {/* Category */}
            <fieldset>
              <label htmlFor='category'>Category <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select
                    components={animatedComponents}
                    options={categoryOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Category"
                    {...field}
                  />
                )}
              />
              {errors.category && <span className='error-message'>{errors.category.message}</span>}
            </fieldset>

            {/* Manufacturer */}
            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="manufacturer"
                control={control}
                rules={{ required: "Manufacturer is required" }}
                render={({ field }) => (
                  <Select
                    options={manufacturerOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Manufacturer"
                    {...field}
                  />
                )}
              />
              {errors.manufacturer && <span className='error-message'>{errors.manufacturer.message}</span>}
            </fieldset>

            {/* Depreciation */}
            <fieldset>
              <label htmlFor='depreciation'>Depreciation <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="depreciation"
                control={control}
                rules={{ required: "Depreciation is required" }}
                render={({ field }) => (
                  <Select
                    options={depreciationOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Depreciation Method"
                    {...field}
                  />
                )}
              />
              {errors.depreciation && <span className='error-message'>{errors.depreciation.message}</span>}
            </fieldset>

            {/* Supplier */}
            <fieldset>
              <label htmlFor='supplier'>Default Supplier</label>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <Select
                    options={supplierOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Supplier"
                    {...field}
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

            {/* End of Life Date */}
            <fieldset>
              <label htmlFor='end-of-life-date'>End of Life Date</label>
              <input
                type='date'
                {...register('endOfLifeDate')}
                min={!id ? currentDate : undefined}
              />
            </fieldset>

            {/* Default Purchase Cost */}
            <fieldset>
              <label>Default Purchase Cost</label>
              <div className="purchase-cost-container">
                <div className="currency-label">PHP</div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("defaultPurchaseCost", { valueAsNumber: true })}
                  placeholder='Default Purchase Cost'
                  className="purchase-cost-input"
                />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity <span style={{color: 'red'}}>*</span></label>
              <input
                type='number'
                className={errors.minimumQuantity ? 'input-error' : ''}
                {...register('minimumQuantity', {
                  required: 'Minimum Quantity is required',
                  min: { value: 0, message: 'Minimum Quantity must be at least 0' },
                  valueAsNumber: true
                })}
                placeholder='Minimum Quantity'
                min="0"
              />
              {errors.minimumQuantity && <span className='error-message'>{errors.minimumQuantity.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='operating_system'>Operating System</label>
              <Controller
                name="operatingSystem"
                control={control}
                render={({ field }) => (
                  <Select
                    options={operatingSystemOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Operating System"
                    {...field}
                  />
                )}
              />
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
              <label htmlFor='upload-image'>Image</label>
              <div>
                {previewImage ? (
                  <div className='image-selected'>
                    <img src={previewImage} alt='Preview' />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        setSelectedImage(null);
                        setValue('image', null);
                        document.getElementById('image').value = '';
                        setRemoveImage(true);
                        console.log("Remove image flag set to:", true);
                      }}
                    >
                      <img src={CloseIcon} alt='Remove' />
                    </button>
                  </div>
                ) : null}
                <input
                  type='file'
                  id='image'
                  accept='image/*'
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
                <label htmlFor='image' className='upload-image-btn'>
                  {!previewImage ? 'Choose Image' : 'Change Image'}
                </label>
              </div>
            </fieldset>

            <button type='submit' className='save-btn' disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
