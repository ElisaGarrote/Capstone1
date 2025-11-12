import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/ContextFilterModal.css";

export default function RecycleBinFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {} }) {

  const [filters, setFilters] = useState({
    name: "",
    category: null,
    manufacturer: null,
    supplier: null,
    location: null,
  });

  // Category options
  const categoryOptions = [
    { value: "laptop", label: "Laptop" },
    { value: "desktop", label: "Desktop" },
    { value: "mobile", label: "Mobile Phone" },
    { value: "tablet", label: "Tablet" },
  ];

  // Manufacturer options
  const manufacturerOptions = [
    { value: "lenovo", label: "Lenovo" },
    { value: "apple", label: "Apple" },
    { value: "samsung", label: "Samsung" },
    { value: "microsoft", label: "Microsoft" },
    { value: "hp", label: "HP" },
  ];

  // Supplier options
  const supplierOptions = [
    { value: "amazon", label: "Amazon" },
    { value: "wsi", label: "WSI" },
    { value: "iontech", label: "Iontech Inc." },
    { value: "noventiq", label: "Noventiq" },
  ];

  // Location options
  const locationOptions = [
    { value: "makati", label: "Makati" },
    { value: "pasig", label: "Pasig" },
    { value: "marikina", label: "Marikina" },
    { value: "quezon", label: "Quezon City" },
    { value: "remote", label: "Remote" },
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
  const handleSelectChange = (field, value, optionsArray) => {
    const selectedOption = optionsArray.find(opt => opt.value === value);
    setFilters((prev) => ({
      ...prev,
      [field]: selectedOption || null,
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      name: "",
      category: null,
      manufacturer: null,
      supplier: null,
      location: null,
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
    <div className="recyclebin-modal-overlay" onClick={handleOverlayClick}>
      <div className="recyclebin-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="recyclebin-modal-header">
          <h2>Filter Recycle Bin</h2>
          <button className="recyclebin-modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="recyclebin-filter-modal-body">
          <div className="recyclebin-filter-grid">
            {/* Name */}
            <fieldset>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter Name"
                value={filters.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </fieldset>

            {/* Category */}
            <fieldset>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={filters.category?.value || ""}
                onChange={(e) => handleSelectChange("category", e.target.value, categoryOptions)}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Manufacturer */}
            <fieldset>
              <label htmlFor="manufacturer">Manufacturer</label>
              <select
                id="manufacturer"
                value={filters.manufacturer?.value || ""}
                onChange={(e) => handleSelectChange("manufacturer", e.target.value, manufacturerOptions)}
              >
                <option value="">Select Manufacturer</option>
                {manufacturerOptions.map((option) => (
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
                onChange={(e) => handleSelectChange("supplier", e.target.value, supplierOptions)}
              >
                <option value="">Select Supplier</option>
                {supplierOptions.map((option) => (
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
                onChange={(e) => handleSelectChange("location", e.target.value, locationOptions)}
              >
                <option value="">Select Location</option>
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="recyclebin-modal-footer">
          <button className="recyclebin-modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="recyclebin-modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

