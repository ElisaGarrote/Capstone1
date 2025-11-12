import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function ComponentFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {} }) {

  const [filters, setFilters] = useState({
    name: "",
    category: null,
    manufacturer: null,
  });

  // Category options
  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "mechanical", label: "Mechanical" },
    { value: "software", label: "Software" },
    { value: "hardware", label: "Hardware" },
    { value: "networking", label: "Networking" },
  ];

  // Manufacturer options
  const manufacturerOptions = [
    { value: "dell", label: "Dell" },
    { value: "hp", label: "HP" },
    { value: "lenovo", label: "Lenovo" },
    { value: "apple", label: "Apple" },
    { value: "samsung", label: "Samsung" },
    { value: "intel", label: "Intel" },
    { value: "amd", label: "AMD" },
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
      name: "",
      category: null,
      manufacturer: null,
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
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container asset-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Filter Components</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            {/* Component Name */}
            <fieldset>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter Component Name"
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
                onChange={(e) => {
                  const selectedOption = categoryOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("category", selectedOption || null);
                }}
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
                onChange={(e) => {
                  const selectedOption = manufacturerOptions.find(opt => opt.value === e.target.value);
                  handleSelectChange("manufacturer", selectedOption || null);
                }}
              >
                <option value="">Select Manufacturer</option>
                {manufacturerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

