import NavBar from '../../components/NavBar';
import '../../styles/Registration.css';
import '../../styles/PerformAudits.css';
import { useNavigate, useParams } from 'react-router-dom';
import MediumButtons from '../../components/buttons/MediumButtons';
import TopSecFormPage from '../../components/TopSecFormPage';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SampleImage from '../../assets/img/dvi.jpeg';
import CloseIcon from '../../assets/icons/close.svg';
import Select from "react-select";
import makeAnimated from "react-select/animated";

export default function ComponentsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split('T')[0];

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

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: "all",
    defaultValues: {
      image: SampleImage,
      componentName: '',
      category: null,
      modelNumber: '',
      manufacturer: null,
      supplier: null,
      location: null,
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

  // Create options arrays for react-select dropdowns
  const categoryOptions = categoryList.map(category => ({
    value: category,
    label: category
  }));

  const manufacturerOptions = manufacturerList.map(manufacturer => ({
    value: manufacturer,
    label: manufacturer
  }));

  const supplierOptions = supplierList.map(supplier => ({
    value: supplier,
    label: supplier
  }));

  const locationOptions = locationList.map(location => ({
    value: location,
    label: location
  }));

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id && componentData[id]) {
      const component = componentData[id];

      // Set regular form values
      setValue('componentName', component.componentName);
      setValue('modelNumber', component.modelNumber);
      setValue('orderNumber', component.orderNumber);
      setValue('purchaseDate', component.purchaseDate);
      setValue('purchaseCost', component.purchaseCost);
      setValue('quantity', component.quantity);
      setValue('minimumQuantity', component.minimumQuantity);
      setValue('notes', component.notes);

      // Set dropdown values as option objects
      const categoryOption = categoryOptions.find(option => option.value === component.category);
      const manufacturerOption = manufacturerOptions.find(option => option.value === component.manufacturer);
      const supplierOption = supplierOptions.find(option => option.value === component.supplier);
      const locationOption = locationOptions.find(option => option.value === component.location);

      setValue('category', categoryOption || null);
      setValue('manufacturer', manufacturerOption || null);
      setValue('supplier', supplierOption || null);
      setValue('location', locationOption || null);

      setPreviewImage(component.image);
    }
  }, [id, setValue, categoryOptions, manufacturerOptions, supplierOptions, locationOptions]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setRemoveImage(false);
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    // Convert react-select values to strings for submission
    const formData = {
      ...data,
      category: data.category?.value || '',
      manufacturer: data.manufacturer?.value || '',
      supplier: data.supplier?.value || '',
      location: data.location?.value || ''
    };
    console.log('Form submitted:', formData);
    navigate('/components');
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav>
        <NavBar />
      </nav>
      <main className='perform-audit-page'>
        <section className='top'>
          <TopSecFormPage
            root="Components"
            currentPage={id ? "Edit Component" : "New Component"}
            rootNavigatePage="/components"
            title={id ? `${componentName}` : "New Component"}
          />
        </section>
        <section className='perform-audit-form'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              <label htmlFor='component-name'>Component Name <span style={{color: 'red'}}>*</span></label>
              <input
                type='text'
                className={errors.componentName ? 'input-error' : ''}
                {...register('componentName', { required: 'Component Name is required' })}
                maxLength='100'
                placeholder='Component Name'
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </fieldset>

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

            <fieldset>
              <label htmlFor='manufacturer'>Manufacturer</label>
              <Controller
                name="manufacturer"
                control={control}
                render={({ field }) => (
                  <Select
                    options={manufacturerOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Manufacturer"
                    {...field}
                  />
                )}
              />
            </fieldset>

            <fieldset>
              <label htmlFor='supplier'>Supplier</label>
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

            <fieldset>
              <label htmlFor='location'>Location</label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Select
                    options={locationOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Location"
                    {...field}
                  />
                )}
              />
            </fieldset>

            <fieldset>
              <label htmlFor='model-number'>Model Number</label>
              <input type='text' {...register('modelNumber')} maxLength='100' placeholder='Model Number' />
            </fieldset>

            <fieldset>
              <label htmlFor='order-number'>Order Number</label>
              <input type='text' {...register('orderNumber')} maxLength='100' placeholder='Order Number' />
            </fieldset>

            <fieldset>
              <label>Purchase Date</label>
              <input type="date" {...register("purchase_date")} max={currentDate} />
            </fieldset>

            <fieldset>
              <label htmlFor='purchase-cost'>Purchase Cost</label>
              <div className="purchase-cost-container">
                <div className="currency-label">PHP</div>
                <input
                  type='number'
                  {...register('purchaseCost')}
                  step='0.01'
                  min='0'
                  placeholder='Purchase Cost'
                  className="purchase-cost-input"
                />
              </div>
            </fieldset>

            <fieldset>
              <label htmlFor='quantity'>Quantity</label>
              <input
                type='number'
                {...register('quantity')}
                min='1'
                placeholder='Quantity'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='minimum-quantity'>Minimum Quantity</label>
              <input
                type='number'
                {...register('minimumQuantity')}
                min='1'
                placeholder='Minimum Quantity'
              />
            </fieldset>

            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea {...register('notes')} maxLength='500' placeholder='Notes...' />
            </fieldset>

            <fieldset>
              <label>Image</label>
              {previewImage && (
                <div className="image-selected">
                  <img src={previewImage} alt="Preview" />
                  <button onClick={handleRemoveImage}>
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

            <button type='submit' className='save-btn' disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
