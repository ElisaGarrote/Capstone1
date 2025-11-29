import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import Alert from "../../components/Alert";
import { fetchAllProducts, fetchAssetById, createAsset, updateAsset } from "../../services/assets-service";
import { fetchAllDropdowns, createStatus, createSupplier } from "../../services/contexts-service";
import { fetchAllLocations, createLocation } from "../../services/integration-help-desk-service";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import SystemLoading from "../../components/Loading/SystemLoading";

export default function AssetsRegistration() {
  const [products, setProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [asset, setAsset] = useState(null);

  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentDate = new Date().toISOString().split("T")[0];

  const { setValue, register, handleSubmit, formState: { errors, isValid } } = useForm({
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
      notes: '',
    }
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Fetch dropdown options for assets (filter statuses by asset category)
        const contextDropdowns = await fetchAllDropdowns("asset", { category: "asset" });
        setStatuses(contextDropdowns.statuses || []);
        setSuppliers(contextDropdowns.suppliers || []);

        const helpDeskDropdowns = await fetchAllLocations();
        setLocations(helpDeskDropdowns || []);

        // Get asset data - prioritize state, then fetch from API
        let assetData = location.state?.asset;

        // If no asset in state but we have an ID, fetch from API
        if (!assetData && id) {
          assetData = await fetchAssetById(id);
        }

        // Initialize form if editing
        if (assetData) {
          setValue("assetId", assetData.asset_id || "");
          setValue("product", assetData.product || "");
          setValue("status", assetData.status || "");
          setValue("supplier", assetData.supplier || "");
          setValue("location", assetData.location || "");
          setValue("assetName", assetData.name || "");
          setValue("serialNumber", assetData.serial_number || "");
          setValue("warrantyExpiration", assetData.warranty_expiration || "");
          setValue("orderNumber", assetData.order_number || "");
          setValue("purchaseDate", assetData.purchase_date || "");
          setValue("purchaseCost", assetData.purchase_cost || "");
          setValue("notes", assetData.notes || "");
          setAsset(assetData);
          if (assetData.image) {
            setPreviewImage(assetData.image);
          }
        } else if (location.state?.nextAssetId) {
          // Set generated asset ID for new asset
          setValue("assetId", location.state.nextAssetId);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setErrorMessage("Failed to initialize form data");
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [id, location.state, setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
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
      name: 'category',
      type: 'hidden',
      defaultValue: 'asset'
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
      const newStatus = await createStatus(data);
      setStatuses([...statuses, newStatus]);
      setShowStatusModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error('Error creating status:', error);
      setErrorMessage("Failed to create status");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveSupplier = async (data) => {
    try {
      const newSupplier = await createSupplier(data);
      setSuppliers([...suppliers, newSupplier]);
      setShowSupplierModal(false);
      setErrorMessage("");
    } catch (error) {
      console.error('Error creating supplier:', error);
      setErrorMessage("Failed to create supplier");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSaveLocation = async (data) => {
    try {
      // For now, just add to local state (location API not available)
      console.log('Creating location:', data);
      const newLocation = {
        id: locations.length + 1,
        city: data.name
      };
      setLocations(prev => [...prev, newLocation]);
      setShowLocationModal(false);
    } catch (error) {
      console.error('Error creating location:', error);
      setErrorMessage("Failed to create location");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const onSubmit = async (data) => {
    setErrorMessage("");
    try {
      const formData = new FormData();

      // Append asset data to FormData object
      formData.append('product', data.product || '');
      formData.append('status', data.status || '');
      formData.append('supplier', data.supplier || '');
      formData.append('location', data.location || '');
      formData.append('name', data.assetName || '');
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
        console.log("Removing image: remove_image flag set to true");
      }

      console.log("Form data before submission:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let result;

      if (id) {
        // Update existing asset
        result = await updateAsset(id, formData);
      } else {
        // Create new asset
        result = await createAsset(formData);
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

      let message = `An error occurred while ${id ? 'updating' : 'creating'} the asset`;

      if (error.response && error.response.data) {
        const data = error.response.data;

        // Extract the first message from the first key
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey]) && data[firstKey].length > 0) {
            message = data[firstKey][0];
          }
        }
      }

      setErrorMessage(message);
    }
  };



  // Handle product selection to auto-fill default values
  const handleProductChange = async (event) => {
    const productId = event.target.value;
    setValue('product', productId);

    if (productId) {
      try {
        // Fetch the product to get default values
        const product = await assetsService.fetchProductById(productId);

        if (product) {
          console.log("Product defaults:", product);

          // Set purchase cost if available
          if (product.default_purchase_cost) {
            setValue('purchaseCost', product.default_purchase_cost);
          }

          // Set supplier if available
          if (product.default_supplier) {
            setValue('supplier', product.default_supplier);
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
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.city}
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
              <label>Image</label>
              {previewImage ? (
                <div className="image-selected">
                  <img src={previewImage} alt="Selected image" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setPreviewImage(null);
                      setSelectedImage(null);
                      document.getElementById('image').value = '';
                      setRemoveImage(true);
                      console.log("Remove image flag set to:", true);
                    }}
                  >
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              ) : (
                <label className="upload-image-btn">
                  Choose File
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelection}
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
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
    </>
  );
}
