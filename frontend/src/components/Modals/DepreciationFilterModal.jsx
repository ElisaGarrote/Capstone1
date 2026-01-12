import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import "../../styles/Modal.css";
import "../../styles/AssetFilterModal.css";

export default function DepreciationFilterModal({
  isOpen,
  onClose,
  onApplyFilter,
  onResetFilter,
  initialFilters = {},
}) {
  const [filters, setFilters] = useState({
    valueSort: "",
  });

  const valueSortOptions = [
    { value: "asc", label: "Minimum Value - Lowest to Highest" },
    { value: "desc", label: "Minimum Value - Highest to Lowest" },
  ];

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({
      valueSort: "",
    });
    if (onResetFilter) {
      onResetFilter();
    }
    onClose();
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
      <div
        className="modal-container asset-filter-modal-container depreciation-filter-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Filter Depreciations</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>

        <div className="modal-body asset-filter-modal-body">
          <div className="filter-grid">
            <fieldset>
              <label htmlFor="valueSort">Sort by Minimum Value</label>
              <select
                id="valueSort"
                value={filters.valueSort || ""}
                onChange={(e) => handleSelectChange("valueSort", e.target.value)}
              >
                <option value="">No Sort</option>
                {valueSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

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

