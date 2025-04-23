import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SampleImage from '../../assets/img/dvi.jpeg';
import CloseIcon from '../../assets/icons/close.svg';

export default function ComponentsRegistration() {
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
      componentName: '',
      category: '',
      modelNumber: '',
      manufacturer: '',
      supplier: '',
      location: '',
      orderNumber: '',
      purchaseDate: '',
      purchaseCost: '',
      quantity: '',
      minimumQuantity: '',
      notes: ''
    }
  });

  const componentData = {
    '1': {
      image: SampleImage,
      componentName: 'Corsair Vengeance RAM',
      category: 'RAM',
      manufacturer: 'Corsair',
      supplier: 'TechStore',
      location: 'Main Warehouse',
      modelNumber: 'CMK16GX4M2B3200C16',
      orderNumber: 'ORD-2048',
      purchaseDate: '2024-06-15',
      purchaseCost: 120.99,
      quantity: 20,
      minimumQuantity: 5,
      notes: 'High performance RAM module for gaming PCs',
    },
    '2': {
      image: SampleImage,
      componentName: 'Intel Network Card',
      category: 'Networking',
      manufacturer: 'Intel',
      supplier: 'NetSupplies',
      location: 'Storage Room B',
      modelNumber: 'I350-T4V2',
      orderNumber: 'ORD-3090',
      purchaseDate: '2023-10-10',
      purchaseCost: 89.5,
      quantity: 15,
      minimumQuantity: 3,
      notes: '',
    }
  };

  const categoryList = ['RAM', 'Storage', 'Motherboard', 'Networking'];
  const manufacturerList = ['Corsair', 'Intel', 'Samsung', 'Kingston'];
  const supplierList = ['TechStore', 'NetSupplies', 'HardwareHub'];
  const locationList = ['Main Warehouse', 'Storage Room A', 'Storage Room B'];

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id && componentData[id]) {
      const component = componentData[id];
      Object.entries(component).forEach(([key, value]) => {
        setValue(key, value);
      });
      setPreviewImage(component.image);
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
    navigate('/components');
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className='registration'>
        <section className='top'>
          <TopSecFormPage
            root='Components'
            currentPage={id ? 'Edit Component' : 'New Component'}
            rootNavigatePage='/components'
            title={id ? 'Edit Component' : 'New Component'}
          />
        </section>
        <section className='registration-form'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor='component-name'>Component Name *</label>
              <input
                type='text'
                className={errors.componentName ? 'input-error' : ''}
                {...register('componentName', { required: 'Component Name is required' })}
                maxLength='100'
              />
              {errors.componentName && <span className='error-message'>{errors.componentName.message}</span>}
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
              <label htmlFor='manufacturer'>Manufacturer</label>
              <select {...register('manufacturer')}>
                <option value=''>Select Manufacturer</option>
                {manufacturerList.map((mfg, idx) => (
                  <option key={idx} value={mfg}>{mfg}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor='supplier'>Supplier</label>
              <select {...register('supplier')}>
                <option value=''>Select Supplier</option>
                {supplierList.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor='location'>Location</label>
              <select {...register('location')}>
                <option value=''>Select Location</option>
                {locationList.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </fieldset>

            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input type='text' {...register('modelNumber')} maxLength='100' />
            </fieldset>

            <fieldset>
              <label htmlFor='order-number'>Order Number</label>
              <input type='text' {...register('orderNumber')} maxLength='100' />
            </fieldset>

            <fieldset>
              <label htmlFor='purchase-date'>Purchase Date</label>
              <input
                type='date'
                {...register('purchaseDate')}
                max={currentDate}
              />
            </fieldset>

            <fieldset>
              <label htmlFor='purchase-cost'>Purchase Cost</label>
              <input
                type='number'
                {...register('purchaseCost')}
                step='0.01'
                min='0'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='quantity'>Quantity</label>
              <input
                type='number'
                {...register('quantity')}
                min='1'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity</label>
              <input
                type='number'
                {...register('minimumQuantity')}
                min='1'
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
