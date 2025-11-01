import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import "../../styles/Registration.css";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import MediumButtons from "../../components/buttons/MediumButtons";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import { fetchAllCategories } from "../../services/contexts-service";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import DeleteModal from "../../components/Modals/DeleteModal";

export default function AssetEditPage() {
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

  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

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

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const watchedFields = watch();

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

  // Handle Clone Asset
  const handleCloneAsset = () => {
    console.log('Clone button clicked, asset:', asset);
    if (asset) {
      console.log('Navigating to registration with cloned name:', `${asset.name} (cloned)`);
      navigate('/assets/registration', {
        state: { clonedAssetName: `${asset.name} (cloned)` }
      });
    } else {
      console.log('No asset found for cloning');
    }
  };

  // Handle Delete Asset
  const handleDeleteAsset = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAsset = async () => {
    try {
      setIsLoading(true);
      await assetsService.deleteAsset(id);
      setErrorMessage("");
      setTimeout(() => {
        navigate('/assets');
      }, 2000);
    } catch (error) {
      console.error("Error deleting asset:", error);
      setErrorMessage("Failed to delete asset");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Handle image selection - copied from AssetRegistration
  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Please select a valid JPEG or PNG image file");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size exceeds 5MB. Please choose a smaller file.");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      setSelectedImage(file); // store the actual file
      setValue('image', file); // optional: sync with react-hook-form

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // for display only
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setValue('image', null);
    setRemoveImage(true);
    document.getElementById('image-upload').value = '';
  };

  // Handle form submission - copied from AssetRegistration
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      // Append all form fields
      Object.keys(data).forEach(key => {
        if (key === 'image' && selectedImage) {
          formData.append(key, selectedImage);
        } else if (key !== 'image' && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      await assetsService.updateAsset(id, formData);
      setErrorMessage("");

      setTimeout(() => {
        navigate('/assets');
      }, 2000);
    } catch (error) {
      console.error("Error updating asset:", error);
      setErrorMessage("Failed to update asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new status - copied from AssetRegistration
  const handleAddStatus = async (statusData) => {
    try {
      const newStatus = await assetsService.createStatus(statusData);
      setStatuses(prev => [...prev, newStatus]);
      setValue('status', newStatus.id);
      setShowStatusModal(false);
      setErrorMessage("");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (error) {
      console.error("Error adding status:", error);
      setErrorMessage("Failed to add status");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Add new supplier - copied from AssetRegistration
  const handleAddSupplier = async (supplierData) => {
    try {
      const newSupplier = await assetsService.createSupplier(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      setValue('supplier', newSupplier.id);
      setShowSupplierModal(false);
      setErrorMessage("");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (error) {
      console.error("Error adding supplier:", error);
      setErrorMessage("Failed to add supplier");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Add new location - copied from AssetRegistration
  const handleAddLocation = async (locationData) => {
    try {
      const newLocation = await assetsService.createLocation(locationData);
      setLocations(prev => [...prev, newLocation]);
      setValue('location', newLocation.id);
      setShowLocationModal(false);
      setErrorMessage("");
      setTimeout(() => setErrorMessage(""), 3000);
    } catch (error) {
      console.error("Error adding location:", error);
      setErrorMessage("Failed to add location");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Add this function to handle product selection - copied from AssetRegistration
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
            currentPage="Edit Asset"
            rootNavigatePage="/assets"
            title={'Edit' + ' ' + (asset?.name || 'Asset')}
            rightComponent={
              <div className="import-section">
                <button
                  type="button"
                  className="import-btn"
                  onClick={handleCloneAsset}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                    style={{ marginRight: '4px' }}
                  >
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                  Clone
                </button>
                <MediumButtons
                  type="delete"
                  onClick={handleDeleteAsset}
                />
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

            {/* Status Dropdown with Add Button */}
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
                >
                  <img src={PlusIcon} alt="Add Status" />
                </button>
              </div>
              {errors.status && <span className='error-message'>{errors.status.message}</span>}
            </fieldset>

            {/* Supplier Dropdown with Add Button */}
            <fieldset>
              <label htmlFor='supplier'>Supplier</label>
              <div className="dropdown-with-add">
                <select
                  id="supplier"
                  {...register("supplier")}
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
                >
                  <img src={PlusIcon} alt="Add Supplier" />
                </button>
              </div>
            </fieldset>

            {/* Location Dropdown with Add Button */}
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
                className={errors.serialNumber ? 'input-error' : ''}
                {...register('serialNumber')}
                maxLength='50'
                placeholder='Serial Number'
              />
              {errors.serialNumber && <span className='error-message'>{errors.serialNumber.message}</span>}
            </fieldset>

            {/* Warranty Expiration Date */}
            <fieldset>
              <label htmlFor='warranty-expiration'>Warranty Expiration Date</label>
              <input
                type='date'
                className={errors.warrantyExpiration ? 'input-error' : ''}
                {...register('warrantyExpiration')}
              />
              {errors.warrantyExpiration && <span className='error-message'>{errors.warrantyExpiration.message}</span>}
            </fieldset>

            {/* Order Number */}
            <fieldset>
              <label htmlFor='order-number'>Order Number</label>
              <input
                type='text'
                className={errors.orderNumber ? 'input-error' : ''}
                {...register('orderNumber')}
                maxLength='50'
                placeholder='Order Number'
              />
              {errors.orderNumber && <span className='error-message'>{errors.orderNumber.message}</span>}
            </fieldset>

            {/* Purchase Date */}
            <fieldset>
              <label htmlFor='purchase-date'>Purchase Date</label>
              <input
                type='date'
                className={errors.purchaseDate ? 'input-error' : ''}
                {...register('purchaseDate')}
              />
              {errors.purchaseDate && <span className='error-message'>{errors.purchaseDate.message}</span>}
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
                  className={errors.purchaseCost ? 'input-error' : ''}
                  {...register("purchaseCost", { valueAsNumber: true })}
                />
              </div>
              {errors.purchaseCost && <span className='error-message'>{errors.purchaseCost.message}</span>}
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
                className={errors.scheduleAuditDate ? 'input-error' : ''}
                {...register('scheduleAuditDate')}
              />
              {errors.scheduleAuditDate && <span className='error-message'>{errors.scheduleAuditDate.message}</span>}
            </fieldset>

            {/* Notes */}
            <fieldset>
              <label htmlFor='notes'>Notes</label>
              <textarea
                className={errors.notes ? 'input-error' : ''}
                {...register('notes')}
                maxLength='500'
                placeholder='Notes'
                rows='4'
              />
              {errors.notes && <span className='error-message'>{errors.notes.message}</span>}
            </fieldset>

            {/* Image Upload */}
            <fieldset>
              <label htmlFor='image'>Image Upload</label>
              {previewImage && (
                <div className="image-selected">
                  <img src={previewImage} alt="Asset preview" />
                  <button type="button" onClick={handleRemoveImage}>
                    <img src={CloseIcon} alt="Remove" />
                  </button>
                </div>
              )}
              <label htmlFor="image-upload" className="upload-image-btn">
                Choose File
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageSelection}
                style={{ display: 'none' }}
              />
              <small className="file-size-info">
                Maximum file size must be 5MB
              </small>
            </fieldset>

            {/* Save Button */}
            <button
              type="submit"
              className="primary-button"
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </main>

      {/* Modals */}
      {showStatusModal && (
        <AddEntryModal
          title="Add New Status"
          fields={[
            {
              name: "name",
              label: "Status Name",
              type: "text",
              required: true,
              placeholder: "Enter status name"
            }
          ]}
          onSubmit={handleAddStatus}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {showSupplierModal && (
        <AddEntryModal
          title="Add New Supplier"
          fields={[
            {
              name: "name",
              label: "Supplier Name",
              type: "text",
              required: true,
              placeholder: "Enter supplier name"
            }
          ]}
          onSubmit={handleAddSupplier}
          onClose={() => setShowSupplierModal(false)}
        />
      )}

      {showLocationModal && (
        <AddEntryModal
          title="Add New Location"
          fields={[
            {
              name: "name",
              label: "Location Name",
              type: "text",
              required: true,
              placeholder: "Enter location name"
            }
          ]}
          onSubmit={handleAddLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteAsset}
          actionType="delete"
        />
      )}
    </>
  );
}