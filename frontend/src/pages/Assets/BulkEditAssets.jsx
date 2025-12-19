import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";
import CloseIcon from "../../assets/icons/close.svg";
import PlusIcon from "../../assets/icons/plus.svg";
import AddEntryModal from "../../components/Modals/AddEntryModal";
import "../../styles/Registration.css";
import "../../styles/Assets/BulkEditAssets.css";

export default function BulkEditAssets() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedIds } = location.state || { selectedIds: [] };

  // Get the selected assets from mockup data
  const [currentSelectedIds, setCurrentSelectedIds] = useState(selectedIds);
  const selectedAssets = MockupData.filter(asset => currentSelectedIds.includes(asset.id));

  const handleRemoveAsset = (assetId) => {
    setCurrentSelectedIds(prev => prev.filter(id => id !== assetId));
  };

  const [products, setProducts] = useState([
    { id: 1, name: "MacBook Pro" },
    { id: 2, name: "Dell XPS" },
    { id: 3, name: "HP Pavilion" },
    { id: 4, name: "Lenovo ThinkPad" }
  ]);

  const [statuses, setStatuses] = useState([
    { id: 1, name: "Archived" },
    { id: 2, name: "Being Repaired" },
    { id: 3, name: "Broken" },
    { id: 4, name: "Deployed" },
    { id: 5, name: "Lost or Stolen" },
    { id: 6, name: "Pending" },
    { id: 7, name: "Ready to Deploy" }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Tech Supplier A" },
    { id: 2, name: "Tech Supplier B" },
    { id: 3, name: "Tech Supplier C" }
  ]);

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

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states for adding new entries
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const currentDate = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "all",
    defaultValues: {
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

  useEffect(() => {
    if (!selectedIds || selectedIds.length === 0) {
      setErrorMessage("No assets selected for bulk edit");
      setTimeout(() => navigate('/assets'), 2000);
    }
  }, [selectedIds, navigate]);

  const handleAddStatus = (data) => {
    const newStatus = { id: statuses.length + 1, name: data.name };
    setStatuses([...statuses, newStatus]);
    setShowStatusModal(false);
  };

  const handleAddSupplier = (data) => {
    const newSupplier = { id: suppliers.length + 1, name: data.name };
    setSuppliers([...suppliers, newSupplier]);
    setShowSupplierModal(false);
  };

  const handleAddLocation = (data) => {
    const newLocation = { id: locations.length + 1, name: data.name };
    setLocations([...locations, newLocation]);
    setShowLocationModal(false);
  };

  const onSubmit = async (data) => {
    try {
      if (currentSelectedIds.length === 0) {
        setErrorMessage("Please select at least one asset to update");
        return;
      }

      // Filter out empty fields
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      );

      if (Object.keys(updateData).length === 0) {
        setErrorMessage("Please select at least one field to update");
        return;
      }

      // TODO: Call API to update multiple assets
      console.log("Updating assets:", currentSelectedIds, "with data:", updateData);

      setSuccessMessage(`Successfully updated ${currentSelectedIds.length} asset(s)`);
      setTimeout(() => {
        navigate('/assets', { state: { successMessage: `Updated ${currentSelectedIds.length} asset(s)` } });
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Failed to update assets");
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <section className="page-layout-registration">
        <NavBar />

        <main className="registration bulk-edit-page">
          <section className="top">
            <TopSecFormPage
              root="Assets"
              currentPage="Bulk Edit Assets"
              rootNavigatePage="/assets"
              title="Bulk Edit Assets"
              rightComponent={
                <div className="import-section">
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {currentSelectedIds.length} Asset{currentSelectedIds.length !== 1 ? 's' : ''} Selected
                  </span>
                </div>
              }
            />
          </section>

          {/* Selected Assets Section */}
          <section className="selected-assets-section">
            <h3>Selected Assets ({currentSelectedIds.length})</h3>
            <div className="selected-assets-tags">
              {selectedAssets.length > 0 ? (
                selectedAssets.map((asset) => (
                  <div key={asset.id} className="asset-tag">
                    <span className="asset-tag-name">{asset.name}</span>
                    <span className="asset-tag-id">#{asset.displayed_id}</span>
                    <button
                      type="button"
                      className="asset-tag-remove"
                      onClick={() => handleRemoveAsset(asset.id)}
                      title="Remove from selection"
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-assets-message">No assets selected</p>
              )}
            </div>
          </section>

          <p className="selected-assets-note">
            Note: Fill in only the fields you want to change. Fields left empty will stay unchanged. Use the Remove toggle to clear existing values.
          </p>

          <section className="registration-form">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Product Dropdown */}
              <fieldset className="form-field">
                <label htmlFor='product'>Product</label>
                <select
                  id="product"
                  {...register("product")}
                  className={`form-input ${errors.product ? 'input-error' : ''}`}
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
              <fieldset className="form-field">
                <label htmlFor='status'>Status</label>
                <div className="dropdown-with-add">
                  <select
                    id="status"
                    {...register("status")}
                    className={`form-input ${errors.status ? 'input-error' : ''}`}
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

              {/* Supplier Dropdown with Add Button */}
              <fieldset className="form-field">
                <label htmlFor='supplier'>Supplier</label>
                <div className="dropdown-with-add">
                  <select
                    id="supplier"
                    {...register("supplier")}
                    className={`form-input ${errors.supplier ? 'input-error' : ''}`}
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

              {/* Location Dropdown with Add Button */}
              <fieldset className="form-field">
                <label htmlFor='location'>Location</label>
                <div className="dropdown-with-add">
                  <select
                    id="location"
                    {...register("location")}
                    className={`form-input ${errors.location ? 'input-error' : ''}`}
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
              <fieldset className="form-field">
                <label htmlFor='asset-name'>Asset Name</label>
                <input
                  type='text'
                  id='asset-name'
                  className={`form-input ${errors.assetName ? 'input-error' : ''}`}
                  {...register('assetName')}
                  maxLength='100'
                  placeholder='Asset Name'
                />
                {errors.assetName && <span className='error-message'>{errors.assetName.message}</span>}
              </fieldset>

              {/* Serial Number */}
              <fieldset className="form-field">
                <label htmlFor='serial-number'>Serial Number</label>
                <input
                  type='text'
                  id='serial-number'
                  className={`form-input ${errors.serialNumber ? 'input-error' : ''}`}
                  {...register('serialNumber')}
                  maxLength='50'
                  placeholder='Serial Number'
                />
                {errors.serialNumber && <span className='error-message'>{errors.serialNumber.message}</span>}
              </fieldset>

              {/* Warranty Expiration Date */}
              <fieldset className="form-field">
                <label htmlFor='warranty-expiration'>Warranty Expiration Date</label>
                <input
                  type='date'
                  id='warranty-expiration'
                  className={`form-input ${errors.warrantyExpiration ? 'input-error' : ''}`}
                  {...register('warrantyExpiration')}
                />
                {errors.warrantyExpiration && <span className='error-message'>{errors.warrantyExpiration.message}</span>}
              </fieldset>

              {/* Order Number */}
              <fieldset className="form-field">
                <label htmlFor='order-number'>Order Number</label>
                <input
                  type='text'
                  id='order-number'
                  className={`form-input ${errors.orderNumber ? 'input-error' : ''}`}
                  {...register('orderNumber')}
                  maxLength='50'
                  placeholder='Order Number'
                />
                {errors.orderNumber && <span className='error-message'>{errors.orderNumber.message}</span>}
              </fieldset>

              {/* Purchase Date */}
              <fieldset className="form-field">
                <label htmlFor='purchase-date'>Purchase Date</label>
                <input
                  type='date'
                  id='purchase-date'
                  className={`form-input ${errors.purchaseDate ? 'input-error' : ''}`}
                  {...register('purchaseDate')}
                />
                {errors.purchaseDate && <span className='error-message'>{errors.purchaseDate.message}</span>}
              </fieldset>

              {/* Purchase Cost */}
              <fieldset className="form-field cost-field">
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
                    className={`form-input ${errors.purchaseCost ? 'input-error' : ''}`}
                    {...register("purchaseCost", { valueAsNumber: true })}
                  />
                </div>
                {errors.purchaseCost && <span className='error-message'>{errors.purchaseCost.message}</span>}
              </fieldset>

              {/* Disposal Status */}
              <fieldset className="form-field">
                <label htmlFor='disposal-status'>Disposal Status</label>
                <select
                  id="disposal-status"
                  {...register("disposalStatus")}
                  className={`form-input ${errors.disposalStatus ? 'input-error' : ''}`}
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
              <fieldset className="form-field">
                <label htmlFor='schedule-audit-date'>Schedule Audit Date</label>
                <input
                  type='date'
                  id='schedule-audit-date'
                  className={`form-input ${errors.scheduleAuditDate ? 'input-error' : ''}`}
                  {...register('scheduleAuditDate')}
                  min={currentDate}
                />
                {errors.scheduleAuditDate && <span className='error-message'>{errors.scheduleAuditDate.message}</span>}
              </fieldset>

              {/* Notes */}
              <fieldset className="form-field notes-field">
                <label htmlFor='notes'>Notes</label>
                <textarea
                  id='notes'
                  className={`form-input ${errors.notes ? 'input-error' : ''}`}
                  {...register('notes')}
                  maxLength='500'
                  placeholder='Notes'
                  rows='4'
                />
                {errors.notes && <span className='error-message'>{errors.notes.message}</span>}
              </fieldset>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/assets')}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Assets
                </button>
              </div>
            </form>
          </section>
        </main>
      </section>

      <Footer />

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
    </>
  );
}

