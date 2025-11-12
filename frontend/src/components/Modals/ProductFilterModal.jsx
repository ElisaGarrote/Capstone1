import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/ProductFilterModal.css";

export default function ProductFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {} }) {

  const [filters, setFilters] = useState({
    assetId: "",
    assetModel: "",
    status: null,
    supplier: null,
    location: null,
    assetName: "",
    serialNumber: "",
    warrantyExpiration: "",
    orderNumber: "",
    purchaseDate: "",
    purchaseCost: "",
  });

  // Status options
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "archived", label: "Archived" },
  ];

  // Supplier options (mock data)
  const supplierOptions = [
    { value: "supplier1", label: "Supplier 1" },
    { value: "supplier2", label: "Supplier 2" },
    { value: "supplier3", label: "Supplier 3" },
  ];

  // Location options (mock data)
  const locationOptions = [
    { value: "location1", label: "Location 1" },
    { value: "location2", label: "Location 2" },
    { value: "location3", label: "Location 3" },
  ];

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (field, selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      assetId: "",
      assetModel: "",
      status: null,
      supplier: null,
      location: null,
      assetName: "",
      serialNumber: "",
      warrantyExpiration: "",
      orderNumber: "",
      purchaseDate: "",
      purchaseCost: "",
    });
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilter(filters);
    onClose();
  };

  // Close modal on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="product-modal-overlay" onClick={handleOverlayClick}>
      <div className="product-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="product-modal-header">
          <h2>Filter Assets</h2>
          <button className="product-modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="product-filter-modal-body">
          <div className="product-filter-grid">
            {/* Asset ID */}
            <fieldset>
              <label htmlFor="assetId">Asset ID</label>
              <input
                type="number"
                id="assetId"
                placeholder="Enter Asset ID"
                value={filters.assetId}
                onChange={(e) => handleInputChange("assetId", e.target.value)}
              />
            </fieldset>

            {/* Asset Model */}
            <fieldset>
              <label htmlFor="assetModel">Asset Model</label>
              <input
                type="text"
                id="assetModel"
                placeholder="Enter Asset Model"
                value={filters.assetModel}
                onChange={(e) => handleInputChange("assetModel", e.target.value)}
              />
            </fieldset>

            {/* Status */}
            <fieldset>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filters.status?.value || ""}
                onChange={(e) => {
                  const selected = statusOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("status", selected || null);
                }}
              >
                <option value="">Select Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Supplier */}
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <select
                id="supplier"
                value={filters.supplier?.value || ""}
                onChange={(e) => {
                  const selected = supplierOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("supplier", selected || null);
                }}
              >
                <option value="">Select Supplier</option>
                {supplierOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Location */}
            <fieldset>
              <label htmlFor="location">Location</label>
              <select
                id="location"
                value={filters.location?.value || ""}
                onChange={(e) => {
                  const selected = locationOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("location", selected || null);
                }}
              >
                <option value="">Select Location</option>
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Asset Name */}
            <fieldset>
              <label htmlFor="assetName">Asset Name</label>
              <input
                type="text"
                id="assetName"
                placeholder="Enter Asset Name"
                value={filters.assetName}
                onChange={(e) => handleInputChange("assetName", e.target.value)}
              />
            </fieldset>

            {/* Serial Number */}
            <fieldset>
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="number"
                id="serialNumber"
                placeholder="Enter Serial Number"
                value={filters.serialNumber}
                onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              />
            </fieldset>

            {/* Warranty Expiration */}
            <fieldset>
              <label htmlFor="warrantyExpiration">Warranty Expiration</label>
              <input
                type="date"
                id="warrantyExpiration"
                value={filters.warrantyExpiration}
                onChange={(e) => handleInputChange("warrantyExpiration", e.target.value)}
              />
            </fieldset>

            {/* Order No */}
            <fieldset>
              <label htmlFor="orderNumber">Order No</label>
              <input
                type="number"
                id="orderNumber"
                placeholder="Enter Order No"
                value={filters.orderNumber}
                onChange={(e) => handleInputChange("orderNumber", e.target.value)}
              />
            </fieldset>

            {/* Purchase Date */}
            <fieldset>
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                value={filters.purchaseDate}
                onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
              />
            </fieldset>

            {/* Purchase Cost */}
            <fieldset className="product-filter-cost-field">
              <label htmlFor="purchaseCost">Purchase Cost</label>
              <div className="product-filter-cost-input-group">
                <span className="product-filter-cost-addon">PHP</span>
                <input
                  type="number"
                  id="purchaseCost"
                  placeholder="0.00"
                  value={filters.purchaseCost}
                  onChange={(e) => handleInputChange("purchaseCost", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="product-modal-footer">
          <button className="product-modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="product-modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

