import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import "../../styles/Registration.css";
import "../../styles/PerformAudits.css";
import CloseIcon from "../../assets/icons/close.svg";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import Select from "react-select";
import makeAnimated from "react-select/animated";

export default function AssetsRegistration() {
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([
    { id: 1, name: "Makati Office" },
    { id: 2, name: "Pasig Office" },
    { id: 3, name: "Marikina Office" },
    { id: 4, name: "Quezon City Office" },
    { id: 5, name: "Manila Office" },
    { id: 6, name: "Taguig Office" },
    { id: 7, name: "Remote" }
  ]);

  // Animated components for react-select
  const animatedComponents = makeAnimated();

  // Custom styles for dropdowns to match Audits form
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
  
  const [asset, setAsset] = useState(null);
  const { id } = useParams();

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [generatedAssetId, setGeneratedAssetId] = useState('(Loading...)');
  
  const { setValue, register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm({
    mode: "all",
    defaultValues: {
      assetId: '',
      product: null,
      status: null,
      supplier: null,
      location: null,
      assetName: '',
      serialNumber: '',
      warrantyExpiration: '',
      orderNumber: '',
      purchaseDate: '',
      purchaseCost: '',
      auditSchedule: '',
      notes: '',
    }
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Add this state to track the selected product
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Only fetch the next asset ID if we're creating a new asset (no ID provided)
    if (!id) {
      const fetchNextAssetId = async () => {
        try {
          setIsLoading(true);
          const response = await assetsService.getNextAssetId();
          if (response && response.next_id) {
            setValue('assetId', response.next_id);
            setGeneratedAssetId(response.next_id);
          } else {
            console.error("Failed to get next asset ID");
            setErrorMessage("Failed to generate asset ID. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching next asset ID:", error);
          setErrorMessage("Error generating asset ID. Please try again.");
        }
      };

      fetchNextAssetId();
    }
  }, [id, setValue]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data in parallel
        const [assetContextsData, contextsData] = await Promise.all([
          assetsService.fetchAssetContexts(),
          fetchAllCategories()
        ]);
        
        console.log("Asset contexts data:", assetContextsData);
        
        // Set products and statuses from asset contexts
        setProducts(assetContextsData.products || []);
        setStatuses(assetContextsData.statuses || []);
        
        // Set suppliers from contexts
        setSuppliers(contextsData.suppliers || []);

        console.log("products:", assetContextsData.products);
        console.log("statuses:", assetContextsData.statuses);
        console.log("Suppliers:", contextsData.suppliers);

        // If ID is present, fetch the asset details
        if (id) {
          const assetData = await assetsService.fetchAssetById(id);
          if (!assetData) {
            setErrorMessage("Failed to fetch asset details");
            setIsLoading(false);
            return;
          }

          setAsset(assetData);
          console.log("Asset Details:", assetData);

          // Set form values from retrieved asset data
          setValue('assetId', assetData.displayed_id);

          // For dropdowns, find the matching option objects
          const currentProductOptions = assetContextsData.products?.map(product => ({
            value: product.id,
            label: product.name
          })) || [];

          const currentStatusOptions = assetContextsData.statuses?.map(status => ({
            value: status.id,
            label: status.name
          })) || [];

          const currentSupplierOptions = contextsData.suppliers?.map(supplier => ({
            value: supplier.id,
            label: supplier.name
          })) || [];

          const currentLocationOptions = locations.map(location => ({
            value: location.name,
            label: location.name
          }));

          const productOption = currentProductOptions.find(option => option.value === assetData.product);
          const statusOption = currentStatusOptions.find(option => option.value === assetData.status);
          const supplierOption = currentSupplierOptions.find(option => option.value === assetData.supplier_id);
          const locationOption = currentLocationOptions.find(option => option.value === assetData.location);

          setValue('product', productOption || null);
          setValue('status', statusOption || null);
          setValue('supplier', supplierOption || null);
          setValue('location', locationOption || null);
          setValue('assetName', assetData.name || '');
          setValue('serialNumber', assetData.serial_number || '');
          setValue('warrantyExpiration', assetData.warranty_expiration || '');
          setValue('orderNumber', assetData.order_number || '');
          setValue('purchaseDate', assetData.purchase_date || '');
          setValue('purchaseCost', assetData.purchase_cost || '');
          setValue('notes', assetData.notes || '');
          
          if (assetData.image) {
            setPreviewImage(`https://assets-service-production.up.railway.app${assetData.image}`);
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
      const formData = new FormData();

      // Append asset data to FormData object
      formData.append('displayed_id', data.assetId);
      formData.append('product', data.product?.value || '');
      formData.append('status', data.status?.value || '');
      formData.append('supplier_id', data.supplier?.value || '');
      formData.append('location', data.location?.value || '');
      formData.append('name', data.assetName);
      formData.append('serial_number', data.serialNumber || '');
      formData.append('warranty_expiration', data.warrantyExpiration || '');
      formData.append('order_number', data.orderNumber || '');
      formData.append('purchase_date', data.purchaseDate || '');
      formData.append('purchase_cost', data.purchaseCost || '');
      formData.append('notes', data.notes || '');
      
      // Handle image upload
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // Handle image removal
      if (removeImage) {
        formData.append('remove_image', 'true');
      }
      
      console.log("Form data before submission:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      let result;
      
      if (id) {
        // Update existing asset
        result = await assetsService.updateAsset(id, formData);
      } else {
        // Create new asset
        result = await assetsService.createAsset(formData);
      }

      if (!result) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} asset.`);
      }

      console.log(`${id ? 'Updated' : 'Created'} asset:`, result);
      
      // Navigate to assets page with success message
      navigate('/assets', { 
        state: { 
          successMessage: `Asset has been ${id ? 'updated' : 'created'} successfully!` 
        } 
      });
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'creating'} asset:`, error);
      setErrorMessage(error.message || `An error occurred while ${id ? 'updating' : 'creating'} the asset`);
    }
  };

  // Create options arrays for react-select dropdowns
  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name
  }));

  const statusOptions = statuses.map(status => ({
    value: status.id,
    label: status.name
  }));

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  }));

  const locationOptions = locations.map(location => ({
    value: location.name,
    label: location.name
  }));

  // Add this function to handle product selection
  const handleProductChange = async (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      try {
        // Fetch the product defaults
        const productDefaults = await assetsService.fetchProductDefaults(selectedOption.value);

        if (productDefaults) {
          console.log("Product defaults:", productDefaults);

          // Set purchase cost if available
          if (productDefaults.default_purchase_cost) {
            setValue('purchaseCost', productDefaults.default_purchase_cost);
          }

          // Set supplier if available
          if (productDefaults.default_supplier_id) {
            const supplierOption = supplierOptions.find(option => option.value === productDefaults.default_supplier_id);
            if (supplierOption) {
              setValue('supplier', supplierOption);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product defaults:", error);
      }
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
      <main className="perform-audit-page">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage={id ? "Edit Asset" : "New Asset"}
            rootNavigatePage="/assets"
            title={id ? 'Edit' + ' ' + (asset?.name || 'Asset') : 'New Asset'}
          />
        </section>
        <section className="perform-audit-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset ID */}
            <fieldset>
              <label htmlFor='asset-id'>Asset ID <span style={{color: 'red'}}>*</span></label>
              <input
                type='text'
                readOnly
                className={errors.assetId ? 'input-error' : ''}
                {...register('assetId', { required: 'Asset ID is required' })}
                maxLength='20'
                placeholder='Asset ID'
              />
              {errors.assetId && <span className='error-message'>{errors.assetId.message}</span>}
            </fieldset>

            {/* Products selection */}
            <fieldset>
              <label htmlFor='product'>Product <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="product"
                control={control}
                rules={{ required: "Product is required" }}
                render={({ field }) => (
                  <Select
                    components={animatedComponents}
                    options={productOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Product"
                    {...field}
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption);
                      handleProductChange(selectedOption);
                    }}
                  />
                )}
              />
              {errors.product && <span className='error-message'>{errors.product.message}</span>}
            </fieldset>

            {/* Status selection, Default deployable */}
            <fieldset>
              <label htmlFor='status'>Status <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select
                    options={statusOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Status"
                    {...field}
                  />
                )}
              />
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            {/* Supplier selection */}
            <fieldset>
              <label htmlFor='supplier'>Supplier <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="supplier"
                control={control}
                rules={{ required: "Supplier is required" }}
                render={({ field }) => (
                  <Select
                    options={supplierOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Supplier"
                    {...field}
                  />
                )}
              />
              {errors.supplier && <span className='error-message'>{errors.supplier.message}</span>}
            </fieldset>

            {/* Location selection */}
            <fieldset>
              <label htmlFor='location'>Location <span style={{color: 'red'}}>*</span></label>
              <Controller
                name="location"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Select
                    options={locationOptions}
                    styles={customStylesDropdown}
                    placeholder="Select Location"
                    {...field}
                  />
                )}
              />
              {errors.location && <span className='error-message'>{errors.location.message}</span>}
            </fieldset>

            {/* Asset Name */}
            <fieldset>
              <label htmlFor='asset-name'>Asset Name <span style={{color: 'red'}}>*</span></label>
              <input
                type='text'
                className={errors.assetName ? 'input-error' : ''}
                {...register('assetName', { required: 'Asset Name is required' })}
                maxLength='100'
                placeholder='Asset Name'
              />
              {errors.assetName && <span className='error-message'>{errors.assetName.message}</span>}
            </fieldset>

            {/* Serial Number */}
            <fieldset>
              <label htmlFor='serial-number'>Serial Number</label>
              <input 
                type='text'
                {...register('serialNumber')} 
                maxLength='50'
                placeholder='Serial Number'
              />
            </fieldset>

            {/* Warranty Expiration */}
            <fieldset>
              <label htmlFor='warranty-expiration'>Warranty Expiration Date</label>
              <input
                type='date'
                {...register('warrantyExpiration')}
                min={!id ? currentDate : undefined}
              />
            </fieldset>

            {/* Order Number */}
            <fieldset>
              <label htmlFor='order-number'>Order Number</label>
              <input 
                type='text'
                {...register('orderNumber')} 
                maxLength='50'
                placeholder='Order Number'
              />
            </fieldset>

            {/* Purchase Date */}
            <fieldset>
              <label htmlFor='purchase-date'>Purchase Date</label>
              <input
                type='date'
                {...register('purchaseDate')}
                min={!id ? currentDate : undefined}
              />
            </fieldset>

            {/* Purchase Cost */}
            <fieldset>
              <label>Default Purchase Cost</label>
              <div className="purchase-cost-container">
                <div className="currency-label">PHP</div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchaseCost", { valueAsNumber: true })}
                  placeholder='Default Purchase Cost'
                  className="purchase-cost-input"
                />
              </div>
            </fieldset>

            {/* Notes */}
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

            <button type="submit" className="save-btn" disabled={!isValid}>Save</button>
          </form>
        </section>
      </main>
    </>
  );
}
