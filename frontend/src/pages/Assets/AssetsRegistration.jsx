import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";

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
  
  const [asset, setAsset] = useState(null);
  const { id } = useParams();

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [generatedAssetId, setGeneratedAssetId] = useState('(Loading...)');
  
  const { setValue, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      assetId: '',
      product: '',
      status: '',
      supplier: '',
      location: '',
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
      try {
        setIsLoading(true);
        
        // Fetch all necessary data in parallel
        const [assetContextsData, contextsData] = await Promise.all([
          assetsService.fetchAssetContexts(),
          contextsService.fetchAllSupplierNames()
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
          
          // For product and status, use the direct values from fetched product data
          setValue('product', assetData.product);
          setValue('status', assetData.status);
          
          setValue('supplier', assetData.supplier_id);
          setValue('location', assetData.location || '');
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
      formData.append('product', data.product);
      formData.append('status', data.status);
      formData.append('supplier_id', data.supplier || '');
      formData.append('location', data.location || '');
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

  // Add this function to handle product selection
  const handleProductChange = async (e) => {
    const productId = e.target.value;
    if (productId) {
      try {
        // Fetch the product defaults
        const productDefaults = await assetsService.fetchProductDefaults(productId);
        
        if (productDefaults) {
          console.log("Product defaults:", productDefaults);
          
          // Set purchase cost if available
          if (productDefaults.default_purchase_cost) {
            setValue('purchaseCost', productDefaults.default_purchase_cost);
          }
          
          // Set supplier if available
          if (productDefaults.default_supplier_id) {
            setValue('supplier', productDefaults.default_supplier_id);
          }
        }
      } catch (error) {
        console.error("Error fetching product defaults:", error);
      }
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
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage={id ? "Edit Asset" : "New Asset"}
            rootNavigatePage="/assets"
            title={id ? 'Edit' + ' ' + (asset.name) : 'New Asset'}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Asset ID */}
            <fieldset>
              <label htmlFor='asset-id'>Asset ID *</label>
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
              <label htmlFor='product'>Product *</label>
              <div>
                <select
                  className={errors.product ? 'input-error' : ''}
                  {...register('product', { required: 'Product is required' })}
                  onChange={(e) => {
                    // This ensures react-hook-form also gets the value
                    register('product').onChange(e);
                    // Then call our custom handler
                    handleProductChange(e);
                  }}
                >
                  <option value=''>Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.product && <span className='error-message'>{errors.product.message}</span>}
            </fieldset>

            {/* Status selection, Default deployable */}
            <fieldset>
              <label htmlFor='status'>Status *</label>
              <div>
                <select
                  className={errors.status ? 'input-error' : ''}
                  {...register('status', { required: 'Status is required' })}
                >
                  <option value=''>Select Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            {/* Supplier selection */}
            <fieldset>
              <label htmlFor='supplier'>Supplier *</label>
              <div>
                <select
                  className={errors.supplier ? 'input-error' : ''}
                  {...register('supplier', { required: 'Supplier is required' })}
                >
                  <option value=''>Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.supplier && <span className='error-message'>{errors.supplier.message}</span>}
            </fieldset>

            {/* Location selection */}
            <fieldset>
              <label htmlFor='location'>location *</label>
              <div>
                <select
                  className={errors.location ? 'input-error' : ''}
                  {...register('location', { required: 'Location is required' })}
                >
                  <option value=''>Select Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.location && <span className='error-message'>{errors.location.message}</span>}
            </fieldset>

            {/* Asset Name */}
            <fieldset>
              <label htmlFor='asset-name'>Asset Name *</label>
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
              <label>Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("purchaseCost", { valueAsNumber: true })}
                  placeholder='Purchase Cost'
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

            <button type="submit" className="save-btn">Save</button>
          </form>
        </section>
      </main>
    </>
  );
}
