import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CloseIcon from '../../assets/icons/close.svg';
import Alert from "../../components/Alert";

export default function ProductsRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [product, setProduct] = useState(null);
  const [depreciations, setDepreciations] = useState([]);

  const { id } = useParams();
  const { setValue, register, handleSubmit, formState: { errors } } = useForm();

  const currentDate = new Date().toISOString().split('T')[0];
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await fetchContexts();
      await fetchDepreciations();

      if (id) {
        try {
          const response = await fetch(`http://localhost:8001/products/${id}/`);
          if (!response.ok) throw new Error("Failed to fetch product details");

          const data = await response.json();
          setProduct(data);
          console.log("Product Details:", data);

          // Set form values
          setValue('productName', data.name);
          setValue('modelNumber', data.model_number);
          setValue('endOfLifeDate', data.end_of_life);
          setValue('defaultPurchaseCost', data.purchase_cost);
          setValue('category', data.category_id);
          setValue('manufacturer', data.manufacturer_id);
          setValue('supplier', data.default_supplier_id);
          setValue('depreciation', data.depreciation.id);

          if (data.images && data.images.length > 0) {
            setPreviewImage(data.images[0].image);
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
      const response = await fetch("http://localhost:8000/contexts/product/");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch contexts. Status: ${response.status}`);
      }

      setSuppliers(data.suppliers);
      setCategories(data.categories);
      setManufacturers(data.manufacturers);
      console.log("Contexts:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDepreciations = async () => {
    try {
      const response = await fetch("http://localhost:8001/depreciations/product_registration");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch contexts. Status: ${response.status}`);
      }

      setDepreciations(data)
      console.log("Depreciations:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      const categoryId = Number(data.category);
      const manufacturerId = Number(data.manufacturer);
      const supplierId = Number(data.supplier);

      // Find the category object using selected category ID
      const selectedCategory = categories.find(category => category.id === categoryId);
      const selectedManufacturer = manufacturers.find(manufacturer => manufacturer.id === manufacturerId);
      const selectedSupplier = suppliers.find(supplier => supplier.id === supplierId);

      console.log("category name:" ,selectedCategory.name);
 
      formData.append('name', data.productName);
      formData.append('category_id', data.category);
      formData.append('category_name', selectedCategory.name);
      formData.append('manufacturer_id', data.manufacturer || '');
      if (selectedManufacturer) {
        console.log("manufacturer name:" ,selectedManufacturer.name);
        formData.append('manufacturer_name', selectedManufacturer.name);
      }
      formData.append('depreciation', data.depreciation.id || '');
      formData.append('model_number', data.modelNumber || '');
      formData.append('end_of_life', data.endOfLifeDate || '');
      formData.append('purchase_cost', data.defaultPurchaseCost || '');
      formData.append('default_supplier_id', data.supplier || '');
      if (selectedSupplier) {
        console.log("supplier name:" ,selectedSupplier.name);
        formData.append('default_supplier_name', selectedSupplier.name);
      }
      formData.append('minimum_quantity', data.minimumQuantity);
      formData.append('operating_system', data.operatingSystem);
      formData.append('imei_number', data.imeiNumber);
      formData.append('notes', data.notes);
      
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      if (id) {
        try {
          const response = await fetch(`http://localhost:8001/products/${id}/`, {
            method: 'PUT',
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`Failed to update product. Status: ${response.status}`);
          }
      
          const result = await response.json();
          console.log('Updated product:', result);
          setSuccessMessage("Product has been updated successfully!");
          setErrorMessage("");
      
          setTimeout(() => {
            setErrorMessage("");
            setSuccessMessage("");
          }, 5000);
      
          navigate('/products');
        } catch (error) {
          console.error('Update error:', error);
          setSuccessMessage("");
          setErrorMessage("Updating product failed. Please try again.");
      
          setTimeout(() => {
            setErrorMessage("");
            setSuccessMessage("");
          }, 5000);
        }
      } else {
        try {
          const response = await fetch("http://localhost:8001/products/registration/", {
            method: 'POST',
            body: formData,
          });
    
          const result = await response.json();
          console.log('Product registered:', result);
          navigate('/products');        
        } catch (error) {
          throw new Error(`Failed to submit product. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error submitting/updating product:', error);
    }
  };  

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}
      <main className='registration'>
        <section className='top'>
          <TopSecFormPage
            root='Products'
            currentPage={id ? 'Edit Product' : 'New Product'}
            rootNavigatePage='/products'
            title={id ? 'Edit Product' : 'New Product'}
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
              <label htmlFor='category'>Category *</label>
              <div>
                <select
                  className={errors.category ? 'input-error' : ''}
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value=''>Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
              {errors.category && <span className='error-message'>{errors.category.message}</span>}
            </fieldset>

            {/* Manufacturer */}
            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer</label>
              <div>
                <select {...register('manufacturer')}>
                  <option value=''>Select Manufacturer</option>
                  {manufacturers.map((manufacturer) => (
                    <option key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            {/* Depreciation */}
            <fieldset>
              <label htmlFor='depreciation'>Depreciation</label>
              <div>
                <select {...register('depreciation')}>
                  <option value=''>Select Depreciation Method</option>
                  {depreciations.map((depreciation) => (
                    <option key={depreciation.id} value={depreciation.id}>
                      {depreciation.name}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            {/* Model Number */}
            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input 
              type='text'
              {...register('modelNumber')} maxLength='100'
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
                min="1"
                {...register("defaultPurchaseCost", { valueAsNumber: true })}
                placeholder='Default Purchase Cost'
                />
                
              </div>
            </fieldset>

            {/* Default Supplier */}
            <fieldset>
              <label htmlFor='supplier'>Default Supplier</label>
              <div>
                <select {...register('supplier')}>
                  <option value=''>Select Suppler</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity</label>
              <input
                type='number'
                {...register('minimumQuantity')}
                placeholder='Minimum Quantity'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='operating-system'>Operating System</label>
              <input
                type='text'
                {...register('operatingSystem')}
                placeholder='Operating System'
              />
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
              <label htmlFor='ssd-encryption'>SSD Encryption</label>
              <input
                type='text'
                {...register('ssdEncryption')}
                placeholder='SSD Encryption'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea {...register('notes')} maxLength='500'
              placeholder='Notes...'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='upload-image'>Image</label>
              <div>
                {previewImage && (
                  <div className='image-selected'>
                    <img src={previewImage} alt='Preview' />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        setValue('image', null);
                        document.getElementById('image').value = '';
                      }}
                    >
                      <img src={CloseIcon} alt='Remove' />
                    </button>
                  </div>
                )}
                <input
                  type='file'
                  id='image'
                  accept='image/*'
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
              </div>
              <label htmlFor='image' className='upload-image-btn'>
                {!previewImage ? 'Choose Image' : 'Change Image'}
              </label>
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
