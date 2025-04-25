import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SampleImage from '../../assets/img/dvi.jpeg';
import CloseIcon from '../../assets/icons/close.svg';

export default function ProductsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      image: SampleImage,
      productName: '',
      category: '',
      modelNumber: '',
      manufacturer: '',
      depreciation: 'Straight Line',
      endOfLifeDate: '',
      minimumQuantity: 10,
      imeiNumber: '',
      ssdEncryption: '',
      notes: ''
    }
  });

  const productData = {
    '1': {
      image: SampleImage,
      productName: 'Dell Latitude',
      category: 'Laptop',
      modelNumber: 'DL-2025',
      manufacturer: 'Dell',
      depreciation: 'Straight Line',
      endOfLifeDate: '2028-12-31',
      minimumQuantity: 10,
      imeiNumber: '123456789012345',
      ssdEncryption: 'Enabled',
      notes: 'Sample notes for Dell Latitude',
    },
    '2': {
      image: SampleImage,
      productName: 'iPhone 15 Pro',
      category: 'Mobile Phone',
      modelNumber: 'IPH15P',
      manufacturer: 'Apple',
      depreciation: 'Declining Balance',
      endOfLifeDate: '2027-11-20',
      minimumQuantity: 10,
      imeiNumber: '123456789012345',
      ssdEncryption: 'Disabled',
      notes: '',
    }
  };

  const categoryList = ['Laptop', 'Mobile Phone', 'Tablet'];
  const manufacturerList = ['Apple', 'Dell', 'Samsung'];
  const depreciationList = ['Straight Line', 'Declining Balance', 'Units of Production'];

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id && productData[id]) {
      const product = productData[id];
      Object.entries(product).forEach(([key, value]) => {
        setValue(key, value);
      });
      setPreviewImage(product.image);
    }
  }, [id, setValue]);

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
            <fieldset>
              <label htmlFor='product-name'>Product Name *</label>
              <input
                type='text'
                className={errors.productName ? 'input-error' : ''}
                {...register('productName', { required: 'Product Name is required' })}
                maxLength='100'
              />
              {errors.productName && <span className='error-message'>{errors.productName.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='category'>Category *</label>
              <div>
                <select
                  className={errors.category ? 'input-error' : ''}
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value=''>Select Category</option>
                  {categoryList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
              {errors.category && <span className='error-message'>{errors.category.message}</span>}
            </fieldset>

            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input type='text' {...register('modelNumber')} maxLength='100' />
            </fieldset>

            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer</label>
              <div>
                <select {...register('manufacturer')}>
                  <option value=''>Select Manufacturer</option>
                  {manufacturerList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='depreciation'>Depreciation</label>
              <div>
                <select {...register('depreciation')}>
                  <option value=''>Select Depreciation Method</option>
                  {depreciationList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type='new' />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='end-of-life-date'>End of Life Date</label>
              <input
                type='date'
                {...register('endOfLifeDate')}
                min={!id ? currentDate : undefined}
              />
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
              <textarea {...register('notes')} maxLength='500' />
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
