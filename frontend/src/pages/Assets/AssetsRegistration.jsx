import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import { fetchAllCategories } from "../../services/contexts-service";
import AddEntryModal from "../../components/Modals/AddEntryModal";

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
  const [disposalStatuses] = useState([
    { id: 1, name: "Not Disposed" },
    { id: 2, name: "Sold" },
    { id: 3, name: "Donated" },
    { id: 4, name: "Recycled" },
    { id: 5, name: "Destroyed" },
    { id: 6, name: "Lost" },
    { id: 7, name: "Stolen" }
  ]);


  
  const [asset, setAsset] = useState(null);
  const { id } = useParams();
  const location = useLocation();

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [generatedAssetId, setGeneratedAssetId] = useState('(Loading...)');
  
  const { setValue, register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    mode: "all",
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
      disposalStatus: '',
      scheduleAuditDate: '',
      notes: '',
    }
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Import file state
  const [importFile, setImportFile] = useState(null);

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



          setValue('product', assetData.product_id || '');
          setValue('status', assetData.status_id || '');
          setValue('supplier', assetData.supplier_id || '');
          setValue('location', assetData.location || '');
          setValue('assetName', assetData.name || '');
          setValue('serialNumber', assetData.serial_number || '');
          setValue('warrantyExpiration', assetData.warranty_expiration || '');
          setValue('orderNumber', assetData.order_number || '');
          setValue('purchaseDate', assetData.purchase_date || '');
          setValue('purchaseCost', assetData.purchase_cost || '');
          setValue('disposalStatus', assetData.disposal_status || '');
          setValue('scheduleAuditDate', assetData.schedule_audit_date || '');
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

  // Handle cloned asset name from location state
  useEffect(() => {
    console.log('AssetsRegistration location.state:', location.state);
    if (location.state?.clonedAssetName && !id) {
      console.log('Setting cloned asset name:', location.state.clonedAssetName);
      setValue('assetName', location.state.clonedAssetName);
    }
  }, [location.state, setValue, id]);

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 5MB and was not added.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
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
      // Here you would typically process the Excel file
      console.log("Import file selected:", file.name);
    }
  };

  // Modal field configurations
  const statusFields = [
    {
      name: 'name',
      label: 'Status Label',
      type: 'text',
      placeholder: 'Status Label',
      required: true,
      maxLength: 100,
      validation: { required: 'Status Label is required' }
    },
    {
      name: 'type',
      label: 'Status Type',
      type: 'select',
      placeholder: 'Select Status Type',
      required: true,
      options: [
        { value: 'deployable', label: 'Deployable' },
        { value: 'deployed', label: 'Deployed' },
        { value: 'undeployable', label: 'Undeployable' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' }
      ],
      validation: { required: 'Status Type is required' }
    }
  ];

  const supplierFields = [
    {
      name: 'name',
      label: 'Supplier Name',
      type: 'text',
      placeholder: 'Supplier Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Supplier Name is required' }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Email',
      required: false,
      maxLength: 100
    },
    {
      name: 'phone_number',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Phone Number',
      required: false,
      maxLength: 20
    }
  ];

  const locationFields = [
    {
      name: 'name',
      label: 'Location Name',
      type: 'text',
      placeholder: 'Location Name',
      required: true,
      maxLength: 100,
      validation: { required: 'Location Name is required' }
    }
  ];

  // Modal save handlers
  const handleSaveStatus = async (data) => {
    try {
      // Here you would call the API to create a new status
      console.log('Creating status:', data);
      // For now, just add to local state
      const newStatus = {
        id: statuses.length + 1,
        name: data.name,
        type: data.type
      };
      setStatuses(prev => [...prev, newStatus]);
    } catch (error) {
      console.error('Error creating status:', error);
      throw error;
    }
  };

  const handleSaveSupplier = async (data) => {
    try {
      // Here you would call the API to create a new supplier
      console.log('Creating supplier:', data);
      // For now, just add to local state
      const newSupplier = {
        id: suppliers.length + 1,
        name: data.name,
        email: data.email,
        phone_number: data.phone_number
      };
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const handleSaveLocation = async (data) => {
    try {
      // Here you would call the API to create a new location
      console.log('Creating location:', data);
      // For now, just add to local state
      const newLocation = {
        id: locations.length + 1,
        name: data.name
      };
      setLocations(prev => [...prev, newLocation]);
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  };
  
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append asset data to FormData object
      formData.append('displayed_id', data.assetId);
      formData.append('product', data.product || '');
      formData.append('status', data.status || '');
      formData.append('supplier_id', data.supplier || '');
      formData.append('location', data.location || '');
      formData.append('name', data.assetName);
      formData.append('serial_number', data.serialNumber || '');
      formData.append('warranty_expiration', data.warrantyExpiration || '');
      formData.append('order_number', data.orderNumber || '');
      formData.append('purchase_date', data.purchaseDate || '');
      formData.append('purchase_cost', data.purchaseCost || '');
      formData.append('disposal_status', data.disposalStatus || '');
      formData.append('schedule_audit_date', data.scheduleAuditDate || '');
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
  const handleProductChange = async (event) => {
    const productId = event.target.value;
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
            root="Assets"
            currentPage={id ? "Edit Asset" : "New Asset"}
            rootNavigatePage="/assets"
            title={id ? 'Edit' + ' ' + (asset?.name || 'Asset') : 'New Asset'}
            rightComponent={
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
            }
          />
        </section>

        <section className="registration-form">
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

            {/* Product Dropdown */}
            <fieldset>
              <label htmlFor='product'>Product <span style={{color: 'red'}}>*</span></label>
              <select
                id="product"
                {...register("product", { required: "Product is required" })}
                onChange={handleProductChange}
                className={errors.product ? 'input-error' : ''}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.product && <span className='error-message'>{errors.product.message}</span>}
            </fieldset>

            {/* Status Dropdown with + button */}
            <fieldset>
              <label htmlFor='status'>Status <span style={{color: 'red'}}>*</span></label>
              <div className="dropdown-with-add">
                <select
                  id="status"
                  {...register("status", { required: "Status is required" })}
                  className={errors.status ? 'input-error' : ''}
                >
                  <option value="">Select Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowStatusModal(true)}
                  title="Add new status"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            {/* Supplier Dropdown with + button */}
            <fieldset>
              <label htmlFor='supplier'>Supplier</label>
              <div className="dropdown-with-add">
                <select
                  id="supplier"
                  {...register("supplier")}
                  className={errors.supplier ? 'input-error' : ''}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowSupplierModal(true)}
                  title="Add new supplier"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.supplier && <span className='error-message'>{errors.supplier.message}</span>}
            </fieldset>

            {/* Location Dropdown with + button */}
            <fieldset>
              <label htmlFor='location'>Location</label>
              <div className="dropdown-with-add">
                <select
                  id="location"
                  {...register("location")}
                  className={errors.location ? 'input-error' : ''}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => setShowLocationModal(true)}
                  title="Add new location"
                >
                  <img src={PlusIcon} alt="Add" />
                </button>
              </div>
              {errors.location && <span className='error-message'>{errors.location.message}</span>}
            </fieldset>

            {/* Asset Name */}
            <fieldset>
              <label htmlFor='asset-name'>Asset Name</label>
              <input
                type='text'
                className={errors.assetName ? 'input-error' : ''}
                {...register('assetName')}
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

            {/* Warranty Expiration Date */}
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
            <fieldset className="cost-field">
              <label htmlFor="purchaseCost">Purchase Cost</label>
              <div className="cost-input-group">
                <span className="cost-addon">PHP</span>
                <input
                  type="number"
                  id="purchaseCost"
                  name="purchaseCost"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  {...register("purchaseCost", { valueAsNumber: true })}
                />
              </div>
            </fieldset>

            {/* Disposal Status */}
            <fieldset>
              <label htmlFor='disposal-status'>Disposal Status</label>
              <select
                id="disposal-status"
                {...register("disposalStatus")}
                className={errors.disposalStatus ? 'input-error' : ''}
              >
                <option value="">Select Disposal Status</option>
                {disposalStatuses.map(status => (
                  <option key={status.id} value={status.name}>
                    {status.name}
                  </option>
                ))}
              </select>
              {errors.disposalStatus && <span className='error-message'>{errors.disposalStatus.message}</span>}
            </fieldset>

            {/* Schedule Audit Date */}
            <fieldset>
              <label htmlFor='schedule-audit-date'>Schedule Audit Date</label>
              <input
                type='date'
                id="schedule-audit-date"
                {...register('scheduleAuditDate')}
                min={currentDate}
              />
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

            {/* Attachments */}
            <fieldset>
              <label>Attachments</label>
              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="attachments" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="attachments"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                      multiple
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 5MB
                  </small>
                </div>

                {/* Right column: Uploaded files */}
                <div className="upload-right">
                  {attachmentFiles.map((file, index) => (
                    <div className="file-uploaded" key={index}>
                      <span title={file.name}>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            <button type="submit" className="primary-button" disabled={!isValid}>Save</button>
          </form>
        </section>
      </main>

      {/* Modals */}
      <AddEntryModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatus}
        title="New Status Label"
        fields={statusFields}
        type="status"
      />

      <AddEntryModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSave={handleSaveSupplier}
        title="New Supplier"
        fields={supplierFields}
        type="supplier"
      />

      <AddEntryModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSave={handleSaveLocation}
        title="New Location"
        fields={locationFields}
        type="location"
      />
    </>
  );
}
