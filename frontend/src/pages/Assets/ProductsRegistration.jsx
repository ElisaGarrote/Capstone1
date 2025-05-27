import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CloseIcon from '../../assets/icons/close.svg';
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";

export default function ProductsRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const [product, setProduct] = useState(null);

  const { id } = useParams();
  const { setValue, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      productName: '',
      category: '',
      manufacturer: '',
      depreciation: '',
      modelNumber: '',
      endOfLifeDate: '',
      defaultPurchaseCost: '',
      supplier: '',
      minimumQuantity: '',
      operatingSystem: '',
      imeiNumber: '',
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
          contextsService.fetchContextNames()
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

          // Set form values from retrieved product data
          setValue('productName', productData.name);
          
          // For category and depreciation, use the direct values from fetched product data
          setValue('category', productData.category);
          setValue('depreciation', productData.depreciation);
          
          setValue('manufacturer', productData.manufacturer_id);
          setValue('modelNumber', productData.model_number || '');
          setValue('endOfLifeDate', productData.end_of_life || '');
          setValue('defaultPurchaseCost', productData.default_purchase_cost || '');
          setValue('supplier', productData.default_supplier_id || '');
          setValue('minimumQuantity', productData.minimum_quantity || '');
          setValue('operatingSystem', productData.operating_system || '');
          setValue('imeiNumber', productData.imei_number || '');
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

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      formData.append('category', data.category);
      formData.append('manufacturer_id', data.manufacturer);
      formData.append('depreciation', data.depreciation);
      formData.append('model_number', data.modelNumber || '');
      formData.append('end_of_life', data.endOfLifeDate || '');
      formData.append('default_purchase_cost', data.defaultPurchaseCost || '');
      formData.append('default_supplier_id', data.supplier || '');
      formData.append('minimum_quantity', data.minimumQuantity);
      formData.append('operating_system', data.operatingSystem || '');
      formData.append('imei_number', data.imeiNumber || '');
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
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav>
        <NavBar />
      </nav>
      <main className='registration'>
        <section className='top'>
          <TopSecFormPage
            root='Products'
            currentPage={id ? 'Edit Product' : 'New Product'}
            rootNavigatePage='/products'
            title={id ? 'Edit' + ' ' + (product.name) : 'New Product'}
          />
        </section>
        <section className='registration-form'>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Product Name */}
            <fieldset>
              <label htmlFor='product-name'>Product Name *</label>
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
              <label htmlFor="category">Category *</label>
              <div className="dropdown-container">
                <select
                  className={errors.category ? "input-error" : ""}
                  {...register("category", {
                    required: "Category is required",
                    valueAsNumber: true,
                  })}
                  defaultValue=""
                >
                  <option value="" disabled hidden>
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </fieldset>

            {/* Manufacturer */}
            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer *</label>
              <div>
                <select 
                  className={errors.manufacturer ? 'input-error' : ''}
                  {...register('manufacturer', { required: 'Manufacturer is required' })}
                >
                  <option value=''>Select Manufacturer</option>
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.manufacturer && <span className='error-message'>{errors.manufacturer.message}</span>}
            </fieldset>

            {/* Depreciation */}
            <fieldset>
              <label htmlFor='depreciation'>Depreciation *</label>
              <div>
                <select 
                  className={errors.depreciation ? 'input-error' : ''}
                  {...register('depreciation', { required: 'Depreciation is required' })}
                >
                  <option value=''>Select Depreciation Method</option>
                  {depreciations.map((depreciation) => (
                    <option key={depreciation.id} value={depreciation.id}>
                      {depreciation.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.depreciation && <span className='error-message'>{errors.depreciation.message}</span>}
            </fieldset>

            {/* Supplier */}
            <fieldset>
              <label htmlFor='supplier'>Default Supplier</label>
              <div>
                <select {...register('supplier')}>
                  <option value=''>Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <label> Default Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("defaultPurchaseCost", { valueAsNumber: true })}
                  placeholder='Default Purchase Cost'
                />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity *</label>
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
              <div>
                <select 
                  {...register('operatingSystem')}
                  defaultValue=""
                >
                  <option value='' disabled hidden>
                    Select Operating System
                  </option>
                  <option value='linux'>Linux</option>
                  <option value='windows'>Windows</option>
                  <option value='macos'>macOS</option>
                  <option value='ubuntu'>Ubuntu</option>
                  <option value='centos'>CentOS</option>
                  <option value='debian'>Debian</option>
                  <option value='fedora'>Fedora</option>
                  <option value='other'>Other</option>
                </select>
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='imei-number'>IMEI Number</label>
              <input
                type='text'
                {...register('imeiNumber', { maxLength: 15 })}
                placeholder='IMEI Number'
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

            <button type='submit' className='save-btn'>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
