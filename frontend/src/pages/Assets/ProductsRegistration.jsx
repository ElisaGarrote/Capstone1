import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CloseIcon from '../../assets/icons/close.svg';

export default function ProductsRegistration() {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const { setValue, register, handleSubmit, formState: { errors } } = useForm();

  const currentDate = new Date().toISOString().split('T')[0];
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const depreciationList = ['Straight Line', 'Declining Balance', 'Units of Production'];

  useEffect(() => {
    fetchContexts();
    if (id && product) {
      fetchProductDetails();

      Object.entries(product).forEach(([key, value]) => {
        if (value !== null) {
          setValue(key, value);
        }
      });

      if (product.images && product.images.length > 0) {
        setPreviewImage(product.images[0].image);
      }
    }
  }, [product, id, setValue]);
  
  const fetchContexts = async () => {
    try {
      const response = await fetch("http://localhost:8000/contexts/product/");
      const data = await response.json();
      setSuppliers(data.suppliers);
      setCategories(data.categories);
      setManufacturers(data.manufacturers);
      console.log("Contexts:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProductDetails = async () => {
    if (id) {
      try {
        const response = await fetch(`http://localhost:8001/products/${id}/`);
        const data = await response.json();
        setProduct(data);
        console.log("Product Details:", data);
      } catch (err) {
        console.log(err);
      }
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

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    if (id) {
      console.log('Updating product...');
    } else {
      console.log('Creating new product...');
    }
    navigate('/products');
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
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
                    <option
                      key={category.id}
                      value={category.id}
                      selected={id && product && category.id === product.category_id} 
                    >
                      {id && product && product.category_name ? product.category_name : category.name}
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
                    <option
                      key={manufacturer.id}
                      value={manufacturer.id}
                      selected={id && product && manufacturer.id === product.manufacturer_id}
                    >
                      {id && product && product.manufacturer_name ? product.manufacturer_name : manufacturer.name}
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
                  {depreciationList.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            {/* Model Number */}
            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input type='text' {...register('modelNumber')} maxLength='100' />
            </fieldset>

            {/* End of Life Date */}
            <fieldset>
              <label htmlFor='end-of-life-date'>End of Life Date</label>
              <input
                type='date'
                {...register('endOfLifeDate')}
                min={!id ? currentDate : undefined} // Disable past dates if creating new product
              />
            </fieldset>

            {/* Default Purchase Cost */}
            <fieldset>
              <label> Default Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input type="number" step="0.01" min="1" {...register("purchaseCost", { valueAsNumber: true })} />
              </div>
            </fieldset>

            {/* Default Supplier */}
            <fieldset>
              <label htmlFor='supplier'>Default Supplier</label>
              <div>
                <select {...register('supplier')}>
                  <option value=''>Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                      selected={id && product && supplier.id === product.supplier_id} 
                    >
                      {id && product && product.supplier_name ? product.supplier_name : supplier.name}
                    </option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            {/* Other fields... */}

            {/* Image upload */}
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

            {/* Save Button */}
            <button type='submit' className='save-btn'>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
