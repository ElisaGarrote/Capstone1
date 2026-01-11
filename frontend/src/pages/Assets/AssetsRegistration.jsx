import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { getCustomSelectStyles } from "../../utils/selectStyles";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import { fetchAllCategories } from "../../services/contexts-service";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import ProductMockData from "../../data/mockData/products/products-mockup-data.json";
import StatusMockData from "../../data/mockData/more/status-mockup-data.json";
import SupplierMockData from "../../data/mockData/more/supplier-mockup-data.json";

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

  const customSelectStyles = getCustomSelectStyles();

  const [asset, setAsset] = useState(null);
  const { id } = useParams();
  const location = useLocation();

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const [generatedAssetId, setGeneratedAssetId] = useState('(Loading...)');

  const { setValue, register, handleSubmit, watch, control, formState: { errors, isValid } } = useForm({
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
      disposalStatus: null,
      scheduleAuditDate: '',
      notes: '',
    }
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
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
        let assetContextsData = {};
        let contextsData = {};
        try {
          [assetContextsData, contextsData] = await Promise.all([
            assetsService.fetchAssetContexts(),
            fetchAllCategories(),
          ]);
        } catch (ctxError) {
          console.error("Error fetching asset/contexts data, using mock data:", ctxError);
        }

        const apiProducts = assetContextsData?.products || [];
        const apiStatuses = assetContextsData?.statuses || [];
        const apiSuppliers = contextsData?.suppliers || [];

        setProducts(apiProducts.length ? apiProducts : ProductMockData);
        setStatuses(apiStatuses.length ? apiStatuses : StatusMockData);
        setSuppliers(apiSuppliers.length ? apiSuppliers : SupplierMockData);

        if (id) {
          try {
            const assetData = await assetsService.fetchAssetById(id);
            if (!assetData) {
              setErrorMessage("Failed to fetch asset details");
              return;
            }

            setAsset(assetData);
            console.log("Asset Details:", assetData);
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
          } catch (assetError) {
            console.error("Error fetching asset details:", assetError);
            setErrorMessage("Failed to fetch asset details");
          }
        }
      } catch (error) {
        console.error("Error initializing asset registration form:", error);
        setErrorMessage("Failed to initialize form data");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [id, setValue]);

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

  const isImageFile = (file) => {
    const imageExtensions = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return imageExtensions.includes(file.type);
  };

  const handleImageClick = (file) => {
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageForModal(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      console.log("Import file selected:", file.name);
    }
  };
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
  const handleSaveStatus = async (data) => {
    try {
      console.log('Creating status:', data);
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
      console.log('Creating supplier:', data);
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
      console.log('Creating location:', data);
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

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (removeImage) {
        formData.append('remove_image', 'true');
      }

      console.log("Form data before submission:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let result;

      if (id) {
        result = await assetsService.updateAsset(id, formData);
      } else {
        result = await assetsService.createAsset(formData);
      }

      if (!result) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} asset.`);
      }

      console.log(`${id ? 'Updated' : 'Created'} asset:`, result);
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

  const handleProductChange = async (event) => {
    const productId = event.target.value;
    if (productId) {
      try {
        const productDefaults = await assetsService.fetchProductDefaults(productId);

        if (productDefaults) {
          console.log("Product defaults:", productDefaults);
          if (productDefaults.default_purchase_cost) {
            setValue('purchaseCost', productDefaults.default_purchase_cost);
          }
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
      <section className="page-layout-registration">
        <NavBar />
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
              <Controller
                name="product"
                control={control}
                rules={{ required: "Product is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="product"
                    options={products.map(p => ({ value: p.id, label: p.name }))}
                    value={products.map(p => ({ value: p.id, label: p.name })).find(opt => opt.value === field.value) || null}
                    onChange={(selected) => {
                      field.onChange(selected?.value ?? null);
                      handleProductChange({ target: { value: selected?.value ?? '' } });
                    }}
                    placeholder="Select Product"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                    className={errors.product ? 'react-select-error' : ''}
                  />
                )}
              />
              {errors.product && <span className='error-message'>{errors.product.message}</span>}
            </fieldset>

            {/* Status Dropdown with + button */}
            <fieldset>
              <label htmlFor='status'>Status <span style={{color: 'red'}}>*</span></label>
              <div className="select-with-button">
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="status"
                      options={statuses.map(s => ({ value: s.id, label: s.name }))}
                      value={statuses.map(s => ({ value: s.id, label: s.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Status"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.status ? 'react-select-error' : ''}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
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
              <div className="select-with-button">
                <Controller
                  name="supplier"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="supplier"
                      options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                      value={suppliers.map(s => ({ value: s.id, label: s.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Supplier"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.supplier ? 'react-select-error' : ''}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
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
              <div className="select-with-button">
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      inputId="location"
                      options={locations.map(l => ({ value: l.name, label: l.name }))}
                      value={locations.map(l => ({ value: l.name, label: l.name })).find(opt => opt.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value ?? null)}
                      placeholder="Select Location"
                      isSearchable={true}
                      isClearable={true}
                      styles={customSelectStyles}
                      className={errors.location ? 'react-select-error' : ''}
                    />
                  )}
                />
                <button
                  type="button"
                  className="add-entry-btn"
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
              <Controller
                name="disposalStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    inputId="disposal-status"
                    options={disposalStatuses.map(d => ({ value: d.name, label: d.name }))}
                    value={disposalStatuses.map(d => ({ value: d.name, label: d.name })).find(opt => opt.value === field.value) || null}
                    onChange={(selected) => field.onChange(selected?.value ?? null)}
                    placeholder="Select Disposal Status"
                    isSearchable={true}
                    isClearable={true}
                    styles={customSelectStyles}
                    className={errors.disposalStatus ? 'react-select-error' : ''}
                  />
                )}
              />
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

            {/* Image Upload */}
            <fieldset>
              <label>Image Upload</label>
              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="attachments" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="attachments"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
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
                      <span 
                        title={file.name}
                        onClick={() => handleImageClick(file)}
                        style={isImageFile(file) ? { cursor: 'pointer', textDecoration: 'underline', color: '#007bff' } : {}}
                      >
                        {file.name}
                      </span>
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
      <Footer />
      </section>

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

      {/* Image Preview Modal */}
      {selectedImageForModal && (
        <div 
          className="image-preview-modal-overlay"
          onClick={() => setSelectedImageForModal(null)}
        >
          <div 
            className="image-preview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-preview-close-btn"
              onClick={() => setSelectedImageForModal(null)}
            >
              ✕
            </button>
            <img 
              src={selectedImageForModal} 
              alt="Preview" 
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
