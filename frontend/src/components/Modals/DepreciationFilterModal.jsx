import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/ContextFilterModal.css";

export default function DepreciationFilterModal({ isOpen, onClose, onApplyFilter, initialFilters = {} }) {

  const [filters, setFilters] = useState({
    name: "",
    duration: "",
    minimumValue: "",
  });

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

  // Reset all filters
  const handleReset = () => {
    setFilters({
      name: "",
      duration: "",
      minimumValue: "",
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
    <div className="depreciation-modal-overlay" onClick={handleOverlayClick}>
      <div className="depreciation-filter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="depreciation-modal-header">
          <h2>Filter Depreciations</h2>
          <button className="depreciation-modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="depreciation-filter-modal-body">
          <div className="depreciation-filter-grid">
            {/* Depreciation Name */}
            <fieldset>
              <label htmlFor="name">Depreciation Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter Depreciation Name"
                value={filters.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </fieldset>

            {/* Duration */}
            <fieldset>
              <label htmlFor="duration">Duration (months)</label>
              <input
                type="number"
                id="duration"
                placeholder="Enter Duration"
                value={filters.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                min="0"
              />
            </fieldset>

            {/* Minimum Value */}
            <fieldset className="depreciation-filter-cost-field">
              <label htmlFor="minimumValue">Minimum Value</label>
              <div className="depreciation-filter-cost-input-group">
                <span className="depreciation-filter-cost-addon">PHP</span>
                <input
                  type="number"
                  id="minimumValue"
                  placeholder="0.00"
                  value={filters.minimumValue}
                  onChange={(e) => handleInputChange("minimumValue", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </fieldset>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="depreciation-modal-footer">
          <button className="depreciation-modal-cancel-btn" onClick={handleReset}>
            Reset Filter
          </button>
          <button className="depreciation-modal-save-btn" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

